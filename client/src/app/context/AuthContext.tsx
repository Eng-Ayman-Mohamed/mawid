import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authService, type RegisterData } from '../services/auth.service';
import { STORAGE_KEYS } from '../services/http/client';

export interface User {
  id: number;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  userRole: User['role'] | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const isAuthenticated = !!user && !!localStorage.getItem(STORAGE_KEYS.ACCESS);
  const userRole = user?.role || null;

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS);
    if (!token) {
      setUser(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    localStorage.setItem(STORAGE_KEYS.ACCESS, data.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH, data.refresh);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
    localStorage.setItem(STORAGE_KEYS.ROLE, data.user.role);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    const result = await authService.register(data);
    localStorage.setItem(STORAGE_KEYS.ACCESS, result.access);
    localStorage.setItem(STORAGE_KEYS.REFRESH, result.refresh);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));
    localStorage.setItem(STORAGE_KEYS.ROLE, result.user.role);
    setUser(result.user);
  }, []);

  const logout = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
