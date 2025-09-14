import api from './api';
import { User, Payment, ApiResponse } from '../types';

export interface DashboardStats {
  total_users: number;
  total_payments: number;
  total_revenue: number;
  pending_payments: number;
  overdue_payments: number;
  active_vehicles: number;
}

export interface AdminUser extends User {
  total_payments?: number;
  last_payment?: string;
  status?: 'active' | 'inactive' | 'suspended';
  payment_status?: 'up_to_date' | 'overdue' | 'no_payments';
  days_overdue?: number;
  pending_amount?: number;
  vehicle_name?: string;
}

export const adminService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await api.get('/admin/dashboard');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao obter estatísticas do dashboard'
      };
    }
  },

  async getUsersWithPaymentStatus(): Promise<ApiResponse<AdminUser[]>> {
    try {
      const response = await api.get('/admin/users-payment-status');
      let users = response.data.users || response.data;
      
      if (users && Array.isArray(users)) {
        users = users.map((user: any) => ({
          ...user,
          payment_status: user.payment_status || 'no_payments'
        }));
      }
      
      return { 
        success: true, 
        data: users
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao obter lista de usuários'
      };
    }
  },

  async getPaymentSummary(): Promise<ApiResponse<{
    total_revenue: number;
    pending_count: number;
    overdue_count: number;
    up_to_date_users: number;
    overdue_users: number;
  }>> {
    try {
      const response = await api.get('/admin/payment-summary');
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao obter resumo de pagamentos'
      };
    }
  },

  async getAllUsers(page = 1, limit = 10): Promise<ApiResponse<{ users: AdminUser[], total: number, page: number }>> {
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
      return { 
        success: true, 
        data: {
          users: response.data.users || response.data,
          total: response.data.total || 0,
          page: response.data.page || page
        }
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao obter lista de usuários'
      };
    }
  },

  async getAllPayments(page = 1, limit = 10, status?: string): Promise<ApiResponse<{ payments: Payment[], total: number, page: number }>> {
    try {
      const params = new URLSearchParams({ 
        page: page.toString(), 
        limit: limit.toString() 
      });
      
      if (status) {
        params.append('status', status);
      }

      const response = await api.get(`/admin/payments?${params}`);
      return { 
        success: true, 
        data: {
          payments: response.data.payments || response.data,
          total: response.data.total || 0,
          page: response.data.page || page
        }
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao obter lista de pagamentos'
      };
    }
  },

  async updateOverduePayments(): Promise<ApiResponse<{ updated_count: number }>> {
    try {
      const response = await api.post('/admin/payments/update-overdue');
      return { 
        success: true, 
        data: { updated_count: response.data.updated_count },
        message: `${response.data.updated_count} pagamentos atualizados com sucesso`
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao atualizar pagamentos em atraso'
      };
    }
  },

  async getUserDetails(userId: string): Promise<ApiResponse<AdminUser>> {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao obter detalhes do usuário'
      };
    }
  },

  async updateUserStatus(userId: string, status: 'active' | 'inactive' | 'suspended'): Promise<ApiResponse> {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status });
      return { 
        success: true, 
        message: 'Status do usuário atualizado com sucesso'
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao atualizar status do usuário'
      };
    }
  },

  async getPaymentAnalytics(startDate?: string, endDate?: string): Promise<ApiResponse<any>> {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await api.get(`/admin/analytics/payments?${params}`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao obter análises de pagamentos'
      };
    }
  },

  async exportPaymentReport(format: 'csv' | 'pdf' = 'csv', filters?: Record<string, any>): Promise<ApiResponse<{ download_url: string }>> {
    try {
      const params = new URLSearchParams({ format });
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.append(key, value.toString());
        });
      }

      const response = await api.get(`/admin/reports/payments?${params}`);
      return { 
        success: true, 
        data: { download_url: response.data.download_url }
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao gerar relatório'
      };
    }
  }
};
