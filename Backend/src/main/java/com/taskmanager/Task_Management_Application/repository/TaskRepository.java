package com.taskmanager.Task_Management_Application.repository;

import com.taskmanager.Task_Management_Application.entities.Project;
import com.taskmanager.Task_Management_Application.entities.Task;
import com.taskmanager.Task_Management_Application.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {

    long countByTaskStatus(TaskStatus taskStatus);

    long countByProject(Project project);

    long countByProjectAndTaskStatus(
            Project project,
            TaskStatus taskStatus
    );

    List<Task> findByProject(Project project);

    List<Task> findByTaskStatus(TaskStatus taskStatus);

    List<Task> findByPriority(String priority);

    List<Task> findByTaskStatusAndPriority(
            TaskStatus taskStatus,
            String priority
    );

    List<Task> findByAssignees_Id(Long assigneeId);

        List<Task> findByPrimaryAssignee_Id(Long assigneeId);
}