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

interface PaymentHistoryScreenProps {
  navigation: any;
}

export default function PaymentHistoryScreen({ navigation }: PaymentHistoryScreenProps) {
  const { paymentHistory, loading, refreshData, processPayment } = useVehicle();
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    refreshData();
  }, []);

  const handlePayment = (payment: Payment) => {
    Alert.alert(
      'Processar Pagamento',
      `Deseja pagar ${formatCurrency(payment.amount)} para ${payment.vehicleName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'PIX', onPress: () => processPaymentWithMethod(payment.id, 'PIX') },
        { text: 'Cartão', onPress: () => processPaymentWithMethod(payment.id, 'Cartão de Crédito') },
        { text: 'Boleto', onPress: () => processPaymentWithMethod(payment.id, 'Boleto') }
      ]
    );
  };

  const processPaymentWithMethod = async (paymentId: string, method: PaymentMethod) => {
    setProcessingPayment(paymentId);
    
    try {
      const result = await processPayment(paymentId, method);
      
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
    const status = getPaymentStatus(item);
    const isProcessing = processingPayment === item.id;

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
              <Text style={[styles.amount, { color: theme.colors.primary }]}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Payment Details */}
          <View style={styles.paymentDetails}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <Text style={styles.detailLabel}>Vencimento:</Text>
              <Text style={styles.detailValue}>
                {formatDateTime(item.dueDate).split(' ')[0]}
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

          {/* Payment Button */}
          {(item.status === 'pendente' || item.status === 'vencido') && (
            <Button
              mode="contained"
              onPress={() => handlePayment(item)}
              style={[
                styles.payButton,
                { backgroundColor: item.status === 'vencido' ? '#f44336' : theme.colors.primary }
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
        </Card.Content>
      </Card>
    );
  };

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
  const paidPayments = paymentHistory.filter(p => p.status === 'pago');
  const pendingPayments = paymentHistory.filter(p => p.status === 'pendente' || p.status === 'vencido');
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
          new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        )}
        renderItem={renderPaymentCard}
        keyExtractor={(item) => item.id}
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
});
