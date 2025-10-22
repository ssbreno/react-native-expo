import { authService } from '../../src/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  mockUser,
  mockAuthResponse,
  mockErrorResponse,
  mockUnauthorizedResponse,
} from '../../__mocks__/mockData';

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse = {
        data: mockAuthResponse,
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.login('joao@example.com', 'senha123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBe('mock_access_token_12345');

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        'auth_token',
        'mock_access_token_12345'
      );
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(mockUser)
      );
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        'refresh_token',
        'mock_refresh_token_67890'
      );
    });

    it('should return error when login fails with invalid credentials', async () => {
      mockedAxios.post.mockRejectedValueOnce(mockUnauthorizedResponse);

      const result = await authService.login('joao@example.com', 'senha_errada');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autorizado');
      expect(mockedAsyncStorage.setItem).not.toHaveBeenCalled();
    });

    it('should return generic error when there is no server message', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      const result = await authService.login('joao@example.com', 'senha123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro ao fazer login');
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const mockResponse = {
        data: mockAuthResponse,
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.register(
        'joao@example.com',
        'senha123',
        'João Silva',
        '11999999999'
      );

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockedAxios.post).toHaveBeenCalledWith('/auth/register', {
        email: 'joao@example.com',
        password: 'senha123',
        name: 'João Silva',
        phone: '11999999999',
      });
    });

    it('should return error when trying to register duplicate email', async () => {
      const mockDuplicateError = {
        response: {
          status: 409,
          data: { error: 'Email já cadastrado' },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(mockDuplicateError);

      const result = await authService.register('joao@example.com', 'senha123', 'João Silva');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email já cadastrado');
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully', async () => {
      const mockResponse = {
        data: {
          token: 'new_access_token',
          refresh_token: 'new_refresh_token',
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await authService.refreshToken('old_refresh_token');

      expect(result.success).toBe(true);
      expect(result.data?.token).toBe('new_access_token');
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith('auth_token', 'new_access_token');
    });

    it('should return error when token refresh fails', async () => {
      mockedAxios.post.mockRejectedValueOnce(mockUnauthorizedResponse);

      const result = await authService.refreshToken('invalid_refresh_token');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const updatedUser = {
        ...mockUser,
        name: 'João Silva Jr',
        phone: '11988888888',
      };

      const mockResponse = {
        data: { user: updatedUser },
      };

      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await authService.updateProfile({
        name: 'João Silva Jr',
        phone: '11988888888',
      });

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('João Silva Jr');
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        'user_data',
        JSON.stringify(updatedUser)
      );
    });

    it('should return error when update fails', async () => {
      mockedAxios.put.mockRejectedValueOnce(mockErrorResponse);

      const result = await authService.updateProfile({
        name: 'João Silva Jr',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const mockResponse = {
        data: { message: 'Senha alterada com sucesso' },
      };

      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await authService.changePassword({
        current_password: 'senha_atual',
        new_password: 'nova_senha',
        confirm_password: 'nova_senha',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Senha alterada com sucesso');
      expect(mockedAxios.put).toHaveBeenCalledWith('/auth/change-password', {
        current_password: 'senha_atual',
        new_password: 'nova_senha',
        confirm_password: 'nova_senha',
      });
    });

    it('should return error when current password is incorrect', async () => {
      const mockWrongPasswordError = {
        response: {
          status: 401,
          data: { error: 'Senha atual incorreta' },
        },
      };

      mockedAxios.put.mockRejectedValueOnce(mockWrongPasswordError);

      const result = await authService.changePassword({
        current_password: 'senha_errada',
        new_password: 'nova_senha',
        confirm_password: 'nova_senha',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Senha atual incorreta');
    });
  });

  describe('deleteAccount', () => {
    it('should unlink account successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Usuário desvinculado do veículo com sucesso',
        },
      };

      const mockProfileResponse = {
        data: { ...mockUser, vehicle_id: null },
      };

      mockedAxios.delete.mockResolvedValueOnce(mockResponse);
      mockedAxios.get.mockResolvedValueOnce(mockProfileResponse);

      const result = await authService.deleteAccount();

      expect(result.success).toBe(true);
      expect(result.message).toBeTruthy();
      expect(mockedAxios.delete).toHaveBeenCalledWith('/auth/account');
    });

    it('should return error when unlinking fails', async () => {
      mockedAxios.delete.mockRejectedValueOnce(mockErrorResponse);

      const result = await authService.deleteAccount();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user successfully', async () => {
      const mockResponse = {
        data: mockUser,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUser);
      expect(mockedAxios.get).toHaveBeenCalledWith('/auth/profile');
    });

    it('should return error when token is invalid', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockUnauthorizedResponse);

      const result = await authService.getCurrentUser();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autorizado');
    });
  });

  describe('logout', () => {
    it('should logout and clear storage', async () => {
      mockedAsyncStorage.multiRemove.mockResolvedValueOnce();

      const result = await authService.logout();

      expect(result.success).toBe(true);
      expect(mockedAsyncStorage.multiRemove).toHaveBeenCalledWith([
        'auth_token',
        'user_data',
        'refresh_token',
      ]);
    });

    it('should return error when logout fails', async () => {
      mockedAsyncStorage.multiRemove.mockRejectedValueOnce(new Error('Storage error'));

      const result = await authService.logout();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro ao fazer logout');
    });
  });

  describe('getStoredUser', () => {
    it('should return stored user', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(JSON.stringify(mockUser));

      const user = await authService.getStoredUser();

      expect(user).toEqual(mockUser);
      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('user_data');
    });

    it('should return null when there is no stored user', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const user = await authService.getStoredUser();

      expect(user).toBeNull();
    });
  });

  describe('getStoredToken', () => {
    it('should return stored token', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce('mock_token');

      const token = await authService.getStoredToken();

      expect(token).toBe('mock_token');
      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when there is a token', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce('mock_token');

      const isAuth = await authService.isAuthenticated();

      expect(isAuth).toBe(true);
    });

    it('should return false when there is no token', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const isAuth = await authService.isAuthenticated();

      expect(isAuth).toBe(false);
    });
  });
});
