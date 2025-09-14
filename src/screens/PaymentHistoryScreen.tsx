import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Button,
  Surface,
  Chip,
  useTheme,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useVehicle } from '../contexts/VehicleContext';
import { Payment, PaymentMethod } from '../types';
import { formatCurrency, formatDateTime, getPaymentStatus } from '../utils/dateUtils';
import { paymentService } from '../services/paymentService';
import PixPayment from '../components/PixPayment';
import PaymentReceipt from '../components/PaymentReceipt';

interface PaymentHistoryScreenProps {
  navigation: any;
}

export default function PaymentHistoryScreen({ navigation }: PaymentHistoryScreenProps) {
  const { paymentHistory, loading, refreshData, processPayment, vehicles } = useVehicle();
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const [showPixPayment, setShowPixPayment] = useState<number | null>(null);
  const [showReceipt, setShowReceipt] = useState<number | null>(null);
  const theme = useTheme();

  useEffect(() => {
    refreshData();
  }, []);

  const normalizeStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      'pendente': 'pending',
      'vencido': 'overdue', 
      'pago': 'completed',
      'completed': 'completed',
      'pending': 'pending',
      'overdue': 'overdue',
      'failed': 'failed',
      'cancelled': 'cancelled'
    };
    return statusMap[status] || status;
  };

  const isPaymentPending = (status: string): boolean => {
    const normalizedStatus = normalizeStatus(status);
    return normalizedStatus === 'pending' || normalizedStatus === 'overdue';
  };

  const isPaymentCompleted = (status: string): boolean => {
    const normalizedStatus = normalizeStatus(status);
    return normalizedStatus === 'completed';
  };

  const handlePayment = (payment: Payment) => {
    Alert.alert(
      'Pagamento via PIX',
      `Deseja gerar PIX de ${formatCurrency(payment.amount)} para ${payment.vehicleName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Gerar PIX', onPress: () => setShowPixPayment(parseInt(payment.id.toString())) }
      ]
    );
  };

  const handlePixPaymentComplete = (paymentData: any) => {
    Alert.alert(
      'Pagamento Concluído!',
      'Seu pagamento PIX foi processado com sucesso.',
      [{ text: 'OK', onPress: () => {
        setShowPixPayment(null);
        refreshData();
      }}]
    );
  };

  const processPaymentWithMethod = async (paymentId: string, method: PaymentMethod) => {
    setProcessingPayment(paymentId);
    
    try {
      const result = await processPayment(parseInt(paymentId), method);
      
      if (result.success) {
        Alert.alert(
          'Sucesso!',
          result.message || 'Pagamento processado com sucesso!',
          [{ text: 'OK', onPress: () => refreshData() }]
        );
      } else {
        Alert.alert(
          'Erro',
          result.error || 'Falha ao processar pagamento. Tente novamente.'
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro interno. Tente novamente.');
    } finally {
      setProcessingPayment(null);
    }
  };

  const renderPaymentCard = ({ item }: { item: Payment }) => {
    const status = getPaymentStatus({ ...item, dueDate: item.dueDate || item.due_date || new Date().toISOString() });
    const isProcessing = processingPayment === item.id.toString();

    return (
      <Card style={styles.card}>
        <Card.Content>
          {/* Payment Header */}
          <View style={styles.paymentHeader}>
            <View style={styles.paymentInfo}>
              <Title style={styles.vehicleName} numberOfLines={1}>
                {item.vehicleName}
              </Title>
              <Text style={styles.description}>
                {item.description || 'Mensalidade'}
              </Text>
            </View>
            
            <View style={styles.amountContainer}>
              {/* Verificar se há juros aplicados */}
              {item.amount > (item.base_amount || item.amount) ? (
                <View style={styles.amountBreakdown}>
                  <Text style={styles.baseAmountSmall}>
                    Base: {formatCurrency(item.base_amount || item.amount)}
                  </Text>
                  <Text style={styles.interestAmountSmall}>
                    + Juros: {formatCurrency(item.amount - (item.base_amount || item.amount))}
                  </Text>
                  <Text style={[styles.amount, { color: theme.colors.primary }]}>
                    {formatCurrency(item.amount)}
                  </Text>
                </View>
              ) : (
                <Text style={[styles.amount, { color: theme.colors.primary }]}>
                  {formatCurrency(item.amount)}
                </Text>
              )}
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Payment Details */}
          <View style={styles.paymentDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Vencimento:</Text>
              <Text style={styles.detailValue}>
                {item.dueDate ? formatDateTime(item.dueDate).split(' ')[0] : 'Não informado'}
              </Text>
            </View>

            {item.date && (
              <View style={styles.detailRow}>
                <Ionicons name="checkmark-circle" size={16} color="#4caf50" />
                <Text style={styles.detailLabel}>Pago em:</Text>
                <Text style={styles.detailValue}>
                  {formatDateTime(item.date)}
                </Text>
              </View>
            )}

            {item.method && (
              <View style={styles.detailRow}>
                <Ionicons name="card-outline" size={16} color="#666" />
                <Text style={styles.detailLabel}>Método:</Text>
                <Text style={styles.detailValue}>{item.method}</Text>
              </View>
            )}
          </View>

          {/* Status Chip */}
          <View style={styles.statusContainer}>
            <Surface
              style={[
                styles.statusChip,
                { backgroundColor: status.backgroundColor }
              ]}
            >
              <Ionicons 
                name={status.icon} 
                size={16} 
                color={status.color} 
                style={styles.statusIcon}
              />
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </Surface>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtonsContainer}>
            {/* Receipt Button - Only for completed/paid payments */}
            {isPaymentCompleted(item.status) && (
              <Button
                mode="outlined"
                onPress={() => setShowReceipt(parseInt(item.id.toString()))}
                style={styles.receiptButton}
                icon="receipt"
              >
                Comprovante
              </Button>
            )}

            {/* Payment Button - Only for pending/overdue */}
            {isPaymentPending(item.status) && (
              <Button
                mode="contained"
                onPress={() => handlePayment(item)}
                style={[
                  styles.payButton,
                  { backgroundColor: normalizeStatus(item.status) === 'overdue' ? '#f44336' : theme.colors.primary }
                ]}
                disabled={isProcessing}
                contentStyle={styles.payButtonContent}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  `Pagar ${formatCurrency(item.amount)}`
                )}
              </Button>
            )}
          </View>

          {/* PIX Payment Component */}
          {isPaymentPending(item.status) && (
            <View>
              {showPixPayment === parseInt(item.id.toString()) && (
                <View style={styles.pixPaymentContainer}>
                  <PixPayment 
                    paymentId={parseInt(item.id.toString())}
                    amount={item.amount}
                    description={`Pagamento - ${item.vehicleName || 'Veículo'}`}
                    onPaymentComplete={handlePixPaymentComplete}
                  />
                  <Button
                    mode="text"
                    onPress={() => setShowPixPayment(null)}
                    style={styles.cancelPixButton}
                  >
                    Cancelar PIX
                  </Button>
                </View>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  // Add PaymentReceipt modal to the main render

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="receipt-outline" size={64} color="#ccc" />
      <Title style={styles.emptyTitle}>Nenhum pagamento encontrado</Title>
      <Text style={styles.emptyText}>
        Seu histórico de pagamentos aparecerá aqui.
      </Text>
      <Button
        mode="contained"
        onPress={refreshData}
        style={styles.retryButton}
      >
        Atualizar
      </Button>
    </View>
  );

  // Calculate summary
  const paidPayments = paymentHistory.filter(p => isPaymentCompleted(p.status));
  const pendingPayments = paymentHistory.filter(p => isPaymentPending(p.status));
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  if (loading && paymentHistory.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Summary */}
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Histórico de Pagamentos</Title>
        
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Pago</Text>
            <Text style={[styles.summaryValue, { color: '#4caf50' }]}>
              {formatCurrency(totalPaid)}
            </Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pendente</Text>
            <Text style={[styles.summaryValue, { color: '#ff9800' }]}>
              {formatCurrency(totalPending)}
            </Text>
          </View>
        </View>
      </Surface>

      {/* Payment List */}
      <FlatList
        data={paymentHistory.sort((a, b) => 
          new Date(b.dueDate || b.due_date || '').getTime() - new Date(a.dueDate || a.due_date || '').getTime()
        )}
        renderItem={renderPaymentCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          paymentHistory.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshData}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Payment Receipt Modal */}
      {showReceipt && (
        <PaymentReceipt
          visible={!!showReceipt}
          onDismiss={() => setShowReceipt(null)}
          paymentId={showReceipt}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    elevation: 2,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    backgroundColor: 'white',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 16,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    marginVertical: 12,
  },
  paymentDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    minWidth: 80,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 1,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  payButton: {
    marginTop: 8,
  },
  payButtonContent: {
    paddingVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
  pixPaymentContainer: {
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cancelPixButton: {
    marginTop: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  receiptButton: {
    flex: 1,
  },
  amountBreakdown: {
    alignItems: 'flex-end',
  },
  baseAmountSmall: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  interestAmountSmall: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '500',
  },
});
