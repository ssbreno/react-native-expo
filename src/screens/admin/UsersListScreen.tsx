import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  Alert,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import {
  Card,
  Title,
  Text,
  ActivityIndicator,
  Surface,
  useTheme,
  Chip,
  Searchbar,
  FAB
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { adminService, AdminUser } from '../../services/adminService';
import { formatCurrency } from '../../utils/dateUtils';
import { Colors } from '../../constants/colors';

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

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async (pageNum = 1, reset = true) => {
    try {
      if (reset) setLoading(true);
      
      // Load users with payment status information
      const [usersResult, paymentStatusResult] = await Promise.all([
        adminService.getAllUsers(pageNum, 100),
        adminService.getUsersWithPaymentStatus()
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
            payment_status: allUsers[0].payment_status
          });
        }
        
        const regularUsers = allUsers.filter((user: AdminUser) => {
          const isAdminByEmail = user.email?.includes('admin');
          const isAdminByName = user.name?.toLowerCase().includes('administrador');
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
      case 'up_to_date': return { bg: '#E8F5E8', text: '#2E7D32' };
      case 'overdue': return { bg: '#FFEBEE', text: '#D32F2F' };
      case 'no_payments': return { bg: '#FFF3E0', text: '#F57C00' };
      default: return { bg: '#F5F5F5', text: '#757575' };
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

  const filteredUsers = users.filter(user =>
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
                {user.vehicle_name && (
                  <View style={styles.vehicleItem}>
                    <Ionicons name="car-outline" size={16} color="#4CAF50" />
                    <Text style={styles.vehicleText}>{user.vehicle_name}</Text>
                  </View>
                )}
                {user.license_plate && (
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
                        ? new Date(user.last_payment).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                        : 'N/A'
                      }
                    </Text>
                  </View>
                </View>
              </View>

              {/* Overdue Information */}
              {user.payment_status === 'overdue' && (
                <View style={styles.overdueAlert}>
                  <View style={styles.overdueRow}>
                    <Ionicons name="time-outline" size={16} color="#D32F2F" />
                    <Text style={styles.overdueText}>
                      {user.days_overdue || 0} dias em atraso
                    </Text>
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onMomentumScrollEnd={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
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
    </View>
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
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    padding: 16,
  },
  searchBar: {
    elevation: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  userCardContainer: {
    marginBottom: 12,
  },
  userCard: {
    elevation: 2,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  userStatus: {
    marginLeft: 12,
  },
  userDetails: {
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  loadMoreText: {
    fontSize: 14,
    color: '#666',
  },
  userNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  phoneText: {
    fontSize: 13,
    color: '#666',
  },
  paymentStatusBadge: {
    marginTop: 12,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  vehicleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginVertical: 12,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  licensePlateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  licensePlateText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '700',
    letterSpacing: 1,
  },
  paymentInfoSection: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  paymentInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 16,
  },
  paymentInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  paymentInfoContent: {
    flex: 1,
  },
  paymentInfoLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  paymentInfoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  overdueAlert: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFCDD2',
    gap: 6,
  },
  overdueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  overdueText: {
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '500',
  },
  overdueAmount: {
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '700',
  },
});
