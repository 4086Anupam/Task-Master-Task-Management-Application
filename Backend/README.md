# Task Management Application

## 📌 Project Overview

The **Task Management Application** is a full-stack web application designed to help teams and organizations manage projects and tasks efficiently.

The system provides secure **JWT-based authentication** with **role-based access control** for **Admin** and **Member** users.

Users can:

- Create and manage projects
- Assign team members
- Track tasks using a Kanban board
- Monitor task progress
- Filter tasks based on status, priority, or assignee

The main goal of the project is to improve team collaboration, task tracking, and productivity through a secure and user-friendly platform.

---

# 🚀 Core Features

## 🔐 1. User Authentication

- User Registration & Login
- JWT-Based Authentication
- Secure API Access
- Role-Based Authorization
  - Admin
  - Member

---

## 📁 2. Project Management

- Create Projects
- Update Projects
- Delete Projects
- Assign Members to Projects
- View Project Details

---

## 📋 3. Task Board (Kanban)

The application provides a **Kanban-style task board** with the following columns:

- 📝 To Do
- 🚧 In Progress
- ✅ Done

### ✅ Task Features

- Create Tasks
- Edit Tasks
- Delete Tasks
- Move Tasks Between Columns
- Assign Tasks to Members

### ⚡ Task Priority Levels

- Low
- Medium
- High

### 📅 Additional Features

- Set Due Dates
- Track Task Status
- Manage Assigned Members

---

## 📊 4. Dashboard

The dashboard provides an overview of:

- Total Projects
- Task Progress
- Completed Tasks
- Pending Tasks
- In Progress Tasks

### 🔍 Filters

- Filter by Status
- Filter by Priority
- Filter by Assignee

---

# 🛠️ Technologies Used

## Frontend

- React.js
- HTML
- CSS
- JavaScript

## Backend

- Spring Boot
- Spring Security
- JWT Authentication
- REST APIs

## Database

- PostgreSQL

## Tools & Deployment

- Docker
- GitHub
- Postman
- Maven

---


# 📁 Backend Project Structure

```text
Backend/
│
├── src/
│   │
│   ├── main/
│   │   │
│   │   ├── java/com/taskmanagement/
│   │   │   │
│   │   │   ├── config/              # Security & application configuration
│   │   │   ├── controller/          # REST API controllers
│   │   │   ├── dto/                 # Request & Response DTOs
│   │   │   ├── entities/            # JPA entity classes
│   │   │   ├── enums/               # Enum definitions
│   │   │   ├── exception/           # Global exception handling
│   │   │   ├── repository/          # JPA repositories
│   │   │   ├── security/            # JWT & Spring Security logic
│   │   │   ├── service/             # Service interfaces
│   │   │   ├── service/impl/        # Service implementations
│   │   │   ├── util/                # Utility/helper classes
│   │   │   │
│   │   │   └── TaskManagementApplication.java
│   │   │
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── static/
│   │
│   └── test/
│       └── java/com/taskmanagement/
│
├── target/                          # Compiled build files
│
├── Dockerfile                       # Docker image configuration
├── docker-compose.yml               # Multi-container setup
├── pom.xml                          # Maven dependencies & build config
├── .gitignore                       # Git ignored files
├── mvnw                             # Maven wrapper
├── mvnw.cmd                         # Maven wrapper for Windows
│
└── README.md                        # Project documentation
```

---

# 📌 Package Description

| Package | Description |
|--------|-------------|
| `config` | Contains application and security configurations |
| `controller` | Handles REST API requests and responses |
| `dto` | Data Transfer Objects for API communication |
| `entity` | Database entity classes using JPA |
| `enums` | Enum constants such as Task Status & Priority |
| `exception` | Custom exceptions and global exception handler |
| `repository` | Interfaces for database operations |
| `security` | JWT authentication & Spring Security classes |
| `service` | Business logic interfaces |
| `service/impl` | Business logic implementations |
| `util` | Utility/helper classes |

---

# 🛠️ Configuration Files

| File | Purpose |
|------|----------|
| `application.properties` | Main application configuration |
| `application-dev.properties` | Development environment configuration |
| `application-prod.properties` | Production environment configuration |
| `pom.xml` | Maven dependencies and plugins |
| `docker-compose.yml` | Docker multi-container setup |

---

# 🚀 Main Entry Point

```java
TaskManagementApplication.java
```

This is the main Spring Boot application file used to start the backend server.

---

# 🔐 Security Layer

The backend uses:

- Spring Security
- JWT Authentication
- Role-Based Authorization
- Password Encryption

---

# 🗄️ Database Layer

The project uses:

- PostgreSQL Database
- Spring Data JPA
- Hibernate ORM

---

# 🐳 Docker Support

Docker is used for:

- Containerization
- Easy Deployment
- Consistent Development Environment

Run the project using:

```bash
docker-compose up --build
```
## Environment Variables

### Backend

Copy `Backend/.env.example` to `Backend/.env` and update the values.

Required variables:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/task_management
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your-database-password
JWT_SECRET=your-base64-encoded-jwt-secret
PORT=8080
```

### Variable Description

| Variable | Description |
|---|---|
| DATABASE_URL | PostgreSQL database connection URL |
| DATABASE_USERNAME | PostgreSQL database username |
| DATABASE_PASSWORD | PostgreSQL database password |
| JWT_SECRET | Secret key used for JWT token generation and validation |
| PORT | Backend server port |

### Frontend

Copy `Frontend/.env.example` to `Frontend/.env` and update the values if needed.

Required variables:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Variable Description

| Variable | Description |
|---|---|
| VITE_API_BASE_URL | Base URL of the Spring Boot backend API |

# ⚙️ application.properties Configuration

Update your `application.properties` file like this:

```properties
# ===============================
# Application Configuration
# ===============================

