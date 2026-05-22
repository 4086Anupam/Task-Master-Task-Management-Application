package com.taskmanager.Task_Management_Application.service.project;

import com.taskmanager.Task_Management_Application.dto.ProjectDto;

public interface ProjectService {

    java.util.List<ProjectDto> getAllProjects();

    ProjectDto getProjectById(Long id);
    
    ProjectDto createProject(ProjectDto projectDto);

    ProjectDto updateProject(Long id, ProjectDto projectDto);

    void deleteProject(Long id);

    void assignMemberToProject(Long projectId, Long userId);

    void removeMemberFromProject(Long projectId, Long userId);
}