import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, registerSessionExpiredCallback } from '../api/client';
import { saveToken, getToken, deleteToken } from '../storage/secureToken';
import { AuthUser, LoginInput, RegisterInput, AuthResponse } from '../shared/types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionExpired, setSessionExpired] = useState<boolean>(false);

  const clearSessionExpired = () => setSessionExpired(false);

  useEffect(() => {
    // Register the 401 callback
    registerSessionExpiredCallback(() => {
      setUser(null);
      setToken(null);
      setSessionExpired(true);
    });

    const checkAuth = async () => {
      try {
        const storedToken = await getToken();
        if (!storedToken) {
          setIsLoading(false);
          return;
        }

        setToken(storedToken);
        const res = await api.get<{ success: true; data: { user: AuthUser } }>('/auth/me');
        setUser(res.data.data.user);
      } catch (err) {
        await deleteToken();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (input: LoginInput) => {
    const res = await api.post<{ success: true; data: AuthResponse }>('/auth/login', input);
    const { token: newToken, user: newUser } = res.data.data;
    await saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setSessionExpired(false);
  };

  const register = async (input: RegisterInput) => {
    const res = await api.post<{ success: true; data: AuthResponse }>('/auth/register', input);
    const { token: newToken, user: newUser } = res.data.data;
    await saveToken(newToken);
    setToken(newToken);
    setUser(newUser);
    setSessionExpired(false);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Stateless logout
    } finally {
      await deleteToken();
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
        sessionExpired,
        clearSessionExpired,
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
