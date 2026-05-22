package com.taskmanager.Task_Management_Application.service.auth;

import com.taskmanager.Task_Management_Application.dto.AuthenticationRequest;
import com.taskmanager.Task_Management_Application.dto.AuthenticationResponse;
import com.taskmanager.Task_Management_Application.dto.SignupRequest;
import com.taskmanager.Task_Management_Application.dto.UserDto;

public interface AuthService {

  UserDto signupUser(SignupRequest signupRequest);

  void generateOtpForUser(String email);

  boolean verifyOtpForUser(String email, String otp, String newPassword);

  boolean hasUserWithEmail(String email);

    AuthenticationResponse login(AuthenticationRequest request);


}
