package com.taskmanager.Task_Management_Application.entities;

import com.taskmanager.Task_Management_Application.dto.UserDto;
import com.taskmanager.Task_Management_Application.enums.UserRole;
import jakarta.persistence.*;

import lombok.Data;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@Entity
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String name;

    private String email;

    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    // Active / Soft-delete flag
    private Boolean active = true;

    // Whether the user has verified their account (OTP flow for admin-created users)
    private Boolean verified = true;

    // One-time password for verification (6 digit)
    private String otp;

    private LocalDateTime otpExpiry;

    // Audit fields
    private Long createdBy;
    private Long updatedBy;
    private Long deletedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {

        return email;
    }

    @Override
    public boolean isAccountNonExpired() {

        return true;
    }

    @Override
    public boolean isAccountNonLocked() {

        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {

        return true;
    }

    @Override
    public boolean isEnabled() {

        return active == null || active;
    }

    public UserDto getUserDto() {
        UserDto userDto = new UserDto();

        userDto.setId(id);

        userDto.setName(name);

        userDto.setEmail(email);

        userDto.setRole(role);

        userDto.setActive(active);
        userDto.setVerified(verified);
        userDto.setCreatedAt(createdAt);
        userDto.setUpdatedAt(updatedAt);
        userDto.setDeletedAt(deletedAt);

        return userDto;
    }


    public boolean isActive() {
        return active == null || active;
    }

    @PrePersist
    public void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (active == null) {
            active = true;
        }
        if (verified == null) {
            verified = true;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}