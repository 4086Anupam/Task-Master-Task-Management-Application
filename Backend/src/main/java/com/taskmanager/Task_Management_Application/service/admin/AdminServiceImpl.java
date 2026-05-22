package com.taskmanager.Task_Management_Application.service.admin;

import com.taskmanager.Task_Management_Application.dto.TaskDto;
import com.taskmanager.Task_Management_Application.dto.UserDto;
import com.taskmanager.Task_Management_Application.entities.Project;
import com.taskmanager.Task_Management_Application.entities.TaskAssignmentHistory;
import com.taskmanager.Task_Management_Application.entities.Task;
import com.taskmanager.Task_Management_Application.entities.User;
import com.taskmanager.Task_Management_Application.enums.TaskStatus;
import com.taskmanager.Task_Management_Application.enums.UserRole;
import com.taskmanager.Task_Management_Application.repository.ProjectRepository;
import com.taskmanager.Task_Management_Application.repository.TaskAssignmentHistoryRepository;
import com.taskmanager.Task_Management_Application.repository.TaskRepository;
import com.taskmanager.Task_Management_Application.repository.UserRepository;
import com.taskmanager.Task_Management_Application.service.audit.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TaskAssignmentHistoryRepository taskAssignmentHistoryRepository;
    private final AuditLogService auditLogService;
    private final com.taskmanager.Task_Management_Application.service.mail.EmailService emailService;

    // Get All Employees
    @Override
    public List<UserDto> getUsers(boolean includeInactive) {

        return userRepository.findAll().stream()
                .filter(user -> user.getRole() == UserRole.EMPLOYEE)
                .filter(user -> includeInactive || (user.getActive() == null || user.getActive()))
                .map(User::getUserDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        // Soft-delete: mark user inactive + remove from projects and unassign from tasks
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        UserDto beforeDelete = user.getUserDto();

        // Remove from project memberships
        projectRepository.findAll().forEach(project -> {
            if (project.getMembers() != null) {
                boolean removed = project.getMembers().removeIf(member -> member.getId() == id);
                if (removed) {
                    projectRepository.save(project);
                }
            }
        });

        // For tasks: remove from assignees, if primaryAssignee is the user, set to another assignee or null
        List<Task> tasksOwnedOrAssigned = taskRepository.findByPrimaryAssignee_Id(id);
        tasksOwnedOrAssigned.addAll(taskRepository.findByAssignees_Id(id));

        tasksOwnedOrAssigned.stream().distinct().forEach(task -> {
            boolean changed = false;

            if (task.getAssignees() != null && task.getAssignees().removeIf(u -> u.getId() == id)) {
                changed = true;
            }

            if (task.getPrimaryAssignee() != null && task.getPrimaryAssignee().getId() == id) {
                // pick another assignee if present
                User previousPrimary = task.getPrimaryAssignee();
                if (task.getAssignees() != null && !task.getAssignees().isEmpty()) {
                    User newPrimary = task.getAssignees().iterator().next();
                    task.setPrimaryAssignee(newPrimary);
                    saveTaskHistory(task, previousPrimary, newPrimary, "Task reassigned after employee removal");
                } else {
                    task.setPrimaryAssignee(null);
                    saveTaskHistory(task, previousPrimary, null, "Task unassigned after employee removal");
                }

                changed = true;
            }

            if (changed) {
                taskRepository.save(task);
            }
        });

        // Mark user inactive and set deletedAt
        user.setActive(false);
        user.setDeletedAt(java.time.LocalDateTime.now());

        userRepository.save(user);
        auditLogService.record("DELETE", "User", user.getId(), beforeDelete, user.getUserDto(), "User soft-deleted and removed from projects/tasks");
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        UserDto before = user.getUserDto();
        user.setActive(false);
        user.setDeletedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        auditLogService.record("DEACTIVATE", "User", user.getId(), before, user.getUserDto(), "User deactivated");
    }

    @Override
    @Transactional
    public void restoreUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        UserDto before = user.getUserDto();
        user.setActive(true);
        user.setDeletedAt(null);
        userRepository.save(user);
        auditLogService.record("RESTORE", "User", user.getId(), before, user.getUserDto(), "User restored");
    }

    // Create Task
    @Override
    public TaskDto createTask(TaskDto taskDto) {
        Project project = projectRepository.findById(taskDto.getProjectId()).orElseThrow(() -> new RuntimeException("Project not found"));

        Task task = new Task();

        task.setTitle(taskDto.getTitle());
        task.setDescription(taskDto.getDescription());
        task.setTaskStatus(taskDto.getTaskStatus());
        task.setPriority(taskDto.getPriority());
        task.setDueDate(taskDto.getDueDate());

        task.setProject(project);
        Set<User> assignees = resolveAssignees(taskDto);
        task.setPrimaryAssignee(assignees.iterator().next());
        task.setAssignees(assignees);

        Task savedTask = taskRepository.save(task);

        saveTaskHistory(savedTask, null, savedTask.getPrimaryAssignee(), "Task created and assigned");
        auditLogService.record("CREATE", "Task", savedTask.getId(), null, savedTask.getTaskDto(), "Task created");

        // Notify assignees by email
        if (savedTask.getAssignees() != null) {
            savedTask.getAssignees().forEach(u -> {
                if (u.getEmail() != null) {
                    String subject = "You have been assigned a task: " + savedTask.getTitle();
                    String body = "Task '" + savedTask.getTitle() + "' has been assigned to you.\n\nDescription: " + savedTask.getDescription();
                    try {
                        emailService.sendSimpleMessage(u.getEmail(), subject, body);
                    } catch (Exception e) {
                        // log and continue
                        System.err.println("Failed to send task assignment email to " + u.getEmail() + ": " + e.getMessage());
                    }
                }
            });
        }

        return savedTask.getTaskDto();
    }

    // Get All Tasks
    @Override
    public List<TaskDto> getAllTasks() {
        User currentUser = getCurrentUser();
        boolean admin = currentUser.getRole() == UserRole.ADMIN;

        return taskRepository.findAll().stream()
                .filter(task -> admin || isTaskRelatedToUser(task, currentUser.getId()))
                .sorted((t1, t2) -> Long.compare(t2.getId(), t1.getId()))
                .map(Task::getTaskDto)
                .toList();
    }

    // Delete Task
    @Override
    @Transactional
    public void deleteTask(Long id) {

        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        TaskDto before = task.getTaskDto();

        // Remove any assignment history entries referencing this task to avoid FK constraint violations
        taskAssignmentHistoryRepository.deleteByTask_Id(id);

        taskRepository.delete(task);
        auditLogService.record("DELETE", "Task", id, before, null, "Task deleted");
    }

    // Get Task By id
    @Override
    public TaskDto getTaskById(Long id) {

        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));

        User currentUser = getCurrentUser();
        if (currentUser.getRole() != UserRole.ADMIN && !isTaskRelatedToUser(task, currentUser.getId())) {
            throw new RuntimeException("Task not found");
        }

        return task.getTaskDto();
    }

    // Update Task
    @Override
    public TaskDto updateTask(Long id, TaskDto taskDto) {

        Task existingTask = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        TaskDto before = existingTask.getTaskDto();

        existingTask.setTitle(taskDto.getTitle());
        existingTask.setDescription(taskDto.getDescription());
        existingTask.setPriority(taskDto.getPriority());
        existingTask.setTaskStatus(taskDto.getTaskStatus());
        existingTask.setDueDate(taskDto.getDueDate());

        // Update Assignees
        if (taskDto.getAssigneeIds() != null || taskDto.getUserId() != null) {
            Set<User> assignees = resolveAssignees(taskDto);
            existingTask.setPrimaryAssignee(assignees.iterator().next());
            existingTask.setAssignees(assignees);
        }

        Task updatedTask = taskRepository.save(existingTask);

        saveTaskHistory(updatedTask, existingTask.getPrimaryAssignee(), updatedTask.getPrimaryAssignee(), "Task updated");
        auditLogService.record("UPDATE", "Task", updatedTask.getId(), before, updatedTask.getTaskDto(), "Task updated");

        if (updatedTask.getAssignees() != null) {
            updatedTask.getAssignees().forEach(u -> {
                if (u.getEmail() != null) {
                    String subject = "Task updated: " + updatedTask.getTitle();
                    String body = "Task '" + updatedTask.getTitle() + "' has been updated.\n\nDescription: " + updatedTask.getDescription();
                    try {
                        emailService.sendSimpleMessage(u.getEmail(), subject, body);
                    } catch (Exception e) {
                        System.err.println("Failed to send task update email to " + u.getEmail() + ": " + e.getMessage());
                    }
                }
            });
        }

        return updatedTask.getTaskDto();
    }

    // Update Task Status
    @Override
    @Transactional
    public TaskDto updateTaskStatus(Long id, TaskStatus status) {

        Task existingTask = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Task not found"));
        TaskDto before = existingTask.getTaskDto();

        // Authorization: only admins or related users (assignee/primary assignee/project member) can change status
        User currentUser = getCurrentUser();
        boolean admin = currentUser.getRole() == UserRole.ADMIN;
        if (!admin && !isTaskRelatedToUser(existingTask, currentUser.getId())) {
            throw new RuntimeException("Not authorized to change status of this task");
        }

        existingTask.setTaskStatus(status);

        Task updatedTask = taskRepository.save(existingTask);

        saveTaskHistory(updatedTask, currentUser, updatedTask.getPrimaryAssignee(), "Task status changed to " + status);
        auditLogService.record("STATUS_CHANGE", "Task", updatedTask.getId(), before, updatedTask.getTaskDto(), "Task status changed to " + status);

        if (updatedTask.getAssignees() != null) {
            updatedTask.getAssignees().forEach(u -> {
                if (u.getEmail() != null) {
                    String subject = "Task status changed: " + updatedTask.getTitle();
                    String body = "Status for task '" + updatedTask.getTitle() + "' changed to " + updatedTask.getTaskStatus();
                    try {
                        emailService.sendSimpleMessage(u.getEmail(), subject, body);
                    } catch (Exception e) {
                        System.err.println("Failed to send task status email to " + u.getEmail() + ": " + e.getMessage());
                    }
                }
            });
        }

        return updatedTask.getTaskDto();
    }

    private java.util.Set<User> resolveAssignees(TaskDto taskDto) {
        List<Long> assigneeIds = taskDto.getAssigneeIds();

        if ((assigneeIds == null || assigneeIds.isEmpty()) && taskDto.getUserId() != null) {
            assigneeIds = List.of(taskDto.getUserId());
        }

        if (assigneeIds == null || assigneeIds.isEmpty()) {
            throw new RuntimeException("At least one assignee is required");
        }

        return assigneeIds.stream()
                .map(userId -> userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found")))
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    private void saveTaskHistory(Task task, User fromUser, User toUser, String note) {
        TaskAssignmentHistory history = new TaskAssignmentHistory();
        history.setTask(task);
        history.setFromUser(fromUser);
        history.setToUser(toUser);
        history.setChangedAt(java.time.LocalDateTime.now());
        history.setNote(note);
        taskAssignmentHistoryRepository.save(history);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated user");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    private boolean isTaskRelatedToUser(Task task, Long userId) {
        boolean primaryMatch = task.getPrimaryAssignee() != null && task.getPrimaryAssignee().getId() == userId;
        boolean assigneeMatch = task.getAssignees() != null && task.getAssignees().stream().anyMatch(user -> user.getId() == userId);
        boolean projectMatch = task.getProject() != null && task.getProject().getMembers() != null && task.getProject().getMembers().stream().anyMatch(member -> member.getId() == userId);
        return primaryMatch || assigneeMatch || projectMatch;
    }
}