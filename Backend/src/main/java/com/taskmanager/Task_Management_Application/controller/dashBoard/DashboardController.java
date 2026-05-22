package com.taskmanager.Task_Management_Application.controller.dashBoard;

import com.taskmanager.Task_Management_Application.dto.DashboardSummaryDto;
import com.taskmanager.Task_Management_Application.dto.ProjectProgressDto;
import com.taskmanager.Task_Management_Application.dto.TaskDto;
import com.taskmanager.Task_Management_Application.enums.TaskStatus;
import com.taskmanager.Task_Management_Application.service.dashboard.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
public class DashboardController {

    private final DashboardService dashboardService;

    // =========================================
    // Dashboard Summary API
    // =========================================

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDto>
    getDashboardSummary() {

        DashboardSummaryDto response =
                dashboardService.getDashboardSummary();

        return ResponseEntity.ok(response);
    }

    // =========================================
    // Projects Progress API
    // =========================================

    @GetMapping("/projects-progress")
    public ResponseEntity<List<ProjectProgressDto>>
    getProjectsProgress() {

        List<ProjectProgressDto> response =
                dashboardService.getProjectsProgress();

        return ResponseEntity.ok(response);
    }

    // =========================================
    // Filter Tasks API
    // =========================================

    @GetMapping("/filter-tasks")
    public ResponseEntity<List<TaskDto>>
    filterTasks(

            @RequestParam(required = false)
            TaskStatus status,

            @RequestParam(required = false)
            String priority,

            @RequestParam(required = false)
            Long assigneeId
    ) {

        List<TaskDto> response =
                dashboardService.filterTasks(
                        status,
                        priority,
                        assigneeId
                );

        return ResponseEntity.ok(response);
    }
}