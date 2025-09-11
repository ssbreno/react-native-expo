import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse, ApiResponse } from '../types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user, refresh_token } = response.data;
      
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      if (refresh_token) {
        await AsyncStorage.setItem('refresh_token', refresh_token);
      }
      
      return { success: true, user, token: access_token };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao fazer login'
      };
    }
  },

  async register(email: string, password: string, name: string, phone?: string): Promise<AuthResponse> {
    try {
      const response = await api.post('/auth/register', { 
        email, 
        password, 
        name,
        phone 
      });
      const { access_token, user, refresh_token } = response.data;
      
      await AsyncStorage.setItem('auth_token', access_token);
      await AsyncStorage.setItem('user_data', JSON.stringify(user));
      if (refresh_token) {
        await AsyncStorage.setItem('refresh_token', refresh_token);
      }
      
      return { success: true, user, token: access_token };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao registrar usuário'
      };
    }
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string; refresh_token?: string }>> {
    try {
      const response = await api.post('/auth/refresh-token', { refresh_token: refreshToken });
      const data = response.data;
      
      // Store new tokens
      await AsyncStorage.setItem('auth_token', data.token);
      if (data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', data.refresh_token);
      }

      return { success: true, data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao renovar token'
      };
    }
  },

  async logout(): Promise<ApiResponse> {
    try {
      await AsyncStorage.multiRemove(['auth_token', 'user_data', 'refresh_token']);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer logout' };
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/auth/profile');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao obter perfil do usuário'
      };
    }
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  },

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      return null;
    }
  },

  async getStoredRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('refresh_token');
    } catch (error) {
      return null;
    }
  },

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      return !!token;
    } catch (error) {
      return false;
    }
  }
};
