import axios from 'axios';
import api from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  role: 'owner' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

const TOKEN_KEY = 'token';
const REMEMBERED_USERNAME_KEY = 'rememberedUsername';

const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  register: async (userData: any) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token } = response.data;
      localStorage.setItem(TOKEN_KEY, token);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { message: 'Failed to get user data' };
    }
  },

  getToken: () => localStorage.getItem(TOKEN_KEY),
  
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  
  removeToken: () => localStorage.removeItem(TOKEN_KEY),

  getRememberedUsername: () => localStorage.getItem(REMEMBERED_USERNAME_KEY),
  
  setRememberedUsername: (username: string) => localStorage.setItem(REMEMBERED_USERNAME_KEY, username),
  
  removeRememberedUsername: () => localStorage.removeItem(REMEMBERED_USERNAME_KEY),
  
  // Add auth header to axios requests
  setupAxiosInterceptors: () => {
    api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem(TOKEN_KEY);
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  },
};

export default authService; 