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
  license_plate?: string;
  weekly_amount?: number;
  monthly_amount?: number;
  // Vehicle information
  vehicle_id?: number;
  vehicle_brand?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_color?: string;
  rental_start?: string;
  rental_expiration?: string;
  rental_status?: string;
}

export const adminService = {
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await api.get('/admin/dashboard');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter estatísticas do dashboard',
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
          payment_status: user.payment_status || 'no_payments',
        }));
      }

      return {
        success: true,
        data: users,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter lista de usuários',
      };
    }
  },

  async getPaymentSummary(): Promise<
    ApiResponse<{
      total_revenue: number;
      pending_count: number;
      overdue_count: number;
      up_to_date_users: number;
      overdue_users: number;
    }>
  > {
    try {
      const response = await api.get('/admin/payment-summary');
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter resumo de pagamentos',
      };
    }
  },

  async getWeeklyPaymentEvolution(weeks: number = 4): Promise<
    ApiResponse<{
      weeks: Array<{
        week_number: number;
        week_start: string;
        week_end: string;
        total_payments: number;
        total_amount: number;
        completed_payments: number;
        pending_payments: number;
        paid_users?: Array<{
          user_name: string;
          user_email: string;
          vehicle_name: string;
          license_plate: string;
          amount: number;
          payment_date: string;
        }>;
        unpaid_users?: Array<{
          user_name: string;
          user_email: string;
          vehicle_name: string;
          license_plate: string;
          expected_amount: number;
          days_overdue: number;
        }>;
      }>;
    }>
  > {
    try {
      console.log(`📊 Fetching weekly payment evolution for ${weeks} weeks...`);
      const response = await api.get(
        `/admin/payments/weekly-evolution?weeks=${weeks}&details=true`
      );
      console.log('✅ Weekly evolution data received:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter evolução semanal de pagamentos',
      };
    }
  },

  async getAllUsers(
    page = 1,
    limit = 10
  ): Promise<ApiResponse<{ users: AdminUser[]; total: number; page: number }>> {
    try {
      const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
      const users = response.data.users || response.data;

      // Log para verificar se a placa está vindo
      if (users && users.length > 0) {
        console.log('👥 First user sample:', {
          name: users[0].name,
          license_plate: users[0].license_plate,
          vehicle_name: users[0].vehicle_name,
        });
      }

      return {
        success: true,
        data: {
          users: users,
          total: response.data.total || 0,
          page: response.data.page || page,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter lista de usuários',
      };
    }
  },

  async getAllPayments(
    page = 1,
    limit = 10,
    status?: string
  ): Promise<ApiResponse<{ payments: Payment[]; total: number; page: number }>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
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
          page: response.data.page || page,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter lista de pagamentos',
      };
    }
  },

  async updateOverduePayments(): Promise<ApiResponse<{ updated_count: number }>> {
    try {
      const response = await api.post('/admin/payments/update-overdue');
      return {
        success: true,
        data: { updated_count: response.data.updated_count },
        message: `${response.data.updated_count} pagamentos atualizados com sucesso`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar pagamentos em atraso',
      };
    }
  },

  async getUserDetails(userId: string): Promise<ApiResponse<AdminUser>> {
    try {
      // Try to fetch from payment status endpoint first
      const response = await api.get(`/admin/users/${userId}`);
      console.log('📡 API Response for user details:', JSON.stringify(response.data, null, 2));

      // Handle different response formats
      let userData = response.data.user || response.data;
      console.log('📦 Processed user data:', JSON.stringify(userData, null, 2));

      // Try to get payment status from dedicated endpoint
      try {
        const paymentResponse = await api.get(`/admin/users/${userId}/payment-status`);
        console.log('💰 Payment status response:', JSON.stringify(paymentResponse.data, null, 2));

        if (paymentResponse.data) {
          userData = { ...userData, ...paymentResponse.data };
          console.log('✅ Merged payment status:', userData.payment_status);
        }
      } catch (paymentError) {
        console.log(
          '⚠️ Could not fetch payment status from dedicated endpoint, will try alternative method'
        );
      }

      // Ensure total_payments is a number
      if (userData.total_payments === undefined || userData.total_payments === null) {
        // Try to count from payments array if available
        if (userData.payments && Array.isArray(userData.payments)) {
          userData.total_payments = userData.payments.length;
          console.log('📊 Calculated total_payments from array:', userData.total_payments);
        } else {
          userData.total_payments = 0;
        }
      }

      // Ensure payment_status is set
      if (!userData.payment_status) {
        if (userData.total_payments > 0) {
          userData.payment_status = 'up_to_date';
        } else {
          userData.payment_status = 'no_payments';
        }
        console.log('🔄 Set default payment_status:', userData.payment_status);
      }

      return { success: true, data: userData };
    } catch (error: any) {
      console.error('❌ Error fetching user details:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter detalhes do usuário',
      };
    }
  },

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    age?: number;
    document_number?: string;
    document_type?: 'cpf' | 'cnpj' | 'rg' | 'passport';
    birth_date?: string;
  }): Promise<ApiResponse<AdminUser>> {
    try {
      console.log('➕ [Admin] Criando novo usuário:', data.email);
      const response = await api.post('/admin/users', data);
      console.log('✅ [Admin] Usuário criado com sucesso');
      return {
        success: true,
        data: response.data.user || response.data,
        message: response.data?.message || 'Usuário criado com sucesso',
      };
    } catch (error: any) {
      console.error('❌ [Admin] Erro ao criar usuário:', error.response?.data || error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Erro ao criar usuário',
      };
    }
  },

  async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      console.log('🗑️ [Admin] Deletando usuário:', userId);
      const response = await api.delete(`/admin/users/${userId}`);
      console.log('✅ [Admin] Usuário deletado com sucesso');
      return {
        success: true,
        message: response.data?.message || 'Usuário deletado com sucesso',
      };
    } catch (error: any) {
      console.error('❌ [Admin] Erro ao deletar usuário:', error.response?.data || error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Erro ao deletar usuário',
      };
    }
  },

  async updateUserStatus(
    userId: string,
    status: 'active' | 'inactive' | 'suspended'
  ): Promise<ApiResponse> {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      return {
        success: true,
        message: 'Status do usuário atualizado com sucesso',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar status do usuário',
      };
    }
  },

  async updateUserPaymentAmount(
    userId: string,
    weeklyAmount?: number,
    monthlyAmount?: number
  ): Promise<ApiResponse> {
    try {
      const payload: { weekly_amount?: number; monthly_amount?: number } = {};

      if (weeklyAmount !== undefined && weeklyAmount !== null) {
        payload.weekly_amount = weeklyAmount;
      }

      if (monthlyAmount !== undefined && monthlyAmount !== null) {
        payload.monthly_amount = monthlyAmount;
      }

      await api.put(`/admin/users/${userId}/payment-amount`, payload);
      return {
        success: true,
        message: 'Valor de pagamento atualizado com sucesso',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar valor de pagamento',
      };
    }
  },

  async updateUserInfo(
    userId: string,
    data: { name: string; email: string; phone: string; address: string }
  ): Promise<ApiResponse> {
    try {
      console.log('🔄 [Admin] Atualizando usuário:', userId, data);
      const response = await api.put(`/admin/users/${userId}`, data);
      console.log('✅ [Admin] Usuário atualizado com sucesso');
      return {
        success: true,
        message: response.data?.message || 'Informações do usuário atualizadas com sucesso',
      };
    } catch (error: any) {
      console.error('❌ [Admin] Erro ao atualizar usuário:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao atualizar informações do usuário',
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
        error: error.response?.data?.error || 'Erro ao obter análises de pagamentos',
      };
    }
  },

  async exportPaymentReport(
    format: 'csv' | 'pdf' = 'csv',
    filters?: Record<string, any>
  ): Promise<ApiResponse<{ download_url: string }>> {
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
        data: { download_url: response.data.download_url },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao gerar relatório',
      };
    }
  },

  /**
   * Registra o push token do dispositivo no servidor
   */
  async registerPushToken(userId: string, pushToken: string): Promise<ApiResponse> {
    try {
      await api.post('/admin/users/register-push-token', {
        user_id: userId,
        push_token: pushToken,
      });
      return {
        success: true,
        message: 'Push token registrado com sucesso',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao registrar push token',
      };
    }
  },

  /**
   * Envia notificações para usuários com pagamentos vencidos
   */
  async notifyOverdueUsers(): Promise<ApiResponse<{ notified_count: number }>> {
    try {
      const response = await api.post('/admin/notifications/overdue-payments');
      return {
        success: true,
        data: { notified_count: response.data.notified_count || 0 },
        message: `${response.data.notified_count || 0} usuários notificados sobre pagamentos vencidos`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao notificar usuários com pagamentos vencidos',
      };
    }
  },

  /**
   * Envia notificações para usuários com pagamentos pendentes (próximos do vencimento)
   */
  async notifyPendingPayments(
    daysBeforeDue: number = 3
  ): Promise<ApiResponse<{ notified_count: number }>> {
    try {
      const response = await api.post('/admin/notifications/pending-payments', {
        days_before_due: daysBeforeDue,
      });
      return {
        success: true,
        data: { notified_count: response.data.notified_count || 0 },
        message: `${response.data.notified_count || 0} usuários notificados sobre pagamentos próximos do vencimento`,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error || 'Erro ao notificar usuários sobre pagamentos pendentes',
      };
    }
  },

  /**
   * Envia notificação para um usuário específico
   */
  async sendUserNotification(
    userId: string,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<ApiResponse> {
    try {
      await api.post(`/admin/notifications/send/${userId}`, {
        title,
        message,
        data: data || {},
      });
      return {
        success: true,
        message: 'Notificação enviada com sucesso',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao enviar notificação',
      };
    }
  },

  /**
   * Envia notificação broadcast para todos os usuários
   */
  async sendBroadcastNotification(
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<ApiResponse<{ sent_count: number }>> {
    try {
      const response = await api.post('/admin/notifications/broadcast', {
        title,
        message,
        data: data || {},
      });
      return {
        success: true,
        data: { sent_count: response.data.sent_count || 0 },
        message: `Notificação enviada para ${response.data.sent_count || 0} usuários`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao enviar notificação broadcast',
      };
    }
  },

  /**
   * Busca os pagamentos de um usuário específico
   * Usa o endpoint geral de payments filtrado por user_id e status
   */
  async getUserPayments(
    userId: string,
    page = 1,
    limit = 50
  ): Promise<ApiResponse<{ payments: Payment[]; total: number }>> {
    try {
      // Busca apenas pagamentos pagos (paid ou completed)
      const response = await api.get(`/payments`, {
        params: {
          user_id: userId,
          status: 'paid,completed', // Filtra apenas pagos
          page: page,
          limit: limit,
        },
      });

      return {
        success: true,
        data: {
          payments: response.data.payments || response.data || [],
          total: response.data.total || response.data.length || 0,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar pagamentos do usuário',
      };
    }
  },
};
