import React from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Title, Text, Surface, useTheme, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useVehicle } from '../../contexts/VehicleContext';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { styles } from './SubscriptionScreen.styles';

interface SubscriptionScreenProps {
  navigation: any;
}

export default function SubscriptionScreen({ navigation }: SubscriptionScreenProps) {
  const { vehicles, getPendingPayments } = useVehicle();
  const theme = useTheme();

  const pendingPayments = getPendingPayments();
  const totalPendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalMonthlyAmount = vehicles.reduce(
    (sum, vehicle) => sum + (vehicle.price || vehicle.monthlyPrice || 0),
    0
  );

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
        <Text style={styles.headerSubtitle}>Gerencie sua assinatura e pagamentos</Text>
      </Surface>

      {/* Subscription Status */}
      <Card style={styles.statusCard}>
        <Card.Content>
          <View style={styles.statusHeader}>
            <View style={styles.statusInfo}>
              <Title style={styles.statusTitle}>Status da Assinatura</Title>
              <View style={styles.activeStatus}>
                <Ionicons name="checkmark-circle" size={20} color="#4caf50" />
                <Text style={[styles.statusText, { color: '#4caf50' }]}>Ativa</Text>
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
              <Text
                style={[styles.detailValue, { color: theme.colors.primary, fontWeight: 'bold' }]}
              >
                {formatCurrency(totalMonthlyAmount)}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Próximo Vencimento:</Text>
              <Text style={styles.detailValue}>{getNextDueDate()}</Text>
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
