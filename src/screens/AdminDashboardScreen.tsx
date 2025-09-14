import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
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
  SegmentedButtons
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminService, DashboardStats, AdminUser } from '../services/adminService';
import { vehicleService } from '../services/vehicleService';
import { formatCurrency } from '../utils/dateUtils';
import { useAuth } from '../contexts/AuthContext';

interface AdminDashboardScreenProps {
  navigation: any;
}

export default function AdminDashboardScreen({ navigation }: AdminDashboardScreenProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersWithPaymentStatus, setUsersWithPaymentStatus] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOverdue, setUpdatingOverdue] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const theme = useTheme();
  const { logout, user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResult, usersResult, vehiclesResult, allUsersResult, paymentStatusResult, paymentSummaryResult] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllUsers(1, 5),
        vehicleService.getVehicles(),
        adminService.getAllUsers(1, 1000),
        adminService.getUsersWithPaymentStatus(),
        adminService.getPaymentSummary()
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
            has_payment_status: !!user.payment_status
          });
        });
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
        const allUsers = usersResult.data.users || [];
        const regularUsers = allUsers.filter((user: AdminUser) => {
          const isAdminByEmail = user.email?.includes('admin');
          const isAdminByName = user.name?.toLowerCase().includes('administrador');
          const isAdminByField = user.is_admin === true;
          
          const isAdmin = isAdminByEmail || isAdminByName || isAdminByField;
          return !isAdmin;
        });
        setUsers(regularUsers.slice(0, 5));
      }

      if (allUsersResult.success && allUsersResult.data) {
        const allUsers = allUsersResult.data.users || [];
        
        const regularUsersCount = allUsers.filter((user: AdminUser) => {
          const isAdminByEmail = user.email?.includes('admin');
          const isAdminByName = user.name?.toLowerCase().includes('administrador');
          const isAdminByField = user.is_admin === true;
          
          const isAdmin = isAdminByEmail || isAdminByName || isAdminByField;
          return !isAdmin;
        }).length;
    
        setTotalUsers(regularUsersCount);
      }

      // Count active vehicles
      if (vehiclesResult.success && vehiclesResult.data) {
        const activeVehicles = vehiclesResult.data.filter((vehicle: any) => 
          vehicle.status === 'ativo' || vehicle.status === 'active'
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
        Alert.alert(
          'Sucesso!',
          result.message || 'Pagamentos em atraso atualizados',
          [{ text: 'OK', onPress: () => loadDashboardData() }]
        );
      } else {
        Alert.alert('Erro', result.error || 'Erro ao atualizar pagamentos');
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro interno do servidor');
    } finally {
      setUpdatingOverdue(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair do Sistema',
      'Tem certeza que deseja sair do painel administrativo?',
      [
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
          }
        }
      ]
    );
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
    // Debug: Log user data to see what we're receiving
    if (showPaymentStatus) {
      console.log('🔍 renderEnhancedUserCard - User:', {
        id: user.id,
        name: user.name,
        payment_status: user.payment_status,
        status: user.status,
        showPaymentStatus
      });
    }

    const getStatusColor = (status?: string) => {
      if (showPaymentStatus) {
        // If payment_status is not defined, treat as 'no_payments'
        const actualStatus = status || 'no_payments';
        switch (actualStatus) {
          case 'up_to_date': return { bg: '#E8F5E8', text: '#2E7D32', label: 'Em Dia' };
          case 'overdue': return { bg: '#FFEBEE', text: '#D32F2F', label: 'Vencido' };
          case 'no_payments': return { bg: '#FFF3E0', text: '#F57C00', label: 'Sem Pagamentos' };
          default: return { bg: '#FFF3E0', text: '#F57C00', label: 'Sem Pagamentos' };
        }
      } else {
        return user.status === 'active' 
          ? { bg: '#E8F5E8', text: '#2E7D32', label: 'Ativo' }
          : { bg: '#FFF3E0', text: '#F57C00', label: 'Inativo' };
      }
    };

    const statusInfo = getStatusColor(showPaymentStatus ? user.payment_status : user.status);

    return (
      <Card key={user.id} style={styles.enhancedUserCard}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.userMainInfo}>
              <Title style={styles.userName}>{user.name}</Title>
              
              <View style={styles.contactInfo}>
                <View style={styles.contactRow}>
                  <Ionicons name="mail-outline" size={16} color="#666" />
                  <Text style={styles.contactText}>{user.email}</Text>
                </View>
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={16} color="#666" />
                  <Text style={styles.contactText}>{user.phone || 'N/A'}</Text>
                </View>
                {user.vehicle_name && (
                  <View style={styles.contactRow}>
                    <Ionicons name="car-outline" size={16} color="#4CAF50" />
                    <Text style={[styles.contactText, { color: '#4CAF50', fontWeight: '500' }]}>
                      {user.vehicle_name}
                    </Text>
                  </View>
                )}
              </View>
              
              {/* Status chip moved to bottom of user info */}
              <View style={styles.statusChipContainer}>
                <Chip 
                  mode="flat" 
                  style={[
                    styles.modernStatusChip,
                    { backgroundColor: statusInfo.bg }
                  ]}
                  textStyle={{ 
                    color: statusInfo.text,
                    fontWeight: '600',
                    fontSize: 12
                  }}
                >
                  {statusInfo.label}
                </Chip>
              </View>
            </View>
          </View>
          
          <Divider style={styles.modernDivider} />
          
          {showPaymentStatus && user.payment_status ? (
            <View style={styles.paymentStatusInfo}>
              {user.payment_status === 'overdue' && (
                <View style={styles.overdueInfo}>
                  <View style={styles.overdueItem}>
                    <Ionicons name="time-outline" size={18} color="#D32F2F" />
                    <Text style={styles.overdueLabel}>Dias em Atraso</Text>
                    <Text style={styles.overdueValue}>{user.days_overdue || 0}</Text>
                  </View>
                  <View style={styles.overdueItem}>
                    <Ionicons name="cash-outline" size={18} color="#D32F2F" />
                    <Text style={styles.overdueLabel}>Valor Pendente</Text>
                    <Text style={styles.overdueValue}>
                      {formatCurrency(user.pending_amount || 0)}
                    </Text>
                  </View>
                </View>
              )}
              
              {user.payment_status === 'up_to_date' && user.last_payment && (
                <View style={styles.upToDateInfo}>
                  <Ionicons name="checkmark-circle-outline" size={18} color="#4CAF50" />
                  <Text style={styles.upToDateLabel}>Último Pagamento</Text>
                  <Text style={styles.upToDateValue}>
                    {new Date(user.last_payment).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
              )}
              
              {user.payment_status === 'no_payments' && (
                <View style={styles.noPaymentsInfo}>
                  <Ionicons name="alert-circle-outline" size={18} color="#FF9800" />
                  <Text style={styles.noPaymentsText}>Nenhum pagamento registrado</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.basicPaymentInfo}>
              <View style={styles.paymentStat}>
                <Text style={styles.paymentStatLabel}>Total de Pagamentos</Text>
                <Text style={styles.paymentStatValue}>{user.total_payments || 0}</Text>
              </View>
              <View style={styles.paymentStat}>
                <Text style={styles.paymentStatLabel}>Último Pagamento</Text>
                <Text style={styles.paymentStatValue}>
                  {user.last_payment ? new Date(user.last_payment).toLocaleDateString('pt-BR') : 'N/A'}
                </Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>
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
        filter: 'up_to_date'
      },
      {
        label: 'Vencidos', 
        value: paymentSummary.overdue_users || 0,
        color: '#F44336',
        icon: 'warning',
        filter: 'overdue'
      },
      {
        label: 'Sem Pagamentos',
        value: usersWithPaymentStatus.filter(u => u.payment_status === 'no_payments').length,
        color: '#FF9800',
        icon: 'alert-circle',
        filter: 'no_payments'
      }
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
                statusFilter === stat.filter && { backgroundColor: stat.color + '15' }
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
        case 'up_to_date': return '#4CAF50';
        case 'overdue': return '#F44336';
        case 'no_payments': return '#FF9800';
        default: return '#666';
      }
    };

    const getPaymentStatusLabel = (status?: string) => {
      switch (status) {
        case 'up_to_date': return 'Em Dia';
        case 'overdue': return 'Vencido';
        case 'no_payments': return 'Sem Pagamentos';
        default: return 'Indefinido';
      }
    };

    return (
      <Card key={user.id} style={styles.userCard}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <Title style={styles.userName}>{user.name}</Title>
              <Text style={styles.userEmail}>{user.email}</Text>
              {user.vehicle_name && (
                <Text style={styles.vehicleName}>Veículo: {user.vehicle_name}</Text>
              )}
            </View>
            <Chip 
              mode="flat" 
              style={[
                styles.paymentStatusChip,
                { backgroundColor: getPaymentStatusColor(user.payment_status) + '20' }
              ]}
              textStyle={{ 
                color: getPaymentStatusColor(user.payment_status),
                fontWeight: 'bold'
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
                  {user.last_payment ? new Date(user.last_payment).toLocaleDateString('pt-BR') : 'N/A'}
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <Surface style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Title style={styles.headerTitle}>Dashboard Administrativo</Title>
            <Text style={styles.headerSubtitle}>Visão geral do sistema</Text>
            {user && (
              <Text style={styles.welcomeText}>Olá, {user.name}</Text>
            )}
          </View>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={24} color="#F44336" />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>
      </Surface>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {renderStatsCard('Total Usuários', totalUsers || stats?.total_users || 0, 'people-outline', '#2196F3')}
        {renderStatsCard('Total Pagamentos', stats?.total_payments ?? 0, 'card-outline', '#4CAF50')}
        {renderStatsCard('Receita Total', stats?.total_revenue ?? 0, 'cash-outline', '#FF9800')}
        {renderStatsCard('Pagamentos Pendentes', stats?.pending_payments ?? 0, 'time-outline', '#FFC107')}
        {renderStatsCard('Pagamentos Vencidos', stats?.overdue_payments ?? 0, 'warning-outline', '#F44336')}
        {renderStatsCard('Veículos Ativos', totalVehicles || stats?.active_vehicles || 0, 'car-outline', '#9C27B0')}
      </View>

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
          onPress={() => Alert.alert('Em Desenvolvimento', 'Funcionalidade em desenvolvimento')}
          style={styles.actionButton}
          icon="receipt-outline"
        >
          Gerenciar Pagamentos
        </Button>
      </Surface>

      {/* Payment Status Summary */}
      {paymentSummary && (
        <Surface style={styles.summaryCard}>
          <Title style={styles.sectionTitle}>Resumo de Pagamentos</Title>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{paymentSummary.up_to_date_users || 0}</Text>
              <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>Em Dia</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{paymentSummary.overdue_users || 0}</Text>
              <Text style={[styles.summaryLabel, { color: '#F44336' }]}>Vencidos</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryValue}>{formatCurrency(paymentSummary.total_revenue || 0)}</Text>
              <Text style={[styles.summaryLabel, { color: '#FF9800' }]}>Receita Total</Text>
            </View>
          </View>
        </Surface>
      )}

      {/* Quick Stats */}
      {renderQuickStats()}

      {/* Users with Payment Status */}
      {usersWithPaymentStatus.length > 0 && (
        <Surface style={styles.usersSection}>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Status de Pagamentos dos Usuários</Title>
          </View>
          
          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            <SegmentedButtons
              value={statusFilter}
              onValueChange={filterUsersByStatus}
              buttons={[
                { value: 'all', label: 'Todos' },
                { value: 'up_to_date', label: 'Em Dia' },
                { value: 'overdue', label: 'Vencidos' },
                { value: 'no_payments', label: 'Sem Pag.' }
              ]}
              style={styles.segmentedButtons}
            />
          </View>
          
          {filteredUsers.length > 0 ? (
            <>
              <Text style={styles.resultCount}>
                {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} 
                {statusFilter !== 'all' && `com status "${statusFilter === 'up_to_date' ? 'Em Dia' : statusFilter === 'overdue' ? 'Vencidos' : 'Sem Pagamentos'}"`}
              </Text>
              {filteredUsers.slice(0, 10).map(user => renderEnhancedUserCard(user, true))}
              
              {/* Ver todos moved to bottom */}
              <View style={styles.seeAllContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('UsersList')}>
                  <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
                    Ver todos
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>
                Nenhum usuário encontrado {statusFilter !== 'all' && 'com este status'}
              </Text>
            </View>
          )}
        </Surface>
      )}

      {/* Recent Users */}
      <Surface style={styles.usersSection}>
        <View style={styles.sectionHeader}>
          <Title style={styles.sectionTitle}>Usuários Recentes</Title>
          <TouchableOpacity onPress={() => navigation.navigate('UsersList')}>
            <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>
        
        {users.map(user => renderEnhancedUserCard(user, false))}
      </Surface>

      {/* Admin Info */}
      <Surface style={styles.infoCard}>
        <Title style={styles.sectionTitle}>Informações do Sistema</Title>
        <View style={styles.infoItem}>
          <Ionicons name="server-outline" size={20} color="#666" />
          <Text style={styles.infoText}>API: Vehicles Go</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
          <Text style={styles.infoText}>Admin: admin@vehicles.com</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="card-outline" size={20} color="#666" />
          <Text style={styles.infoText}>Pagamento: PIX via Abacate Pay</Text>
        </View>
      </Surface>
    </ScrollView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: '#FF8C00',
    marginTop: 8,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  logoutText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  statsGrid: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statCard: {
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    backgroundColor: 'white',
    borderLeftWidth: 4,
    borderRadius: 8,
  },
  statContent: {
    flexDirection: 'column',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionsCard: {
    margin: 16,
    padding: 20,
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  actionButton: {
    marginBottom: 12,
  },
  usersSection: {
    margin: 16,
    padding: 20,
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  userCard: {
    marginBottom: 12,
    elevation: 1,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  vehicleName: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginTop: 2,
  },
  statusChip: {
    height: 32,
  },
  paymentStatusChip: {
    height: 32,
    borderRadius: 16,
  },
  userDivider: {
    marginVertical: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStat: {
    alignItems: 'center',
  },
  userStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  userStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  infoCard: {
    margin: 16,
    padding: 20,
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  summaryCard: {
    margin: 16,
    padding: 20,
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  enhancedUserCard: {
    marginBottom: 16,
    elevation: 3,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  userMainInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modernStatusChip: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  contactInfo: {
    gap: 8,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  modernDivider: {
    marginVertical: 16,
    backgroundColor: '#E0E0E0',
  },
  paymentStatusInfo: {
    marginTop: 8,
  },
  overdueInfo: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  overdueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  overdueLabel: {
    fontSize: 14,
    color: '#D32F2F',
    flex: 1,
    fontWeight: '500',
  },
  overdueValue: {
    fontSize: 14,
    color: '#D32F2F',
    fontWeight: 'bold',
  },
  upToDateInfo: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  upToDateLabel: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  upToDateValue: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginLeft: 'auto',
  },
  noPaymentsInfo: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noPaymentsText: {
    fontSize: 14,
    color: '#F57C00',
    fontWeight: '500',
  },
  basicPaymentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 8,
  },
  paymentStat: {
    alignItems: 'center',
    flex: 1,
  },
  paymentStatLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
  },
  paymentStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  quickStatsCard: {
    margin: 16,
    padding: 20,
    elevation: 2,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  quickStatsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'white',
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
    color: '#666',
  },
  filterContainer: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginVertical: 8,
  },
  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  statusChipContainer: {
    alignItems: 'flex-start',
    marginTop: 12,
  },
  seeAllContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
});
