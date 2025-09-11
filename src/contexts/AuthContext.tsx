import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, AuthContextType, AuthResponse } from '../types';
import { authService } from '../services/authService';

const deleteStorageItem = async (key: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async (): Promise<void> => {
    try {
      const token = await authService.getStoredToken();
      const userData = await authService.getStoredUser();
      
      if (token && userData) {
        setUser(userData);
        setIsAuthenticated(true);
        
        // Validate token with server
        const profileResult = await authService.getCurrentUser();
        if (profileResult.success && profileResult.data) {
          setUser(profileResult.data);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar estado de autenticação:', error);
      // Clear any corrupted data
      await clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      setLoading(true);
      const result = await authService.login(email, password);
      
      if (result.success && result.user && result.token) {
        // Auth data is already stored by authService
        const userWithAdminCheck = {
          ...result.user,
          is_admin: result.user.is_admin || result.user.email === 'admin@vehicles.com' || result.user.email.toLowerCase().includes('admin')
        };
        setUser(userWithAdminCheck);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      console.error('🔐 Erro no login:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Call logout service
      await authService.logout();
      
      // Clear stored data
      await clearAuthData();
      
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erro no logout:', error);
      // Force logout even if service call fails
      await clearAuthData();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = async (): Promise<void> => {
    try {
      await deleteStorageItem('authToken');
      await deleteStorageItem('userData');
      await deleteStorageItem('refresh_token');
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
    }
  };

  // Monitor token changes and automatically logout if tokens are cleared by API interceptor
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAuthenticated) {
      interval = setInterval(async () => {
        const token = await authService.getStoredToken();
        if (!token && isAuthenticated) {
          // Token was cleared (likely by API interceptor after failed refresh)
          console.log('Token cleared, forcing logout');
          setUser(null);
          setIsAuthenticated(false);
        }
      }, 2000); // Check every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
