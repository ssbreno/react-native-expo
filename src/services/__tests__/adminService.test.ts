import { adminService } from '../adminService';
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
    it('deve retornar estatísticas do dashboard', async () => {
      const mockResponse = {
        data: { stats: mockDashboardStats },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getDashboardStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDashboardStats);
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/dashboard');
    });

    it('deve retornar erro ao falhar busca de estatísticas', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockUnauthorizedResponse);

      const result = await adminService.getDashboardStats();

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('getAllUsers', () => {
    it('deve listar todos os usuários com paginação', async () => {
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

    it('deve usar valores padrão de paginação', async () => {
      const mockResponse = {
        data: { users: [], total: 0 },
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      await adminService.getAllUsers();

      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/users', {
        params: { page: 1, limit: 20 },
      });
    });

    it('deve retornar erro quando não autorizado', async () => {
      mockedAxios.get.mockRejectedValueOnce(mockUnauthorizedResponse);

      const result = await adminService.getAllUsers();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não autorizado');
    });
  });

  describe('getUserById', () => {
    it('deve buscar usuário por ID com sucesso', async () => {
      const mockResponse = {
        data: mockAdminUser,
      };

      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await adminService.getUserById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAdminUser);
      expect(mockedAxios.get).toHaveBeenCalledWith('/admin/users/1');
    });

    it('deve retornar erro quando usuário não encontrado', async () => {
      mockedAxios.get.mockRejectedValueOnce(mock404Response);

      const result = await adminService.getUserById('999');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Não encontrado');
    });
  });

  describe('createUser', () => {
    it('deve criar novo usuário com sucesso', async () => {
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

    it('deve retornar erro ao criar usuário com email duplicado', async () => {
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
    it('deve atualizar status do usuário com sucesso', async () => {
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

    it('deve retornar erro ao falhar atualização', async () => {
      mockedAxios.put.mockRejectedValueOnce(mockErrorResponse);

      const result = await adminService.updateUserStatus('1', 'active');

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('getUserPayments', () => {
    it('deve buscar pagamentos do usuário', async () => {
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

    it('deve retornar array vazio quando não há pagamentos', async () => {
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
    it('deve buscar analytics de pagamentos', async () => {
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
    it('deve buscar relatórios de pagamentos', async () => {
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
    it('deve atualizar valores de pagamento do usuário', async () => {
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

    it('deve aceitar valores null ou undefined', async () => {
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
    it('deve tratar erro sem response', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      const result = await adminService.getDashboardStats();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Erro ao buscar estatísticas do dashboard');
    });

    it('deve extrair mensagem de erro corretamente', async () => {
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
