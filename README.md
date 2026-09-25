# onBoard — Full-Stack Issue & Sprint Tracker

> A high-performance, multi-tenant issue and sprint tracking platform inspired by Linear and Jira. Built with **React 19, TypeScript, Tailwind CSS v4, Node.js/Express, and PostgreSQL (Raw SQL)**.

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph ClientLayer ["Frontend Layer (React 19 + TypeScript + Tailwind CSS v4)"]
        UI["Kanban Board & Interactive Views"]
        AuthCtx["AuthContext (Global Session & useAuth Hook)"]
        ApiClient["Typed API Client (credentials: include)"]
    end

    subgraph ServerLayer ["Backend Layer (Express + TypeScript on Port 5001)"]
        AuthMW["requireAuth Middleware (JWT in HttpOnly Cookie)"]
        AuthCtrl["Auth Controller (/register, /login, /me, /logout)"]
        WsCtrl["Workspace Controller (ACID Transactions)"]
        ProjCtrl["Project Controller (Multi-Tenant Scoping)"]
        IssueCtrl["Issue Controller (Dynamic SQL Query Builder & COALESCE)"]
    end

    subgraph DatabaseLayer ["Database Layer (PostgreSQL with Connection Pool)"]
        Pool["pg.Pool Connection Pool"]
        T_Users["users (UUID, bcrypt hash)"]
        T_Workspaces["workspaces (UUID, unique slug)"]
        T_Members["workspace_members (ADMIN / MEMBER roles)"]
        T_Projects["projects (Unique Key prefixes e.g. CORE, MOB)"]
        T_Issues["issues (Status, Priority, Assignee, Reporter)"]
    end

    UI --> AuthCtx
    AuthCtx --> ApiClient
    ApiClient -->|HTTP with HttpOnly Cookie| ServerLayer
    
    ServerLayer --> AuthMW
    AuthMW --> AuthCtrl & WsCtrl & ProjCtrl & IssueCtrl
    
    AuthCtrl & WsCtrl & ProjCtrl & IssueCtrl --> Pool
    Pool --> T_Users & T_Workspaces & T_Members & T_Projects & T_Issues
```

---

## ✨ Core Features

- 🏢 **Multi-Tenant Workspaces & Projects**: Teams create isolated workspaces, assign member roles (`ADMIN`, `MEMBER`), and organize work with project key prefixes (e.g., `CORE-12`).
- 📋 **Interactive Kanban Board**: 4 status columns (`BACKLOG`, `TODO`, `IN_PROGRESS`, `DONE`) with instant **optimistic UI updates** for 0ms transition latency.
- 🎯 **Priority-Ranked Workflows**: Issues are automatically ordered by urgency (`URGENT` $\rightarrow$ `HIGH` $\rightarrow$ `MEDIUM` $\rightarrow$ `LOW`) using PostgreSQL `CASE` expressions.
- 🔍 **Live Search & Filter Engine**: Real-time debounced title search and priority pill filtering.
- 🔐 **Enterprise Security Engine**:
  - `bcryptjs` password hashing (10 salt rounds).
  - Secure `HttpOnly; SameSite=Lax` cookie-based JWT sessions (immune to XSS token theft & CSRF protected).
  - Route guarding with `<ProtectedRoute />` and session restoration via `GET /api/auth/me`.
- 🐘 **Zero-ORM Raw SQL Engine**:
  - Pure parameterized queries preventing SQL injection.
  - Connection pooling via `pg.Pool`.
  - ACID database transactions (`BEGIN` $\rightarrow$ `COMMIT` $\rightarrow$ `ROLLBACK`) for multi-table operations.
  - Partial updates using `COALESCE`.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | **React 19** with **TypeScript** |
| **Styling & UI** | **Tailwind CSS v4**, **Lucide React** |
| **Routing** | **React Router DOM v7** |
| **Build Tool** | **Vite v8** |
| **Backend API** | **Node.js**, **Express**, **TypeScript** (`tsx watch`) |
| **Database** | **PostgreSQL** (Raw SQL via official `pg` driver) |
| **Authentication** | **JSON Web Tokens (JWT)**, **`HttpOnly` Cookies**, **bcryptjs** |

---

## 🚀 Getting Started Guide

Follow these steps to set up and run onBoard locally:

### 1. Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- **PostgreSQL Database** (local instance or cloud database like Neon, Supabase, or AWS RDS)

---

### 2. Clone the Repository & Install Dependencies
```bash
git clone https://github.com/lassi332/onBoard.git
cd onBoard

