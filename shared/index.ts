// shared/index.ts — Main entry point for shared contracts
// Export enums and non-conflicting types from types.ts
export {
  ProjectStatus,
  TaskPriority,
  TaskStatus,
} from './types';
export type {
  AuthUser,
  AuthResponse,
  ProjectDTO,
  TaskDTO,
  DashboardStats,
  ApiSuccess,
  ApiError,
  PaginatedResponse,
} from './types';
// Export Zod schemas and their schema-inferred input types (these are the authoritative input types)
export * from './schemas/index';
