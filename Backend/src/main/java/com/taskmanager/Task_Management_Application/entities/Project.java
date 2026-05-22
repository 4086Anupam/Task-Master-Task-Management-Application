package com.taskmanager.Task_Management_Application.entities;

import com.taskmanager.Task_Management_Application.dto.ProjectDto;
import jakarta.persistence.*;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "projects")
@Data
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    // Many users can join many projects
    @ManyToMany
    @JoinTable(
            name = "project_members",
            joinColumns = @JoinColumn(name = "project_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> members = new HashSet<>();

    public ProjectDto getProjectDto() {
        ProjectDto projectDto = new ProjectDto();
        projectDto.setId(id);
        projectDto.setName(name);
        projectDto.setDescription(description);
        
        if (members != null) {
            List<com.taskmanager.Task_Management_Application.dto.UserDto> memberDtos = members.stream()
                .map(User::getUserDto)
                .collect(Collectors.toList());
            projectDto.setMembers(memberDtos);
        }
        
        return projectDto;
    }
}
