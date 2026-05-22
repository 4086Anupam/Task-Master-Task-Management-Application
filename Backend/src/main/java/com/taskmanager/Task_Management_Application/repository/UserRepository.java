package com.taskmanager.Task_Management_Application.repository;

import com.taskmanager.Task_Management_Application.entities.User;
import com.taskmanager.Task_Management_Application.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findFirstByEmail(String email);

    Optional<User> findByRole(UserRole role);

    Optional<User> findByEmail(String email);
}