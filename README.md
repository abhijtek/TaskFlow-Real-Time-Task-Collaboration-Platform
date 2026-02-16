# Real-Time Task Collaboration Platform

![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248)
![Realtime](https://img.shields.io/badge/Realtime-Socket.IO-010101)
![Tests](https://img.shields.io/badge/Tests-Vitest%20%2B%20RTL-6E9F18)
![License](https://img.shields.io/badge/License-ISC-blue)

## Table of Contents
- [1. Introduction](#1-introduction)
- [2. Features](#2-features)
- [3. Tech Stack](#3-tech-stack)
- [4. Architecture Overview](#4-architecture-overview)
- [5. Project Structure](#5-project-structure)
- [6. API Summary](#6-api-summary)
- [7. Socket Events](#7-socket-events)
- [8. Prerequisites](#8-prerequisites)
- [9. Environment Variables](#9-environment-variables)
- [10. Installation](#10-installation)
- [11. Run Locally](#11-run-locally)
- [12. Testing](#12-testing)
- [13. Build for Production](#13-build-for-production)
- [14. Usage Flow](#14-usage-flow)
- [15. Security Notes](#15-security-notes)
- [16. Recruiter Notes](#16-recruiter-notes)

## 1. Introduction
TaskFlow is a real-time collaborative project management app where teams organize work inside workspaces, boards, lists, and tasks.  
It supports live updates (Socket.IO), role-based workspace membership, task assignment, activity logs, and a responsive React UI.

## 2. Features
- JWT authentication (`signup`, `login`, `me`) with protected frontend routes.
- Workspaces with owner/admin/member roles.
- Workspace member management (invite by email, role change, remove member).
- Boards inside a workspace with color selection.
- Lists inside boards (create, rename, delete, reorder support in API).
- Tasks with drag-and-drop movement across lists.
- Task fields: title, description, assignee, priority, due date.
- Activity feed API for board-level changes.
- Search API across boards and tasks in a workspace.
- Real-time updates for:
  - task moved
  - task updated
  - list created/updated/deleted
  - board created (workspace room broadcast)
- Light/dark theme support.
- Vitest + Testing Library test setup for key realtime flows.

## 3. Tech Stack
### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- Socket.IO Client
- Framer Motion
- `@hello-pangea/dnd` for drag-and-drop
- Axios
- Vitest + Testing Library

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT (`jsonwebtoken`)
- bcrypt
- cookie-parser
- CORS
- Nodemailer + Mailgen (email flows)

## 4. Architecture Overview
### Data model
- `Workspace` -> has many `Board`
- `Board` -> has many `List` and `Task`
- `Task` -> belongs to one `List` and one `Board`
- `Workspace` and `Board` keep `members` with `{ user, role }`
- `Activity` stores board-level event history

### Auth model
- Frontend stores token in `localStorage` (`taskflow_token`) and sends it as `Authorization: Bearer <token>`.
- Backend API middleware accepts bearer token (and cookie fallback in some paths).
- Socket connection uses JWT in `socket.handshake.auth.token`.

### Realtime model
- Board-scoped events use room `board-<boardId>`.
- Workspace-scoped board creation uses room `workspace-<workspaceId>`.
- Client emits events; server validates/broadcasts to relevant rooms.

## 5. Project Structure
```text
backend/
  src/
    controllers/
    middlewares/
    models/
    routes/
    utils/
    socket.handlers.js
    app.js
    index.js

frontend/
  src/
    pages/
    components/
    context/
  services/
  lib/
  tests/
```

## 6. API Summary
### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Workspaces
- `GET /api/workspaces`
- `GET /api/workspaces/:id`
- `POST /api/workspaces`
- `PUT /api/workspaces/:id`
- `DELETE /api/workspaces/:id`
- `POST /api/workspaces/:wsId/members`
- `DELETE /api/workspaces/:wsId/members/:userId`
- `PATCH /api/workspaces/:wsId/members/:userId/role`

### Boards
- `GET /api/boards?workspace=<workspaceId>`
- `GET /api/boards/:id`
- `POST /api/boards`
- `PUT /api/boards/:id`
- `DELETE /api/boards/:id`

### Lists
- `POST /api/lists`
- `PUT /api/lists/:id`
- `DELETE /api/lists/:id`
- `PATCH /api/lists/reorder`

### Tasks
- `GET /api/tasks?board=<boardId>`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/move`
- `PATCH /api/tasks/:id/assign`

### Search and Activity
- `GET /api/search?q=<query>&workspace=<workspaceId>`
- `GET /api/activities?boardId=<boardId>&page=1&limit=20`

## 7. Socket Events
### Client emits
- `join-board`, `leave-board`
- `join-workspace`, `leave-workspace`
- `task-moved`, `task-updated`, `task-deleted`
- `list-created`, `list-updated`, `list-deleted`
- `board-created`

### Server broadcasts
- `task-moved`, `task-updated`
- `list-created`, `list-updated`, `list-deleted`
- `board-created`
- `user-joined`, `user-left` (board presence)

## 8. Prerequisites
- Node.js 18+
- npm 9+
- MongoDB database (local or Atlas)

## 9. Environment Variables
### Backend (`backend/.env`)
```bash
MONGO_URI=<your_mongodb_uri>
PORT=3000
CORS_ORIGIN=http://localhost:5173

ACCESS_TOKEN_SECRET=<secret>
ACCESS_TOKEN_EXPIRY=10d
REFRESH_TOKEN_SECRET=<secret>
REFRESH_TOKEN_EXPIRY=10d

MAILTRAP_SMTP_HOST=<host>
MAILTRAP_SMTP_PORT=<port>
MAILTRAP_SMTP_USER=<user>
MAILTRAP_SMTP_PASS=<pass>
FORGOT_PASSWORD_REDIRECT_URL=http://localhost:5173/forgot-password
```

### Frontend (`frontend/.env`)
```bash
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
# Optional:
# VITE_USE_MOCK=true
```

## 10. Installation
```bash
# backend
cd backend
npm install

# frontend
cd ../frontend
npm install
```

## 11. Run Locally
### Start backend
```bash
cd backend
npm run dev
```

### Start frontend
```bash
cd frontend
npm run dev
```

### App URLs
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

## 12. Testing
```bash
cd frontend
npm run test
npm run test:run
npm run test:coverage
```

Current tests cover key realtime and socket integration behavior around board creation and sidebar updates.

## 13. Build for Production
```bash
cd frontend
npm run build
npm run preview
```

```bash
cd backend
npm start
```

## 14. Usage Flow
1. Create an account or log in.
2. Create a workspace.
3. Invite members by email from the workspace sidebar.
4. Create a board in that workspace.
5. Use default lists or add new lists.
6. Create tasks and drag tasks between lists.
7. Open multiple clients to see realtime updates.

## 15. Security Notes
- Do not commit real `.env` secrets to source control.
- Rotate secrets immediately if they were exposed.
- Prefer `httpOnly` cookie-only auth for production if you harden this further.

## 16. Recruiter Notes
- Includes full-stack architecture (React + Node + MongoDB).
- Demonstrates realtime collaboration with room-scoped Socket.IO events.
- Includes role-based access controls and API-level membership checks.
- Includes automated frontend tests for critical realtime behavior.
