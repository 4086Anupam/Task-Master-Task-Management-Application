package com.taskmanager.Task_Management_Application.repository;

import com.taskmanager.Task_Management_Application.entities.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {




}