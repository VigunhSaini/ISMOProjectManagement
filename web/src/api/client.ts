import axios, { AxiosError } from 'axios';
import { ApiError } from '../shared/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 token expiration and normalization
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    const errorCode = error.response?.data?.error?.code;

    // Decision #3: Only trigger session expiration for protected endpoints with token errors
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      (errorCode === 'TOKEN_EXPIRED' ||
        errorCode === 'INVALID_TOKEN' ||
        errorCode === 'UNAUTHENTICATED' ||
        errorCode === 'MISSING_TOKEN')
    ) {
      localStorage.removeItem('auth_token');
      localStorage.setItem('auth_flash', 'Your session has expired. Please log in again.');
      // Avoid redirect loop if already on login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    // Network error (backend down or unreachable)
    if (!error.response) {
      return Promise.reject({
        message: 'Cannot reach the server. Please check your network connection or server status.',
        code: 'NETWORK_ERROR',
      });
    }

    return Promise.reject(error.response.data?.error || {
      message: error.message || 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR',
    });
  }
);
