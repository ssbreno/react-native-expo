import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User, AuthContextType, AuthResponse } from '../types';
import { mockAuthService } from '../services/mockApi';

// Platform-aware storage functions
const setStorageItem = async (key: string, value: string): Promise<void> => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

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
      const token = await getStorageItem('authToken');
      const userData = await getStorageItem('userData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData) as User;
        setUser(parsedUser);
        setIsAuthenticated(true);
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
      console.log('🔐 Iniciando login...', { email });
      setLoading(true);
      const result = await mockAuthService.login(email, password);
      console.log('🔐 Resultado do login:', result);
      
      if (result.success && result.user && result.token) {
        console.log('🔐 Login bem-sucedido, armazenando dados...');
        // Store auth data securely
        await setStorageItem('authToken', result.token);
        await setStorageItem('userData', JSON.stringify(result.user));
        
        console.log('🔐 Dados armazenados, atualizando estado...');
        setUser(result.user);
        setIsAuthenticated(true);
        console.log('🔐 Estado atualizado - usuário autenticado!');
      } else {
        console.log('🔐 Login falhou:', result.error);
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
      await mockAuthService.logout();
      
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
    } catch (error) {
      console.error('Erro ao limpar dados de autenticação:', error);
    }
  };

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
