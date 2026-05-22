package com.taskmanager.Task_Management_Application.dto;

import lombok.Data;
import java.util.List;

@Data
public class ProjectDto {

    private Long id;

    private String name;

    private String description;

    private List<UserDto> members;

    private List<TaskDto> tasks;
}