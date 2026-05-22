package com.taskmanager.Task_Management_Application.dto;

import com.taskmanager.Task_Management_Application.enums.UserRole;
import com.taskmanager.Task_Management_Application.dto.UserDto;

import lombok.Data;

@Data
public class AuthenticationResponse {

    private String jwt;

    private Long userId;

    private UserRole userRole;

    private boolean verificationRequired;

    private String email;

    private UserDto user;
}