import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  RefreshControl
} from 'react-native';
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
  TextInput as PaperTextInput
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminUser } from '../../services/adminService';
import { formatCurrency } from '../../utils/dateUtils';
import { vehicleService } from '../../services/vehicleService';
import { Vehicle } from '../../types';
import { Colors } from '../../constants/colors';

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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [editPaymentVisible, setEditPaymentVisible] = useState(false);
  const [weeklyAmount, setWeeklyAmount] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  
  // Edit user info states
  const [editUserVisible, setEditUserVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      // Load user details and payment status in parallel
      const [userResult, paymentStatusResult] = await Promise.all([
        adminService.getUserDetails(userId),
        adminService.getUsersWithPaymentStatus()
      ]);

      console.log('👤 User details result:', JSON.stringify(userResult, null, 2));
      console.log('💰 Payment status result:', JSON.stringify(paymentStatusResult, null, 2));

      if (userResult.success && userResult.data) {
        console.log('✅ Setting user data:', userResult.data);
        console.log('📧 Email:', userResult.data.email);
        console.log('📱 Phone:', userResult.data.phone);
        console.log('📍 Address:', userResult.data.address);
        console.log('💰 Weekly amount:', userResult.data.weekly_amount);
        console.log('💵 Monthly amount:', userResult.data.monthly_amount);
        console.log('🚗 Vehicles:', userResult.data.vehicles);
        
        let userData = userResult.data;
        
        // Merge payment status data - try multiple comparison methods
        if (paymentStatusResult.success && paymentStatusResult.data) {
          console.log('🔍 Searching for user ID:', userId, 'Type:', typeof userId);
          console.log('📋 Available users:', paymentStatusResult.data.map((u: AdminUser) => ({ id: u.id, type: typeof u.id })));
          
          // Try multiple matching strategies
          const paymentData = paymentStatusResult.data.find((u: AdminUser) => {
            const match1 = u.id.toString() === userId.toString();
            const match2 = u.id === parseInt(userId);
            const match3 = u.id.toString() === userId;
            
            console.log(`Comparing user ${u.id} with ${userId}: match1=${match1}, match2=${match2}, match3=${match3}`);
            
            return match1 || match2 || match3;
          });
          
          if (paymentData) {
            console.log('✅ Found payment data:', paymentData);
            userData = { ...userData, ...paymentData };
            console.log('💳 Payment status merged:', userData.payment_status);
          } else {
            console.log('⚠️ No payment data found for user ID:', userId);
            // Set default if no payment data found
            userData.payment_status = 'no_payments';
          }
        }
        
        setUser(userData);
        
        // Set vehicles from user data if available
        if (userData.vehicles && Array.isArray(userData.vehicles)) {
          console.log('🚙 Setting vehicles from user data:', userData.vehicles);
          setUserVehicles(userData.vehicles);
        } else {
          console.log('⚠️ No vehicles found in user data');
          setUserVehicles([]);
        }
      } else {
        console.error('❌ User details error:', userResult.error);
        Alert.alert('Erro', userResult.error || 'Erro ao carregar dados do usuário');
      }

    } catch (error) {
      console.error('Erro ao carregar detalhes:', error);
      Alert.alert('Erro', 'Erro ao carregar dados do usuário');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
        setUser(prev => prev ? { ...prev, status: newStatus } : null);
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
            monthly_amount: monthly !== undefined ? monthly : prev.monthly_amount
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
    setEditUserVisible(true);
  };

  const closeEditUserDialog = () => {
    setEditUserVisible(false);
    setEditName('');
    setEditEmail('');
    setEditPhone('');
    setEditAddress('');
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

    setSavingUser(true);
    try {
      const result = await adminService.updateUserInfo(userId, {
        name: editName,
        email: editEmail,
        phone: editPhone,
        address: editAddress
      });
      
      if (result.success) {
        setUser(prev => prev ? {
          ...prev,
          name: editName,
          email: editEmail,
          phone: editPhone,
          address: editAddress
        } : null);
        closeEditUserDialog();
        Alert.alert('Sucesso', result.message || 'Informações atualizadas com sucesso');
      } else {
        Alert.alert('Erro', result.error || 'Erro ao atualizar informações');
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      Alert.alert('Erro', 'Erro ao atualizar informações do usuário');
    } finally {
      setSavingUser(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'inactive': return '#FF9800';
      case 'suspended': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'suspended': return 'Suspenso';
      default: return 'Desconhecido';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'up_to_date': return { bg: '#E8F5E8', text: '#2E7D32', icon: '#4CAF50' };
      case 'overdue': return { bg: '#FFEBEE', text: '#D32F2F', icon: '#F44336' };
      case 'no_payments': return { bg: '#FFF3E0', text: '#F57C00', icon: '#FF9800' };
      default: return { bg: '#F5F5F5', text: '#757575', icon: '#757575' };
    }
  };

  const getPaymentStatusText = (status?: string) => {
    switch (status) {
      case 'up_to_date': return 'Em Dia';
      case 'overdue': return 'Vencido';
      case 'no_payments': return 'Sem Pagamentos';
      default: return 'Indefinido';
    }
  };

  const getPaymentStatusIcon = (status?: string) => {
    switch (status) {
      case 'up_to_date': return 'checkmark-circle';
      case 'overdue': return 'alert-circle';
      case 'no_payments': return 'information-circle';
      default: return 'help-circle';
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
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
              <View style={styles.statusContainer}>
                <Chip
                  mode="outlined"
                  textStyle={{ color: getStatusColor(user.status), fontSize: 12 }}
                  style={{ 
                    borderColor: getStatusColor(user.status),
                    marginTop: 8 
                  }}
                >
                  {getStatusText(user.status)}
                </Chip>
                {user.is_admin && (
                  <Chip
                    mode="flat"
                    textStyle={{ color: Colors.primary, fontSize: 12 }}
                    style={{ 
                      backgroundColor: '#E3F2FD',
                      marginTop: 8,
                      marginLeft: 8
                    }}
                  >
                    Administrador
                  </Chip>
                )}
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Contact Info */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.sectionHeader}>
            <Title style={styles.sectionTitle}>Informações de Contato</Title>
            <Button
              mode="outlined"
              onPress={openEditUserDialog}
              icon="pencil"
              compact
            >
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
              {user.document_type?.toUpperCase()}: {user.document_number || user.cpf || 'Não informado'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              Criado em: {formatDateTime(user.created_at)}
            </Text>
          </View>
          {user.updated_at && (
            <View style={styles.infoItem}>
              <Ionicons name="sync-outline" size={20} color="#666" />
              <Text style={styles.infoText}>
                Atualizado: {formatDateTime(user.updated_at)}
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Payment Status */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Status do Pagamento Atual</Title>
          <View style={[styles.paymentStatusContainer, { backgroundColor: getPaymentStatusColor(user.payment_status).bg }]}>
            <View style={styles.paymentStatusHeader}>
              <Ionicons 
                name={getPaymentStatusIcon(user.payment_status) as any} 
                size={32} 
                color={getPaymentStatusColor(user.payment_status).icon} 
              />
              <View style={styles.paymentStatusInfo}>
                <Text style={styles.paymentStatusLabel}>Status Atual</Text>
                <Text style={[styles.paymentStatusValue, { color: getPaymentStatusColor(user.payment_status).text }]}>
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
                      <Text style={styles.overdueValue}>{formatCurrency(user.pending_amount || 0)}</Text>
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
            <Button
              mode="outlined"
              onPress={openEditPaymentDialog}
              icon="pencil"
              compact
            >
              Editar
            </Button>
          </View>
          <Divider style={{ marginVertical: 12 }} />
          <View style={styles.paymentAmountsGrid}>
            <Surface style={styles.amountCard}>
              <Ionicons name="calendar-outline" size={32} color={theme.colors.primary} />
              <Text style={styles.amountLabel}>Valor Semanal</Text>
              <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
                {user.weekly_amount 
                  ? `R$ ${user.weekly_amount.toFixed(2).replace('.', ',')}` 
                  : 'Não definido'}
              </Text>
            </Surface>
            <Surface style={styles.amountCard}>
              <Ionicons name="calendar" size={32} color={theme.colors.primary} />
              <Text style={styles.amountLabel}>Valor Mensal</Text>
              <Text style={[styles.amountValue, { color: theme.colors.primary }]}>
                {user.monthly_amount 
                  ? `R$ ${user.monthly_amount.toFixed(2).replace('.', ',')}` 
                  : 'Não definido'}
              </Text>
            </Surface>
          </View>
        </Card.Content>
      </Card>

      {/* Vehicle Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Veículos do Usuário</Title>
          {userVehicles.length > 0 ? (
            userVehicles.map((vehicle) => (
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
                      borderColor: getStatusColor(vehicle.status)
                    }}
                    textStyle={{ 
                      color: getStatusColor(vehicle.status),
                      fontSize: 11,
                      fontWeight: '600'
                    }}
                  >
                    {vehicle.status === 'available' ? 'Disponível' : 
                     vehicle.status === 'rented' ? 'Alugado' : 
                     vehicle.status === 'maintenance' ? 'Manutenção' : vehicle.status}
                  </Chip>
                </View>

                <Divider style={{ marginVertical: 12 }} />

                <View style={styles.vehicleDetailsGrid}>
                  <View style={styles.vehicleDetailRow}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.vehicleDetailLabel}>Ano:</Text>
                    <Text style={styles.vehicleDetailValue}>
                      {vehicle.manufacture_year || vehicle.year}/{vehicle.model_year || vehicle.year}
                    </Text>
                  </View>

                  <View style={styles.vehicleDetailRow}>
                    <Ionicons name="color-palette-outline" size={16} color="#666" />
                    <Text style={styles.vehicleDetailLabel}>Cor:</Text>
                    <Text style={styles.vehicleDetailValue}>{vehicle.color || 'N/A'}</Text>
                  </View>

                  {vehicle.chassis && (
                    <View style={styles.vehicleDetailRow}>
                      <Ionicons name="barcode-outline" size={16} color="#666" />
                      <Text style={styles.vehicleDetailLabel}>Chassi:</Text>
                      <Text style={styles.vehicleDetailValue}>{vehicle.chassis}</Text>
                    </View>
                  )}

                  {vehicle.fuel_type && (
                    <View style={styles.vehicleDetailRow}>
                      <Ionicons name="water-outline" size={16} color="#666" />
                      <Text style={styles.vehicleDetailLabel}>Combustível:</Text>
                      <Text style={styles.vehicleDetailValue}>
                        {vehicle.fuel_type === 'gasoline' ? 'Gasolina' :
                         vehicle.fuel_type === 'ethanol' ? 'Etanol' :
                         vehicle.fuel_type === 'flex' ? 'Flex' :
                         vehicle.fuel_type === 'diesel' ? 'Diesel' : vehicle.fuel_type}
                      </Text>
                    </View>
                  )}

                  {vehicle.price && (
                    <View style={styles.vehicleDetailRow}>
                      <Ionicons name="cash-outline" size={16} color="#666" />
                      <Text style={styles.vehicleDetailLabel}>Valor:</Text>
                      <Text style={[styles.vehicleDetailValue, { color: theme.colors.primary, fontWeight: '600' }]}>
                        R$ {vehicle.price.toFixed(2).replace('.', ',')}
                      </Text>
                    </View>
                  )}

                  {vehicle.description && (
                    <View style={[styles.vehicleDetailRow, { marginTop: 8 }]}>
                      <Ionicons name="information-circle-outline" size={16} color="#666" />
                      <Text style={styles.vehicleDetailLabel}>Descrição:</Text>
                      <Text style={[styles.vehicleDetailValue, { flex: 1 }]}>{vehicle.description}</Text>
                    </View>
                  )}
                </View>

                {vehicle.rentalExpiration && (
                  <View style={{ marginTop: 12, padding: 8, backgroundColor: '#FFF3E0', borderRadius: 6 }}>
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
        </Card.Content>
      </Card>


      {/* Edit Payment Dialog */}
      <Portal>
        <Dialog visible={editPaymentVisible} onDismiss={closeEditPaymentDialog}>
          <Dialog.Title>Editar Valores de Pagamento</Dialog.Title>
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
          <Dialog.Actions>
            <Button onPress={closeEditPaymentDialog} disabled={savingPayment}>
              Cancelar
            </Button>
            <Button 
              onPress={savePaymentAmounts} 
              disabled={savingPayment}
              loading={savingPayment}
            >
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>

        {/* Edit User Info Dialog */}
        <Dialog visible={editUserVisible} onDismiss={closeEditUserDialog}>
          <Dialog.Title>Editar Informações do Usuário</Dialog.Title>
          <Dialog.Content>
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
              style={{ marginBottom: 12 }}
              left={<PaperTextInput.Icon icon="email" />}
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
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeEditUserDialog} disabled={savingUser}>
              Cancelar
            </Button>
            <Button 
              onPress={saveUserInfo} 
              disabled={savingUser}
              loading={savingUser}
            >
              Salvar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginVertical: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  vehicleItem: {
    marginBottom: 16,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  vehicleDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginLeft: 32,
  },
  vehicleDivider: {
    marginTop: 12,
  },
  noVehicles: {
    alignItems: 'center',
    padding: 32,
  },
  noVehiclesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginVertical: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentAmountsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  amountCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    backgroundColor: 'white',
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  vehiclePlate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    letterSpacing: 1,
  },
  vehicleDetailsGrid: {
    gap: 8,
  },
  vehicleDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vehicleDetailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    marginLeft: 4,
  },
  vehicleDetailValue: {
    fontSize: 13,
    color: '#333',
    fontWeight: '400',
  },
  paymentStatusContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  paymentStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  paymentStatusInfo: {
    flex: 1,
  },
  paymentStatusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  paymentStatusValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  overdueDetails: {
    marginTop: 8,
  },
  overdueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  overdueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  overdueLabel: {
    fontSize: 12,
    color: '#D32F2F',
    marginBottom: 4,
  },
  overdueValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  },
  upToDateDetails: {
    marginTop: 8,
  },
  upToDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upToDateLabel: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 4,
  },
  upToDateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});