# Install root, client, and server dependencies
npm install
npm install --prefix client
npm install --prefix server
```

---

### 3. Configure Environment Variables
Create a `.env` file in the `server/` directory:

```bash
# server/.env
PORT=5001
DATABASE_URL=postgresql://username:password@localhost:5432/onboard
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
NODE_ENV=development
```

> ⚠️ *Note: macOS AirPlay Receiver uses port 5000 by default. onBoard runs the backend permanently on port **5001** to prevent conflicts.*

---

### 4. Run Database Migrations
Initialize the 5 relational tables, foreign keys, and indexes:

```bash
npm run db:migrate
```

---

### 5. Seed Demo Data (Optional but Recommended)
Populate the database with demo users, workspaces, projects, and Kanban cards:

```bash
npm run db:seed
```

---

### 6. Start the Development Servers

Open two terminal tabs (or run concurrently):

**Terminal 1 — Start Backend API (Port 5001):**
```bash
npm run dev:server
```

**Terminal 2 — Start Frontend Client (Port 5173):**
```bash
npm run dev:client
```

Now open your browser and navigate to: **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Demo Login Credentials

If you ran `npm run db:seed`, you can immediately sign in with any of these pre-configured accounts:

| Role | Email | Password | Access / Workspaces |
| :--- | :--- | :--- | :--- |
| 🌟 **Lead / Admin** | `alex.chen@onboard.dev` *(or `demo@example.com`)* | `password123` | **Acme Engineering** (`CORE`, `UI`), **NextGen Mobile Lab** (`MOB`) |
| 👩‍💻 **Backend Dev** | `sarah.connor@onboard.dev` | `password123` | **Acme Engineering** |
| 👨‍💻 **Frontend Dev** | `marcus.vance@onboard.dev` | `password123` | **Acme Engineering**, **NextGen Mobile Lab** |

---

## 📡 REST API Reference

All protected endpoints require a valid `HttpOnly` JWT session cookie.

### Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user & set cookie |
| `POST` | `/api/auth/login` | Authenticate user & set cookie |
| `POST` | `/api/auth/logout` | Clear auth cookie |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |

### Workspaces (`/api/workspaces`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/workspaces` | Get all workspaces for current user |
| `POST` | `/api/workspaces` | Create workspace (ACID transaction: creates workspace + assigns user as ADMIN) |
| `GET` | `/api/workspaces/:id` | Get single workspace details |

### Projects (`/api/workspaces/:workspaceId/projects`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/workspaces/:workspaceId/projects` | List all projects in workspace |
| `POST` | `/api/workspaces/:workspaceId/projects` | Create new project with unique prefix key |
| `GET` | `/api/projects/:id` | Get project details |

### Issues (`/api/projects/:projectId/issues` & `/api/issues`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/projects/:projectId/issues` | Query issues with `?q=...&priority=...&status=...` (Sorted by priority) |
| `POST` | `/api/projects/:projectId/issues` | Create new issue |
| `PATCH` | `/api/issues/:id` | Partially update issue status, priority, title, etc. |
| `DELETE` | `/api/issues/:id` | Delete issue |

---

## 🗄️ Database Schema Diagram

```mermaid
erDiagram
    users ||--o{ workspace_members : "belongs to"
    users ||--o{ issues : "assigned to"
    users ||--o{ issues : "reported by"
    users ||--o{ comments : "writes"

    workspaces ||--o{ workspace_members : "has"
    workspaces ||--o{ projects : "contains"

    projects ||--o{ issues : "contains"
    issues ||--o{ comments : "has"

    users {
        UUID id PK
        VARCHAR email UK
        VARCHAR password_hash
        VARCHAR name
        TEXT avatar_url
        TIMESTAMPTZ created_at
    }

    workspaces {
        UUID id PK
        VARCHAR name
        VARCHAR slug UK
        TEXT description
        TIMESTAMPTZ created_at
    }

    workspace_members {
        UUID workspace_id FK
        UUID user_id FK
        VARCHAR role "ADMIN | MEMBER"
        TIMESTAMPTZ joined_at
    }

    projects {
        UUID id PK
        UUID workspace_id FK
        VARCHAR key "CORE, MOB"
        VARCHAR name
        TEXT description
    }

    issues {
        UUID id PK
        UUID project_id FK
        VARCHAR title
        TEXT description
        VARCHAR status "BACKLOG | TODO | IN_PROGRESS | DONE"
        VARCHAR priority "LOW | MEDIUM | HIGH | URGENT"
        TIMESTAMPTZ due_date
        UUID assignee_id FK
        UUID reporter_id FK
    }

    comments {
        UUID id PK
        UUID issue_id FK
        UUID user_id FK
        TEXT content
        TIMESTAMPTZ created_at
    }
```
