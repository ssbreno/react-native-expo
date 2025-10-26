import api from './api';
import { Payment, ApiResponse } from '../types';

export interface PixPaymentData {
  payment_id: number;
  abacate_pay_id?: string;
  amount: number;
  base_amount: number;
  payment_type: string;
  status: string;
  due_date?: string;
  description: string;
  pix_qr_code?: string;
  pix_copy_paste?: string;
  recurrence_type?: string;
  is_recurring: boolean;
  next_payment_date?: string;
  created_at: string;
  expires_at?: string;
}

export interface PaymentHistory {
  id: string;
  payment_id: string;
  status: string;
  amount: number;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export const paymentService = {
  async generatePixQRCode(paymentId: number): Promise<ApiResponse<PixPaymentData>> {
    try {
      console.log(`[PaymentService] Generating PIX QR code for payment ${paymentId}`);
      const response = await api.post('/pix/generate', {
        payment_id: paymentId,
      });

      return {
        success: true,
        data: {
          payment_id: response.data.payment_id,
          abacate_pay_id: response.data.abacate_pay_id,
          amount: response.data.amount_with_interest || response.data.amount,
          base_amount: response.data.base_amount || response.data.amount,
          payment_type: 'pix',
          status: response.data.status,
          due_date: response.data.due_date,
          description: response.data.description,
          pix_qr_code: response.data.qr_code,
          pix_copy_paste: response.data.copy_paste_code,
          recurrence_type: 'weekly',
          is_recurring: true,
          next_payment_date: undefined,
          created_at: response.data.created_at,
          expires_at: response.data.expires_at,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Erro ao gerar QR code PIX',
      };
    }
  },

  async getPixQRCode(paymentId: number): Promise<ApiResponse<PixPaymentData>> {
    try {
      console.log(`[PaymentService] Getting existing PIX QR code for payment ${paymentId}`);
      const response = await api.get(`/pix/qrcode/${paymentId}`);

      return {
        success: true,
        data: {
          payment_id: response.data.payment_id,
          abacate_pay_id: response.data.abacate_pay_id,
          amount: response.data.amount_with_interest || response.data.amount,
          base_amount: response.data.base_amount || response.data.amount,
          payment_type: 'pix',
          status: response.data.status,
          due_date: response.data.due_date,
          description: response.data.description,
          pix_qr_code: response.data.qr_code,
          pix_copy_paste: response.data.copy_paste_code,
          recurrence_type: 'weekly',
          is_recurring: true,
          next_payment_date: undefined,
          created_at: response.data.created_at,
          expires_at: response.data.expires_at,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Erro ao obter QR code PIX',
      };
    }
  },

  async checkPixPaymentStatus(paymentId: number): Promise<ApiResponse<PixPaymentData>> {
    try {
      console.log(`[PaymentService] Checking PIX payment status for payment ${paymentId}`);
      const response = await api.get(`/pix/status/${paymentId}`);

      return {
        success: true,
        data: {
          payment_id: response.data.payment_id,
          abacate_pay_id: response.data.abacate_pay_id,
          amount: response.data.amount_with_interest || response.data.amount,
          base_amount: response.data.base_amount || response.data.amount,
          payment_type: 'pix',
          status: response.data.status,
          due_date: response.data.due_date,
          description: response.data.description || 'Pagamento semanal',
          pix_qr_code: '',
          pix_copy_paste: '',
          recurrence_type: 'weekly',
          is_recurring: true,
          next_payment_date: undefined,
          created_at: response.data.created_at,
          expires_at: response.data.updated_at,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Erro ao verificar status do pagamento',
      };
    }
  },

  async cancelPixPayment(paymentId: number): Promise<ApiResponse> {
    try {
      console.log(`[PaymentService] Canceling PIX payment ${paymentId}`);
      const response = await api.post(`/pix/cancel/${paymentId}`);

      return {
        success: true,
        message: response.data.message || 'Pagamento cancelado com sucesso',
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.response?.data?.error ||
          'Erro ao cancelar pagamento',
      };
    }
  },

  async getPaymentHistory(
    paymentId?: string, 
    page: number = 1, 
    limit: number = 10
  ): Promise<ApiResponse<{
    payment_id?: number;
    history: PaymentHistory[];
    total: number;
    page: number;
    limit: number;
  }>> {
    try {
      const url = paymentId ? `/payments/${paymentId}/history` : '/payments/history';
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      const response = await api.get(`${url}?${params}`);

      return {
        success: true,
        data: {
          payment_id: response.data.payment_id,
          history: response.data.history || response.data,
          total: response.data.total || 0,
          page: response.data.page || page,
          limit: response.data.limit || limit,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter histórico de pagamentos',
      };
    }
  },

  async getMyPayments(filters: Record<string, any> = {}): Promise<ApiResponse<Payment[]>> {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/payments?${params}`);

      // Ensure proper mapping of payment data with due dates
      const payments = (response.data.payments || response.data || []).map((payment: any) => ({
        id: payment.id || payment.payment_id,
        vehicleId: payment.vehicle_id?.toString() || payment.vehicleId,
        vehicleName: payment.vehicle_name || payment.vehicleName || 'Veículo',
        amount: payment.amount || 0,
        date: payment.paid_at || payment.date,
        status:
          payment.status === 'completed'
            ? 'completed'
            : payment.status === 'overdue'
              ? 'overdue'
              : 'pending',
        method: payment.payment_method || payment.method,
        dueDate: payment.due_date || payment.dueDate || new Date().toISOString(),
        description: payment.description || 'Pagamento de assinatura',
      }));

      return {
        success: true,
        data: payments,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter meus pagamentos',
      };
    }
  },

  async getPaymentsByVehicle(vehicleId: string): Promise<ApiResponse<Payment[]>> {
    try {
      const response = await api.get(`/payments?vehicle_id=${vehicleId}`);

      return {
        success: true,
        data: response.data.payments || response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter pagamentos do veículo',
      };
    }
  },

  async markPaymentAsPaid(paymentId: string): Promise<ApiResponse<any>> {
    try {
      console.log(`💳 [PaymentService] Marking payment ${paymentId} as paid`);
      const response = await api.post(`/payments/${paymentId}/complete`);
      
      console.log('✅ [PaymentService] Payment marked as paid successfully');
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Pagamento marcado como pago com sucesso',
      };
    } catch (error: any) {
      console.error('❌ [PaymentService] Error marking payment as paid:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao marcar pagamento como pago',
      };
    }
  },

  async getPaymentStatus(paymentId: string): Promise<ApiResponse<any>> {
    try {
      const response = await api.get(`/payments/${paymentId}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter status do pagamento',
      };
    }
  },

  async getPendingPayments(): Promise<ApiResponse<Payment[]>> {
    try {
      const response = await api.get('/payments?status=pending');

      return {
        success: true,
        data: response.data.payments || response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter pagamentos pendentes',
      };
    }
  },

  async cancelPayment(paymentId: string): Promise<ApiResponse> {
    try {
      await api.delete(`/payments/${paymentId}`);

      return {
        success: true,
        message: 'Pagamento cancelado com sucesso',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao cancelar pagamento',
      };
    }
  },

  async checkPaymentStatus(paymentId: string): Promise<ApiResponse<PixPaymentData>> {
    try {
      console.log(`[PaymentService] Verificando status do pagamento: ${paymentId}`);

      // Detect if this is an Abacate Pay ID (starts with pix_char_) or internal payment ID
      const isAbacatePayId = paymentId.startsWith('pix_char_');
      let endpoint: string;

      if (isAbacatePayId) {
        // Use the PIX status endpoint for Abacate Pay IDs
        endpoint = `/pix/check-status/${paymentId}`;
        console.log(`[PaymentService] Usando endpoint PIX para ID Abacate Pay: ${paymentId}`);
      } else {
        // Use regular payments endpoint for internal IDs
        endpoint = `/payments/${paymentId}`;
        console.log(`[PaymentService] Usando endpoint payments para ID interno: ${paymentId}`);
      }

      const response = await api.get(endpoint);
      console.log(`[PaymentService] Resposta da API:`, response.data);

      const paymentData = {
        payment_id: response.data.payment_id || response.data.id || parseInt(paymentId),
        abacate_pay_id: response.data.abacate_pay_id || (isAbacatePayId ? paymentId : undefined),
        amount: response.data.amount || 0,
        base_amount: response.data.base_amount || response.data.amount || 0,
        payment_type: response.data.payment_type || 'pix',
        status: response.data.status || 'pending',
        due_date: response.data.due_date,
        description: response.data.description || 'Verificação de status',
        pix_qr_code: response.data.pix_qr_code,
        pix_copy_paste: response.data.pix_copy_paste || response.data.pix_code,
        recurrence_type: response.data.recurrence_type,
        is_recurring: response.data.is_recurring || false,
        next_payment_date: response.data.next_payment_date,
        created_at: response.data.created_at || new Date().toISOString(),
        expires_at: response.data.expires_at || response.data.expiration_date,
      };

      console.log(
        `[PaymentService] Status obtido: ${paymentData.status} para pagamento ${paymentId}`
      );

      return {
        success: true,
        data: paymentData,
      };
    } catch (error: any) {
      // Silently handle 404 errors as they are expected when payment is not found
      const status = error.response?.status;
      if (status !== 404) {
        console.error(
          `[PaymentService] Erro ao verificar status do pagamento ${paymentId}:`,
          error
        );
        console.error(`[PaymentService] Detalhes do erro:`, error.response?.data);
      }
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Erro ao verificar status do pagamento',
      };
    }
  },
};
