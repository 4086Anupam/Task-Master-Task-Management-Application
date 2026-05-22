package com.taskmanager.Task_Management_Application.controller.admin;

import com.taskmanager.Task_Management_Application.dto.TaskDto;
import com.taskmanager.Task_Management_Application.dto.UserDto;
import com.taskmanager.Task_Management_Application.enums.TaskStatus;
import com.taskmanager.Task_Management_Application.service.admin.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getUsers(
            @RequestParam(defaultValue = "false") boolean includeInactive
    ) {

        return ResponseEntity.ok(
                adminService.getUsers(includeInactive)
        );
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id
    ) {

        adminService.deleteUser(id);

        return ResponseEntity.ok("User deleted successfully");
    }

        @PutMapping("/users/{id}/deactivate")
        public ResponseEntity<String> deactivateUser(@PathVariable Long id) {
                adminService.deactivateUser(id);
                return ResponseEntity.ok("User deactivated");
        }

        @PutMapping("/users/{id}/restore")
        public ResponseEntity<String> restoreUser(@PathVariable Long id) {
                adminService.restoreUser(id);
                return ResponseEntity.ok("User restored");
        }

    @PostMapping("/task")
    public ResponseEntity<TaskDto> createTask(
            @RequestBody TaskDto taskDto
    ) {

        TaskDto createdTaskDTO =
                adminService.createTask(taskDto);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdTaskDTO);
    }

    @GetMapping("/tasks")
    public ResponseEntity<List<TaskDto>>
    getAllTasks() {

        return ResponseEntity.ok(
                adminService.getAllTasks()
        );
    }

    @DeleteMapping("/task/{id}")
    public ResponseEntity<String> deleteTask(
            @PathVariable Long id
    ) {

        adminService.deleteTask(id);

        return ResponseEntity.ok(
                "Task deleted successfully"
        );
    }

    @GetMapping("/task/{id}")
    public ResponseEntity<TaskDto> getTaskById(
            @PathVariable Long id
    ) {

        TaskDto taskDto =
                adminService.getTaskById(id);

        return ResponseEntity.ok(taskDto);
    }

    @PutMapping("/task/{id}")
    public ResponseEntity<TaskDto> updateTask(

            @PathVariable Long id,

            @RequestBody TaskDto taskDto
    ) {

        TaskDto updatedTask =
                adminService.updateTask(
                        id,
                        taskDto
                );

        return ResponseEntity.ok(updatedTask);
    }

    @PutMapping("/task/{id}/status")
    public ResponseEntity<TaskDto>
    updateTaskStatus(

            @PathVariable Long id,

            @RequestParam TaskStatus status
    ) {

        TaskDto updatedTask =
                adminService.updateTaskStatus(
                        id,
                        status
                );

        return ResponseEntity.ok(updatedTask);
    }
}