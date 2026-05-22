package com.taskmanager.Task_Management_Application.dto;

import com.taskmanager.Task_Management_Application.enums.TaskStatus;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class TaskDto {

    private Long id;

    private String title;

    private String description;

    private TaskStatus taskStatus;

    private String priority;

    private Long userId;

    private LocalDate dueDate;

    private Long projectId;

    private ProjectDto project;

    private UserDto user;

    private List<Long> assigneeIds;

    private List<UserDto> assignees;

}