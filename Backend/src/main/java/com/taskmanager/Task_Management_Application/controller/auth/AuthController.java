package com.taskmanager.Task_Management_Application.controller.auth;

import com.taskmanager.Task_Management_Application.dto.AuthenticationRequest;
import com.taskmanager.Task_Management_Application.dto.AuthenticationResponse;
import com.taskmanager.Task_Management_Application.dto.SignupRequest;
import com.taskmanager.Task_Management_Application.dto.UserDto;
import com.taskmanager.Task_Management_Application.service.auth.AuthService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import com.taskmanager.Task_Management_Application.dto.VerifyOtpRequest;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signupUser(
            @RequestBody SignupRequest signupRequest) {

        if (authService.hasUserWithEmail(
                signupRequest.getEmail())) {

            return ResponseEntity
                    .status(HttpStatus.NOT_ACCEPTABLE)
                    .body("User already exists with this email");
        }

        UserDto createdUserDto =
                authService.signupUser(signupRequest);

        if (createdUserDto == null) {

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body("User not created");
        }

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdUserDto);
    }

        @PostMapping("/request-otp")
        public ResponseEntity<String> requestOtp(@RequestParam String email) {
                authService.generateOtpForUser(email);
                return ResponseEntity.ok("OTP sent if user exists and is unverified");
        }

        @PostMapping("/verify-otp")
        public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest verifyOtpRequest) {
                boolean ok = authService.verifyOtpForUser(verifyOtpRequest.getEmail(), verifyOtpRequest.getOtp(), verifyOtpRequest.getNewPassword());
                if (ok) return ResponseEntity.ok("Verified");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid or expired OTP");
        }

    @PostMapping("/login")
    public ResponseEntity<AuthenticationResponse> login(
            @RequestBody AuthenticationRequest authenticationRequest) throws Exception {

        try {
            AuthenticationResponse authenticationResponse = authService.login(authenticationRequest);
            return ResponseEntity.ok(authenticationResponse);

        } catch (Exception e) {

            throw new Exception(e.getMessage());
        }
    }
}