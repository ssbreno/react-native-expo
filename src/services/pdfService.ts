import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { formatCurrency, formatDateTime } from '../utils/dateUtils';

export interface PaymentReceiptData {
  id: number;
  payment_id: number;
  transaction_id?: string;
  status: string;
  description: string;
  amount: number;
  base_amount: number;
  interest_amount?: number;
  payment_method: string;
  due_date: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
  vehicle_id: number;
  vehicle_name?: string;
  user_id: number;
  user_name?: string;
}

export const pdfService = {
  async generateReceiptPDF(
    payment: PaymentReceiptData
  ): Promise<{ success: boolean; uri?: string; error?: string }> {
    try {
      const getStatusText = (status: string) => {
        switch (status) {
          case 'paid':
          case 'completed':
            return 'Pago';
          case 'pending':
            return 'Pendente';
          case 'overdue':
            return 'Vencido';
          default:
            return status;
        }
      };

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Comprovante de Pagamento</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f8f9fa;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #1565C0, #1976D2);
              color: white;
              text-align: center;
              padding: 30px 20px;
            }
            .company-name {
              font-size: 28px;
              font-weight: bold;
              margin: 0;
              letter-spacing: 1px;
            }
            .company-subtitle {
              font-size: 14px;
              margin-top: 5px;
              opacity: 0.9;
            }
            .content {
              padding: 30px;
            }
            .receipt-title {
              font-size: 24px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 30px;
              color: #1565C0;
            }
            .info-section {
              margin-bottom: 25px;
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #1565C0;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              color: #1565C0;
              margin-bottom: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .info-label {
              font-weight: 500;
              color: #666;
            }
            .info-value {
              font-weight: 600;
              color: #333;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .status-paid {
              background-color: #e8f5e8;
              color: #2e7d32;
            }
            .status-pending {
              background-color: #fff3cd;
              color: #f57c00;
            }
            .status-overdue {
              background-color: #ffebee;
              color: #d32f2f;
            }
            .amount-section {
              background: linear-gradient(135deg, #f8f9fa, #e3f2fd);
              border: 2px solid #1565C0;
            }
            .total-row {
              border-top: 2px solid #ddd;
              margin-top: 15px;
              padding-top: 15px;
              font-size: 18px;
              font-weight: bold;
            }
            .total-value {
              color: #1565C0;
              font-size: 20px;
            }
            .interest-value {
              color: #f44336;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #e0e0e0;
              margin-top: 20px;
            }
            .footer-text {
              font-size: 12px;
              color: #666;
              margin-bottom: 10px;
            }
            .confirmation-text {
              font-size: 14px;
              color: #4caf50;
              font-weight: 600;
            }
            .payment-id {
              font-size: 18px;
              font-weight: bold;
              color: #1565C0;
            }
            @media print {
              body { 
                background: white; 
              }
              .container {
                box-shadow: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="company-name">NANQUIM LOCAÇÕES</h1>
              <p class="company-subtitle">Sistema de Gestão de Veículos</p>
            </div>
            
            <div class="content">
              <h2 class="receipt-title">📄 COMPROVANTE DE PAGAMENTO</h2>
              
              <div class="info-section">
                <div class="section-title">Informações do Pagamento</div>
                <div class="info-row">
                  <span class="info-label">ID do Pagamento:</span>
                  <span class="info-value payment-id">#${payment.id}</span>
                </div>
                ${
                  payment.transaction_id
                    ? `
                <div class="info-row">
                  <span class="info-label">Transaction ID:</span>
                  <span class="info-value">${payment.transaction_id}</span>
                </div>
                `
                    : ''
                }
                <div class="info-row">
                  <span class="info-label">Status:</span>
                  <span class="status-badge status-${payment.status === 'paid' || payment.status === 'completed' ? 'paid' : payment.status === 'pending' ? 'pending' : 'overdue'}">
                    ${getStatusText(payment.status)}
                  </span>
                </div>
                <div class="info-row">
                  <span class="info-label">Descrição:</span>
                  <span class="info-value">${payment.description}</span>
                </div>
              </div>

              <div class="info-section amount-section">
                <div class="section-title">💰 Valores</div>
                <div class="info-row">
                  <span class="info-label">Valor Base:</span>
                  <span class="info-value">${formatCurrency(payment.base_amount)}</span>
                </div>
                ${
                  payment.interest_amount && payment.interest_amount > 0
                    ? `
                <div class="info-row">
                  <span class="info-label">Juros de Atraso:</span>
                  <span class="info-value interest-value">+ ${formatCurrency(payment.interest_amount)}</span>
                </div>
                `
                    : ''
                }
                <div class="info-row total-row">
                  <span class="info-label">Total Pago:</span>
                  <span class="info-value total-value">${formatCurrency(payment.amount)}</span>
                </div>
              </div>

              <div class="info-section">
                <div class="section-title">📅 Datas</div>
                <div class="info-row">
                  <span class="info-label">Vencimento:</span>
                  <span class="info-value">${formatDateTime(payment.due_date)}</span>
                </div>
                ${
                  payment.payment_date
                    ? `
                <div class="info-row">
                  <span class="info-label">Data do Pagamento:</span>
                  <span class="info-value" style="color: #4caf50; font-weight: bold;">${formatDateTime(payment.payment_date)}</span>
                </div>
                `
                    : ''
                }
                <div class="info-row">
                  <span class="info-label">Criado em:</span>
                  <span class="info-value">${formatDateTime(payment.created_at)}</span>
                </div>
              </div>

              <div class="info-section">
                <div class="section-title">🚗 Veículo</div>
                <div class="info-row">
                  <span class="info-label">ID do Veículo:</span>
                  <span class="info-value">${payment.vehicle_id}</span>
                </div>
                ${
                  payment.vehicle_name
                    ? `
                <div class="info-row">
                  <span class="info-label">Veículo:</span>
                  <span class="info-value">${payment.vehicle_name}</span>
                </div>
                `
                    : ''
                }
              </div>

              <div class="info-section">
                <div class="section-title">💳 Método de Pagamento</div>
                <div class="info-row">
                  <span class="info-label">Método:</span>
                  <span class="info-value">${payment.payment_method?.toUpperCase() || 'PIX'}</span>
                </div>
              </div>
            </div>

            <div class="footer">
              <p class="footer-text">
                Comprovante gerado em: ${formatDateTime(new Date().toISOString())}
              </p>
              ${
                payment.status === 'paid' || payment.status === 'completed'
                  ? `
              <p class="confirmation-text">
                ✅ Pagamento confirmado e processado com sucesso
              </p>
              `
                  : ''
              }
              <p class="footer-text">
                <strong>Nanquim Locações</strong> - Sistema de Gestão de Veículos<br>
                Este é um documento oficial de comprovação de pagamento.
              </p>
            </div>
          </div>
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      return { success: true, uri };
    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      return {
        success: false,
        error: error.message || 'Erro ao gerar PDF do comprovante',
      };
    }
  },

  async shareReceiptPDF(
    payment: PaymentReceiptData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await this.generateReceiptPDF(payment);

      if (!result.success || !result.uri) {
        return { success: false, error: result.error };
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        return { success: false, error: 'Compartilhamento não disponível neste dispositivo' };
      }

      await Sharing.shareAsync(result.uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartilhar Comprovante PDF',
        UTI: 'com.adobe.pdf',
      });

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao compartilhar PDF:', error);
      return {
        success: false,
        error: error.message || 'Erro ao compartilhar PDF',
      };
    }
  },
};
