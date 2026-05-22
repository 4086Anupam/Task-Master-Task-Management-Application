package com.taskmanager.Task_Management_Application.service.auth;

import com.taskmanager.Task_Management_Application.dto.AuthenticationRequest;
import com.taskmanager.Task_Management_Application.dto.AuthenticationResponse;
import com.taskmanager.Task_Management_Application.dto.SignupRequest;
import com.taskmanager.Task_Management_Application.dto.UserDto;

import com.taskmanager.Task_Management_Application.entities.User;
import com.taskmanager.Task_Management_Application.enums.UserRole;
import com.taskmanager.Task_Management_Application.repository.UserRepository;
import com.taskmanager.Task_Management_Application.service.audit.AuditLogService;
import com.taskmanager.Task_Management_Application.utils.JwtUtil;

import jakarta.annotation.PostConstruct;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    private final AuthenticationManager authenticationManager;

    private final JwtUtil jwtUtil;

        private final AuditLogService auditLogService;

        private final com.taskmanager.Task_Management_Application.service.mail.EmailService emailService;

    @PostConstruct
    public void createAnAdminAccount() {

        Optional<User> optionalUser =
                userRepository.findByRole(UserRole.ADMIN);

        if (optionalUser.isEmpty()) {

            User user = new User();

            user.setEmail("admin@test.com");

            user.setName("admin");

            user.setPassword(
                    new BCryptPasswordEncoder().encode("admin")
            );

            user.setRole(UserRole.ADMIN);

            userRepository.save(user);

            log.info("Admin Account Created Successfully");

        } else {

            log.info("Admin Account Already Exists");
        }
    }

    @Override
    public UserDto signupUser(
            SignupRequest signupRequest) {

        User user = new User();

        user.setEmail(signupRequest.getEmail());

        user.setName(signupRequest.getName());

        user.setPassword(
                new BCryptPasswordEncoder()
                        .encode(signupRequest.getPassword())
        );

                user.setRole(signupRequest.getRole() != null ? signupRequest.getRole() : UserRole.EMPLOYEE);

                // If created by admin, mark unverified and generate OTP
                if (signupRequest.isCreatedByAdmin()) {
                        user.setVerified(false);
                        String otp = String.format("%06d", (int) (Math.random() * 900000) + 100000);
                        user.setOtp(otp);
                        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
                } else {
                        user.setVerified(true);
                }

                User createdUser = userRepository.save(user);

                auditLogService.record("CREATE", "User", createdUser.getId(), null, createdUser.getUserDto(), "User created" + (signupRequest.isCreatedByAdmin() ? " by admin" : " by self-signup"));

                // send OTP email if needed
                if (!Boolean.TRUE.equals(createdUser.getVerified()) && createdUser.getOtp() != null) {
                        try {
                                emailService.sendSimpleMessage(createdUser.getEmail(), "Your account verification code", "Your OTP: " + createdUser.getOtp());
                        } catch (Exception e) {
                                log.error("Failed to send signup OTP email to {}: {}", createdUser.getEmail(), e.getMessage());
                        }
                }

                return createdUser.getUserDto();
    }

    @Override
    public boolean hasUserWithEmail(String email) {

        return userRepository
                .findFirstByEmail(email)
                .isPresent();
    }

    @Override
    public AuthenticationResponse login(
            AuthenticationRequest request) {
        // If user is an unverified employee, do not authenticate via password; require OTP flow
        java.util.Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();
            if (user.getRole() == UserRole.EMPLOYEE && !Boolean.TRUE.equals(user.getVerified())) {
                                // Reuse the current OTP if it is still valid; only generate a new one when needed.
                                ensureOtpForUser(user);

                AuthenticationResponse response = new AuthenticationResponse();
                response.setJwt(null);
                                response.setVerificationRequired(true);
                                response.setEmail(user.getEmail());
                                response.setUserId(user.getId());
                                response.setUserRole(user.getRole());
                                response.setUser(user.getUserDto());
                return response; // client should detect null jwt and prompt for OTP
            }
        }

        authenticationManager.authenticate(

                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow();

        String jwtToken =
                jwtUtil.generateToken(user);

        AuthenticationResponse response =
                new AuthenticationResponse();

        response.setJwt(jwtToken);
        response.setVerificationRequired(false);
        response.setEmail(user.getEmail());
        response.setUserId(user.getId());
        response.setUserRole(user.getRole());
                response.setUser(user.getUserDto());

        return response;
    }

    @Override
    public void generateOtpForUser(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
                UserDto before = user.getUserDto();
        String otp = String.format("%06d", (int) (Math.random() * 900000) + 100000);
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);
                auditLogService.record("UPDATE", "User", user.getId(), before, user.getUserDto(), "OTP generated or refreshed");
        try {
            emailService.sendSimpleMessage(user.getEmail(), "Your OTP Code", "Your OTP: " + otp);
                                } catch (Exception e) {
                                        log.error("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
                                }
    }

    @Override
    public boolean verifyOtpForUser(String email, String otp, String newPassword) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
                UserDto before = user.getUserDto();
                String submittedOtp = otp == null ? null : otp.trim();
                String storedOtp = user.getOtp() == null ? null : user.getOtp().trim();

                if (storedOtp == null || storedOtp.isBlank()) return false;
                if (submittedOtp == null || submittedOtp.isBlank()) return false;
                if (user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(java.time.LocalDateTime.now())) return false;
                if (!storedOtp.equals(submittedOtp)) return false;
        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);
        if (newPassword != null && !newPassword.isBlank()) {
            user.setPassword(new BCryptPasswordEncoder().encode(newPassword));
        }
        userRepository.save(user);
                auditLogService.record("VERIFY_OTP", "User", user.getId(), before, user.getUserDto(), newPassword != null && !newPassword.isBlank() ? "OTP verified and password changed" : "OTP verified");
        return true;
    }

        private void ensureOtpForUser(User user) {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                if (user.getOtp() == null || user.getOtpExpiry() == null || user.getOtpExpiry().isBefore(now)) {
                        String otp = String.format("%06d", (int) (Math.random() * 900000) + 100000);
                        user.setOtp(otp);
                        user.setOtpExpiry(now.plusMinutes(15));
                        userRepository.save(user);
                }

                try {
                    emailService.sendSimpleMessage(user.getEmail(), "Your OTP Code", "Your OTP: " + user.getOtp());
                } catch (Exception e) {
                    log.error("Failed to resend OTP email to {}: {}", user.getEmail(), e.getMessage());
                }
        }
}