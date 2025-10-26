import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Button,
  IconButton,
  Surface,
  useTheme,
  Divider,
  Chip,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminService, DashboardStats, AdminUser } from '../../services/adminService';
import { vehicleService } from '../../services/vehicleService';
import { formatCurrency } from '../../utils/dateUtils';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/colors';
import { styles } from './AdminDashboardScreen.styles';
import {
  renderQuickStats as renderQuickStatsUtil,
  renderPaymentStatusUserCard as renderPaymentStatusUserCardUtil,
  renderStatsCard as renderStatsCardUtil,
  createFilterUsersByStatus,
} from './AdminDashboardScreen.utils';

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
  const [notifyingOverdue, setNotifyingOverdue] = useState(false);
  const [notifyingPending, setNotifyingPending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0); // Índice da semana sendo exibida (0-3)
  const theme = useTheme();
  const { logout, user } = useAuth();

  // Função para gerar as 4 semanas do mês baseado no mês selecionado
  const generateMonthWeeks = (year: number, month: number) => {
    const weeks = [];
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Dividir o mês em semanas de 7 dias
    // Semana 1: dias 1-7
    // Semana 2: dias 8-14
    // Semana 3: dias 15-21
    // Semana 4: dias 22-fim do mês
    const weekRanges = [
      { start: 1, end: 7 },
      { start: 8, end: 14 },
      { start: 15, end: 21 },
      { start: 22, end: daysInMonth }, // Última semana vai até o fim do mês
    ];
    
    for (let i = 0; i < 4; i++) {
      const range = weekRanges[i];
      const weekStart = new Date(year, month, range.start);
      const weekEnd = new Date(year, month, Math.min(range.end, daysInMonth));
      
      weeks.push({
        week_number: i + 1,
        week_start: weekStart.toISOString().split('T')[0],
        week_end: weekEnd.toISOString().split('T')[0],
        total_payments: 0,
        completed_payments: 0,
        pending_payments: 0,
        total_amount: 0,
        paid_users: [],
        unpaid_users: [],
        is_placeholder: true, // Marca como placeholder
      });
    }
    
    console.log('📅 [generateMonthWeeks] Semanas geradas:', weeks.map(w => `Semana ${w.week_number}: ${w.week_start} - ${w.week_end}`));
    
    return weeks;
  };

  // Função para mesclar semanas geradas com dados do backend
  const mergeWeeksWithData = (generatedWeeks: any[], backendWeeks: any[]) => {
    if (!backendWeeks || backendWeeks.length === 0) {
      console.log('📅 [Merge] Sem dados do backend, usando apenas placeholders');
      return generatedWeeks;
    }
    
    console.log('📅 [Merge] Mesclando semanas:');
    console.log('  - Geradas:', generatedWeeks.length);
    console.log('  - Backend:', backendWeeks.length);
    
    // Mesclar considerando sobreposição de períodos
    return generatedWeeks.map((genWeek: any, index: number) => {
      const genStart = new Date(genWeek.week_start);
      const genEnd = new Date(genWeek.week_end);
      
      // Procurar semana do backend que tenha sobreposição com a semana gerada
      const backendWeek = backendWeeks.find((bWeek: any) => {
        const bStart = new Date(bWeek.week_start);
        const bEnd = new Date(bWeek.week_end);
        
        // Verificar se há qualquer sobreposição entre os períodos
        const hasOverlap = 
          (genStart >= bStart && genStart <= bEnd) || // genStart está dentro do período backend
          (genEnd >= bStart && genEnd <= bEnd) ||     // genEnd está dentro do período backend
          (bStart >= genStart && bStart <= genEnd) || // bStart está dentro do período gerado
          (bEnd >= genStart && bEnd <= genEnd);       // bEnd está dentro do período gerado
        
        return hasOverlap;
      });
      
      if (backendWeek) {
        console.log(`  ✅ Semana ${index + 1}: Dados encontrados (${backendWeek.total_payments} pagamentos)`);
        return { ...backendWeek, is_placeholder: false };
      }
      
      console.log(`  📭 Semana ${index + 1}: Sem dados (placeholder)`);
      return genWeek;
    });
  };

  // Função para determinar qual é a semana atual do mês
  const getCurrentWeekIndex = (weeks: any[]) => {
    if (!weeks || weeks.length === 0) return 0;
    
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Encontrar a semana que contém hoje
    const currentWeekIdx = weeks.findIndex((week: any) => {
      const start = new Date(week.week_start);
      const end = new Date(week.week_end);
      const current = new Date(todayStr);
      return current >= start && current <= end;
    });
    
    return currentWeekIdx >= 0 ? currentWeekIdx : 0;
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth, selectedYear]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Debug: Verificar autenticação
      console.log('🔐 [Dashboard] Current user:', JSON.stringify(user, null, 2));
      console.log('🔐 [Dashboard] Is admin?:', user?.is_admin);
      
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const token = await AsyncStorage.getItem('AUTH_TOKEN');
      const storedUser = await AsyncStorage.getItem('USER_DATA');
      
      console.log('🔐 [Dashboard] Token exists?:', !!token);
      console.log('🔐 [Dashboard] Token length:', token?.length || 0);
      console.log('🔐 [Dashboard] Stored user:', storedUser ? JSON.parse(storedUser) : null);
      
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
        adminService.getWeeklyPaymentEvolution(selectedMonth + 1, selectedYear), // Enviar mês (1-12) e ano
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

      // Processar dados semanais de forma inteligente
      // Sempre gerar 4 semanas e mesclar com dados do backend
      const generatedWeeks = generateMonthWeeks(selectedYear, selectedMonth);
      console.log('📅 Semanas geradas para o mês:', generatedWeeks);
      
      let finalWeeks = generatedWeeks;
      
      if (weeklyResult.success && weeklyResult.data && weeklyResult.data.weeks) {
        console.log('📊 Dados do backend:', weeklyResult.data.weeks);
        finalWeeks = mergeWeeksWithData(generatedWeeks, weeklyResult.data.weeks);
        console.log('✅ Semanas mescladas:', finalWeeks);
      }
      
      // Setar dados com as 4 semanas (com ou sem dados)
      setWeeklyEvolution({ weeks: finalWeeks });
      
      // Definir automaticamente a semana atual
      const currentIdx = getCurrentWeekIndex(finalWeeks);
      setSelectedWeekIndex(currentIdx);
      console.log(`📅 Semana atual detectada: Semana ${currentIdx + 1}`);

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

        // Se getAllUsers retornou vazio mas payment status tem dados, usar os primeiros 5
        if (allUsers.length === 0 && paymentStatusResult.success && paymentStatusResult.data && paymentStatusResult.data.length > 0) {
          console.log('📋 [Dashboard] Using payment status data for recent users');
          allUsers = paymentStatusResult.data.slice(0, 5);
        }
        // Caso contrário, merge payment status data com users
        else if (paymentStatusResult.success && paymentStatusResult.data && allUsers.length > 0) {
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
      if (vehiclesResult.success && vehiclesResult.data && vehiclesResult.data.vehicles) {
        const activeVehicles = vehiclesResult.data.vehicles.filter(
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

  const renderStatsCard = (label: string, value: number, icon: string, color: string) =>
    renderStatsCardUtil(label, value, icon, color, styles);

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

  // Usar função do utils
  const filterUsersByStatus = createFilterUsersByStatus(
    usersWithPaymentStatus,
    setStatusFilter,
    setFilteredUsers
  );

  // Usar função do utils
  const renderQuickStats = () => 
    renderQuickStatsUtil(
      paymentSummary,
      usersWithPaymentStatus,
      statusFilter,
      filterUsersByStatus,
      styles
    );

  // Usar função do utils
  const renderPaymentStatusUserCard = (user: AdminUser) =>
    renderPaymentStatusUserCardUtil(user, navigation, styles);

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
      {weeklyEvolution && (
        <Surface style={styles.weeklyEvolutionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="trending-up" size={24} color={Colors.primary} />
            <Title style={styles.sectionTitleWithIcon}>Evolução Semanal de Pagamentos</Title>
          </View>

          <View style={styles.weeksPeriodSelector}>
            {/* Month Selector */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' }}>
              {/* Botão Mês Anterior */}
              <IconButton
                icon="chevron-left"
                mode="outlined"
                onPress={() => {
                  if (selectedMonth === 0) {
                    setSelectedMonth(11);
                    setSelectedYear(selectedYear - 1);
                  } else {
                    setSelectedMonth(selectedMonth - 1);
                  }
                  setSelectedWeekIndex(0); // Resetar para primeira semana do mês
                }}
                size={24}
              />
              
              {/* Mês Atual */}
              <Button
                mode="contained"
                style={{ flex: 1 }}
                labelStyle={{ fontSize: 14, fontWeight: '600' }}
              >
                {new Date(selectedYear, selectedMonth).toLocaleDateString('pt-BR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Button>
              
              {/* Botão Próximo Mês - SEMPRE HABILITADO */}
              <IconButton
                icon="chevron-right"
                mode="outlined"
                onPress={() => {
                  if (selectedMonth === 11) {
                    setSelectedMonth(0);
                    setSelectedYear(selectedYear + 1);
                  } else {
                    setSelectedMonth(selectedMonth + 1);
                  }
                  setSelectedWeekIndex(0); // Resetar para primeira semana do mês
                }}
                size={24}
              />
            </View>
            <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 8 }}>
              Navegue para qualquer mês • Meses futuros mostrarão previsão
            </Text>
          </View>

          {/* Navegação entre semanas */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center', paddingHorizontal: 16 }}>
            <IconButton
              icon="chevron-left"
              mode="outlined"
              onPress={() => {
                if (selectedWeekIndex > 0) {
                  setSelectedWeekIndex(selectedWeekIndex - 1);
                }
              }}
              disabled={selectedWeekIndex === 0}
              size={24}
            />
            <Button
              mode="contained"
              style={{ flex: 1 }}
              labelStyle={{ fontSize: 14 }}
            >
              Semana {selectedWeekIndex + 1} de 4
            </Button>
            <IconButton
              icon="chevron-right"
              mode="outlined"
              onPress={() => {
                if (selectedWeekIndex < weeklyEvolution.weeks.length - 1) {
                  setSelectedWeekIndex(selectedWeekIndex + 1);
                }
              }}
              disabled={selectedWeekIndex >= weeklyEvolution.weeks.length - 1}
              size={24}
            />
          </View>

          <View style={styles.weeklyCardsContainer}>
            {weeklyEvolution.weeks
              .filter((_: any, index: number) => index === selectedWeekIndex) // Filtrar apenas semana selecionada
              .map((week: any) => {
              // Verificar se semana tem pagamentos gerados
              const hasPayments = week.total_payments > 0 || 
                                  week.completed_payments > 0 || 
                                  week.pending_payments > 0;
              
              return (
                <Card key={`week-${selectedWeekIndex}-${week.week_start}`} style={styles.weekCard}>
                  <Card.Content>
                    <View style={styles.weekHeader}>
                      {/* Mostrar como Semana 1, 2, 3, 4 */}
                      <Text style={styles.weekNumber}>Semana {selectedWeekIndex + 1}</Text>
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

                    {hasPayments ? (
                      <>
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
                      </>
                    ) : (
                      // Empty State - Sem pagamentos gerados
                      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                        <Ionicons name="calendar-outline" size={48} color="#ccc" style={{ marginBottom: 12 }} />
                        <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', marginBottom: 4 }}>
                          Pagamentos ainda não gerados
                        </Text>
                        <Text style={{ fontSize: 12, color: '#bbb', textAlign: 'center' }}>
                          Os pagamentos desta semana serão criados automaticamente
                        </Text>
                      </View>
                    )}

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
              );
            })}
          </View>
        </Surface>
      )}

      {/* Admin Actions */}
      <Surface style={styles.actionsCard}>
        <Title style={styles.sectionTitle}>Ações Administrativas</Title>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('UsersList')}
          style={styles.actionButton}
          icon="account-group"
        >
          Gerenciar Usuários
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('VehiclesManagement')}
          style={styles.actionButton}
          icon="car"
        >
          Gerenciar Veículos
        </Button>

        <Button
          mode="outlined"
          onPress={() => navigation.navigate('VehicleCosts')}
          style={styles.actionButton}
          icon="cash-multiple"
        >
          Gerenciar Custos
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

    </ScrollView>
  );
}
