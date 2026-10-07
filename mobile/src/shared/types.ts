// ============================================================
// shared/types.ts — Canonical enums and DTO types
// Consumed by backend, web, and mobile via sync.mjs copy
// ============================================================

export enum ProjectStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

// ---------------------- Auth ----------------------
export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}

// ---------------------- Project ----------------------
export interface ProjectDTO {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  userId: string;
  taskCount?: number;
  completedTaskCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string;
  endDate?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
}

// ---------------------- Task ----------------------
export interface TaskDTO {
  id: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  name: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  projectId: string;
}

export interface UpdateTaskInput {
  name?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string | null;
}

// ---------------------- Dashboard ----------------------
export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  projectsInProgress: number;
  completedProjects: number;
}

// ---------------------- API Responses ----------------------
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---------------------- Query Params ----------------------
export interface ProjectQueryParams {
  search?: string;
  status?: ProjectStatus;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TaskQueryParams {
  projectId?: string;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status';
  sortOrder?: 'asc' | 'desc';
}

