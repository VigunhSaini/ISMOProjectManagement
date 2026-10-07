import axios, { AxiosError } from 'axios';
import { getToken, deleteToken } from '../storage/secureToken';
import { ApiError } from '../shared/types';

// EXPO_PUBLIC_API_URL set in .env or default to local IP/localhost
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let onSessionExpiredCallback: (() => void) | null = null;

export function registerSessionExpiredCallback(cb: () => void) {
  onSessionExpiredCallback = cb;
}

// Request interceptor: attach token from hardware-backed SecureStore
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handles expired login and network error
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    const errorCode = error.response?.data?.error?.code;

    // Decision #3: 401 interceptor skips login/register and checks token error codes
    if (
      error.response?.status === 401 &&
      !isAuthEndpoint &&
      (errorCode === 'TOKEN_EXPIRED' ||
        errorCode === 'INVALID_TOKEN' ||
        errorCode === 'UNAUTHENTICATED' ||
        errorCode === 'MISSING_TOKEN')
    ) {
      await deleteToken();
      if (onSessionExpiredCallback) {
        onSessionExpiredCallback();
      }
    }

    if (!error.response) {
      return Promise.reject({
        message: 'No internet connection. Please check your network.',
        code: 'NETWORK_ERROR',
      });
    }

    return Promise.reject(error.response.data?.error || {
      message: error.message || 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR',
    });
  }
);
