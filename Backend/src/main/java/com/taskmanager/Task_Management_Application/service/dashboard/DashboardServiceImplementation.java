package com.taskmanager.Task_Management_Application.service.dashboard;

import com.taskmanager.Task_Management_Application.dto.DashboardSummaryDto;
import com.taskmanager.Task_Management_Application.dto.ProjectProgressDto;
import com.taskmanager.Task_Management_Application.dto.TaskDto;
import com.taskmanager.Task_Management_Application.entities.Project;
import com.taskmanager.Task_Management_Application.entities.Task;
import com.taskmanager.Task_Management_Application.entities.User;
import com.taskmanager.Task_Management_Application.enums.TaskStatus;
import com.taskmanager.Task_Management_Application.enums.UserRole;
import com.taskmanager.Task_Management_Application.repository.ProjectRepository;
import com.taskmanager.Task_Management_Application.repository.TaskRepository;
import com.taskmanager.Task_Management_Application.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImplementation
        implements DashboardService {

    private final ProjectRepository projectRepository;

    private final TaskRepository taskRepository;

    private final UserRepository userRepository;

    private final ModelMapper modelMapper;

    @Override
    public DashboardSummaryDto getDashboardSummary() {

        User currentUser = getCurrentUser();
        boolean admin = isAdmin(currentUser);

        DashboardSummaryDto dto =
                new DashboardSummaryDto();

        List<Project> projects = admin ? projectRepository.findAll() : projectRepository.findAll().stream()
                .filter(project -> project.getMembers() != null && project.getMembers().stream().anyMatch(member -> member.getId() == currentUser.getId()))
                .toList();

        List<Task> tasks = admin ? taskRepository.findAll() : taskRepository.findAll().stream()
                .filter(task -> {
                                        boolean assigneeMatch = task.getAssignees() != null && task.getAssignees().stream().anyMatch(user -> user.getId() == currentUser.getId());
                                        boolean primaryMatch = task.getPrimaryAssignee() != null && task.getPrimaryAssignee().getId() == currentUser.getId();
                                        boolean projectMatch = task.getProject() != null && task.getProject().getMembers() != null && task.getProject().getMembers().stream().anyMatch(member -> member.getId() == currentUser.getId());
                    return assigneeMatch || primaryMatch || projectMatch;
                })
                .toList();

        dto.setTotalProjects(projects.size());
        dto.setTotalTasks(tasks.size());
        dto.setCompletedTasks(tasks.stream().filter(task -> task.getTaskStatus() == TaskStatus.DONE).count());
        dto.setPendingTasks(tasks.stream().filter(task -> task.getTaskStatus() == TaskStatus.TODO).count());
        dto.setInProgressTasks(tasks.stream().filter(task -> task.getTaskStatus() == TaskStatus.IN_PROGRESS).count());
        dto.setTotalUsers(admin ? userRepository.count() : tasks.stream()
                .flatMap(task -> task.getAssignees() == null ? java.util.stream.Stream.empty() : task.getAssignees().stream())
                .map(User::getId)
                .collect(Collectors.toSet()).size());

        return dto;
    }

    @Override
    public List<ProjectProgressDto> getProjectsProgress() {

        User currentUser = getCurrentUser();
        boolean admin = isAdmin(currentUser);

        List<Project> projects = admin ? projectRepository.findAll() : projectRepository.findAll().stream()
                .filter(project -> project.getMembers() != null && project.getMembers().stream().anyMatch(member -> member.getId() == currentUser.getId()))
                .toList();

        List<ProjectProgressDto> response =
                new ArrayList<>();

        for(Project project : projects){

            long totalTasks =
                    taskRepository.countByProject(project);

            long completedTasks =
                    taskRepository
                            .countByProjectAndTaskStatus(
                                    project,
                                    TaskStatus.DONE
                            );

            long pendingTasks =
                    totalTasks - completedTasks;

            double progress = 0;

            if(totalTasks > 0){

                progress =
                        ((double) completedTasks
                                / totalTasks) * 100;
            }

            ProjectProgressDto dto =
                    new ProjectProgressDto();

            dto.setProjectId(project.getId());

            dto.setProjectName(
                    project.getName()
            );

            dto.setTotalTasks(totalTasks);

            dto.setCompletedTasks(completedTasks);

            dto.setPendingTasks(pendingTasks);

            dto.setProgressPercentage(progress);

            response.add(dto);
        }

        return response;
    }

    @Override
    public List<TaskDto> filterTasks(
            TaskStatus status,
            String priority,
            Long assigneeId
    ) {

        User currentUser = getCurrentUser();
        boolean admin = isAdmin(currentUser);
        Long effectiveAssigneeId = admin ? assigneeId : currentUser.getId();

        List<Task> tasks;

        if(status != null && priority != null){

            tasks =
                    taskRepository
                            .findByTaskStatusAndPriority(
                                    status,
                                    priority
                            );

        } else if(status != null){

            tasks =
                    taskRepository.findByTaskStatus(status);

        } else if(priority != null){

            tasks =
                    taskRepository.findByPriority(priority);

                } else if(effectiveAssigneeId != null){

            tasks =
                    taskRepository.findByAssignees_Id(
                                                        effectiveAssigneeId
                    );

        } else {

                        tasks = admin ? taskRepository.findAll() : taskRepository.findAll().stream()
                                        .filter(task -> {
                                                boolean assigneeMatch = task.getAssignees() != null && task.getAssignees().stream().anyMatch(user -> user.getId() == currentUser.getId());
                                                boolean primaryMatch = task.getPrimaryAssignee() != null && task.getPrimaryAssignee().getId() == currentUser.getId();
                                                boolean projectMatch = task.getProject() != null && task.getProject().getMembers() != null && task.getProject().getMembers().stream().anyMatch(member -> member.getId() == currentUser.getId());
                                                return assigneeMatch || primaryMatch || projectMatch;
                                        })
                                        .toList();
        }

        return tasks.stream()
                .map(task ->
                        modelMapper.map(
                                task,
                                TaskDto.class
                        )
                )
                .toList();
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