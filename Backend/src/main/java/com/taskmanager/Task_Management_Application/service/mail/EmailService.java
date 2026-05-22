package com.taskmanager.Task_Management_Application.service.mail;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Value("${app.mail.from-address:noreply@taskmanager.local}")
    private String fromAddress;

    public void sendSimpleMessage(String to, String subject, String text) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender == null) {
            log.error("JavaMailSender is not configured. Email to {} will not be sent. Check SMTP configuration (spring.mail.*).", to);
            throw new IllegalStateException("Mail sender not available - check SMTP settings");
        }

        SimpleMailMessage message = new SimpleMailMessage();
        String resolvedFrom = fromAddress;
        if (resolvedFrom == null || resolvedFrom.isBlank() || "noreply@taskmanager.local".equals(resolvedFrom)) {
            resolvedFrom = mailUsername;
        }
        if (resolvedFrom != null && !resolvedFrom.isBlank()) {
            message.setFrom(resolvedFrom);
        }
        message.setTo(to);
        message.setSubject(subject);
        message.setText(text);
        try {
            mailSender.send(message);
            log.info("Sent email to {} subject={}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {} subject={} - {}", to, subject, e.getMessage(), e);
            throw new RuntimeException("Failed to send email to " + to + ": " + e.getMessage(), e);
        }
    }
}
