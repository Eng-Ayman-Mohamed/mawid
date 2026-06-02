import client, { STORAGE_KEYS } from './http/client';

export interface LoginResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    role: 'patient' | 'doctor' | 'admin';
    first_name?: string;
    last_name?: string;
  };
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string;
}

export const authService = {
  login(email: string, password: string) {
    return client.post<LoginResponse>('/api/auth/login/', { email, password }).then((r) => r.data);
  },

  register(data: RegisterData) {
    return client.post<LoginResponse>('/api/auth/register/', data).then((r) => r.data);
  },

  refreshToken(refresh: string) {
    return client.post<{ access: string; refresh?: string }>('/api/auth/token/refresh/', { refresh }).then((r) => r.data);
  },

  getProfile() {
    return client.get<LoginResponse['user']>('/api/auth/me/').then((r) => r.data);
  },
};
