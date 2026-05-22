package com.taskmanager.Task_Management_Application.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AuditLogDto {
    private Long id;
    private String action;
    private String entityName;
    private Long entityId;
    private Long performedById;
    private String performedByEmail;
    private LocalDateTime performedAt;
    private String details;
    private String beforeState;
    private String afterState;
}
