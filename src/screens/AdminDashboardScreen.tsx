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
  Chip
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
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingOverdue, setUpdatingOverdue] = useState(false);
  const theme = useTheme();
  const { logout, user } = useAuth();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResult, usersResult, vehiclesResult, allUsersResult] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAllUsers(1, 5),
        vehicleService.getVehicles(),
        adminService.getAllUsers(1, 1000)
      ]);

      console.log('📊 Stats Result:', JSON.stringify(statsResult, null, 2));
      console.log('👥 Users Result:', JSON.stringify(usersResult, null, 2));
      console.log('🚗 Vehicles Result:', JSON.stringify(vehiclesResult, null, 2));
      console.log('👥 All Users Result:', JSON.stringify(allUsersResult, null, 2));

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

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

  const renderUserCard = (user: AdminUser) => (
    <Card key={user.id} style={styles.userCard}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Title style={styles.userName}>{user.name}</Title>
            <Text style={styles.userEmail}>{user.email}</Text>
            <Text style={styles.userPhone}>{user.phone}</Text>
          </View>
          <Chip 
            mode="outlined" 
            style={[
              styles.statusChip,
              { backgroundColor: user.status === 'active' ? '#e8f5e8' : '#fff3e0' }
            ]}
            textStyle={{ 
              color: user.status === 'active' ? '#2e7d32' : '#f57c00' 
            }}
          >
            {user.status || 'active'}
          </Chip>
        </View>
        
        <Divider style={styles.userDivider} />
        
        <View style={styles.userStats}>
          <View style={styles.userStat}>
            <Text style={styles.userStatLabel}>Total Pagamentos</Text>
            <Text style={styles.userStatValue}>{user.total_payments || 0}</Text>
          </View>
          <View style={styles.userStat}>
            <Text style={styles.userStatLabel}>Último Pagamento</Text>
            <Text style={styles.userStatValue}>
              {user.last_payment ? new Date(user.last_payment).toLocaleDateString('pt-BR') : 'N/A'}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

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
        
        {users.map(renderUserCard)}
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
  statusChip: {
    height: 32,
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
});
