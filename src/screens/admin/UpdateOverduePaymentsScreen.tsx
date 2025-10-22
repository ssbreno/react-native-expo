import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Button,
  Chip,
  Divider,
  useTheme,
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
        // Filter only users with overdue payments AND exclude admins
        const overdueUsers = result.data.filter((user: any) => {
          // Check if user is admin
          const isAdminByEmail = user.email?.includes('admin');
          const isAdminByName = user.name?.toLowerCase().includes('administrador');
          const isAdminByField = user.is_admin === true;
          const isAdmin = isAdminByEmail || isAdminByName || isAdminByField;

          // Only include non-admin users with overdue payments
          return !isAdmin && user.payment_status === 'overdue' && user.days_overdue > 0;
        }) as OverdueUser[];

        console.log('📋 Loaded overdue users (non-admin only):', overdueUsers.length);
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
          style: 'cancel',
        },
        {
          text: 'Atualizar',
          onPress: async () => {
            setUpdating(true);
            try {
              const result = await adminService.updateOverduePayments();
              if (result.success) {
                Alert.alert('Sucesso', result.message || 'Pagamentos atualizados com sucesso');
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
          },
        },
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
        <Text style={styles.subtitle}>{users.length} usuário(s) com pagamentos em atraso</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
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
              {users.map(user => (
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
                          {!!user.phone && (
                            <View style={styles.phoneRow}>
                              <Ionicons name="call-outline" size={14} color="#666" />
                              <Text style={styles.userPhone}>{user.phone}</Text>
                            </View>
                          )}
                          {!!user.vehicle_name && (
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
                        {!!user.last_payment && (
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
                <Text style={styles.emptyText}>Não há pagamentos vencidos no momento</Text>
              </Card.Content>
            </Card>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  card: {
    elevation: 2,
  },
  container: {
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  divider: {
    marginVertical: 12,
  },
  emptyCard: {
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    padding: 16,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  emptyTitle: {
    color: '#4CAF50',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
  },
  header: {
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    padding: 20,
    paddingTop: 60,
  },
  lastPaymentText: {
    color: '#666',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  listTitle: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
    marginTop: 10,
  },
  overdueChip: {
    backgroundColor: '#FFEBEE',
  },
  paymentInfo: {
    marginBottom: 12,
  },
  paymentLabel: {
    color: '#666',
    fontSize: 14,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  paymentValue: {
    color: '#F44336',
    fontSize: 14,
    fontWeight: 'bold',
  },
  phoneRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  subtitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  summaryCard: {
    padding: 16,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryValue: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  updateButton: {
    marginVertical: 8,
  },
  userCard: {
    elevation: 2,
    marginBottom: 12,
  },
  userEmail: {
    color: '#666',
    fontSize: 14,
    marginBottom: 4,
  },
  userHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  userNameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  userPhone: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  vehicleName: {
    color: '#666',
    fontSize: 12,
    marginLeft: 4,
  },
  vehicleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 2,
  },
  viewDetailsButton: {
    marginTop: 8,
  },
});
