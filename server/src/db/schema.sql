CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

create table if not exists workspace_members (
    workspace_id uuid not null references workspaces(id) on delete cascade,
    user_id uuid not null references users(id) on delete cascade,
    role varchar(20) not null default 'MEMBER' check (role in ('ADMIN', 'MEMBER')),
    joined_at timestamptz default current_timestamp,
    primary key (workspace_id, user_id)
);

create table if not exists projects (
    id uuid primary key default gen_random_uuid(),
    workspace_id uuid not null references workspaces(id) on delete cascade,
    key varchar(10) not null,
    name varchar(100) not null,
    description text,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp,
    unique (workspace_id, key)
);

create table if not exists issues (
    id uuid primary key default gen_random_uuid(),
    project_id uuid not null references projects(id) on delete cascade,
    title varchar(255) not null,
    description text,
    status varchar(20) not null default 'TODO'
    check (status in ('BACKLOG', 'TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED')),
    priority varchar(20) not null default 'MEDIUM'
    check(priority in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    order_index float not null default 0,
    due_date timestamptz,
    assignee_id uuid references users(id) on delete set null,
    reporter_id uuid not null references users(id) on delete restrict,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

create table if not exists comments (
    id uuid primary key default gen_random_uuid(),
    issue_id uuid not null references issues(id) on delete cascade ,
    user_id uuid not null references users(id) on delete cascade ,
    content text not null,
    created_at timestamptz default current_timestamp,
    updated_at timestamptz default current_timestamp
);

create index if not exists idx_users_email on users(email);
create index if not exists idx_issues_project_id on issues(project_id);
create index if not exists idx_issue_status on issues (status);
create index if not exists idx_issues_assignee_id on issues(assignee_id);
create index if not exists idx_comments_issue_id on comments(issue_id);
