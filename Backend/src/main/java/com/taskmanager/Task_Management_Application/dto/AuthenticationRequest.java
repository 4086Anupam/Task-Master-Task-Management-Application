package com.taskmanager.Task_Management_Application.dto;



import lombok.Data;

@Data
public class AuthenticationRequest {

    private String email;

    private String password;
}
