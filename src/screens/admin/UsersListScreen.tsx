import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Alert, TouchableOpacity } from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Surface,
  useTheme,
  Chip,
  Searchbar,
  FAB,
  Portal,
  Dialog,
  Button,
  TextInput,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminUser } from '../../services/adminService';
import { formatCurrency } from '../../utils/dateUtils';
import { Colors } from '../../constants/colors';
import { styles } from './UsersListScreen.styles';

interface UsersListScreenProps {
  navigation: any;
}

export default function UsersListScreen({ navigation }: UsersListScreenProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const theme = useTheme();

  // Create User Modal states
  const [createUserVisible, setCreateUserVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    document_number: '',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (pageNum = 1, reset = true) => {
    try {
      if (reset) setLoading(true);

      // Load users with payment status information
      const [usersResult, paymentStatusResult] = await Promise.all([
        adminService.getAllUsers(pageNum, 100),
        adminService.getUsersWithPaymentStatus(),
      ]);

      console.log('👥 Users loaded:', usersResult);
      console.log('💰 Payment status loaded:', paymentStatusResult);

      if (usersResult.success && usersResult.data) {
        let allUsers = usersResult.data.users || [];

        // Merge payment status data
        if (paymentStatusResult.success && paymentStatusResult.data) {
          const paymentStatusMap = new Map(
            paymentStatusResult.data.map((u: AdminUser) => [u.id, u])
          );

          allUsers = allUsers.map((user: AdminUser) => {
            const paymentData = paymentStatusMap.get(user.id);
            return paymentData ? { ...user, ...paymentData } : user;
          });
        }

        // Log para debug - verificar se license_plate está vindo
        if (allUsers.length > 0) {
          console.log('📋 UsersListScreen - Sample user data:', {
            name: allUsers[0].name,
            email: allUsers[0].email,
            license_plate: allUsers[0].license_plate,
            vehicle_name: allUsers[0].vehicle_name,
            payment_status: allUsers[0].payment_status,
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
        setUsers(reset ? regularUsers : [...users, ...regularUsers]);
        setTotal(regularUsers.length);
        setHasMore(regularUsers.length === 100);
        setPage(pageNum);
      } else {
        Alert.alert('Erro', usersResult.error || 'Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadUsers(page + 1, false);
    }
  };

  const navigateToUserDetails = (userId: string) => {
    navigation.navigate('UserDetails', { userId });
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'up_to_date':
      case 'paid':
      case 'completed':
        return { bg: '#E8F5E8', text: '#2E7D32' };
      case 'overdue':
        return { bg: '#FFEBEE', text: '#D32F2F' };
      case 'no_payments':
        return { bg: '#FFF3E0', text: '#F57C00' };
      case 'pending':
        return { bg: '#FFF9E6', text: '#F57C00' };
      default:
        return { bg: '#FFF3E0', text: '#F57C00' };
    }
  };

  const getPaymentStatusText = (status?: string) => {
    switch (status) {
      case 'up_to_date':
      case 'paid':
      case 'completed':
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
      case 'paid':
      case 'completed':
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

  const openCreateUserModal = () => {
    setNewUserData({
      name: '',
      email: '',
      password: '',
      phone: '',
      document_number: '',
    });
    setCreateUserVisible(true);
  };

  const closeCreateUserModal = () => {
    setCreateUserVisible(false);
  };

  const handleCreateUser = async () => {
    // Validações
    if (!newUserData.name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }
    if (!newUserData.email.trim()) {
      Alert.alert('Erro', 'Email é obrigatório');
      return;
    }
    if (!newUserData.password || newUserData.password.length < 6) {
      Alert.alert('Erro', 'Senha deve ter pelo menos 6 caracteres');
      return;
    }

    setCreating(true);
    try {
      console.log('➕ Criando novo usuário:', newUserData);
      const result = await adminService.createUser(newUserData);

      if (result.success) {
        Alert.alert('Sucesso!', result.message || 'Usuário criado com sucesso');
        closeCreateUserModal();
        // Recarregar lista de usuários
        loadUsers(1, true);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao criar usuário');
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      Alert.alert('Erro', 'Erro ao criar usuário');
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(
    user =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserCard = (user: AdminUser) => {
    const paymentStatus = getPaymentStatusColor(user.payment_status);
    const paymentStatusText = getPaymentStatusText(user.payment_status);
    const paymentStatusIcon = getPaymentStatusIcon(user.payment_status);

    return (
      <TouchableOpacity
        key={user.id}
        onPress={() => navigateToUserDetails(user.id.toString())}
        style={styles.userCardContainer}
        activeOpacity={0.7}
      >
        <Card style={styles.userCard}>
          <Card.Content>
            <View style={styles.userHeader}>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Title style={styles.userName}>{user.name}</Title>
                  <Ionicons name="chevron-forward" size={20} color="#999" />
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <View style={styles.contactRow}>
                  <Ionicons name="call-outline" size={14} color="#666" />
                  <Text style={styles.phoneText}>{user.phone || 'N/A'}</Text>
                </View>
              </View>
            </View>

            {/* Payment Status Badge */}
            <View style={styles.paymentStatusBadge}>
              <View style={[styles.statusBadge, { backgroundColor: paymentStatus.bg }]}>
                <Ionicons name={paymentStatusIcon as any} size={18} color={paymentStatus.text} />
                <Text style={[styles.statusBadgeText, { color: paymentStatus.text }]}>
                  {paymentStatusText}
                </Text>
              </View>
            </View>

            {/* Vehicle Info */}
            {(user.vehicle_name || user.license_plate) && (
              <View style={styles.vehicleSection}>
                {!!user.vehicle_name && (
                  <View style={styles.vehicleItem}>
                    <Ionicons name="car-outline" size={16} color="#4CAF50" />
                    <Text style={styles.vehicleText}>{user.vehicle_name}</Text>
                  </View>
                )}
                {!!user.license_plate && (
                  <View style={styles.licensePlateContainer}>
                    <Ionicons name="card-outline" size={16} color={Colors.primary} />
                    <Text style={styles.licensePlateText}>{user.license_plate}</Text>
                  </View>
                )}
              </View>
            )}

            {/* Enhanced Payment Information */}
            <View style={styles.paymentInfoSection}>
              <View style={styles.paymentInfoGrid}>
                <View style={styles.paymentInfoItem}>
                  <Ionicons name="wallet-outline" size={20} color="#4CAF50" />
                  <View style={styles.paymentInfoContent}>
                    <Text style={styles.paymentInfoLabel}>Total</Text>
                    <Text style={styles.paymentInfoValue}>{user.total_payments || 0}</Text>
                  </View>
                </View>

                <View style={styles.paymentInfoItem}>
                  <Ionicons name="calendar-outline" size={20} color="#2196F3" />
                  <View style={styles.paymentInfoContent}>
                    <Text style={styles.paymentInfoLabel}>Último</Text>
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

              {/* Overdue Information */}
              {user.payment_status === 'overdue' && (
                <View style={styles.overdueAlert}>
                  <View style={styles.overdueRow}>
                    <Ionicons name="time-outline" size={16} color="#D32F2F" />
                    <Text style={styles.overdueText}>{user.days_overdue || 0} dias em atraso</Text>
                  </View>
                  <View style={styles.overdueRow}>
                    <Ionicons name="cash-outline" size={16} color="#D32F2F" />
                    <Text style={styles.overdueAmount}>
                      {formatCurrency(user.pending_amount || 0)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Usuários do Sistema</Title>
        <Text style={styles.headerSubtitle}>
          Total: {total} usuários • Exibindo: {filteredUsers.length}
        </Text>
      </Surface>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por nome ou email..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasMore) {
            loadMore();
          }
        }}
      >
        {filteredUsers.map(renderUserCard)}

        {loading && users.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadMoreText}>Carregando mais...</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB para criar usuário */}
      <FAB
        icon="plus"
        label="Novo Usuário"
        style={styles.fab}
        onPress={openCreateUserModal}
        color="#fff"
      />

      {/* Modal de Criar Usuário */}
      <Portal>
        <Dialog visible={createUserVisible} onDismiss={closeCreateUserModal}>
          <Dialog.Title>Criar Novo Usuário</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView style={{ maxHeight: 400 }}>
              <TextInput
                label="Nome *"
                value={newUserData.name}
                onChangeText={text => setNewUserData({ ...newUserData, name: text })}
                mode="outlined"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />
              <TextInput
                label="Email *"
                value={newUserData.email}
                onChangeText={text => setNewUserData({ ...newUserData, email: text })}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />
              <TextInput
                label="Senha *"
                value={newUserData.password}
                onChangeText={text => setNewUserData({ ...newUserData, password: text })}
                mode="outlined"
                secureTextEntry
                style={{ marginBottom: 12 }}
                disabled={creating}
                placeholder="Mínimo 6 caracteres"
              />
              <TextInput
                label="Telefone (Opcional)"
                value={newUserData.phone}
                onChangeText={text => setNewUserData({ ...newUserData, phone: text })}
                mode="outlined"
                keyboardType="phone-pad"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />
              <TextInput
                label="CPF (Opcional)"
                value={newUserData.document_number}
                onChangeText={text => setNewUserData({ ...newUserData, document_number: text })}
                mode="outlined"
                keyboardType="numeric"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />
              <Text style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                * Campos obrigatórios
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeCreateUserModal} disabled={creating}>
              Cancelar
            </Button>
            <Button
              onPress={handleCreateUser}
              disabled={creating}
              loading={creating}
              mode="contained"
            >
              Criar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}
