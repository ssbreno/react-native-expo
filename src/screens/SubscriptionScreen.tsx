import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Surface,
  ActivityIndicator,
  useTheme,
  Divider,
  Switch,
  List
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useVehicle } from '../contexts/VehicleContext';
import { formatCurrency } from '../utils/dateUtils';

interface SubscriptionScreenProps {
  navigation: any;
}

export default function SubscriptionScreen({ navigation }: SubscriptionScreenProps) {
  const { vehicles, getPendingPayments, processPayment } = useVehicle();
  const [loading, setLoading] = useState(false);
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('Cartão de Crédito');
  const theme = useTheme();

  const pendingPayments = getPendingPayments();
  const totalPendingAmount = pendingPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalMonthlyAmount = vehicles.reduce((sum, vehicle) => sum + vehicle.monthlyPrice, 0);

  const handlePayAllPending = () => {
    if (pendingPayments.length === 0) {
      Alert.alert('Aviso', 'Não há pagamentos pendentes.');
      return;
    }

    Alert.alert(
      'Pagar Todas as Pendências',
      `Deseja pagar ${formatCurrency(totalPendingAmount)} referente a ${pendingPayments.length} mensalidade${pendingPayments.length > 1 ? 's' : ''} pendente${pendingPayments.length > 1 ? 's' : ''}?\n\nMétodo de pagamento: ${paymentMethod}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Confirmar', onPress: processAllPayments }
      ]
    );
  };

  const processAllPayments = async () => {
    setLoading(true);
    let successCount = 0;
    let failureCount = 0;

    try {
      for (const payment of pendingPayments) {
        try {
          const result = await processPayment(payment.id, paymentMethod as any);
          if (result.success) {
            successCount++;
          } else {
            failureCount++;
          }
        } catch (error) {
          failureCount++;
        }
      }

      if (successCount > 0 && failureCount === 0) {
        Alert.alert(
          'Sucesso!',
          `Todos os ${successCount} pagamento${successCount > 1 ? 's foram processados' : ' foi processado'} com sucesso!`
        );
      } else if (successCount > 0 && failureCount > 0) {
        Alert.alert(
          'Parcialmente Processado',
          `${successCount} pagamento${successCount > 1 ? 's foram processados' : ' foi processado'} com sucesso.\n${failureCount} falharam. Tente novamente para os restantes.`
        );
      } else {
        Alert.alert(
          'Erro',
          'Falha ao processar os pagamentos. Tente novamente.'
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro interno. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleRenewSubscription = () => {
    Alert.alert(
      'Renovar Assinatura',
      'Deseja renovar sua assinatura por mais um período?\n\nIsso estenderá o prazo de todos os seus veículos alugados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Renovar', onPress: processRenewal }
      ]
    );
  };

  const processRenewal = async () => {
    setLoading(true);
    
    // Simulate renewal process
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Sucesso!',
        'Sua assinatura foi renovada com sucesso! Os prazos de todos os veículos foram estendidos por mais um mês.',
        [{ text: 'OK' }]
      );
    }, 2000);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancelar Assinatura',
      'Tem certeza que deseja cancelar sua assinatura?\n\nEsta ação não pode ser desfeita e você perderá acesso aos veículos no final do período atual.',
      [
        { text: 'Manter Ativa', style: 'cancel' },
        { text: 'Cancelar Assinatura', style: 'destructive', onPress: processCancellation }
      ]
    );
  };

  const processCancellation = () => {
    Alert.alert(
      'Assinatura Cancelada',
      'Sua assinatura foi cancelada. Você continuará tendo acesso aos veículos até o final do período já pago.',
      [{ text: 'OK' }]
    );
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
                {vehicles.length > 0 
                  ? new Date(Math.min(...vehicles.map(v => new Date(v.rentalExpiration).getTime()))).toLocaleDateString('pt-BR')
                  : '-'
                }
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

            <Button
              mode="contained"
              onPress={handlePayAllPending}
              style={[styles.payAllButton, { backgroundColor: '#f44336' }]}
              disabled={loading}
              contentStyle={styles.buttonContent}
              icon="credit-card"
            >
              {loading ? <ActivityIndicator color="white" /> : 'Pagar Todas as Pendências'}
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Payment Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Configurações de Pagamento</Title>

          <List.Section>
            <List.Item
              title="Renovação Automática"
              description="Renovar automaticamente quando próximo ao vencimento"
              left={(props) => <List.Icon {...props} icon="autorenew" />}
              right={() => (
                <Switch
                  value={autoRenewal}
                  onValueChange={setAutoRenewal}
                  color={theme.colors.primary}
                />
              )}
            />

            <List.Item
              title="Método de Pagamento Padrão"
              description={paymentMethod}
              left={(props) => <List.Icon {...props} icon="credit-card" />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                Alert.alert(
                  'Método de Pagamento',
                  'Escolha seu método de pagamento padrão:',
                  [
                    { text: 'PIX', onPress: () => setPaymentMethod('PIX') },
                    { text: 'Cartão de Crédito', onPress: () => setPaymentMethod('Cartão de Crédito') },
                    { text: 'Boleto', onPress: () => setPaymentMethod('Boleto') },
                    { text: 'Cancelar', style: 'cancel' }
                  ]
                );
              }}
            />
          </List.Section>
        </Card.Content>
      </Card>

      {/* Subscription Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Ações da Assinatura</Title>

          <Button
            mode="contained"
            onPress={handleRenewSubscription}
            style={styles.renewButton}
            disabled={loading}
            contentStyle={styles.buttonContent}
            icon="refresh"
          >
            {loading ? <ActivityIndicator color="white" /> : 'Renovar Assinatura'}
          </Button>

          <Button
            mode="outlined"
            onPress={handleCancelSubscription}
            style={styles.cancelButton}
            contentStyle={styles.buttonContent}
            textColor="#f44336"
            icon="cancel"
          >
            Cancelar Assinatura
          </Button>
        </Card.Content>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
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
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
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
  cancelButton: {
    borderColor: '#f44336',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  bottomSpacing: {
    height: 32,
  },
});
