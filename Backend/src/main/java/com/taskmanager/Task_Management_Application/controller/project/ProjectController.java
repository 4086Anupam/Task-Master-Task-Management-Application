package com.taskmanager.Task_Management_Application.controller.project;

import com.taskmanager.Task_Management_Application.dto.ProjectDto;
import com.taskmanager.Task_Management_Application.service.project.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects")
public class ProjectController {

    private final ProjectService projectService;

    // Get Project
    @GetMapping("/{id}")
    public ResponseEntity<ProjectDto> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(
                projectService.getProjectById(id)
        );
    }

    // Get All Projects
    @GetMapping
    public ResponseEntity<java.util.List<ProjectDto>> getAllProjects() {
        return ResponseEntity.ok(
                projectService.getAllProjects()
        );
    }

    // Create Project
    @PostMapping
    public ResponseEntity<ProjectDto> createProject(
            @RequestBody ProjectDto projectDto) {

        return ResponseEntity.ok(
                projectService.createProject(projectDto)
        );
    }

    // Update Project
    @PutMapping("/{id}")
    public ResponseEntity<ProjectDto> updateProject(
            @PathVariable Long id,
            @RequestBody ProjectDto projectDto) {

        return ResponseEntity.ok(
                projectService.updateProject(id, projectDto)
        );
    }

    // Delete Project
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProject(@PathVariable Long id) {

        projectService.deleteProject(id);

        return ResponseEntity.ok("Project Deleted Successfully");
    }

    // Assign Member
    @PutMapping("/{projectId}/members/{userId}")
    public ResponseEntity<String> assignMember(
            @PathVariable Long projectId,
            @PathVariable Long userId) {

        projectService.assignMemberToProject(projectId, userId);

        return ResponseEntity.ok("Member Assigned Successfully");
    }

    // Remove Member
    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<String> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId) {

        projectService.removeMemberFromProject(projectId, userId);

        return ResponseEntity.ok("Member Removed Successfully");
    }
}