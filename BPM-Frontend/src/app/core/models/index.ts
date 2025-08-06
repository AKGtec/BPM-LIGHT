// Auth models
export * from './auth.models';

// Workflow models
export * from './workflow.models';

// Request models
export * from './request.models';

// Notification models
export * from './notification.models';

// Common interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface SelectOption {
  value: any;
  label: string;
  disabled?: boolean;
}

export interface MenuItem {
  label: string;
  icon?: string;
  route?: string;
  children?: MenuItem[];
  roles?: string[];
  visible?: boolean;
}
