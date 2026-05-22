package com.taskmanager.Task_Management_Application.service.audit;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.Task_Management_Application.dto.AuditLogDto;
import com.taskmanager.Task_Management_Application.entities.AuditLog;
import com.taskmanager.Task_Management_Application.entities.User;
import com.taskmanager.Task_Management_Application.repository.AuditLogRepository;
import com.taskmanager.Task_Management_Application.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Override
    public void record(String action, String entityName, Long entityId, Object beforeState, Object afterState, String details) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityName(entityName);
        auditLog.setEntityId(entityId);
        auditLog.setDetails(details);
        auditLog.setPerformedAt(LocalDateTime.now());

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && authentication.getName() != null) {
            userRepository.findByEmail(authentication.getName()).ifPresent(user -> {
                auditLog.setPerformedById(user.getId());
                auditLog.setPerformedByEmail(user.getEmail());
            });
        }

        auditLog.setBeforeState(serialize(beforeState));
        auditLog.setAfterState(serialize(afterState));
        auditLogRepository.save(auditLog);
    }

    @Override
    public List<AuditLogDto> getAllAuditLogs() {
        return auditLogRepository.findAllByOrderByPerformedAtDesc().stream().map(this::toDto).toList();
    }

    private AuditLogDto toDto(AuditLog auditLog) {
        AuditLogDto dto = new AuditLogDto();
        dto.setId(auditLog.getId());
        dto.setAction(auditLog.getAction());
        dto.setEntityName(auditLog.getEntityName());
        dto.setEntityId(auditLog.getEntityId());
        dto.setPerformedById(auditLog.getPerformedById());
        dto.setPerformedByEmail(auditLog.getPerformedByEmail());
        dto.setPerformedAt(auditLog.getPerformedAt());
        dto.setDetails(auditLog.getDetails());
        dto.setBeforeState(auditLog.getBeforeState());
        dto.setAfterState(auditLog.getAfterState());
        return dto;
    }

    private String serialize(Object value) {
        if (value == null) {
            return null;
        }

        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException e) {
            return String.valueOf(value);
        }
    }
}
