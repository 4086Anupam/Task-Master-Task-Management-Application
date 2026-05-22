package com.taskmanager.Task_Management_Application.service.admin;

import com.taskmanager.Task_Management_Application.dto.TaskDto;
import com.taskmanager.Task_Management_Application.dto.UserDto;
import com.taskmanager.Task_Management_Application.enums.TaskStatus;

import java.util.List;

public interface AdminService {

    List<UserDto> getUsers(boolean includeInactive);

    void deleteUser(Long id);

    void deactivateUser(Long id);

    void restoreUser(Long id);

    TaskDto createTask(TaskDto taskDto);

    List<TaskDto> getAllTasks();

    void deleteTask(Long id);

    TaskDto getTaskById(Long id);

    TaskDto updateTask(Long id, TaskDto taskDto);

    TaskDto updateTaskStatus(Long id, TaskStatus status);

}