package com.taskmanager.Task_Management_Application.controller.employee;

import com.taskmanager.Task_Management_Application.dto.TaskDto;
import com.taskmanager.Task_Management_Application.enums.TaskStatus;
import com.taskmanager.Task_Management_Application.service.admin.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employee")
@RequiredArgsConstructor
@CrossOrigin(originPatterns = "*")
public class EmployeeTaskController {

    private final AdminService adminService;

    // Allow employees to update only the status of a task they are related to
    @PutMapping("/task/{id}/status")
    public ResponseEntity<TaskDto> updateTaskStatus(
            @PathVariable Long id,
            @RequestParam TaskStatus status
    ) {

        TaskDto updated = adminService.updateTaskStatus(id, status);

        return ResponseEntity.ok(updated);
    }
}
