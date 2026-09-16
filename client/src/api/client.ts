const API_BASE = 'http://localhost:5001/api';

// ==========================================
// 1. TypeScript Interfaces (Data Models)
// ==========================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  role?: string;
  joined_at?: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  key: string;
  name: string;
  description?: string;
  created_at?: string;
}

export interface Issue {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: 'BACKLOG' | 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignee_id?: string | null;
  assignee_name?: string | null;
  reporter_id?: string;
  reporter_name?: string;
  order_index: number;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface IssueFilters {
  status?: string;
  priority?: string;
  assignee_id?: string;
  q?: string;
}

// ==========================================
// 2. Generic Fetch Engine
// ==========================================

async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Automatically sends HttpOnly JWT cookies!
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data as T;
}

// ==========================================
// 3. Centralized API Methods
// ==========================================

export const api = {
  // Authentication
  auth: {
    register: (name: string, email: string, password: string) =>
      apiFetch<{ message: string; user: User }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),

    login: (email: string, password: string) =>
      apiFetch<{ message: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    logout: () =>
      apiFetch<{ message: string }>('/auth/logout', {
        method: 'POST',
      }),

    getMe: () =>
      apiFetch<{ user: User }>('/auth/me', {
        method: 'GET',
      }),
  },

  // Workspaces
  workspaces: {
    list: () =>
      apiFetch<{ workspace: Workspace[] }>('/workspaces', {
        method: 'GET',
      }),

    create: (name: string, slug: string, description?: string) =>
      apiFetch<{ message: string; workspace: Workspace }>('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name, slug, description }),
      }),

    getById: (id: string) =>
      apiFetch<{ workspace: Workspace }>(`/workspaces/${id}`, {
        method: 'GET',
      }),
  },

  // Projects
  projects: {
    listByWorkspace: (workspaceId: string) =>
      apiFetch<{ projests: Project[] }>(`/workspaces/${workspaceId}/projects`, {
        method: 'GET',
      }),

    create: (workspaceId: string, key: string, name: string, description?: string) =>
      apiFetch<{ message: string; project: Project }>(`/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        body: JSON.stringify({ key, name, description }),
      }),

    getById: (id: string) =>
      apiFetch<{ projects: Project }>(`/projects/${id}`, {
        method: 'GET',
      }),
  },

  // Issues (Kanban Board)
  issues: {
    listByProject: (projectId: string, filters?: IssueFilters) => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.assignee_id) params.append('assignee_id', filters.assignee_id);
      if (filters?.q) params.append('q', filters.q);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      return apiFetch<{ issues: Issue[] }>(`/projects/${projectId}/issues${queryString}`, {
        method: 'GET',
      });
    },

    create: (projectId: string, issue: Partial<Issue>) =>
      apiFetch<{ message: string; issue: Issue }>(`/projects/${projectId}/issues`, {
        method: 'POST',
        body: JSON.stringify(issue),
      }),

    update: (issueId: string, updates: Partial<Issue>) =>
      apiFetch<{ message: string; issue: Issue }>(`/issues/${issueId}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),

    delete: (issueId: string) =>
      apiFetch<{ message: string }>(`/issues/${issueId}`, {
        method: 'DELETE',
      }),
  },
};
