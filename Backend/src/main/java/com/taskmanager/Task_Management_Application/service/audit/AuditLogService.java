package com.taskmanager.Task_Management_Application.service.audit;

import com.taskmanager.Task_Management_Application.dto.AuditLogDto;

import java.util.List;

public interface AuditLogService {

    void record(String action, String entityName, Long entityId, Object beforeState, Object afterState, String details);

    List<AuditLogDto> getAllAuditLogs();
}
