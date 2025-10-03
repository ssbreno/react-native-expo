import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Button,
  Chip,
  Divider,
  useTheme
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminUser } from '../../services/adminService';
import { Colors } from '../../constants/colors';

interface OverdueUser extends AdminUser {
  days_overdue: number;
  pending_amount: number;
}

export default function UpdateOverduePaymentsScreen({ navigation }: any) {
  const [users, setUsers] = useState<OverdueUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadOverdueUsers();
  }, []);

  const loadOverdueUsers = async () => {
    try {
      const result = await adminService.getUsersWithPaymentStatus();
      if (result.success && result.data) {
        // Filter only users with overdue payments
        const overdueUsers = result.data.filter(
          (user: any) => user.payment_status === 'overdue' && user.days_overdue > 0
        ) as OverdueUser[];
        setUsers(overdueUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Erro ao carregar usuários com pagamentos vencidos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadOverdueUsers();
  };

  const handleUpdateAllOverduePayments = async () => {
    Alert.alert(
      'Atualizar Todos os Pagamentos',
      `Tem certeza que deseja atualizar ${users.length} pagamento(s) vencido(s)?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Atualizar',
          onPress: async () => {
            setUpdating(true);
            try {
              const result = await adminService.updateOverduePayments();
              if (result.success) {
                Alert.alert(
                  'Sucesso',
                  result.message || 'Pagamentos atualizados com sucesso'
                );
                loadOverdueUsers();
              } else {
                Alert.alert('Erro', result.error || 'Erro ao atualizar pagamentos');
              }
            } catch (error) {
              console.error('Erro ao atualizar:', error);
              Alert.alert('Erro', 'Erro ao atualizar pagamentos');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  const handleNavigateToUserDetails = (userId: string | number) => {
    navigation.navigate('UserDetails', { userId: userId.toString() });
  };

  const formatCurrency = (amount: number) => {
    return `R$ ${amount.toFixed(2).replace('.', ',')}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando pagamentos vencidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Pagamentos Vencidos</Title>
        <Text style={styles.subtitle}>
          {users.length} usuário(s) com pagamentos em atraso
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {users.length > 0 ? (
          <>
            <View style={styles.summaryCard}>
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <Ionicons name="people" size={32} color="#F44336" />
                      <Text style={styles.summaryValue}>{users.length}</Text>
                      <Text style={styles.summaryLabel}>Usuários</Text>
                    </View>
                    <View style={styles.summaryItem}>
                      <Ionicons name="cash" size={32} color="#FF9800" />
                      <Text style={styles.summaryValue}>
                        {formatCurrency(
                          users.reduce((sum, user) => sum + (user.pending_amount || 0), 0)
                        )}
                      </Text>
                      <Text style={styles.summaryLabel}>Total Pendente</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </View>

            <View style={styles.actionContainer}>
              <Button
                mode="contained"
                onPress={handleUpdateAllOverduePayments}
                disabled={updating}
                loading={updating}
                icon="refresh-circle"
                buttonColor={Colors.primary}
                style={styles.updateButton}
              >
                Atualizar Todos os Pagamentos
              </Button>
            </View>

            <View style={styles.listContainer}>
              <Title style={styles.listTitle}>Usuários com Pagamentos Vencidos</Title>
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  onPress={() => handleNavigateToUserDetails(user.id)}
                >
                  <Card style={styles.userCard}>
                    <Card.Content>
                      <View style={styles.userHeader}>
                        <View style={styles.userInfo}>
                          <View style={styles.userNameRow}>
                            <Ionicons name="person-circle" size={24} color={Colors.primary} />
                            <Text style={styles.userName}>{user.name}</Text>
                          </View>
                          <Text style={styles.userEmail}>{user.email}</Text>
                          {user.phone && (
                            <View style={styles.phoneRow}>
                              <Ionicons name="call-outline" size={14} color="#666" />
                              <Text style={styles.userPhone}>{user.phone}</Text>
                            </View>
                          )}
                          {user.vehicle_name && (
                            <View style={styles.vehicleRow}>
                              <Ionicons name="car-outline" size={14} color="#666" />
                              <Text style={styles.vehicleName}>{user.vehicle_name}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.statusContainer}>
                          <Chip
                            mode="flat"
                            textStyle={{ color: '#F44336', fontSize: 11 }}
                            style={styles.overdueChip}
                          >
                            {user.days_overdue} dias
                          </Chip>
                        </View>
                      </View>

                      <Divider style={styles.divider} />

                      <View style={styles.paymentInfo}>
                        <View style={styles.paymentRow}>
                          <Text style={styles.paymentLabel}>Valor Pendente:</Text>
                          <Text style={styles.paymentValue}>
                            {formatCurrency(user.pending_amount)}
                          </Text>
                        </View>
                        {user.last_payment && (
                          <View style={styles.paymentRow}>
                            <Text style={styles.paymentLabel}>Último Pagamento:</Text>
                            <Text style={styles.lastPaymentText}>
                              {new Date(user.last_payment).toLocaleDateString('pt-BR')}
                            </Text>
                          </View>
                        )}
                      </View>

                      <Button
                        mode="outlined"
                        onPress={() => handleNavigateToUserDetails(user.id)}
                        icon="arrow-right"
                        contentStyle={{ flexDirection: 'row-reverse' }}
                        style={styles.viewDetailsButton}
                        compact
                      >
                        Ver Detalhes
                      </Button>
                    </Card.Content>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Text style={styles.emptyTitle}>Tudo em dia!</Text>
                <Text style={styles.emptyText}>
                  Não há pagamentos vencidos no momento
                </Text>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 60,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  summaryCard: {
    padding: 16,
  },
  card: {
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  actionContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  updateButton: {
    marginVertical: 8,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  userCard: {
    marginBottom: 12,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  userPhone: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  vehicleName: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  overdueChip: {
    backgroundColor: '#FFEBEE',
  },
  divider: {
    marginVertical: 12,
  },
  paymentInfo: {
    marginBottom: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
  },
  lastPaymentText: {
    fontSize: 14,
    color: '#666',
  },
  viewDetailsButton: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 16,
    flex: 1,
  },
  emptyCard: {
    elevation: 2,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
