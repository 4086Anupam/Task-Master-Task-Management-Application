package com.taskmanager.Task_Management_Application.service.dashboard;

import com.taskmanager.Task_Management_Application.dto.DashboardSummaryDto;
import com.taskmanager.Task_Management_Application.dto.ProjectProgressDto;
import com.taskmanager.Task_Management_Application.dto.TaskDto;
import com.taskmanager.Task_Management_Application.enums.TaskStatus;

import java.util.List;

public interface DashboardService {

    DashboardSummaryDto getDashboardSummary();

    List<ProjectProgressDto> getProjectsProgress();

    List<TaskDto> filterTasks(
            TaskStatus status,
            String priority,
            Long assigneeId
    );
}