import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Button,
  Surface,
  useTheme,
  Divider,
  Chip,
  SegmentedButtons,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminService, DashboardStats, AdminUser } from '../../services/adminService';
import { vehicleService } from '../../services/vehicleService';
import { formatCurrency } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { styles } from './AdminDashboardScreen.styles';

interface AdminDashboardScreenProps {
  navigation: any;
}

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersWithPaymentStatus, setUsersWithPaymentStatus] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [weeklyEvolution, setWeeklyEvolution] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOverdue, setUpdatingOverdue] = useState(false);
  const [notifyingOverdue, setNotifyingOverdue] = useState(false);
  const [notifyingPending, setNotifyingPending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [weeksPeriod, setWeeksPeriod] = useState('4');
  const theme = useTheme();
  const { logout, user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [
        statsResult,
        usersResult,
        vehiclesResult,
        allUsersResult,
        paymentStatusResult,
        paymentSummaryResult,
        weeklyResult,
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllUsers(1, 5),
        vehicleService.getVehicles(),
        adminService.getAllUsers(1, 1000),
        adminService.getUsersWithPaymentStatus(),
        adminService.getPaymentSummary(),
        adminService.getWeeklyPaymentEvolution(parseInt(weeksPeriod)),
      ]);

      console.log('📊 Stats Result:', JSON.stringify(statsResult, null, 2));
      console.log('👥 Users Result:', JSON.stringify(usersResult, null, 2));
      console.log('🚗 Vehicles Result:', JSON.stringify(vehiclesResult, null, 2));
      console.log('👥 All Users Result:', JSON.stringify(allUsersResult, null, 2));
      console.log('💰 Payment Status Result:', JSON.stringify(paymentStatusResult, null, 2));
      console.log('📈 Payment Summary Result:', JSON.stringify(paymentSummaryResult, null, 2));

      // Debug: Check if payment status data is being processed correctly
      if (paymentStatusResult.success && paymentStatusResult.data) {
        console.log('🔍 Payment Status Data Check:');
        paymentStatusResult.data.forEach((user: AdminUser, index: number) => {
          console.log(`User ${index + 1}:`, {
            name: user.name,
            email: user.email,
            payment_status: user.payment_status,
            total_payments: user.total_payments,
            has_payment_status: !!user.payment_status,
          });
        });
      }

      if (weeklyResult.success && weeklyResult.data) {
        console.log('📊 Weekly Evolution Data:', weeklyResult.data);
        setWeeklyEvolution(weeklyResult.data);
      }

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      if (paymentStatusResult.success && paymentStatusResult.data) {
        setUsersWithPaymentStatus(paymentStatusResult.data);
        setFilteredUsers(paymentStatusResult.data);
      }

      if (paymentSummaryResult.success && paymentSummaryResult.data) {
        setPaymentSummary(paymentSummaryResult.data);
      }

      // Reset filter when data is reloaded
      setStatusFilter('all');

      if (usersResult.success && usersResult.data) {
        let allUsers = usersResult.data.users || [];

        // Merge payment status data into recent users
        if (paymentStatusResult.success && paymentStatusResult.data) {
          const paymentStatusMap = new Map(
            paymentStatusResult.data.map((u: AdminUser) => [u.id, u])
          );

          allUsers = allUsers.map((user: AdminUser) => {
            const paymentData = paymentStatusMap.get(user.id);
            return paymentData ? { ...user, ...paymentData } : user;
          });
        }

        // Log para debug - verificar dados dos usuários recentes
        if (allUsers.length > 0) {
          console.log('📊 Dashboard - Recent users sample:', {
            name: allUsers[0].name,
            email: allUsers[0].email,
            license_plate: allUsers[0].license_plate,
            vehicle_name: allUsers[0].vehicle_name,
            total_payments: allUsers[0].total_payments,
            last_payment: allUsers[0].last_payment,
          });
        }

        const regularUsers = allUsers.filter((user: AdminUser) => {
          const isAdminByEmail = user.email?.toLowerCase().includes('admin');
          const isAdminByName =
            user.name?.toLowerCase().includes('administrador') ||
            user.name?.toLowerCase().includes('admin');
          const isAdminByField = user.is_admin === true;

          const isAdmin = isAdminByEmail || isAdminByName || isAdminByField;
          return !isAdmin;
        });
        setUsers(regularUsers.slice(0, 5));
      }

      if (allUsersResult.success && allUsersResult.data) {
        const allUsers = allUsersResult.data.users || [];

        const regularUsersCount = allUsers.filter((user: AdminUser) => {
          const isAdminByEmail = user.email?.toLowerCase().includes('admin');
          const isAdminByName =
            user.name?.toLowerCase().includes('administrador') ||
            user.name?.toLowerCase().includes('admin');
          const isAdminByField = user.is_admin === true;

          const isAdmin = isAdminByEmail || isAdminByName || isAdminByField;
          return !isAdmin;
        }).length;

        setTotalUsers(regularUsersCount);
      }

      // Count active vehicles
      if (vehiclesResult.success && vehiclesResult.data) {
        const activeVehicles = vehiclesResult.data.filter(
          (vehicle: any) => vehicle.status === 'ativo' || vehicle.status === 'active'
        ).length;
        console.log('🚗 Active vehicles count:', activeVehicles);
        setTotalVehicles(activeVehicles);
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleUpdateOverduePayments = async () => {
    setUpdatingOverdue(true);
    try {
      const result = await adminService.updateOverduePayments();

      if (result.success) {
        Alert.alert('Sucesso!', result.message || 'Pagamentos em atraso atualizados', [
          { text: 'OK', onPress: () => loadDashboardData() },
        ]);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao atualizar pagamentos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro interno do servidor');
    } finally {
      setUpdatingOverdue(false);
    }
  };

  const handleNotifyOverdueUsers = async () => {
    Alert.alert(
      'Notificar Usuários',
      'Deseja enviar notificações para todos os usuários com pagamentos vencidos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            setNotifyingOverdue(true);
            try {
              const result = await adminService.notifyOverdueUsers();

              if (result.success) {
                Alert.alert('Sucesso!', result.message || 'Notificações enviadas', [
                  { text: 'OK' },
                ]);
              } else {
                Alert.alert('Erro', result.error || 'Erro ao enviar notificações');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro interno do servidor');
            } finally {
              setNotifyingOverdue(false);
            }
          },
        },
      ]
    );
  };

  const handleNotifyPendingPayments = async () => {
    Alert.alert(
      'Lembrar Pagamentos',
      'Deseja enviar lembretes para usuários com pagamentos próximos do vencimento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            setNotifyingPending(true);
            try {
              const result = await adminService.notifyPendingPayments(3);

              if (result.success) {
                Alert.alert('Sucesso!', result.message || 'Lembretes enviados', [{ text: 'OK' }]);
              } else {
                Alert.alert('Erro', result.error || 'Erro ao enviar lembretes');
              }
            } catch (error) {
              Alert.alert('Erro', 'Erro interno do servidor');
            } finally {
              setNotifyingPending(false);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert('Sair do Sistema', 'Tem certeza que deseja sair do painel administrativo?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Erro ao fazer logout:', error);
          }
        },
      },
    ]);
  };

  const renderStatsCard = (title: string, value: string | number, icon: string, color: string) => (
    <Surface style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statContent}>
        <View style={styles.statHeader}>
          <Ionicons name={icon as any} size={24} color={color} />
          <Text style={styles.statTitle}>{title}</Text>
        </View>
        <Text style={[styles.statValue, { color }]}>
          {title.includes('Receita') ? formatCurrency(Number(value)) : value.toString()}
        </Text>
      </View>
    </Surface>
  );

  const renderEnhancedUserCard = (user: AdminUser, showPaymentStatus = false) => {
    return (
      <TouchableOpacity
        key={user.id}
        activeOpacity={0.7}
        onPress={() => navigation.navigate('UserDetails', { userId: user.id })}
      >
        <Card style={styles.enhancedUserCard}>
          <Card.Content>
            <View style={styles.userHeader}>
              <View style={styles.userMainInfo}>
                <View style={styles.userNameHeader}>
                  <Title style={styles.userName}>{user.name}</Title>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </View>

                <View style={styles.contactInfo}>
                  <View style={styles.contactRow}>
                    <Ionicons name="mail-outline" size={16} color="#666" />
                    <Text style={styles.contactText}>{user.email}</Text>
                  </View>
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={16} color="#666" />
                    <Text style={styles.contactText}>{user.phone || 'N/A'}</Text>
                  </View>
                  {!!user.vehicle_name && (
                    <View style={styles.contactRow}>
                      <Ionicons name="car-outline" size={16} color="#4CAF50" />
                      <Text style={[styles.contactText, { color: '#4CAF50', fontWeight: '500' }]}>
                        {user.vehicle_name}
                      </Text>
                    </View>
                  )}
                  {!!user.license_plate && (
                    <View style={styles.contactRow}>
                      <Ionicons name="card-outline" size={16} color={Colors.primary} />
                      <Text
                        style={[
                          styles.contactText,
                          { color: Colors.primary, fontWeight: '600', letterSpacing: 1 },
                        ]}
                      >
                        {user.license_plate}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            <Divider style={styles.modernDivider} />

            {/* Enhanced Payment Information - Always visible */}
            <View style={styles.enhancedPaymentSection}>
              <View style={styles.paymentRow}>
                <View style={styles.paymentInfoItem}>
                  <Ionicons name="wallet-outline" size={20} color="#4CAF50" />
                  <View style={styles.paymentInfoText}>
                    <Text style={styles.paymentInfoLabel}>Total de Pagamentos</Text>
                    <Text style={styles.paymentInfoValue}>{user.total_payments || 0}</Text>
                  </View>
                </View>
                <View style={styles.paymentInfoItem}>
                  <Ionicons name="calendar-outline" size={20} color="#2196F3" />
                  <View style={styles.paymentInfoText}>
                    <Text style={styles.paymentInfoLabel}>Último Pagamento</Text>
                    <Text style={styles.paymentInfoValue}>
                      {user.last_payment
                        ? new Date(user.last_payment).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                          })
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const filterUsersByStatus = (status: string) => {
    setStatusFilter(status);
    if (status === 'all') {
      setFilteredUsers(usersWithPaymentStatus);
    } else {
      const filtered = usersWithPaymentStatus.filter(user => user.payment_status === status);
      setFilteredUsers(filtered);
    }
  };

  const renderQuickStats = () => {
    if (!paymentSummary) return null;

    const stats = [
      {
        label: 'Em Dia',
        value: paymentSummary.up_to_date_users || 0,
        color: '#4CAF50',
        icon: 'checkmark-circle',
        filter: 'up_to_date',
      },
      {
        label: 'Vencidos',
        value: paymentSummary.overdue_users || 0,
        color: '#F44336',
        icon: 'warning',
        filter: 'overdue',
      },
      {
        label: 'Sem Pagamentos',
        value: usersWithPaymentStatus.filter(u => u.payment_status === 'no_payments').length,
        color: '#FF9800',
        icon: 'alert-circle',
        filter: 'no_payments',
      },
    ];

    return (
      <Surface style={styles.quickStatsCard}>
        <Title style={styles.sectionTitle}>Status dos Usuários</Title>
        <View style={styles.quickStatsGrid}>
          {stats.map((stat, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickStatItem,
                { borderColor: stat.color },
                statusFilter === stat.filter && { backgroundColor: stat.color + '15' },
              ]}
              onPress={() => filterUsersByStatus(stat.filter)}
            >
              <Ionicons name={stat.icon as any} size={24} color={stat.color} />
              <Text style={[styles.quickStatValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.quickStatLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Surface>
    );
  };

  const renderPaymentStatusUserCard = (user: AdminUser) => {
    const getPaymentStatusColor = (status?: string) => {
      switch (status) {
        case 'up_to_date':
          return '#4CAF50';
        case 'overdue':
          return '#F44336';
        case 'no_payments':
          return '#FF9800';
        default:
          return '#666';
      }
    };

    const getPaymentStatusLabel = (status?: string) => {
      switch (status) {
        case 'up_to_date':
          return 'Em Dia';
        case 'overdue':
          return 'Vencido';
        case 'no_payments':
          return 'Sem Pagamentos';
        default:
          return 'Indefinido';
      }
    };

    return (
      <Card key={user.id} style={styles.userCard}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <Title style={styles.userName}>{user.name}</Title>
              <Text style={styles.userEmail}>{user.email}</Text>
              {!!user.vehicle_name && (
                <Text style={styles.vehicleName}>Veículo: {user.vehicle_name}</Text>
              )}
            </View>
            <Chip
              mode="flat"
              style={[
                styles.paymentStatusChip,
                { backgroundColor: getPaymentStatusColor(user.payment_status) + '20' },
              ]}
              textStyle={{
                color: getPaymentStatusColor(user.payment_status),
                fontWeight: 'bold',
              }}
            >
              {getPaymentStatusLabel(user.payment_status)}
            </Chip>
          </View>

          <Divider style={styles.userDivider} />

          <View style={styles.userStats}>
            {user.payment_status === 'overdue' && (
              <>
                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Dias em Atraso</Text>
                  <Text style={[styles.userStatValue, { color: '#F44336' }]}>
                    {user.days_overdue || 0} dias
                  </Text>
                </View>
                <View style={styles.userStat}>
                  <Text style={styles.userStatLabel}>Valor Pendente</Text>
                  <Text style={[styles.userStatValue, { color: '#F44336' }]}>
                    {formatCurrency(user.pending_amount || 0)}
                  </Text>
                </View>
              </>
            )}
            {user.payment_status === 'up_to_date' && (
              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>Último Pagamento</Text>
                <Text style={[styles.userStatValue, { color: '#4CAF50' }]}>
                  {user.last_payment
                    ? new Date(user.last_payment).toLocaleDateString('pt-BR')
                    : 'N/A'}
                </Text>
              </View>
            )}
            {user.payment_status === 'no_payments' && (
              <View style={styles.userStat}>
                <Text style={styles.userStatLabel}>Status</Text>
                <Text style={[styles.userStatValue, { color: '#FF9800' }]}>
                  Nenhum pagamento registrado
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Title style={styles.headerTitle}>Dashboard Administrativo</Title>
            <Text style={styles.headerSubtitle}>Visão geral do sistema</Text>
            {user && <Text style={styles.welcomeText}>Olá, {user.name}</Text>}
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </Surface>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatsCard(
          'Aguardando Pagamento',
          stats?.pending_payments ?? 0,
          'time-outline',
          '#FFC107'
        )}
        {renderStatsCard('Vencidos', stats?.overdue_payments ?? 0, 'warning-outline', '#F44336')}
        {renderStatsCard(
          'Pagos',
          (stats?.total_payments ?? 0) -
            (stats?.pending_payments ?? 0) -
            (stats?.overdue_payments ?? 0),
          'checkmark-circle-outline',
          '#4CAF50'
        )}
      </View>

      {/* Weekly Payment Evolution */}
      {weeklyEvolution && weeklyEvolution.weeks && (
        <Surface style={styles.weeklyEvolutionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="trending-up" size={24} color={Colors.primary} />
            <Title style={styles.sectionTitleWithIcon}>Evolução Semanal de Pagamentos</Title>
          </View>

          <View style={styles.weeksPeriodSelector}>
            <SegmentedButtons
              value={weeksPeriod}
              onValueChange={value => {
                setWeeksPeriod(value);
                setRefreshing(true);
                loadDashboardData();
              }}
              buttons={[
                { value: '4', label: '4 Semanas' },
                { value: '8', label: '8 Semanas' },
                { value: '12', label: '12 Semanas' },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          <View style={styles.weeklyCardsContainer}>
            {weeklyEvolution.weeks.map((week: any, index: number) => (
              <Card key={index} style={styles.weekCard}>
                <Card.Content>
                  <View style={styles.weekHeader}>
                    <Text style={styles.weekNumber}>Semana {week.week_number}</Text>
                    <Chip mode="outlined" compact style={styles.weekDateChip}>
                      {new Date(week.week_start).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(week.week_end).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                      })}
                    </Chip>
                  </View>

                  <Divider style={styles.weekDivider} />

                  <View style={styles.weekStatsGrid}>
                    <View style={styles.weekStatItem}>
                      <Ionicons name="receipt-outline" size={20} color="#2196F3" />
                      <Text style={styles.weekStatValue}>{week.total_payments || 0}</Text>
                      <Text style={styles.weekStatLabel}>Total</Text>
                    </View>

                    <View style={styles.weekStatItem}>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                      <Text style={styles.weekStatValue}>{week.completed_payments || 0}</Text>
                      <Text style={styles.weekStatLabel}>Pagos</Text>
                    </View>

                    <View style={styles.weekStatItem}>
                      <Ionicons name="time-outline" size={20} color="#FF9800" />
                      <Text style={styles.weekStatValue}>{week.pending_payments || 0}</Text>
                      <Text style={styles.weekStatLabel}>Pendentes</Text>
                    </View>
                  </View>

                  <View style={styles.weekAmountContainer}>
                    <Text style={styles.weekAmountLabel}>Valor Total:</Text>
                    <Text style={styles.weekAmountValue}>
                      {formatCurrency(week.total_amount || 0)}
                    </Text>
                  </View>

                  {/* Lista de Usuários que Pagaram */}
                  {week.paid_users && week.paid_users.length > 0 && (
                    <>
                      <Divider style={styles.weekDivider} />
                      <View style={styles.usersSection}>
                        <View style={styles.usersSectionHeader}>
                          <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                          <Text style={styles.usersSectionTitle}>
                            Pagaram ({week.paid_users.length})
                          </Text>
                        </View>
                        {week.paid_users.map((user: any, userIndex: number) => (
                          <View key={userIndex} style={styles.userItem}>
                            <View style={styles.userItemLeft}>
                              <Ionicons name="person-circle-outline" size={18} color="#4CAF50" />
                              <View style={styles.userItemInfo}>
                                <Text style={styles.userItemName}>{user.user_name || 'N/A'}</Text>
                                <View style={styles.vehicleInfo}>
                                  <Ionicons name="car-outline" size={14} color="#666" />
                                  <Text style={styles.vehicleText}>
                                    {user.vehicle_name || 'N/A'}
                                  </Text>
                                  <Text style={styles.licensePlate}>
                                    {user.license_plate || 'N/A'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.userItemRight}>
                              <Text style={styles.paidAmount}>
                                {formatCurrency(user.amount || 0)}
                              </Text>
                              <Text style={styles.paymentDate}>
                                {new Date(user.payment_date).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                })}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </>
                  )}

                  {/* Lista de Usuários que NÃO Pagaram */}
                  {week.unpaid_users && week.unpaid_users.length > 0 && (
                    <>
                      <Divider style={styles.weekDivider} />
                      <View style={styles.usersSection}>
                        <View style={styles.usersSectionHeader}>
                          <Ionicons name="alert-circle" size={20} color="#F44336" />
                          <Text style={[styles.usersSectionTitle, { color: '#F44336' }]}>
                            Não Pagaram ({week.unpaid_users.length})
                          </Text>
                        </View>
                        {week.unpaid_users.map((user: any, userIndex: number) => (
                          <View key={userIndex} style={styles.userItem}>
                            <View style={styles.userItemLeft}>
                              <Ionicons name="person-circle-outline" size={18} color="#F44336" />
                              <View style={styles.userItemInfo}>
                                <Text style={styles.userItemName}>{user.user_name || 'N/A'}</Text>
                                <View style={styles.vehicleInfo}>
                                  <Ionicons name="car-outline" size={14} color="#666" />
                                  <Text style={styles.vehicleText}>
                                    {user.vehicle_name || 'N/A'}
                                  </Text>
                                  <Text style={styles.licensePlate}>
                                    {user.license_plate || 'N/A'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View style={styles.userItemRight}>
                              <Text style={styles.unpaidAmount}>
                                {formatCurrency(user.expected_amount || 0)}
                              </Text>
                              <Text style={styles.overdueDaysLabel}>
                                {user.days_overdue || 0} dias
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </>
                  )}
                </Card.Content>
              </Card>
            ))}
          </View>
        </Surface>
      )}

      {/* Admin Actions */}
      <Surface style={styles.actionsCard}>
        <Title style={styles.sectionTitle}>Ações Administrativas</Title>

        <Button
          mode="contained"
          onPress={handleUpdateOverduePayments}
          disabled={updatingOverdue}
          style={styles.actionButton}
          icon="refresh"
        >
          {updatingOverdue ? 'Atualizando...' : 'Atualizar Pagamentos Vencidos'}
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('UsersList')}
          style={styles.actionButton}
          icon="people-outline"
        >
          Gerenciar Usuários
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('UpdateOverduePayments')}
          style={styles.actionButton}
          icon="cash-outline"
        >
          Atualizar Pagamentos Vencidos
        </Button>

        {/* NOTIFICAÇÕES PUSH - DESABILITADAS TEMPORARIAMENTE
        Para reativar:
        1. Descomentar os botões abaixo
        2. Alterar EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS para "true" em app.json
        3. Adicionar plugin expo-notifications no app.json
        4. Fazer rebuild: npx expo run:ios / npx expo run:android
        
        <Button
          mode="contained"
          onPress={handleNotifyOverdueUsers}
          disabled={notifyingOverdue}
          style={[styles.actionButton, { backgroundColor: '#F44336' }]}
          icon="notifications-outline"
          buttonColor="#F44336"
        >
          {notifyingOverdue ? 'Enviando...' : 'Notificar Pagamentos Vencidos'}
        </Button>

        <Button
          mode="contained"
          onPress={handleNotifyPendingPayments}
          disabled={notifyingPending}
          style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
          icon="alarm-outline"
          buttonColor="#FF9800"
        >
          {notifyingPending ? 'Enviando...' : 'Lembrar Pagamentos Pendentes'}
        </Button>
        */}
      </Surface>

      {/* Recent Users */}
      <Surface style={styles.usersSection}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Usuários Recentes</Title>
          <TouchableOpacity onPress={() => navigation.navigate('UsersList')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {users.map(user => renderEnhancedUserCard(user, false))}
      </Surface>
    </ScrollView>
  );
}
