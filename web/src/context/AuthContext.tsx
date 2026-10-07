import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';
import { AuthUser, LoginInput, RegisterInput, AuthResponse } from '../shared/types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  flashMessage: string | null;
  clearFlashMessage: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [flashMessage, setFlashMessage] = useState<string | null>(
    localStorage.getItem('auth_flash')
  );

  const clearFlashMessage = () => {
    localStorage.removeItem('auth_flash');
    setFlashMessage(null);
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await api.get<{ success: true; data: { user: AuthUser } }>('/auth/me');
        setUser(res.data.data.user);
      } catch (err) {
        // Handled by client interceptor if expired
        localStorage.removeItem('auth_token');
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (input: LoginInput) => {
    const res = await api.post<{ success: true; data: AuthResponse }>('/auth/login', input);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
    clearFlashMessage();
  };

  const register = async (input: RegisterInput) => {
    const res = await api.post<{ success: true; data: AuthResponse }>('/auth/register', input);
    const { token: newToken, user: newUser } = res.data.data;
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(newUser);
    clearFlashMessage();
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Stateless logout
    } finally {
      localStorage.removeItem('auth_token');
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        flashMessage,
        clearFlashMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
