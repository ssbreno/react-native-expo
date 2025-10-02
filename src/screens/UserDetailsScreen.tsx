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
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminUser } from '../services/adminService';
import { vehicleService } from '../services/vehicleService';
import { Vehicle } from '../types';
import { Colors } from '../constants/colors';

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
  const theme = useTheme();

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      const [userResult, vehiclesResult] = await Promise.all([
        adminService.getUserDetails(userId),
        vehicleService.getUserVehicles() // This might need to be modified to accept userId
      ]);

      console.log('👤 User details:', userResult);
      console.log('🚗 User vehicles:', vehiclesResult);

      if (userResult.success && userResult.data) {
        setUser(userResult.data);
      } else {
        Alert.alert('Erro', userResult.error || 'Erro ao carregar dados do usuário');
      }

      // For now, we'll try to get vehicles but it may fail if endpoint doesn't support userId
      if (vehiclesResult.success && vehiclesResult.data) {
        setUserVehicles(vehiclesResult.data);
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
          <Title style={styles.sectionTitle}>Informações de Contato</Title>
          <View style={styles.infoItem}>
            <Ionicons name="mail-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="phone-portrait-outline" size={20} color="#666" />
            <Text style={styles.infoText}>{user.phone || 'Não informado'}</Text>
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

      {/* Vehicle Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Veículos do Usuário</Title>
          {userVehicles.length > 0 ? (
            userVehicles.map((vehicle) => (
              <View key={vehicle.id} style={styles.vehicleItem}>
                <View style={styles.vehicleHeader}>
                  <Ionicons name="car-outline" size={24} color={theme.colors.primary} />
                  <Text style={styles.vehicleName}>
                    {vehicle.brand} {vehicle.model} {vehicle.year}
                  </Text>
                </View>
                <Text style={styles.vehicleDetail}>Placa: {vehicle.plate}</Text>
                <Text style={styles.vehicleDetail}>
                  Status: <Text style={{ color: getStatusColor(vehicle.status) }}>
                    {vehicle.status}
                  </Text>
                </Text>
                {vehicle.rentalExpiration && (
                  <Text style={styles.vehicleDetail}>
                    Vencimento: {formatDate(vehicle.rentalExpiration)}
                  </Text>
                )}
                <Divider style={styles.vehicleDivider} />
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

      {/* Admin Actions */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Ações Administrativas</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="contained"
              onPress={() => updateUserStatus('active')}
              disabled={updatingStatus || user.status === 'active'}
              style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
            >
              Ativar Usuário
            </Button>
            <Button
              mode="contained"
              onPress={() => updateUserStatus('inactive')}
              disabled={updatingStatus || user.status === 'inactive'}
              style={[styles.actionButton, { backgroundColor: '#FF9800' }]}
            >
              Inativar Usuário
            </Button>
            <Button
              mode="contained"
              onPress={() => updateUserStatus('suspended')}
              disabled={updatingStatus || user.status === 'suspended'}
              style={[styles.actionButton, { backgroundColor: '#F44336' }]}
            >
              Suspender Usuário
            </Button>
          </View>
        </Card.Content>
      </Card>
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
});
