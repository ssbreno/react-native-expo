import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Surface,
  useTheme,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useVehicle } from '../../contexts/VehicleContext';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

interface SubscriptionScreenProps {
  navigation: any;
}

export default function SubscriptionScreen({ navigation }: SubscriptionScreenProps) {
  const { vehicles, getPendingPayments } = useVehicle();
  const theme = useTheme();

  const pendingPayments = getPendingPayments();
  const totalPendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalMonthlyAmount = vehicles.reduce((sum, vehicle) => sum + (vehicle.price || vehicle.monthlyPrice || 0), 0);





  // Get next due date from pending payments
  const getNextDueDate = () => {
    const pendingPayments = getPendingPayments();
    
    if (pendingPayments.length === 0) {
      return 'em breve';
    }
    
    // Find the earliest due date among pending payments
    const earliestDueDate = pendingPayments
      .map(payment => new Date(payment.due_date || payment.dueDate || new Date()))
      .sort((a, b) => a.getTime() - b.getTime())[0];
    
    return formatDate(earliestDueDate.toISOString());
  };



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Minha Assinatura</Title>
        <Text style={styles.headerSubtitle}>
          Gerencie sua assinatura e pagamentos
        </Text>
      </Surface>

      {/* Subscription Status */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Title style={styles.statusTitle}>Status da Assinatura</Title>
              <View style={styles.activeStatus}>
                <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                <Text style={[styles.statusText, { color: '#4caf50' }]}>
                  Ativa
                </Text>
              </View>
            </View>
            <Ionicons name="ribbon" size={40} color={theme.colors.primary} />
          </View>

          <Divider style={styles.divider} />

          <View style={styles.subscriptionDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Veículos Ativos:</Text>
              <Text style={styles.detailValue}>{vehicles.length}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Valor Mensal Total:</Text>
              <Text style={[styles.detailValue, { color: theme.colors.primary, fontWeight: 'bold' }]}>
                {formatCurrency(totalMonthlyAmount)}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Próximo Vencimento:</Text>
              <Text style={styles.detailValue}>
                {getNextDueDate()}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Pending Payments */}
      {pendingPayments.length > 0 && (
        <Card style={styles.paymentsCard}>
          <Card.Content>
            <View style={styles.paymentsHeader}>
              <Title style={styles.sectionTitle}>Pagamentos Pendentes</Title>
              <Surface style={styles.pendingBadge}>
                <Text style={styles.pendingCount}>{pendingPayments.length}</Text>
              </Surface>
            </View>

            <View style={styles.pendingAmount}>
              <Text style={styles.amountLabel}>Total Pendente:</Text>
              <Text style={[styles.amount, { color: '#f44336' }]}>
                {formatCurrency(totalPendingAmount)}
              </Text>
            </View>

          </Card.Content>
        </Card>
      )}

      {/* Payment Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Configurações de Pagamento</Title>

          <View style={styles.paymentMethodInfo}>
            <View style={styles.paymentMethodRow}>
              <Ionicons name="logo-bitcoin" size={24} color={theme.colors.primary} />
              <View style={styles.paymentMethodText}>
                <Text style={styles.paymentMethodTitle}>Método de Pagamento</Text>
                <Text style={styles.paymentMethodDescription}>PIX - Pagamento instantâneo</Text>
              </View>
            </View>
          </View>

        </Card.Content>
      </Card>



      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 20,
    elevation: 2,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#000000',
  },
  statusCard: {
    margin: 16,
    elevation: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  activeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  divider: {
    marginVertical: 16,
  },
  subscriptionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  paymentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#f44336',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pendingAmount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  payAllButton: {
    marginTop: 8,
  },
  settingsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  actionsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  renewButton: {
    marginBottom: 12,
  },
  paymentMethodInfo: {
    paddingVertical: 16,
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  paymentMethodText: {
    marginLeft: 16,
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    fontSize: 14,
    color: '#666',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  paySubscriptionButton: {
    marginTop: 16,
  },
  bottomSpacing: {
    height: 32,
  },
});
