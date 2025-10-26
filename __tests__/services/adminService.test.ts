import { adminService } from '../../src/services/adminService';
import axios from 'axios';
import {
  mockAdminUser,
  mockDashboardStats,
  mockPaymentList,
  mockErrorResponse,
  mockUnauthorizedResponse,
  mock404Response,
} from '../../__mocks__/mockData';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('adminService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return dashboard statistics', async () => {
      const mockResponse = {
        data: { stats: mockDashboardStats },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getDashboardStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDashboardStats);
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('should return error when statistics fetch fails', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockUnauthorizedResponse);

      const result = await adminService.getDashboardStats();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('getAllUsers', () => {
    it('should list all users with pagination', async () => {
      const mockResponse = {
        data: {
          users: [mockAdminUser],
          total: 50,
          page: 1,
          limit: 10,
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getAllUsers(1, 10);

      expect(result.success).toBe(true);
      expect(result.users).toHaveLength(1);
      expect(result.users?.[0]).toEqual(mockAdminUser);
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/users', {
        params: { page: 1, limit: 10 },
      });
    });

    it('should use default pagination values', async () => {
      const mockResponse = {
        data: { users: [], total: 0 },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await adminService.getAllUsers();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/users', {
        params: { page: 1, limit: 20 },
      });
    });

    it('should return error when unauthorized', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockUnauthorizedResponse);

      const result = await adminService.getAllUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autorizado');
    });
  });

  describe('getUserById', () => {
    it('should fetch user by ID successfully', async () => {
      const mockResponse = {
        data: mockAdminUser,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getUserById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAdminUser);
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/users/1');
    });

    it('should return error when user not found', async () => {
      mockedAxios.get.mockRejectedValueOnce(mock404Response);

      const result = await adminService.getUserById('999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não encontrado');
    });
  });

  describe('createUser', () => {
    it('should create new user successfully', async () => {
      const newUserData = {
        name: 'Novo Usuário',
        email: 'novo@example.com',
        password: 'senha123',
        cpf: '98765432109',
        phone: '11988888888',
        address: 'Endereço Novo',
        zip_code: '12345-678',
        age: 30,
        document_number: '98765432109',
        document_type: 'cpf' as const,
        birth_date: '1993-01-01T00:00:00Z',
      };

      const mockResponse = {
        data: {
          message: 'Usuário criado com sucesso',
          user: { ...mockAdminUser, ...newUserData },
        },
      };

      mockedAxios.post.mockResolvedValueOnce(mockResponse);

      const result = await adminService.createUser(newUserData);

      expect(result.success).toBe(true);
      expect(result.data?.name).toBe('Novo Usuário');
      expect(mockedAxios.post).toHaveBeenCalledWith('/admin/users/create', newUserData);
    });

    it('should return error when creating user with duplicate email', async () => {
      const duplicateError = {
        response: {
          status: 409,
          data: { error: 'Email já cadastrado' },
        },
      };

      mockedAxios.post.mockRejectedValueOnce(duplicateError);

      const result = await adminService.createUser({
        name: 'Test',
        email: 'duplicate@example.com',
        password: 'senha123',
      } as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email já cadastrado');
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status successfully', async () => {
      const mockResponse = {
        data: {
          message: 'Status atualizado com sucesso',
          user: { ...mockAdminUser, status: 'suspended' },
        },
      };

      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await adminService.updateUserStatus('1', 'suspended');

      expect(result.success).toBe(true);
      expect(mockedAxios.put).toHaveBeenCalledWith('/admin/users/1/status', {
        status: 'suspended',
      });
    });

    it('should return error when update fails', async () => {
      mockedAxios.put.mockRejectedValueOnce(mockErrorResponse);

      const result = await adminService.updateUserStatus('1', 'active');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('getUserPayments', () => {
    it('should fetch user payments', async () => {
      const mockResponse = {
        data: {
          payments: mockPaymentList,
          total: 3,
        },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getUserPayments('1', 1, 10);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/users/1/payments', {
        params: { page: 1, limit: 10 },
      });
    });

    it('should return empty array when there are no payments', async () => {
      const mockResponse = {
        data: { payments: [] },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getUserPayments('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getPaymentAnalytics', () => {
    it('should fetch payment analytics', async () => {
      const mockAnalytics = {
        total_paid: 100000,
        total_pending: 5000,
        total_overdue: 2000,
        payment_rate: 95.5,
      };

      const mockResponse = {
        data: mockAnalytics,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getPaymentAnalytics('2025-01', '2025-01');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAnalytics);
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/analytics/payments', {
        params: {
          start_date: '2025-01',
          end_date: '2025-01',
        },
      });
    });
  });

  describe('getPaymentReports', () => {
    it('should fetch payment reports', async () => {
      const mockReport = {
        period: '2025-01',
        total_payments: 150,
        total_revenue: 112500,
      };

      const mockResponse = {
        data: mockReport,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getPaymentReports('monthly', '2025-01', '2025-01');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReport);
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/reports/payments', {
        params: {
          type: 'monthly',
          start_date: '2025-01',
          end_date: '2025-01',
        },
      });
    });
  });

  describe('updateUserPaymentAmounts', () => {
    it('should update user payment amounts', async () => {
      const mockResponse = {
        data: {
          message: 'Valores atualizados com sucesso',
          user: {
            ...mockAdminUser,
            weekly_amount: 800,
            monthly_amount: 3200,
          },
        },
      };

      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await adminService.updateUserPaymentAmounts('1', 800, 3200);

      expect(result.success).toBe(true);
      expect(mockedAxios.put).toHaveBeenCalledWith('/admin/users/1/payment-amounts', {
        weekly_amount: 800,
        monthly_amount: 3200,
      });
    });

    it('should accept null or undefined values', async () => {
      const mockResponse = {
        data: { message: 'Valores atualizados' },
      };

      mockedAxios.put.mockResolvedValueOnce(mockResponse);

      const result = await adminService.updateUserPaymentAmounts('1', null, undefined);

      expect(result.success).toBe(true);
      expect(mockedAxios.put).toHaveBeenCalledWith('/admin/users/1/payment-amounts', {
        weekly_amount: null,
        monthly_amount: undefined,
      });
    });
  });

  describe('Error handling', () => {
    it('should handle error without response', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await adminService.getDashboardStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro ao buscar estatísticas do dashboard');
    });

    it('should extract error message correctly', async () => {
      const customError = {
        response: {
          data: {
            message: 'Mensagem customizada de erro',
          },
        },
      };

      mockedAxios.get.mockRejectedValueOnce(customError);

      const result = await adminService.getAllUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Mensagem customizada de erro');
    });
  });
});
