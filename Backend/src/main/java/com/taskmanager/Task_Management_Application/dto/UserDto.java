package com.taskmanager.Task_Management_Application.dto;


import com.taskmanager.Task_Management_Application.enums.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDto {

    private Long id;
    private String name;
    private String email;
    private UserRole role;
    private Boolean active;
    private Boolean verified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;
}
