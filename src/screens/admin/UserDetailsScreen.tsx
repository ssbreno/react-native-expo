import React, { useState, useEffect } from 'react';
import { View, ScrollView, Alert, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Surface,
  useTheme,
  Chip,
  Button,
  Divider,
  Dialog,
  Portal,
  TextInput as PaperTextInput,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminUser } from '../../services/adminService';
import { paymentService, PaymentHistory } from '../../services/paymentService';
import { formatCurrency, formatDateTime } from '../../utils/dateUtils';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle, Payment } from '../../types';
import { Colors } from '../../constants/colors';
import { styles } from './UserDetailsScreen.styles';
import PaymentReceipt from '../../components/PaymentReceipt';

interface UserDetailsScreenProps {
  route: {
    params: {
      userId: string;
    };
  };
  navigation: any;
}

export default function UserDetailsScreen({ route, navigation }: UserDetailsScreenProps) {
  const { userId } = route.params;
  const [user, setUser] = useState<AdminUser | null>(null);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [userPayments, setUserPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editPaymentVisible, setEditPaymentVisible] = useState(false);
  const [weeklyAmount, setWeeklyAmount] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState<number | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [loadingPayments, setLoadingPayments] = useState(false);
  
  // Histórico de Pagamentos com paginação
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const historyLimit = 10;

  // Edit user info states
  const [editUserVisible, setEditUserVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editCpf, setEditCpf] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  // Delete user state
  const [deleting, setDeleting] = useState(false);

  const theme = useTheme();

  useEffect(() => {
    loadUserDetails();
  }, [userId]);
  
  useEffect(() => {
    if (user) {
      loadPaymentHistory();
    }
  }, [historyPage, user]);

  const loadUserDetails = async () => {
    if (!userId) return;

    setLoading(true);
    setLoadingPayments(true);

    try {
      const [userResult, paymentStatusResult, paymentsResult] = await Promise.all([
        adminService.getUserDetails(userId),
        adminService.getUsersWithPaymentStatus(),
        adminService.getUserPayments(userId),
      ]);

      if (userResult.success && userResult.data) {
        let userData = userResult.data;

        // Merge payment status data
        if (paymentStatusResult.success && paymentStatusResult.data) {
          const paymentData = paymentStatusResult.data.find(
            (u: AdminUser) =>
              u.id.toString() === userId.toString() ||
              u.id === parseInt(userId) ||
              u.id.toString() === userId
          );

          if (paymentData) {
            userData = { ...userData, ...paymentData };
          } else {
            if (userData.total_payments && userData.total_payments > 0) {
              userData.payment_status = userData.payment_status || 'up_to_date';
            } else {
              userData.payment_status = 'no_payments';
            }
          }
        }

        setUser(userData);

        // Set vehicles
        if (userData.vehicles && Array.isArray(userData.vehicles)) {
          setUserVehicles(userData.vehicles);
        } else {
          setUserVehicles([]);
        }

        // Set user payments - try from API first, then from userData
        let payments: Payment[] = [];

        if (paymentsResult.success && paymentsResult.data) {
          payments = paymentsResult.data.payments || paymentsResult.data || [];
        }

        // If API didn't return payments, try from user data
        if (payments.length === 0 && userData.payments && Array.isArray(userData.payments)) {
          payments = userData.payments;
        }

        // Filter only paid/completed payments
        const paidPayments = payments.filter(
          (p: Payment) => p.status === 'paid' || p.status === 'completed'
        );

        setUserPayments(paidPayments);
      } else {
        console.error('❌ User details error:', userResult.error);
        Alert.alert('Erro', userResult.error || 'Erro ao carregar dados do usuário');
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
      setLoadingPayments(false);
      setRefreshing(false);
    }
  };
  
  const loadPaymentHistory = async () => {
    if (!user) return;
    
    setLoadingHistory(true);
    try {
      // Buscar histórico de TODOS os pagamentos do usuário
      console.log(`📋 [UserDetails] Carregando histórico de ${userPayments.length} pagamentos`);
      
      if (userPayments.length === 0) {
        console.log('⚠️ [UserDetails] Sem pagamentos para buscar histórico');
        setPaymentHistory([]);
        setHistoryTotal(0);
        setHistoryTotalPages(1);
        setLoadingHistory(false);
        return;
      }
      
      // Buscar histórico de cada pagamento
      const historyPromises = userPayments.map(payment =>
        paymentService.getPaymentHistory(
          payment.id.toString(),
          1, // Sempre primeira página de cada
          100 // Pegar mais registros para consolidar
        )
      );
      
      const results = await Promise.all(historyPromises);
      
      // Consolidar todos os históricos
      let allHistory: PaymentHistory[] = [];
      results.forEach(result => {
        if (result.success && result.data?.history) {
          allHistory = [...allHistory, ...result.data.history];
        }
      });
      
      // Ordenar por data (mais recente primeiro)
      allHistory.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return dateB - dateA;
      });
      
      // Aplicar paginação local
      const startIdx = (historyPage - 1) * historyLimit;
      const endIdx = startIdx + historyLimit;
      const paginatedHistory = allHistory.slice(startIdx, endIdx);
      
      setPaymentHistory(paginatedHistory);
      setHistoryTotal(allHistory.length);
      setHistoryTotalPages(Math.ceil(allHistory.length / historyLimit));
      
      console.log(`📋 [UserDetails] Histórico consolidado: ${allHistory.length} registros totais, exibindo ${paginatedHistory.length}`);
    } catch (error) {
      console.error('❌ [UserDetails] Erro ao carregar histórico:', error);
      setPaymentHistory([]);
      setHistoryTotal(0);
      setHistoryTotalPages(1);
    } finally {
      setLoadingHistory(false);
    }
  };
  
  const handleMarkHistoryAsPaid = async (paymentId: string) => {
    Alert.alert(
      'Confirmar Ação',
      'Deseja marcar este pagamento como PAGO?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Marcar como Pago',
          style: 'default',
          onPress: async () => {
            try {
              console.log(`💳 [UserDetails] Marcando pagamento ${paymentId} como pago`);
              const result = await paymentService.markPaymentAsPaid(paymentId);
              
              if (result.success) {
                Alert.alert('Sucesso!', result.message || 'Pagamento marcado como pago');
                // Recarregar histórico e lista de pagamentos
                await loadUserDetails();
                await loadPaymentHistory();
              } else {
                Alert.alert('Erro', result.error || 'Erro ao marcar pagamento como pago');
              }
            } catch (error) {
              console.error('❌ [UserDetails] Erro ao marcar pagamento:', error);
              Alert.alert('Erro', 'Erro ao marcar pagamento como pago');
            }
          },
        },
      ]
    );
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserDetails();
  };

  const updateUserStatus = async (newStatus: 'active' | 'inactive' | 'suspended') => {
    setUpdatingStatus(true);
    try {
      const result = await adminService.updateUserStatus(userId, newStatus);
      if (result.success) {
        setUser(prev => (prev ? { ...prev, status: newStatus } : null));
        Alert.alert('Sucesso', result.message || 'Status atualizado com sucesso');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao atualizar status');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      Alert.alert('Erro', 'Erro ao atualizar status do usuário');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openEditPaymentDialog = () => {
    setWeeklyAmount(user?.weekly_amount?.toString() || '');
    setMonthlyAmount(user?.monthly_amount?.toString() || '');
    setEditPaymentVisible(true);
  };

  const closeEditPaymentDialog = () => {
    setEditPaymentVisible(false);
    setWeeklyAmount('');
    setMonthlyAmount('');
  };

  const savePaymentAmounts = async () => {
    const weekly = weeklyAmount.trim() ? parseFloat(weeklyAmount) : undefined;
    const monthly = monthlyAmount.trim() ? parseFloat(monthlyAmount) : undefined;

    // Validar se pelo menos um valor foi fornecido
    if (weekly === undefined && monthly === undefined) {
      Alert.alert('Erro', 'Por favor, preencha pelo menos um valor');
      return;
    }

    // Validar valor semanal se fornecido
    if (weekly !== undefined && (isNaN(weekly) || weekly < 0)) {
      Alert.alert('Erro', 'Por favor, insira um valor semanal válido');
      return;
    }

    // Validar valor mensal se fornecido
    if (monthly !== undefined && (isNaN(monthly) || monthly < 0)) {
      Alert.alert('Erro', 'Por favor, insira um valor mensal válido');
      return;
    }

    setSavingPayment(true);
    try {
      const result = await adminService.updateUserPaymentAmount(userId, weekly, monthly);
      if (result.success) {
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            weekly_amount: weekly !== undefined ? weekly : prev.weekly_amount,
            monthly_amount: monthly !== undefined ? monthly : prev.monthly_amount,
          };
        });
        closeEditPaymentDialog();
        Alert.alert('Sucesso', result.message || 'Valores de pagamento atualizados com sucesso');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao atualizar valores de pagamento');
      }
    } catch (error) {
      console.error('Erro ao atualizar valores:', error);
      Alert.alert('Erro', 'Erro ao atualizar valores de pagamento');
    } finally {
      setSavingPayment(false);
    }
  };

  const openEditUserDialog = () => {
    setEditName(user?.name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone || '');
    setEditAddress(user?.address || '');
    setEditCpf(user?.document_number || '');
    setEditUserVisible(true);
  };

  const closeEditUserDialog = () => {
    setEditUserVisible(false);
    setEditName('');
    setEditEmail('');
    setEditPhone('');
    setEditAddress('');
    setEditCpf('');
  };

  const saveUserInfo = async () => {
    if (!editName.trim()) {
      Alert.alert('Erro', 'Por favor, insira um nome');
      return;
    }

    if (!editEmail.trim()) {
      Alert.alert('Erro', 'Por favor, insira um email');
      return;
    }

    console.log('💾 [UserDetails] Salvando informações do usuário:', {
      userId,
      name: editName,
      email: editEmail,
      phone: editPhone,
      address: editAddress,
      document_number: editCpf,
    });

    setSavingUser(true);
    try {
      const result = await adminService.updateUserInfo(userId, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress,
        document_number: editCpf,
      });

      console.log('📊 [UserDetails] Resultado da atualização:', result);

      if (result.success) {
        setUser(prev =>
          prev
            ? {
                ...prev,
                name: editName,
                email: editEmail,
                phone: editPhone,
                address: editAddress,
                document_number: editCpf,
              }
            : null
        );
        closeEditUserDialog();
        Alert.alert('Sucesso', result.message || 'Informações atualizadas com sucesso');
      } else {
        console.error('❌ [UserDetails] Erro na resposta:', result.error);
        Alert.alert('Erro', result.error || 'Erro ao atualizar informações');
      }
    } catch (error: any) {
      console.error('❌ [UserDetails] Exception ao atualizar:', error);
      console.error('❌ [UserDetails] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      Alert.alert('Erro', 'Erro ao atualizar informações do usuário');
    } finally {
      setSavingUser(false);
    }
  };

  const handleMarkAsPaid = (payment: Payment) => {
    Alert.alert(
      'Marcar como Pago',
      `Tem certeza que deseja marcar este pagamento como pago?\n\nValor: ${formatCurrency(payment.amount)}\nVencimento: ${formatDate(payment.dueDate || payment.due_date)}`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Marcar como Pago',
          style: 'default',
          onPress: async () => {
            try {
              console.log('💳 [UserDetails] Marking payment as paid:', payment.id);
              const result = await adminService.completePayment(payment.id);

              if (result.success) {
                Alert.alert('Sucesso!', result.message || 'Pagamento marcado como pago');
                // Reload user details to refresh payment status
                await loadUserDetails();
              } else {
                console.error('❌ [UserDetails] Erro ao marcar pagamento:', result.error);
                Alert.alert('Erro', result.error || 'Erro ao marcar pagamento como pago');
              }
            } catch (error: any) {
              console.error('❌ [UserDetails] Error marking payment as paid:', error);
              Alert.alert('Erro', 'Erro ao marcar pagamento como pago');
            }
          },
        },
      ]
    );
  };

  const handleDeleteUser = () => {
    Alert.alert(
      'Deletar Usuário',
      `Tem certeza que deseja deletar o usuário ${user?.name}?\n\nEsta ação não pode ser desfeita e irá remover:\n• Todos os dados do usuário\n• Histórico de pagamentos\n• Vínculos com veículos`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              console.log('🗑️ [UserDetails] Deletando usuário:', userId);
              const result = await adminService.deleteUser(userId);

              if (result.success) {
                Alert.alert('Sucesso!', result.message || 'Usuário deletado com sucesso', [
                  {
                    text: 'OK',
                    onPress: () => navigation.goBack(),
                  },
                ]);
              } else {
                console.error('❌ [UserDetails] Erro ao deletar:', result.error);
                Alert.alert('Erro', result.error || 'Erro ao deletar usuário');
              }
            } catch (error: any) {
              console.error('❌ [UserDetails] Exception ao deletar:', error);
              Alert.alert('Erro', 'Erro ao deletar usuário');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return '#4CAF50';
      case 'inactive':
        return '#FF9800';
      case 'suspended':
        return '#F44336';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'inactive':
        return 'Inativo';
      case 'suspended':
        return 'Suspenso';
      default:
        return 'Desconhecido';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'up_to_date':
        return { bg: '#E8F5E8', text: '#2E7D32', icon: '#4CAF50' };
      case 'overdue':
        return { bg: '#FFEBEE', text: '#D32F2F', icon: '#F44336' };
      case 'no_payments':
        return { bg: '#FFF3E0', text: '#F57C00', icon: '#FF9800' };
      case 'pending':
        return { bg: '#FFF9E6', text: '#F57C00', icon: '#FFC107' };
      default:
        return { bg: '#FFF3E0', text: '#F57C00', icon: '#FF9800' };
    }
  };

  const getPaymentStatusText = (status?: string) => {
    switch (status) {
      case 'up_to_date':
        return 'Em Dia';
      case 'overdue':
        return 'Vencido';
      case 'no_payments':
        return 'Sem Pagamentos';
      case 'pending':
        return 'Aguardando Pagamento';
      default:
        return 'Sem Pagamentos';
    }
  };

  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'up_to_date':
        return 'checkmark-circle';
      case 'overdue':
        return 'alert-circle';
      case 'no_payments':
        return 'information-circle';
      case 'pending':
        return 'time';
      default:
        return 'information-circle';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Não informado';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando dados do usuário...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="person-remove-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Usuário não encontrado</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    >
      {/* User Info Card */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle-outline" size={60} color={theme.colors.primary} />
            </View>
            <View style={styles.userInfo}>
              <Title style={styles.userName}>{user.name}</Title>
              <Text style={styles.userEmail}>{user.email}</Text>
              {!!user.is_admin && (
                <View style={styles.statusContainer}>
                  <Chip
                    mode="flat"
                    textStyle={{ color: Colors.primary, fontSize: 12 }}
                    style={{
                      backgroundColor: '#E3F2FD',
                      marginTop: 8,
                    }}
                  >
                    Administrador
                  </Chip>
                </View>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Contact Info */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Informações de Contato</Title>
            <Button mode="outlined" onPress={openEditUserDialog} icon="pencil" compact>
              Editar
            </Button>
          </View>
          <Divider style={{ marginBottom: 12 }} />
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="phone-portrait-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user.phone || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="location-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user.address || 'Não informado'}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="card-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              {user.document_type?.toUpperCase()}:{' '}
              {user.document_number || user.cpf || 'Não informado'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoText}>Criado em: {formatDateTime(user.created_at)}</Text>
          </View>
          {!!user.updated_at && (
            <View style={styles.infoItem}>
              <Ionicons name="sync-outline" size={20} color="#666" />
              <Text style={styles.infoText}>Atualizado: {formatDateTime(user.updated_at)}</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Payment Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Status do Pagamento Atual</Title>
          <View
            style={[
              styles.paymentStatusContainer,
              { backgroundColor: getPaymentStatusColor(user.payment_status).bg },
            ]}
          >
            <View style={styles.paymentStatusHeader}>
              <Ionicons
                name={getPaymentStatusIcon(user.payment_status) as any}
                size={32}
                color={getPaymentStatusColor(user.payment_status).icon}
              />
              <View style={styles.paymentStatusInfo}>
                <Text style={styles.paymentStatusLabel}>Status Atual</Text>
                <Text
                  style={[
                    styles.paymentStatusValue,
                    { color: getPaymentStatusColor(user.payment_status).text },
                  ]}
                >
                  {getPaymentStatusText(user.payment_status)}
                </Text>
              </View>
            </View>

            {user.payment_status === 'overdue' && (
              <View style={styles.overdueDetails}>
                <Divider style={{ marginVertical: 12, backgroundColor: '#FFCDD2' }} />
                <View style={styles.overdueRow}>
                  <View style={styles.overdueItem}>
                    <Ionicons name="time-outline" size={20} color="#D32F2F" />
                    <View>
                      <Text style={styles.overdueLabel}>Dias em Atraso</Text>
                      <Text style={styles.overdueValue}>{user.days_overdue || 0} dias</Text>
                    </View>
                  </View>
                  <View style={styles.overdueItem}>
                    <Ionicons name="cash-outline" size={20} color="#D32F2F" />
                    <View>
                      <Text style={styles.overdueLabel}>Valor Pendente</Text>
                      <Text style={styles.overdueValue}>
                        {formatCurrency(user.pending_amount || 0)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {user.payment_status === 'up_to_date' && user.last_payment && (
              <View style={styles.upToDateDetails}>
                <Divider style={{ marginVertical: 12, backgroundColor: '#C8E6C9' }} />
                <View style={styles.upToDateRow}>
                  <Ionicons name="calendar-outline" size={20} color="#4CAF50" />
                  <View>
                    <Text style={styles.upToDateLabel}>Último Pagamento</Text>
                    <Text style={styles.upToDateValue}>{formatDate(user.last_payment)}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Payment Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Informações de Pagamento</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.total_payments || 0}</Text>
              <Text style={styles.statLabel}>Total de Pagamentos</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {user.last_payment ? formatDate(user.last_payment) : '-'}
              </Text>
              <Text style={styles.statLabel}>Último Pagamento</Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Payment Amounts */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Valores de Pagamento</Title>
            <Button mode="outlined" onPress={openEditPaymentDialog} icon="pencil" compact>
              Editar
            </Button>
          </View>
          <Divider style={{ marginVertical: 12 }} />
          {/* Se tem valor semanal definido, mostra apenas o valor semanal */}
          {user.weekly_amount !== undefined &&
          user.weekly_amount !== null &&
          user.weekly_amount > 0 ? (
            <View style={styles.paymentAmountsGrid}>
              <Surface style={[styles.amountCard, { flex: 1 }]}>
                <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
                <Text style={styles.amountLabel}>Valor Semanal</Text>
                <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
                  R$ {user.weekly_amount.toFixed(2).replace('.', ',')}
                </Text>
              </Surface>
            </View>
          ) : user.monthly_amount !== undefined &&
            user.monthly_amount !== null &&
            user.monthly_amount > 0 ? (
            <View style={styles.paymentAmountsGrid}>
              <Surface style={[styles.amountCard, { flex: 1 }]}>
                <Ionicons name="calendar" size={32} color={theme.colors.primary} />
                <Text style={styles.amountLabel}>Valor Mensal</Text>
                <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
                  R$ {user.monthly_amount.toFixed(2).replace('.', ',')}
                </Text>
              </Surface>
            </View>
          ) : (
            <View style={styles.paymentAmountsGrid}>
              <Surface style={styles.amountCard}>
                <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
                <Text style={styles.amountLabel}>Valor Semanal</Text>
                <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
                  Não definido
                </Text>
              </Surface>
              <Surface style={styles.amountCard}>
                <Ionicons name="calendar" size={32} color={theme.colors.primary} />
                <Text style={styles.amountLabel}>Valor Mensal</Text>
                <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
                  Não definido
                </Text>
              </Surface>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Vehicle Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Veículos do Usuário</Title>
          {userVehicles.length > 0 ? (
            userVehicles.map(vehicle => (
              <View key={vehicle.id} style={styles.vehicleItem}>
                <View style={styles.vehicleHeader}>
                  <Ionicons name="car" size={28} color={theme.colors.primary} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.vehicleName}>
                      {vehicle.brand} {vehicle.model}
                    </Text>
                    <Text style={styles.vehiclePlate}>
                      {vehicle.license_plate || vehicle.plate}
                    </Text>
                  </View>
                  <Chip
                    mode="outlined"
                    style={{
                      backgroundColor: getStatusColor(vehicle.status) + '20',
                      borderColor: getStatusColor(vehicle.status),
                    }}
                    textStyle={{
                      color: getStatusColor(vehicle.status),
                      fontSize: 11,
                      fontWeight: '600',
                    }}
                  >
                    {vehicle.status === 'available'
                      ? 'Disponível'
                      : vehicle.status === 'rented'
                        ? 'Alugado'
                        : vehicle.status === 'maintenance'
                          ? 'Manutenção'
                          : vehicle.status || 'N/A'}
                  </Chip>
                </View>

                <Divider style={{ marginVertical: 12 }} />

                <View style={styles.vehicleDetailsGrid}>
                  <View style={styles.vehicleDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.vehicleDetailLabel}>Ano:</Text>
                    <Text style={styles.vehicleDetailValue}>
                      {vehicle.manufacture_year || vehicle.year}/
                      {vehicle.model_year || vehicle.year}
                    </Text>
                  </View>

                  <View style={styles.vehicleDetailRow}>
                    <Ionicons name="color-palette-outline" size={16} color="#666" />
                    <Text style={styles.vehicleDetailLabel}>Cor:</Text>
                    <Text style={styles.vehicleDetailValue}>{vehicle.color || 'N/A'}</Text>
                  </View>

                  {!!vehicle.chassis && (
                    <View style={styles.vehicleDetailRow}>
                      <Ionicons name="barcode-outline" size={16} color="#666" />
                      <Text style={styles.vehicleDetailLabel}>Chassi:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.chassis}</Text>
                    </View>
                  )}

                  {!!vehicle.fuel_type && (
                    <View style={styles.vehicleDetailRow}>
                      <Ionicons name="water-outline" size={16} color="#666" />
                      <Text style={styles.vehicleDetailLabel}>Combustível:</Text>
                      <Text style={styles.vehicleDetailValue}>
                        {vehicle.fuel_type === 'gasoline'
                          ? 'Gasolina'
                          : vehicle.fuel_type === 'ethanol'
                            ? 'Etanol'
                            : vehicle.fuel_type === 'flex'
                              ? 'Flex'
                              : vehicle.fuel_type === 'diesel'
                                ? 'Diesel'
                                : vehicle.fuel_type}
                      </Text>
                    </View>
                  )}

                  {vehicle.price !== undefined && vehicle.price !== null && (
                    <View style={styles.vehicleDetailRow}>
                      <Ionicons name="cash-outline" size={16} color="#666" />
                      <Text style={styles.vehicleDetailLabel}>Valor:</Text>
                      <Text
                        style={[
                          styles.vehicleDetailValue,
                          { color: theme.colors.primary, fontWeight: '600' },
                        ]}
                      >
                        R$ {vehicle.price.toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                  )}

                  {!!vehicle.description && (
                    <View style={[styles.vehicleDetailRow, { marginTop: 8 }]}>
                      <Ionicons name="information-circle-outline" size={16} color="#666" />
                      <Text style={styles.vehicleDetailLabel}>Descrição:</Text>
                      <Text style={[styles.vehicleDetailValue, { flex: 1 }]}>
                        {vehicle.description}
                      </Text>
                    </View>
                  )}
                </View>

                {!!vehicle.rentalExpiration && (
                  <View
                    style={{
                      marginTop: 12,
                      padding: 8,
                      backgroundColor: '#FFF3E0',
                      borderRadius: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: '#F57C00' }}>
                      ⏰ Vencimento do aluguel: {formatDate(vehicle.rentalExpiration)}
                    </Text>
                  </View>
                )}

                {userVehicles.length > 1 && <Divider style={styles.vehicleDivider} />}
              </View>
            ))
          ) : (
            <View style={styles.noVehicles}>
              <Ionicons name="car-outline" size={48} color="#ccc" />
              <Text style={styles.noVehiclesText}>Nenhum veículo encontrado</Text>
            </View>
          )}

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('VehiclesManagement')}
            icon="link-variant"
            style={{ marginTop: 16 }}
          >
            Gerenciar Veículos
          </Button>
        </Card.Content>
      </Card>

      {/* User Payments History */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Histórico de Pagamentos</Title>
          {loadingPayments ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : userPayments.length > 0 ? (
            userPayments.map((payment: Payment, index: number) => {
              const isCompleted = payment.status === 'paid' || payment.status === 'completed';
              const isPending = payment.status === 'pending';
              const isOverdue = payment.status === 'overdue';

              const statusColor = isCompleted ? '#4CAF50' : isOverdue ? '#F44336' : '#FF9800';
              const statusBg = isCompleted ? '#E8F5E8' : isOverdue ? '#FFEBEE' : '#FFF3E0';
              const statusText = isCompleted ? 'Pago' : isOverdue ? 'Vencido' : 'Pendente';

              return (
                <View key={payment.id || index}>
                  <View style={styles.paymentItem}>
                    <View style={styles.paymentHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.paymentDescription}>
                          {payment.description || 'Pagamento'}
                        </Text>
                        <Text style={styles.paymentDate}>
                          Vencimento: {formatDate(payment.dueDate || payment.due_date)}
                        </Text>
                        {!!payment.date && (
                          <Text style={[styles.paymentDate, { color: '#4CAF50' }]}>
                            Pago em: {formatDateTime(payment.date)}
                          </Text>
                        )}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={[styles.paymentAmount, { color: theme.colors.primary }]}>
                          {formatCurrency(payment.amount)}
                        </Text>
                        <Chip
                          mode="flat"
                          style={{ backgroundColor: statusBg, marginTop: 4 }}
                          textStyle={{ color: statusColor, fontSize: 11 }}
                        >
                          {statusText}
                        </Chip>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={{ marginTop: 12, flexDirection: 'row', gap: 8 }}>
                      {/* Receipt Button - Only for paid payments */}
                      {!!isCompleted && (
                        <Button
                          mode="outlined"
                          onPress={() => {
                            const paymentIdNum = parseInt(payment.id.toString());
                            setSelectedPayment(payment);
                            setShowReceipt(paymentIdNum);
                          }}
                          icon="receipt"
                          compact
                          style={{ flex: 1 }}
                        >
                          Ver Comprovante
                        </Button>
                      )}
                      
                      {/* Mark as Paid Button - Only for pending/overdue payments */}
                      {!isCompleted && (
                        <Button
                          mode="contained"
                          onPress={() => handleMarkAsPaid(payment)}
                          icon="check-circle"
                          compact
                          style={{ flex: 1 }}
                        >
                          Marcar como Pago
                        </Button>
                      )}
                    </View>
                  </View>
                  {index < userPayments.length - 1 && <Divider style={{ marginVertical: 12 }} />}
                </View>
              );
            })
          ) : (
            <View style={styles.noVehicles}>
              <Ionicons name="cash-outline" size={48} color="#ccc" />
              <Text style={styles.noVehiclesText}>Nenhum pagamento encontrado</Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Payment History with Pagination */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Histórico Detalhado</Title>
          {historyTotal > 0 && (
            <Text style={{ fontSize: 12, color: '#999', marginBottom: 12 }}>
              {historyTotal} registros no total
            </Text>
          )}
          
          {loadingHistory ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : paymentHistory.length > 0 ? (
            <>
                {paymentHistory.map((historyItem: PaymentHistory, index: number) => {
                  const isPaid = historyItem.status === 'paid' || historyItem.status === 'completed';
                  
                  return (
                    <View key={historyItem.id || index}>
                      <View style={{ padding: 12, backgroundColor: '#F5F5F5', borderRadius: 8 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={{ fontSize: 13, color: '#333', fontWeight: '600' }}>
                                Status: {historyItem.status || 'N/A'}
                              </Text>
                              {isPaid ? (
                                <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                              ) : (
                                <Ionicons name="time-outline" size={16} color="#FF9800" />
                              )}
                            </View>
                            {!!historyItem.notes && (
                              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                                {historyItem.notes}
                              </Text>
                            )}
                            <Text style={{ fontSize: 11, color: '#999', marginTop: 2 }}>
                              {formatDateTime(historyItem.created_at)}
                            </Text>
                          </View>
                          
                          {historyItem.amount && (
                            <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.primary }}>
                              {formatCurrency(historyItem.amount)}
                            </Text>
                          )}
                        </View>
                        
                        {/* Botão Marcar como Pago - apenas se não estiver pago */}
                        {!isPaid && (
                          <Button
                            mode="contained"
                            onPress={() => handleMarkHistoryAsPaid(historyItem.payment_id)}
                            icon="check-circle"
                            compact
                            style={{ marginTop: 12, backgroundColor: '#4CAF50' }}
                          >
                            Marcar como Pago
                          </Button>
                        )}
                      </View>
                      {index < paymentHistory.length - 1 && <Divider style={{ marginVertical: 8 }} />}
                    </View>
                  );
                })}
                
                {/* Controles de Paginação */}
                {historyTotalPages > 1 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, gap: 12 }}>
                    <Button
                      mode="outlined"
                      onPress={() => setHistoryPage(historyPage - 1)}
                      disabled={historyPage === 1 || loadingHistory}
                      icon="chevron-left"
                      compact
                    >
                      Anterior
                    </Button>
                    
                    <Text style={{ fontSize: 13, color: '#666' }}>
                      Página {historyPage} de {historyTotalPages}
                    </Text>
                    
                    <Button
                      mode="outlined"
                      onPress={() => setHistoryPage(historyPage + 1)}
                      disabled={historyPage >= historyTotalPages || loadingHistory}
                      icon="chevron-right"
                      contentStyle={{ flexDirection: 'row-reverse' }}
                      compact
                    >
                      Próxima
                    </Button>
                  </View>
                )}
              </>
          ) : (
            <View style={styles.noVehicles}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.noVehiclesText}>Nenhum histórico encontrado</Text>
              <Text style={{ fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' }}>
                O histórico será exibido quando houver pagamentos registrados
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Danger Zone - Deletar Usuário */}
      <Card style={[styles.card, { borderColor: '#F44336', borderWidth: 1 }]}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={[styles.sectionTitle, { color: '#F44336' }]}>Zona de Perigo</Title>
            <Ionicons name="warning" size={24} color="#F44336" />
          </View>
          <Text style={{ fontSize: 14, color: '#666', marginBottom: 16, marginTop: 8 }}>
            Esta ação é irreversível. Ao deletar o usuário, todos os seus dados, histórico de
            pagamentos e vínculos serão permanentemente removidos.
          </Text>
          <Button
            mode="contained"
            onPress={handleDeleteUser}
            icon="trash-can-outline"
            style={{ backgroundColor: '#F44336' }}
            disabled={deleting}
            loading={deleting}
          >
            {deleting ? 'Deletando...' : 'Deletar Usuário'}
          </Button>
        </Card.Content>
      </Card>

      {/* Payment Receipt Modal */}
      <PaymentReceipt
        visible={showReceipt !== null}
        onDismiss={() => {
          setShowReceipt(null);
          setSelectedPayment(null);
        }}
        paymentId={showReceipt || 0}
        paymentData={selectedPayment}
      />

      {/* Edit Payment Dialog */}
      <Portal>
        <Dialog visible={editPaymentVisible} onDismiss={closeEditPaymentDialog}>
          <Dialog.Title>Editar Valores de Pagamento</Dialog.Title>
          
          {/* Botões no Topo */}
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 }}>
            <Button onPress={closeEditPaymentDialog} disabled={savingPayment}>
              Cancelar
            </Button>
            <Button onPress={savePaymentAmounts} disabled={savingPayment} loading={savingPayment} mode="contained">
              Salvar
            </Button>
          </Dialog.Actions>

          <Dialog.Content>
                  <Text style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
                    Você pode atualizar apenas um dos valores ou ambos
                  </Text>
            <PaperTextInput
              label="Valor Semanal (R$) - Opcional"
              value={weeklyAmount}
              onChangeText={setWeeklyAmount}
              keyboardType="decimal-pad"
              mode="outlined"
              style={{ marginBottom: 16 }}
              left={<PaperTextInput.Icon icon="calendar-outline" />}
              placeholder="Ex: 500.00"
            />
            <PaperTextInput
              label="Valor Mensal (R$) - Opcional"
              value={monthlyAmount}
              onChangeText={setMonthlyAmount}
              keyboardType="decimal-pad"
              mode="outlined"
              left={<PaperTextInput.Icon icon="calendar" />}
              placeholder="Ex: 500.00"
            />
          </Dialog.Content>
        </Dialog>

        {/* Edit User Info Dialog */}
        <Dialog visible={editUserVisible} onDismiss={closeEditUserDialog}>
          <Dialog.Title>Editar Informações do Usuário</Dialog.Title>
          
          {/* Botões no Topo */}
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 }}>
            <Button onPress={closeEditUserDialog} disabled={savingUser}>
              Cancelar
            </Button>
            <Button onPress={saveUserInfo} disabled={savingUser} loading={savingUser} mode="contained">
              Salvar
            </Button>
          </Dialog.Actions>

          <Dialog.ScrollArea>
            <ScrollView 
              style={{ maxHeight: 400 }} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
                    <PaperTextInput
              label="Nome"
              value={editName}
              onChangeText={setEditName}
              mode="outlined"
              style={{ marginBottom: 12 }}
              left={<PaperTextInput.Icon icon="account" />}
            />
            <PaperTextInput
              label="Email"
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              mode="outlined"
              autoCapitalize="none"
              style={{ marginBottom: 12 }}
              left={<PaperTextInput.Icon icon="email" />}
            />
            <PaperTextInput
              label="CPF"
              value={editCpf}
              onChangeText={setEditCpf}
              keyboardType="numeric"
              mode="outlined"
              style={{ marginBottom: 12 }}
              left={<PaperTextInput.Icon icon="card-account-details" />}
              placeholder="000.000.000-00"
            />
            <PaperTextInput
              label="Telefone"
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
              mode="outlined"
              style={{ marginBottom: 12 }}
              left={<PaperTextInput.Icon icon="phone" />}
            />
              <PaperTextInput
                label="Endereço"
                value={editAddress}
                onChangeText={setEditAddress}
                mode="outlined"
                multiline
                numberOfLines={2}
                left={<PaperTextInput.Icon icon="map-marker" />}
              />
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}
