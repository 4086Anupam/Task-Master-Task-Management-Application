# Task Management Application

## 📌 Project Overview ([Watch Demo Video](https://drive.google.com/file/d/1R_YW_VKKHE96RLnwD1379uijU1Capeye/view?usp=sharing))

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
# ✨ Additional Features

## 🔄 Drag-and-Drop Task Management

The application supports **drag-and-drop functionality** for moving tasks between different columns.

### Supported Columns
- 📝 To Do
- 🚧 In Progress
- ✅ Completed

Users can drag a task card and drop it into another column to instantly update the task status.

### Benefits
- Faster task updates
- Better workflow visualization
- Interactive user experience
- Smooth task management

---

# 📜 Activity Log / Audit Trail

The application maintains an **activity log (audit trail)** for every task.

### Logged Activities
- Task creation
- Task updates
- Status changes
- Priority changes
- Task deletion

This helps users track the complete history of each task.

### Benefits
- Improved transparency
- Better project monitoring
- Easy tracking of changes
- Enhanced accountability

---

# 🔔 Due Date Notifications

The application provides **email or in-app notifications** for task due dates.

### Notification Features
- Due date reminders
- Overdue task alerts
- Real-time in-app updates
- Important task notifications

Notifications help users complete tasks on time and improve productivity.

---

# 🚀 User Experience Enhancements

These additional features make the application more:

- Interactive
- User-friendly
- Efficient
- Scalable
- Productivity-focused

The integration of drag-and-drop task management, activity tracking, and notifications provides a modern project management experience similar to platforms like Trello and Jira.

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
- Gmail SMTP Server
  

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

# 🔐 Environment Variables
## Backend
irectory and add the following variables:

```env
# ===============================
# DATABASE CONFIGURATION
# ===============================

DATABASE_URL=your_database_url
DATABASE_USERNAME=your_database_username
DATABASE_PASSWORD=your_database_password

# ===============================
# SERVER CONFIGURATION
# ===============================

PORT=8080

# ===============================
# JWT CONFIGURATION
# ===============================

JWT_SECRET=your_jwt_secret_key

# ===============================
# EMAIL CONFIGURATION
# ===============================

MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

---

# ⚠️ Important Notes

- Never upload your real `.env` file to GitHub.
- Add `.env` to `.gitignore`.
- Use Gmail App Password instead of your normal Gmail password.
- Keep all secrets and credentials private.

---

# 📧 Gmail SMTP Setup

Enable:
- 2-Step Verification
- Generate App Password

Use the generated App Password in:

```env
MAIL_PASSWORD=your_app_password
```


# ⚙️ Application Configuration

## 📄 application.properties

```properties
spring.application.name=Task_Management_Application

# ===============================
# DATABASE CONFIGURATION
# ===============================

spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}

spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# ===============================
# JPA / HIBERNATE
# ===============================

spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# ===============================
# SERVER
# ===============================

server.port=${PORT:8080}

# ===============================
# JWT
# ===============================

jwt.secret=${JWT_SECRET}

# ===============================
# EMAIL / SMTP
# ===============================

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}

spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.connectiontimeout=5000
spring.mail.properties.mail.smtp.timeout=5000
spring.mail.properties.mail.smtp.writetimeout=5000

app.mail.from-address=${MAIL_USERNAME}
```

---

# 🚀 How to Run
# 💻 Local Setup Instructions

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/your-repository-name.git
```

---

## 2️⃣ Navigate to the Project Directory

```bash
cd your-repository-name
```

---

## 3️⃣ Configure application.properties

Update:

```text
src/main/resources/application.properties
```

Add your database, JWT, and email credentials.

---

## 4️⃣ Install Dependencies

Make sure you have installed:

- Java 17+
- Maven
- PostgreSQL

Check versions:

```bash
java --version
mvn --version
```

---

## 5️⃣ Create PostgreSQL Database

Create a PostgreSQL database manually or use Neon/Supabase PostgreSQL database.

Example database name:

```text
task_management_db
```

---

## 6️⃣ Run the Backend Application

Using Maven:

```bash
mvn spring-boot:run
```

Or:

```bash
./mvnw spring-boot:run
```

---

## 7️⃣ Backend Runs On

```text
http://localhost:8080
```

---

## 8️⃣ Test APIs

Use:
- Postman
- Swagger
- Frontend Application

to test the REST APIs.

---

# ✅ Application Ready

The Task Management Application is now running locally.
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
