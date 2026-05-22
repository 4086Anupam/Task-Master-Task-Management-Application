package com.taskmanager.Task_Management_Application.dto;

import lombok.Data;

@Data
public class ProjectProgressDto {

    private Long projectId;

    private String projectName;

    private long totalTasks;

    private long completedTasks;

    private long pendingTasks;

    private double progressPercentage;
}