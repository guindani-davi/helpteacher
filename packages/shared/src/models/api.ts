export interface ApiResponse<T> {
  data: T;
  timestamp: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: string[];
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
