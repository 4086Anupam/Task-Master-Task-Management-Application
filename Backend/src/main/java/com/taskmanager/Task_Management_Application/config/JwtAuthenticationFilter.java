package com.taskmanager.Task_Management_Application.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.taskmanager.Task_Management_Application.exception.ApiError;
import com.taskmanager.Task_Management_Application.service.jwt.UserService;
import com.taskmanager.Task_Management_Application.utils.JwtUtil;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private final UserService userService;

    @Override
    protected void doFilterInternal(

            @NonNull HttpServletRequest request,

            @NonNull HttpServletResponse response,

            @NonNull FilterChain filterChain

    ) throws ServletException, IOException {

        final String authHeader =
                request.getHeader("Authorization");

        final String jwt;

        final String userEmail;

        // =====================================
        // Check Token Exists
        // =====================================

        if (authHeader == null
                || !authHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);

            return;
        }

        jwt = authHeader.substring(7);

        try {

            // =====================================
            // Extract Username
            // =====================================

            userEmail =
                    jwtUtil.extractUsername(jwt);

            // =====================================
            // Authenticate User
            // =====================================

            if (userEmail != null
                    && SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UserDetails userDetails =

                        userService.userDetailsService()
                                .loadUserByUsername(
                                        userEmail
                                );

                // =====================================
                // Validate Token
                // =====================================

                if (jwtUtil.isTokenValid(
                        jwt,
                        userDetails
                )) {

                    UsernamePasswordAuthenticationToken
                            authToken =

                            new UsernamePasswordAuthenticationToken(

                                    userDetails,

                                    null,

                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(

                            new WebAuthenticationDetailsSource()
                                    .buildDetails(request)
                    );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authToken);
                }
            }

        }

        // =====================================
        // JWT Expired
        // =====================================

        catch (ExpiredJwtException ex) {

            handleJwtException(

                    response,

                    request,

                    "JWT Token Expired",

                    HttpStatus.UNAUTHORIZED
            );

            return;
        }

        // =====================================
        // Invalid JWT
        // =====================================

        catch (JwtException ex) {

            handleJwtException(

                    response,

                    request,

                    "Invalid JWT Token",

                    HttpStatus.UNAUTHORIZED
            );

            return;
        }

        // =====================================
        // Generic Exception
        // =====================================

        catch (Exception ex) {

            handleJwtException(

                    response,

                    request,

                    ex.getMessage(),

                    HttpStatus.INTERNAL_SERVER_ERROR
            );

            return;
        }

        filterChain.doFilter(request, response);
    }

    // =====================================
    // Common Exception Response Method
    // =====================================

    private void handleJwtException(

            HttpServletResponse response,

            HttpServletRequest request,

            String message,

            HttpStatus status

    ) throws IOException {

        ApiError error = new ApiError(

                LocalDateTime.now(),

                status.value(),

                status.getReasonPhrase(),

                message,

                request.getRequestURI()
        );

        response.setStatus(status.value());

        response.setContentType(
                MediaType.APPLICATION_JSON_VALUE
        );

        ObjectMapper mapper = new ObjectMapper();

        mapper.writeValue(
                response.getWriter(),
                error
        );
    }
}