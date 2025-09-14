import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Share,
  ScrollView
} from 'react-native';
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
  IconButton
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { paymentService } from '../services/paymentService';
import { pdfService } from '../services/pdfService';
import { formatCurrency, formatDateTime } from '../utils/dateUtils';

interface PaymentReceiptProps {
  visible: boolean;
  onDismiss: () => void;
  paymentId: number;
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
  paymentId 
}: PaymentReceiptProps) {
  const [payment, setPayment] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportingPDF, setExportingPDF] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (visible && paymentId) {
      fetchPaymentDetails();
    }
  }, [visible, paymentId]);

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
      setError('Erro ao carregar comprovante');
      console.error('Erro ao buscar detalhes do pagamento:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          text: 'Pago',
          color: '#4caf50',
          backgroundColor: '#e8f5e8'
        };
      case 'pending':
        return {
          text: 'Pendente',
          color: '#ff9800',
          backgroundColor: '#fff3cd'
        };
      case 'overdue':
        return {
          text: 'Vencido',
          color: '#f44336',
          backgroundColor: '#ffebee'
        };
      default:
        return {
          text: status,
          color: '#666',
          backgroundColor: '#f5f5f5'
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
      `Comprovante gerado em: ${formatDateTime(new Date().toISOString())}`
    ].filter(Boolean).join('\n');

    try {
      await Share.share({
        message: receiptText,
        title: 'Comprovante de Pagamento'
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

  if (!visible) return null;

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss} 
        contentContainerStyle={styles.modalContainer}
      >
        <Card style={styles.card}>
          <Card.Content>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerContent}>
                <Ionicons name="receipt-outline" size={32} color={theme.colors.primary} />
                <Title style={styles.title}>Comprovante</Title>
              </View>
              <IconButton
                icon="close"
                size={24}
                onPress={onDismiss}
              />
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
            ) : payment && (payment.status === 'paid' || payment.status === 'completed') ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Company Header */}
                <Surface style={styles.companyHeader}>
                  <Text style={styles.companyName}>VEHICLES-GO</Text>
                  <Text style={styles.companySubtitle}>Sistema de Gestão de Veículos</Text>
                </Surface>

                {/* Payment ID and Status */}
                <Surface style={styles.paymentHeader}>
                  <View style={styles.paymentIdRow}>
                    <Text style={styles.paymentIdLabel}>ID do Pagamento:</Text>
                    <Text style={styles.paymentId}>{`#${payment.id}`}</Text>
                  </View>
                  
                  {payment.transaction_id && (
                    <View style={styles.paymentIdRow}>
                      <Text style={styles.paymentIdLabel}>Transaction ID:</Text>
                      <Text style={styles.transactionId}>{payment.transaction_id}</Text>
                    </View>
                  )}

                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusInfo(payment.status).backgroundColor }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusInfo(payment.status).color }
                    ]}>
                      {getStatusInfo(payment.status).text}
                    </Text>
                  </View>
                </Surface>

                {/* Description */}
                <Surface style={styles.descriptionContainer}>
                  <Text style={styles.descriptionLabel}>Descrição:</Text>
                  <Text style={styles.description}>{payment.description}</Text>
                </Surface>

                {/* Amount Information */}
                <Surface style={styles.amountContainer}>
                  <Text style={styles.amountTitle}>Valores</Text>
                  
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Valor Base:</Text>
                    <Text style={styles.amountValue}>
                      {formatCurrency(payment.base_amount)}
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
                      {formatCurrency(payment.amount)}
                    </Text>
                  </View>
                </Surface>

                {/* Date Information */}
                <Surface style={styles.dateContainer}>
                  <Text style={styles.dateTitle}>Datas</Text>
                  
                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Vencimento:</Text>
                    <Text style={styles.dateValue}>
                      {formatDateTime(payment.due_date)}
                    </Text>
                  </View>

                  {payment.payment_date && (
                    <View style={styles.dateRow}>
                      <Text style={styles.dateLabel}>Data do Pagamento:</Text>
                      <Text style={[styles.dateValue, { color: '#4caf50', fontWeight: '600' }]}>
                        {formatDateTime(payment.payment_date)}
                      </Text>
                    </View>
                  )}

                  <View style={styles.dateRow}>
                    <Text style={styles.dateLabel}>Criado em:</Text>
                    <Text style={styles.dateValue}>
                      {formatDateTime(payment.created_at)}
                    </Text>
                  </View>
                </Surface>

                {/* Vehicle Information */}
                <Surface style={styles.vehicleContainer}>
                  <Text style={styles.vehicleTitle}>Veículo</Text>
                  <View style={styles.vehicleRow}>
                    <Text style={styles.vehicleLabel}>ID do Veículo:</Text>
                    <Text style={styles.vehicleValue}>{payment.vehicle_id}</Text>
                  </View>
                  {payment.vehicle_name && (
                    <View style={styles.vehicleRow}>
                      <Text style={styles.vehicleLabel}>Nome:</Text>
                      <Text style={styles.vehicleValue}>{payment.vehicle_name}</Text>
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
                  {payment.status === 'paid' && (
                    <Text style={styles.paidConfirmation}>
                      Pagamento confirmado e processado com sucesso
                    </Text>
                  )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  <Button
                    mode="contained"
                    onPress={exportToPDF}
                    style={[styles.actionButton, { backgroundColor: '#f44336' }]}
                    icon="file-pdf-box"
                    loading={exportingPDF}
                    disabled={exportingPDF}
                  >
                    {exportingPDF ? 'Gerando PDF...' : 'Exportar PDF'}
                  </Button>
                  
                  <Button
                    mode="contained"
                    onPress={shareReceipt}
                    style={[styles.actionButton, { backgroundColor: '#2196f3' }]}
                    icon="share-variant"
                  >
                    Compartilhar
                  </Button>
                  
                  <Button
                    mode="outlined"
                    onPress={onDismiss}
                    style={styles.actionButton}
                    icon="close"
                  >
                    Fechar
                  </Button>
                </View>
              </ScrollView>
            ) : payment ? (
              <View style={styles.errorContainer}>
                <Ionicons name="information-circle" size={48} color="#ff9800" />
                <Text style={styles.errorText}>
                  Comprovante disponível apenas para pagamentos confirmados
                </Text>
                <Text style={styles.statusInfo}>
                  Status atual: {getStatusInfo(payment.status).text}
                </Text>
              </View>
            ) : null}
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    marginLeft: 12,
    fontSize: 24,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    marginVertical: 16,
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
  statusInfo: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  companyHeader: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 8,
  },
  companyName: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  companySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  paymentHeader: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  paymentIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  paymentIdLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionId: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  descriptionContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    fontWeight: '500',
  },
  amountContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  amountTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  amountDivider: {
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  dateContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  vehicleContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  vehicleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vehicleLabel: {
    fontSize: 14,
    color: '#666',
  },
  vehicleValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  methodContainer: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  paidConfirmation: {
    fontSize: 14,
    color: '#4caf50',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
});
