package com.taskmanager.Task_Management_Application.dto;

import lombok.Data;

@Data
public class VerifyOtpRequest {
    private String email;
    private String otp;
    private String newPassword;
}
