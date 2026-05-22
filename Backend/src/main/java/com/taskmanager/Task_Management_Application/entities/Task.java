package com.taskmanager.Task_Management_Application.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.taskmanager.Task_Management_Application.dto.TaskDto;
import com.taskmanager.Task_Management_Application.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "tasks")
@Data
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private String description;

    @Enumerated(EnumType.STRING)
    private TaskStatus taskStatus;

    private String priority;

    private LocalDate dueDate;

    // =====================================
    // Primary Assignee Mapping
    // =====================================

    @ManyToOne(fetch = FetchType.LAZY, optional = true)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore
    private User primaryAssignee;

    // =====================================
    // Additional Assignees Mapping
    // =====================================

    @ManyToMany
    @JoinTable(
            name = "task_assignees",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @JsonIgnore
    private Set<User> assignees = new HashSet<>();

    // =====================================
    // Project Mapping
    // =====================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @JsonIgnore
    private Project project;

    // Active / soft-delete
    private Boolean active = true;

    // Audit fields
    private Long createdBy;
    private Long updatedBy;
    private Long deletedBy;

    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private java.time.LocalDateTime deletedAt;

    // =====================================
    // Convert Entity to DTO
    // =====================================

    public TaskDto getTaskDto() {

        TaskDto taskDto = new TaskDto();

        taskDto.setId(id);

        taskDto.setTitle(title);

        taskDto.setDescription(description);

        taskDto.setTaskStatus(taskStatus);

        taskDto.setPriority(priority);

        taskDto.setDueDate(dueDate);

        List<User> sortedAssignees = assignees == null ? List.of() : assignees.stream()
                .sorted(Comparator.comparingLong(User::getId))
                .toList();

        User primary = primaryAssignee != null ? primaryAssignee : (sortedAssignees.isEmpty() ? null : sortedAssignees.get(0));

        if (primary != null) {
            taskDto.setUserId(primary.getId());
            taskDto.setUser(primary.getUserDto());
        }

        if (!sortedAssignees.isEmpty()) {
            taskDto.setAssigneeIds(sortedAssignees.stream().map(User::getId).collect(Collectors.toList()));
            taskDto.setAssignees(sortedAssignees.stream().map(User::getUserDto).collect(Collectors.toList()));
        } else if (primary != null) {
            taskDto.setAssigneeIds(List.of(primary.getId()));
            taskDto.setAssignees(List.of(primary.getUserDto()));
        }

        if (project != null) {
            taskDto.setProjectId(project.getId());
        }

        // =========================
        // User DTO
        // =========================

        // =========================
        // Project DTO
        // =========================

        if(project != null){
            taskDto.setProject(
                    project.getProjectDto()
            );
        }

        return taskDto;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (active == null) {
            active = true;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}