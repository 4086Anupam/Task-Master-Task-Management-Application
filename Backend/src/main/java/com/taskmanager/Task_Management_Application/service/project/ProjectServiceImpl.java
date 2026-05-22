package com.taskmanager.Task_Management_Application.service.project;

import com.taskmanager.Task_Management_Application.dto.ProjectDto;
import com.taskmanager.Task_Management_Application.entities.Project;
import com.taskmanager.Task_Management_Application.entities.Task;
import com.taskmanager.Task_Management_Application.entities.User;
import com.taskmanager.Task_Management_Application.enums.UserRole;
import com.taskmanager.Task_Management_Application.repository.ProjectRepository;
import com.taskmanager.Task_Management_Application.repository.TaskRepository;
import com.taskmanager.Task_Management_Application.repository.TaskAssignmentHistoryRepository;
import com.taskmanager.Task_Management_Application.repository.UserRepository;
import com.taskmanager.Task_Management_Application.service.audit.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectServiceImpl implements ProjectService {

    private final ProjectRepository projectRepository;
    private final TaskRepository taskRepository;
    private final TaskAssignmentHistoryRepository taskAssignmentHistoryRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public List<ProjectDto> getAllProjects() {
        User currentUser = getCurrentUser();
        boolean admin = isAdmin(currentUser);

        return projectRepository.findAll().stream()
            .filter(project -> admin || (project.getMembers() != null && project.getMembers().stream().anyMatch(member -> member.getId() == currentUser.getId())))
                .map(this::toProjectDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project Not Found"));

        User currentUser = getCurrentUser();
        if (!isAdmin(currentUser) && (project.getMembers() == null || project.getMembers().stream().noneMatch(member -> member.getId() == currentUser.getId()))) {
            throw new RuntimeException("Project Not Found");
        }

        return toProjectDto(project);
    }

    @Override
    public ProjectDto createProject(ProjectDto projectDto) {

        Project project = new Project();

        project.setName(projectDto.getName());
        project.setDescription(projectDto.getDescription());

        Project savedProject = projectRepository.save(project);

        auditLogService.record("CREATE", "Project", savedProject.getId(), null, savedProject.getProjectDto(), "Project created");

        return toProjectDto(savedProject);
    }

    @Override
    public ProjectDto updateProject(Long id, ProjectDto projectDto) {

        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project Not Found"));

        ProjectDto before = toProjectDto(project);

        project.setName(projectDto.getName());
        project.setDescription(projectDto.getDescription());

        Project updatedProject = projectRepository.save(project);

        auditLogService.record("UPDATE", "Project", updatedProject.getId(), before, updatedProject.getProjectDto(), "Project updated");

        return toProjectDto(updatedProject);
    }

    @Override
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project Not Found"));

        ProjectDto beforeDelete = toProjectDto(project);

        List<Task> tasks = taskRepository.findByProject(project);

        if (!tasks.isEmpty()) {
            for (Task task : tasks) {
                // delete any assignment history entries referencing this task first
                taskAssignmentHistoryRepository.deleteByTask_Id(task.getId());
                taskRepository.delete(task);
            }
            taskRepository.flush();
        }

        project.getMembers().clear();
        projectRepository.saveAndFlush(project);

        projectRepository.delete(project);
        projectRepository.flush();

        auditLogService.record("DELETE", "Project", id, beforeDelete, null, "Project deleted");
    }

    @Override
    public void assignMemberToProject(Long projectId, Long userId) {

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project Not Found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        project.getMembers().add(user);

        projectRepository.save(project);

        auditLogService.record("ASSIGN_MEMBER", "Project", projectId, null, project.getProjectDto(), "Assigned member to project");
    }

    @Override
    public void removeMemberFromProject(Long projectId, Long userId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project Not Found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User Not Found"));

        project.getMembers().remove(user);

        projectRepository.save(project);

        auditLogService.record("REMOVE_MEMBER", "Project", projectId, null, project.getProjectDto(), "Removed member from project");
    }

    private ProjectDto toProjectDto(Project project) {
        ProjectDto projectDto = project.getProjectDto();
        projectDto.setTasks(
                taskRepository.findByProject(project).stream()
                        .map(task -> task.getTaskDto())
                        .collect(Collectors.toList())
        );
        return projectDto;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new RuntimeException("Unauthenticated user");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    private boolean isAdmin(User user) {
        return user != null && user.getRole() == UserRole.ADMIN;
    }
}