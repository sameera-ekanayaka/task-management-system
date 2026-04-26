# Task Management System
### INTE 21323 - Group Assignment

A full-stack Task Management System built with React, Node.js, Express, and MySQL.

---

## 🌐 Live Demo
- **Frontend:** https://task-management-system-nsuw.vercel.app
- **API Documentation:** http://localhost:5000/api-docs

---

## 👥 Group Members

| Name | Student ID | Role |
|------|-----------|------|
| Sameera Ekanayaka | IM/2023/090 | Team Lead & DevOps |
| Member 2 | ID | Frontend Developer |
| Member 3 | ID | Frontend Developer |
| Member 4 | ID | Backend Developer |
| Member 5 | ID | Backend Developer |

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js |
| Backend | Node.js + Express.js |
| Database | MySQL + Prisma ORM |
| Real-time | Socket.io |
| Authentication | JWT + bcrypt |
| Containerization | Docker |
| API Docs | Swagger (OpenAPI 3.0) |
| Deployment | Vercel (Frontend) |

---

## ✨ Features

- ✅ Role-based authentication (Admin, Project Manager, Collaborator)
- ✅ JWT token authentication
- ✅ Task management with Kanban board
- ✅ Real-time notifications with Socket.io
- ✅ User management with role assignment
- ✅ Task comments system
- ✅ Search and filter tasks
- ✅ Docker containerization
- ✅ Swagger API documentation

---

## 👤 User Roles

| Role | Permissions |
|------|------------|
| **Admin** | Full access - manage users, tasks, system |
| **Project Manager** | Create & manage tasks, assign collaborators |
| **Collaborator** | View & update status of assigned tasks |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v22+
- MySQL 8.0+
- Docker Desktop

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/sameera-ekanayaka/task-management-system.git
cd task-management-system
```

**2. Setup Backend**
```bash
cd backend
npm install
```

**3. Configure Environment Variables**

Create `backend/.env`:
```env
DATABASE_URL="mysql://root:password@localhost:3306/task_management_db"
JWT_SECRET="your-secret-key"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```

**4. Run Database Migrations**
```bash
npx prisma migrate deploy
```

**5. Start Backend**
```bash
npm run dev
```

**6. Setup Frontend**
```bash
cd ../frontend
npm install
npm start
```

---

## 🐳 Docker Setup

Run everything with one command:
```bash
docker-compose up --build
```

This starts:
- MySQL database on port 3307
- Backend API on port 5000
- Frontend on port 80

---

## 📡 API Documentation

Start the backend server and visit: http://localhost:5000/api-docs

### Main Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | /api/auth/login | Login | Public |
| POST | /api/auth/reset-password | Reset password | Authenticated |
| GET | /api/users | Get all users | Admin |
| POST | /api/users | Create user | Admin |
| GET | /api/tasks | Get all tasks | Authenticated |
| POST | /api/tasks | Create task | Admin/PM |
| PATCH | /api/tasks/:id/status | Update status | Authenticated |
| GET | /api/notifications | Get notifications | Authenticated |

---

## 🗄️ Database Schema

User
├── id, name, email, password
├── role (ADMIN/PROJECT_MANAGER/COLLABORATOR)
└── isActive, mustResetPassword
Task
├── id, title, description
├── priority (LOW/MEDIUM/HIGH)
├── status (TODO/IN_PROGRESS/COMPLETED)
└── dueDate, createdById
TaskAssignment → Links Tasks to Users
Comment → Task comments by Users
Notification → Real-time notifications for Users

---

## 📁 Project Structure

task-management-system/
├── backend/
│   ├── controllers/    # Request handlers
│   ├── routes/         # API endpoints
│   ├── middleware/     # JWT authentication
│   ├── services/       # Business logic
│   ├── prisma/         # Database schema
│   └── server.js       # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI
│   │   ├── pages/      # Full pages
│   │   ├── services/   # API calls
│   │   └── context/    # Auth state
│   └── public/
├── docker-compose.yml
└── README.md

---

## 🔒 Security Features

- JWT token authentication
- bcrypt password hashing
- Role-based access control (RBAC)
- CORS protection
- Input validation
- SQL injection prevention via Prisma ORM

---

## 📝 License

This project is for educational purposes - INTE 21323 Group Assignment.