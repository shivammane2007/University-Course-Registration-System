# University Subject Registration System (USRS)

A full-stack web application with three role-based dashboards for university course registration management.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, React Query v5, Zustand |
| Backend | Express.js, Prisma ORM, JWT Authentication |
| Database | MySQL |
| UI | shadcn/ui, Lucide React, Recharts |

## Project Structure

```
University Course Registration System/
├── frontend/         → Next.js 14 app
├── backend/          → Express.js server
├── prisma/           → Database schema + seed
│   ├── schema.prisma
│   └── seed.js
└── package.json      → Root workspace scripts
```

## Prerequisites

- Node.js v20+
- MySQL 8.0+ (running locally)
- npm

## Setup & Run

### 1. Configure Environment

**Backend** — edit `backend/.env`:
```env
DATABASE_URL="mysql://root:<YOUR_PASSWORD>@localhost:3306/usrs_db"
JWT_SECRET="your_secret_here"
JWT_REFRESH_SECRET="your_refresh_secret_here"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=5000
```

**Frontend** — `frontend/.env.local` is pre-configured:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 2. Create the Database

Run in MySQL:
```sql
CREATE DATABASE usrs_db;
```

### 3. Install Dependencies

```bash
# Root
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 4. Run Prisma Migration

```bash
cd backend
npx prisma migrate dev --name init --schema=../prisma/schema.prisma
npx prisma generate --schema=../prisma/schema.prisma
```

### 5. Seed the Database

```bash
cd backend
node ../prisma/seed.js
```

This creates:
- 1 Admin account
- 4 Departments
- 3 Faculty members
- 5 Students
- 3 Courses
- Sample enrolments

### 6. Start Development Servers

```bash
# Terminal 1 — Backend (port 5000)
cd backend && npm run dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Or use the root script:
```bash
npm run dev
```

Open: **http://localhost:3000**

---

## Default Login Credentials

| Role | User ID | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Faculty | `FAC001` | `faculty123` |
| Faculty | `FAC002` | `faculty123` |
| Faculty | `FAC003` | `faculty123` |
| Student | `PRN2024001` | `student123` |
| Student | `PRN2024002` | `student123` |

---

## API Overview

Base URL: `http://localhost:5000/api`

| Module | Prefix | Role Required |
|---|---|---|
| Auth | `/auth` | Public |
| Admin | `/admin` | admin |
| Faculty | `/faculty` | faculty |
| Student | `/student` | student |

All protected routes require: `Authorization: Bearer <accessToken>`

---

## Dashboard Features

### Admin Dashboard
- System stats (Students, Faculty, Courses, Departments)
- Full CRUD for all entities
- Enrolment approval/rejection
- Reports with bar chart, pie chart, CSV export

### Faculty Dashboard
- View assigned courses
- Edit course details (name, timing, duration)
- View enrolled students per course
- Schedule overview

### Student Dashboard
- Profile management
- Browse and register for available courses
- View enrolment status (Pending/Approved/Dropped)
- Personal timetable (approved courses only)
