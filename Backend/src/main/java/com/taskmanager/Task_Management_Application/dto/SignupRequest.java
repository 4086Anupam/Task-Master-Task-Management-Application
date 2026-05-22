package com.taskmanager.Task_Management_Application.dto;


import lombok.Data;
import com.taskmanager.Task_Management_Application.enums.UserRole;

@Data
public class SignupRequest {

    private String name;
    private String email;
    private String password;
    private boolean createdByAdmin = false;
    private UserRole role = UserRole.EMPLOYEE;
}
