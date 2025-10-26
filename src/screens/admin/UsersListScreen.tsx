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
import { authService } from '../../services/authService';
import { formatCurrency } from '../../utils/dateUtils';
import { Colors } from '../../constants/colors';
import { styles } from './UsersListScreen.styles';
import { z } from 'zod';
import {
  emailSchema,
  cpfSchema,
  phoneSchema,
  passwordSchema,
} from '../../utils/validationSchemas';

interface UsersListScreenProps {
  navigation: any;
}

export default function UsersListScreen({ navigation }: UsersListScreenProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Paginação
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [itemsPerPage] = useState(10);
  const [isLoadingPage, setIsLoadingPage] = useState(false);
  
  const theme = useTheme();

  // Create User Modal states
  const [createUserVisible, setCreateUserVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
    document_number: '',
    document_type: 'cpf' as const,
    address: '',
    zip_code: '',
    birth_date: '',
    age: 18,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (pageNum = 1, reset = true) => {
    // Evitar múltiplas requisições simultâneas
    if (isLoadingPage) {
      console.log('⏳ [UsersListScreen] Já está carregando, ignorando...');
      return;
    }

    try {
      if (reset) setLoading(true);
      setIsLoadingPage(true);

      // Load users with payment status information
      // Usar itemsPerPage (10) para paginação real do backend
      const [usersResult, paymentStatusResult] = await Promise.all([
        adminService.getAllUsers(pageNum, itemsPerPage),
        adminService.getUsersWithPaymentStatus(),
      ]);

      console.log(`👥 [UsersListScreen] Loading page ${pageNum} with ${itemsPerPage} items`);
      console.log('👥 Users loaded:', usersResult);
      console.log('💰 Payment status loaded:', paymentStatusResult);

      if (usersResult.success && usersResult.data) {
        // A API pode retornar users diretamente ou users.users (estrutura aninhada)
        const data = usersResult.data as any;
        let allUsers: AdminUser[] = [];
        
        // Tentar diferentes estruturas de resposta
        if (Array.isArray(data)) {
          allUsers = data;
        } else if (Array.isArray(data.users?.users)) {
          allUsers = data.users.users;
        } else if (Array.isArray(data.users)) {
          allUsers = data.users;
        }
        
        console.log('📋 [UsersListScreen] Extracted users array:', allUsers.length, 'users');

        // Se getAllUsers retornou vazio mas payment status tem dados, usar payment status como fonte
        if (allUsers.length === 0 && paymentStatusResult.success && paymentStatusResult.data && paymentStatusResult.data.length > 0) {
          console.log('📋 [UsersListScreen] Using payment status data as fallback');
          // Paginar manualmente os dados de payment status
          const startIdx = (pageNum - 1) * itemsPerPage;
          const endIdx = startIdx + itemsPerPage;
          allUsers = paymentStatusResult.data.slice(startIdx, endIdx);
          
          // Usar total real de payment status para paginação
          setTotal(paymentStatusResult.data.length);
          setTotalPages(Math.ceil(paymentStatusResult.data.length / itemsPerPage));
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
          
          // Usar dados de paginação do backend
          setTotal(data.total || allUsers.length);
          setTotalPages(Math.ceil((data.total || allUsers.length) / itemsPerPage));
        } else {
          // Sem dados, usar informações do backend
          setTotal(data.total || 0);
          setTotalPages(data.total ? Math.ceil(data.total / itemsPerPage) : 1);
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
        
        setUsers(regularUsers);
        setPage(pageNum);
        
        console.log(`📊 [UsersListScreen] Page ${pageNum}/${Math.ceil((data.total || regularUsers.length) / itemsPerPage)} - ${regularUsers.length} users displayed`);
      } else {
        Alert.alert('Erro', usersResult.error || 'Erro ao carregar usuários');
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      Alert.alert('Erro', 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsLoadingPage(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUsers(1, true);
  };

  // Paginação agora é controlada por botões no topo

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
      cpf: '',
      document_number: '',
      document_type: 'cpf' as const,
      address: '',
      zip_code: '',
      birth_date: '',
      age: 18,
    });
    setValidationErrors({});
    setCreateUserVisible(true);
  };

  const closeCreateUserModal = () => {
    setCreateUserVisible(false);
    setValidationErrors({});
    setNewUserData({
      name: '',
      email: '',
      password: '',
      phone: '',
      cpf: '',
      document_number: '',
      document_type: 'cpf' as const,
      address: '',
      zip_code: '',
      birth_date: '',
      age: 18,
    });
  };

  const handleCreateUser = async () => {
    // Limpar erros anteriores
    setValidationErrors({});
    const errors: Record<string, string> = {};

    // Validações básicas
    if (!newUserData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    // Validar email com Zod
    const emailValidation = emailSchema.safeParse(newUserData.email);
    if (!emailValidation.success) {
      errors.email = emailValidation.error.errors[0]?.message || 'Email inválido';
    }

    // Validar senha com Zod
    const passwordValidation = passwordSchema.safeParse(newUserData.password);
    if (!passwordValidation.success) {
      errors.password = passwordValidation.error.errors[0]?.message || 'Senha inválida';
    }

    // Validar telefone se preenchido (opcional)
    if (newUserData.phone && newUserData.phone.trim()) {
      const phoneValidation = phoneSchema.safeParse(newUserData.phone);
      if (!phoneValidation.success) {
        errors.phone = 'Telefone inválido (formato: 11999999999)';
      }
    }

    // Validar CPF se preenchido (opcional)
    if (newUserData.cpf && newUserData.cpf.trim()) {
      const cpfValidation = cpfSchema.safeParse(newUserData.cpf);
      if (!cpfValidation.success) {
        errors.cpf = 'CPF inválido (formato: 12345678900)';
      }
    }

    // Se houver erros, mostrar e retornar
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const firstError = Object.values(errors)[0];
      Alert.alert('Erro de Validação', firstError);
      return;
    }

    setCreating(true);
    try {
      console.log('➞ Criando novo usuário via /auth/register:', newUserData);
      
      // Preparar dados para registro
      const registerData = {
        name: newUserData.name,
        email: newUserData.email,
        password: newUserData.password,
        phone: newUserData.phone || '',
        cpf: newUserData.cpf || '',
        document_number: newUserData.cpf || '',
        document_type: 'cpf' as const,
        address: newUserData.address || '',
        zip_code: newUserData.zip_code || '',
        birth_date: newUserData.birth_date || '',
        age: newUserData.age || 18,
      };

      // Usar endpoint /auth/register - passa params individuais
      const result = await authService.register(
        registerData.email,
        registerData.password,
        registerData.name,
        registerData.phone
      );

      if (result.success) {
        Alert.alert('Sucesso!', 'Usuário criado com sucesso');
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

      {/* Botão Novo Usuário no Topo */}
      <View style={{ paddingHorizontal: 16, paddingBottom: 12 }}>
        <Button
          mode="contained"
          onPress={openCreateUserModal}
          icon="plus"
          style={{ borderRadius: 8 }}
        >
          Novo Usuário
        </Button>
      </View>

      {/* Controles de Paginação no Topo */}
      {totalPages > 1 && (
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 12 }}>
          <Button
            mode="outlined"
            onPress={() => {
              if (page > 1 && !isLoadingPage) {
                loadUsers(page - 1, true);
              }
            }}
            disabled={page === 1 || isLoadingPage}
            icon="chevron-left"
            compact
            loading={isLoadingPage && page > 1}
          >
            Anterior
          </Button>
          
          <View style={{ paddingHorizontal: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' }}>
              Página {page} de {totalPages}
            </Text>
            <Text style={{ fontSize: 12, color: '#999', textAlign: 'center' }}>
              {total} usuários no total
            </Text>
          </View>
          
          <Button
            mode="outlined"
            onPress={() => {
              if (page < totalPages && !isLoadingPage) {
                loadUsers(page + 1, true);
              }
            }}
            disabled={page >= totalPages || isLoadingPage}
            icon="chevron-right"
            contentStyle={{ flexDirection: 'row-reverse' }}
            compact
            loading={isLoadingPage && page < totalPages}
          >
            Próxima
          </Button>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {filteredUsers.map(renderUserCard)}

        {loading && users.length > 0 && (
          <View style={styles.loadMoreContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.loadMoreText}>Carregando mais...</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal de Criar Usuário */}
      <Portal>
        <Dialog visible={createUserVisible} onDismiss={closeCreateUserModal}>
          <Dialog.Title>Criar Novo Usuário</Dialog.Title>
          
          {/* Botões no Topo */}
          <Dialog.Actions style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 8 }}>
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

          <Dialog.ScrollArea>
            <ScrollView 
              style={{ maxHeight: 400 }} 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <TextInput
                label="Nome *"
                value={newUserData.name}
                onChangeText={text => setNewUserData({ ...newUserData, name: text })}
                mode="outlined"
                style={{ marginBottom: 12 }}
                disabled={creating}
                error={!!validationErrors.name}
              />
              {validationErrors.name && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                  {validationErrors.name}
                </Text>
              )}
              
              <TextInput
                label="Email *"
                value={newUserData.email}
                onChangeText={text => setNewUserData({ ...newUserData, email: text })}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ marginBottom: 12 }}
                disabled={creating}
                error={!!validationErrors.email}
              />
              {validationErrors.email && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                  {validationErrors.email}
                </Text>
              )}
              
              <TextInput
                label="Senha *"
                value={newUserData.password}
                onChangeText={text => setNewUserData({ ...newUserData, password: text })}
                mode="outlined"
                secureTextEntry
                style={{ marginBottom: 12 }}
                disabled={creating}
                placeholder="Mínimo 6 caracteres"
                error={!!validationErrors.password}
              />
              {validationErrors.password && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                  {validationErrors.password}
                </Text>
              )}
              
              <TextInput
                label="Telefone (Opcional)"
                value={newUserData.phone}
                onChangeText={text => setNewUserData({ ...newUserData, phone: text })}
                mode="outlined"
                error={!!validationErrors.phone}
                keyboardType="phone-pad"
                style={{ marginBottom: 12 }}
                disabled={creating}
                placeholder="11999999999"
              />
              {validationErrors.phone && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                  {validationErrors.phone}
                </Text>
              )}
              
              <TextInput
                label="CPF (Opcional)"
                value={newUserData.cpf}
                onChangeText={text => setNewUserData({ ...newUserData, cpf: text, document_number: text })}
                mode="outlined"
                keyboardType="numeric"
                error={!!validationErrors.cpf}
                placeholder="12345678900"
                style={{ marginBottom: 12 }}
                disabled={creating}
              />
              {validationErrors.cpf && (
                <Text style={{ color: 'red', fontSize: 12, marginTop: -8, marginBottom: 8 }}>
                  {validationErrors.cpf}
                </Text>
              )}
              
              <Text style={{ fontSize: 12, color: '#666', marginTop: 8, marginBottom: 16 }}>
                * Campos obrigatórios
              </Text>
            </ScrollView>
          </Dialog.ScrollArea>
        </Dialog>
      </Portal>
    </View>
  );
}