spring.application.name=${APP_NAME}

server.port=${PORT:8080}

# ===============================
# Database Configuration
# ===============================

spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

spring.datasource.driver-class-name=org.postgresql.Driver

# ===============================
# JPA / Hibernate Configuration
# ===============================

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# ===============================
# JWT Configuration
# ===============================

jwt.secret=${JWT_SECRET}
```

---

# 🚀 How to Run
## Run Locally

### 1. Start the Backend

```bash
cd Backend
mvn spring-boot:run
```

The backend server runs on port `8080` by default.

---

### 2. Start the Frontend

Open a second terminal:

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs on the Vite development server, usually at:

```text
http://localhost:5173
```

---

## Build Commands

### Backend

```bash
cd Backend
mvn clean install -DskipTests
```

### Frontend

```bash
cd Frontend
npm run build
```


---

## 🐳 Run with Docker

```bash
docker-compose up --build
```

---

# 📌 Important Notes

- Never push the real `.env` file to GitHub
- Only upload `.env.example`
- Add `.env` to `.gitignore`

Example:

```gitignore
.env
```

---

# 🔒 Security Best Practices

✅ Keep JWT secrets private  
✅ Use strong database passwords  
✅ Never hardcode secrets inside source code  
✅ Use different environment variables for development and production

---

# 📁 Recommended Structure

```text
Backend/
│
├── .env
├── .env.example
├── Dockerfile
├── docker-compose.yml
├── pom.xml
└── src/
```
# ⚡ Local Setup Instructions

## Prerequisites

Make sure the following tools are installed on your system:

- Java 17+
- Maven 3.9+
- Git
- IntelliJ IDEA / VS Code

---

# 1️⃣ Clone the Repository

```bash
git clone <repository-url>
```

Navigate to the backend folder:

```bash
cd Backend
```

---

# 2️⃣ Configure `application.properties`

Update `src/main/resources/application.properties`:

```properties
spring.application.name=Task_Management_Application

spring.datasource.url=jdbc:postgresql://ep-crimson-sky-aptzib4w-pooler.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require

spring.datasource.username=neondb_owner
spring.datasource.password=your_database_password

spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

jwt.secret=your_jwt_secret_key

server.port=${PORT:8080}
```

---

# 3️⃣ Install Dependencies

```bash
mvn clean install
```

---

# 4️⃣ Run the Application

```bash
mvn spring-boot:run
```

Application will start on:

```text
http://localhost:8080
```

---

# 5️⃣ Build JAR File

```bash
mvn clean package
```

Generated JAR file:

```text
target/Task_Management_Application.jar
```

Run manually:

```bash
java -jar target/Task_Management_Application.jar
```

---

# 6️⃣ Important Notes

- Never push database credentials or JWT secrets to GitHub
- Use environment variables or `.env` file for production
- Add sensitive files inside `.gitignore`

Example:

```gitignore
.env
target/
```

# 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      Frontend        │
                    │   React.js Client    │
                    └──────────┬───────────┘
                               │
                               │ HTTP Requests
                               ▼
                    ┌──────────────────────┐
                    │   REST API Layer     │
                    │ Spring Boot Backend  │
                    └──────────┬───────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Authentication │  │ Project Module   │  │   Task Module    │
│  JWT Security  │  │ Project Services │  │ Kanban Services  │
└────────────────┘  └──────────────────┘  └──────────────────┘
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Service Layer     │
                    │ Business Logic Layer │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Repository Layer   │
                    │ Spring Data JPA      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   PostgreSQL DB      │
                    │                      │
                    └──────────────────────┘


```

# 🔐 JWT Authentication Flow

```text
User Login
      ↓
Credentials Validation
      ↓
JWT Token Generation
      ↓
Token Sent To Client
      ↓
Client Stores JWT Token
      ↓
Protected API Request
      ↓
JWT Token Validation
      ↓
Access Granted To Protected APIs
```

---

## 📌 Authentication Workflow

### 1️⃣ User Login
The user sends email and password from the frontend application.

---

### 2️⃣ Credentials Validation
Spring Security validates the provided credentials.

---

### 3️⃣ JWT Token Generation
If authentication is successful, the backend generates a JWT token.

---

### 4️⃣ Token Returned To Client
The generated JWT token is sent back to the frontend client.

---

### 5️⃣ Client Stores JWT Token
The frontend stores the token securely for future API requests.

---

### 6️⃣ Protected API Request
The client sends the JWT token inside the `Authorization` header.

Example:

```http
Authorization: Bearer <jwt_token>
```

---

### 7️⃣ JWT Token Validation
The backend validates:
- Token authenticity
- Token expiration
- User authorization

---

### 8️⃣ Access Granted
If the token is valid, access to protected APIs is granted.

---
## API Summary

### Authentication

- `POST /api/auth/signup`
- `POST /api/auth/login`

### Projects

- `GET /api/projects/{id}`
- `POST /api/projects`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`
- `PUT /api/projects/{projectId}/members/{userId}`
- `DELETE /api/projects/{projectId}/members/{userId}`

### Admin Tasks

- `GET /api/admin/tasks`
- `GET /api/admin/task/{id}`
- `POST /api/admin/task`
- `PUT /api/admin/task/{id}`
- `PUT /api/admin/task/{id}/status?status=TODO|IN_PROGRESS|DONE`
- `DELETE /api/admin/task/{id}`

### Dashboard

- `GET /api/dashboard/summary`
- `GET /api/dashboard/projects-progress`
- `GET /api/dashboard/filter-tasks`
