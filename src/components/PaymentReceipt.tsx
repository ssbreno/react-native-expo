import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Share, ScrollView } from 'react-native';
import {
  Modal,
  Portal,
  Card,
  Title,
  Text,
  Button,
  Surface,
  ActivityIndicator,
  useTheme,
  Divider,
  IconButton,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../services/paymentService';
import { pdfService } from '../services/pdfService';
import { formatCurrency, formatDateTime } from '../utils/dateUtils';

interface PaymentReceiptProps {
  visible: boolean;
  onDismiss: () => void;
  paymentId: number;
  paymentData?: any; // Optional: if provided, skip API call
}

interface PaymentDetails {
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
  abacate_pay_id?: string;
  pix_qr_code?: string;
  pix_copy_paste?: string;
}

export default function PaymentReceipt({
  visible,
  onDismiss,
  paymentId,
  paymentData,
}: PaymentReceiptProps) {
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    // If paymentData is provided, use it directly (for admin view)
    if (visible && paymentData) {
      setPayment(paymentData);
      setLoading(false);
      return;
    }

    // Otherwise, fetch from API (for user view)
    if (visible && paymentId && paymentId > 0) {
      fetchPaymentDetails();
    }
  }, [visible, paymentId, paymentData]);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await paymentService.getPaymentStatus(paymentId.toString());

      if (result.success && result.data) {
        setPayment(result.data);
      } else {
        setError(result.error || 'Erro ao carregar dados do pagamento');
      }
    } catch (err: any) {
      console.error('Error fetching payment details:', err);
      setError('Erro ao carregar comprovante');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const statusLower = status?.toLowerCase();
    switch (statusLower) {
      case 'paid':
      case 'pago':
      case 'completed':
        return {
          text: 'Pago',
          color: '#4caf50',
          backgroundColor: '#e8f5e8',
        };
      case 'pending':
      case 'pendente':
        return {
          text: 'Pendente',
          color: '#ff9800',
          backgroundColor: '#fff3cd',
        };
      case 'overdue':
      case 'vencido':
        return {
          text: 'Vencido',
          color: '#f44336',
          backgroundColor: '#ffebee',
        };
      default:
        return {
          text: status,
          color: '#666',
          backgroundColor: '#f5f5f5',
        };
    }
  };

  const shareReceipt = async () => {
    if (!payment) return;

    const receiptText = [
      'COMPROVANTE DE PAGAMENTO',
      'Nanquim Locações',
      '',
      'Informações:',
      `• ID: #${payment.id}`,
      `• Status: ${getStatusInfo(payment.status).text}`,
      `• Descrição: ${payment.description}`,
      '',
      'Valores:',
      `• Valor Base: ${formatCurrency(payment.base_amount)}`,
      payment.interest_amount ? `• Juros: ${formatCurrency(payment.interest_amount)}` : '',
      `• Total: ${formatCurrency(payment.amount)}`,
      '',
      'Datas:',
      `• Vencimento: ${formatDateTime(payment.due_date)}`,
      payment.payment_date ? `• Pagamento: ${formatDateTime(payment.payment_date)}` : '',
      `• Criado em: ${formatDateTime(payment.created_at)}`,
      '',
      '---',
      'Nanquim Locações - Sistema de Gestão de Veículos',
      `Comprovante gerado em: ${formatDateTime(new Date().toISOString())}`,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await Share.share({
        message: receiptText,
        title: 'Comprovante de Pagamento',
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o comprovante');
    }
  };

  const exportToPDF = async () => {
    if (!payment) return;

    try {
      setExportingPDF(true);

      const result = await pdfService.shareReceiptPDF({
        id: payment.id,
        payment_id: payment.payment_id,
        transaction_id: payment.transaction_id,
        status: payment.status,
        description: payment.description,
        amount: payment.amount,
        base_amount: payment.base_amount,
        interest_amount: payment.interest_amount,
        payment_method: payment.payment_method,
        due_date: payment.due_date,
        payment_date: payment.payment_date,
        created_at: payment.created_at,
        updated_at: payment.updated_at,
        vehicle_id: payment.vehicle_id,
        vehicle_name: payment.vehicle_name,
        user_id: payment.user_id,
        user_name: payment.user_name,
      });

      if (!result.success) {
        Alert.alert('Erro', result.error || 'Não foi possível gerar o PDF');
      }
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      Alert.alert('Erro', 'Não foi possível gerar o PDF do comprovante');
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Ionicons name="receipt-outline" size={32} color={theme.colors.primary} />
                <Title style={styles.title}>Comprovante</Title>
              </View>
              <IconButton icon="close" size={24} onPress={onDismiss} />
            </View>

            <Divider style={styles.divider} />

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Carregando comprovante...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={48} color="#f44336" />
                <Text style={styles.errorText}>{error}</Text>
                <Button mode="outlined" onPress={fetchPaymentDetails}>
                  Tentar Novamente
                </Button>
              </View>
            ) : payment &&
              (payment.status?.toLowerCase() === 'paid' ||
                payment.status?.toLowerCase() === 'completed' ||
                payment.status?.toLowerCase() === 'pago') ? (
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
              >
                {/* Company Header */}
                <Surface style={styles.companyHeader}>
                  <Text style={styles.companyName}>VEHICLES-GO</Text>
                  <Text style={styles.companySubtitle}>Sistema de Gestão de Veículos</Text>
                </Surface>

                {/* Payment ID and Status */}
                <Surface style={styles.paymentHeader}>
                  <View style={styles.paymentIdRow}>
                    <Text style={styles.paymentIdLabel}>ID do Pagamento:</Text>
                    <Text style={styles.paymentId}>{payment.id ? `#${payment.id}` : 'N/A'}</Text>
                  </View>

                  {payment.transaction_id && String(payment.transaction_id).length > 0 && (
                    <View style={styles.paymentIdRow}>
                      <Text style={styles.paymentIdLabel}>Transaction ID:</Text>
                      <Text style={styles.transactionId}>{String(payment.transaction_id)}</Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusInfo(payment.status).backgroundColor },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: getStatusInfo(payment.status).color }]}
                    >
                      {getStatusInfo(payment.status).text}
                    </Text>
                  </View>
                </Surface>

                {/* Description */}
                <Surface style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Descrição:</Text>
                  <Text style={styles.description}>{payment.description || 'N/A'}</Text>
                </Surface>

                {/* Amount Information */}
                <Surface style={styles.amountContainer}>
                  <Text style={styles.amountTitle}>Valores</Text>

                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Valor Base:</Text>
                    <Text style={styles.amountValue}>
                      {payment.base_amount ? formatCurrency(payment.base_amount) : 'R$ 0,00'}
                    </Text>
                  </View>

                  {payment.interest_amount && payment.interest_amount > 0 && (
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Juros:</Text>
                      <Text style={[styles.amountValue, { color: '#f44336' }]}>
                        {formatCurrency(payment.interest_amount)}
                      </Text>
                    </View>
                  )}

                  <Divider style={styles.amountDivider} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={[styles.totalValue, { color: theme.colors.primary }]}>
                      {payment.amount ? formatCurrency(payment.amount) : 'R$ 0,00'}
                    </Text>
                  </View>
                </Surface>

                {/* Date Information */}
                <Surface style={styles.dateContainer}>
                  <Text style={styles.dateTitle}>Datas</Text>

                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Vencimento:</Text>
                    <Text style={styles.dateValue}>
                      {payment.due_date ? formatDateTime(payment.due_date) : 'N/A'}
                    </Text>
                  </View>

                  {payment.payment_date && String(payment.payment_date).length > 0 && (
                    <View style={styles.dateRow}>
                      <Text style={styles.dateLabel}>Data do Pagamento:</Text>
                      <Text style={[styles.dateValue, { color: '#4caf50', fontWeight: '600' }]}>
                        {payment.payment_date ? formatDateTime(payment.payment_date) : 'N/A'}
                      </Text>
                    </View>
                  )}

                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Criado em:</Text>
                    <Text style={styles.dateValue}>
                      {payment.created_at ? formatDateTime(payment.created_at) : 'N/A'}
                    </Text>
                  </View>
                </Surface>

                {/* Vehicle Information */}
                <Surface style={styles.vehicleContainer}>
                  <Text style={styles.vehicleTitle}>Veículo</Text>
                  <View style={styles.vehicleRow}>
                    <Text style={styles.vehicleLabel}>ID do Veículo:</Text>
                    <Text style={styles.vehicleValue}>{String(payment.vehicle_id || 'N/A')}</Text>
                  </View>
                  {payment.vehicle_name && String(payment.vehicle_name).length > 0 && (
                    <View style={styles.vehicleRow}>
                      <Text style={styles.vehicleLabel}>Nome:</Text>
                      <Text style={styles.vehicleValue}>{String(payment.vehicle_name)}</Text>
                    </View>
                  )}
                </Surface>

                {/* Payment Method */}
                <Surface style={styles.methodContainer}>
                  <View style={styles.methodRow}>
                    <Ionicons name="card-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.methodText}>
                      Método: {payment.payment_method?.toUpperCase() || 'PIX'}
                    </Text>
                  </View>
                </Surface>

                {/* Footer */}
                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Comprovante gerado em: {formatDateTime(new Date().toISOString())}
                  </Text>
                  {payment.status && payment.status === 'paid' && (
                    <Text style={styles.paidConfirmation}>
                      Pagamento confirmado e processado com sucesso
                    </Text>
                  )}
                </View>
              </ScrollView>
            ) : payment ? (
              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={styles.scrollContent}
              >
                <View style={styles.errorContainer}>
                  <Ionicons name="information-circle" size={48} color="#ff9800" />
                  <Text style={styles.errorText}>
                    Comprovante disponível apenas para pagamentos confirmados
                  </Text>
                  <Text style={styles.statusInfo}>
                    Status atual: {getStatusInfo(payment.status).text}
                  </Text>
                </View>
              </ScrollView>
            ) : null}

            {/* Action Buttons - Fixed at bottom */}
            {payment &&
              (payment.status?.toLowerCase() === 'paid' ||
                payment.status?.toLowerCase() === 'completed' ||
                payment.status?.toLowerCase() === 'pago') && (
                <View style={styles.actionButtonsContainer}>
                  <Divider />
                  <View style={styles.actionButtons}>
                    <Button
                      mode="contained"
                      onPress={exportToPDF}
                      style={[styles.actionButton, { backgroundColor: '#f44336' }]}
                      icon="file-pdf-box"
                      loading={exportingPDF}
                      disabled={exportingPDF}
                      compact
                    >
                      PDF
                    </Button>

                    <Button
                      mode="contained"
                      onPress={shareReceipt}
                      style={[styles.actionButton, { backgroundColor: '#2196f3' }]}
                      icon="share-variant"
                      compact
                    >
                      Compartilhar
                    </Button>

                    <Button
                      mode="outlined"
                      onPress={onDismiss}
                      style={styles.actionButton}
                      icon="close"
                      compact
                    >
                      Fechar
                    </Button>
                  </View>
                </View>
              )}
          </View>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButtonsContainer: {
    backgroundColor: '#fff',
    paddingBottom: 16,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  amountContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  amountDivider: {
    marginVertical: 12,
  },
  amountLabel: {
    color: '#666',
    fontSize: 14,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  card: {
    borderRadius: 12,
    elevation: 5,
    maxHeight: '90%',
    width: '100%',
  },
  cardContent: {
    flex: 1,
    maxHeight: '100%',
    padding: 16,
  },
  companyHeader: {
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 16,
    padding: 20,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  companySubtitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  dateContainer: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  dateLabel: {
    color: '#666',
    fontSize: 14,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
  },
  descriptionContainer: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  descriptionLabel: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  divider: {
    marginVertical: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    marginTop: 16,
    padding: 16,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
  methodContainer: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  methodRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  paidConfirmation: {
    color: '#4caf50',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  paymentHeader: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  paymentId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  paymentIdLabel: {
    color: '#666',
    fontSize: 14,
  },
  paymentIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  statusBadge: {
    alignSelf: 'center',
    borderRadius: 20,
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusInfo: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  transactionId: {
    color: '#333',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  vehicleContainer: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  vehicleLabel: {
    color: '#666',
    fontSize: 14,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vehicleValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
