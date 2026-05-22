package com.taskmanager.Task_Management_Application.dto;

import lombok.Data;

@Data
public class DashboardSummaryDto {

    private long totalProjects;

    private long totalTasks;

    private long completedTasks;

    private long pendingTasks;

    private long inProgressTasks;

    private long totalUsers;
}