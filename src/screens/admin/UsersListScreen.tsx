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
      
      const result = await adminService.getAllUsers(pageNum, 20);
      console.log('👥 Users loaded:', result);

      if (result.success && result.data) {
        const allUsers = result.data.users || [];
        
        // Log para debug - verificar se license_plate está vindo
        if (allUsers.length > 0) {
          console.log('📋 UsersListScreen - Sample user data:', {
            name: allUsers[0].name,
            email: allUsers[0].email,
            license_plate: allUsers[0].license_plate,
            vehicle_name: allUsers[0].vehicle_name
          });
        }
        
        const regularUsers = allUsers.filter(user => {
          const isAdminByEmail = user.email?.includes('admin');
          const isAdminByName = user.name?.toLowerCase().includes('administrador');
          const isAdminByField = user.is_admin === true;
          
          const isAdmin = isAdminByEmail || isAdminByName || isAdminByField;
          return !isAdmin;
        });
        setUsers(reset ? regularUsers : [...users, ...regularUsers]);
        setTotal(regularUsers.length);
        setHasMore(regularUsers.length === 20);
        setPage(pageNum);
      } else {
        Alert.alert('Erro', result.error || 'Erro ao carregar usuários');
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

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUserCard = (user: AdminUser) => (
    <TouchableOpacity
      key={user.id}
      onPress={() => navigateToUserDetails(user.id.toString())}
      style={styles.userCardContainer}
    >
      <Card style={styles.userCard}>
        <Card.Content>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <Title style={styles.userName}>{user.name}</Title>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
            <View style={styles.userStatus}>
              <Chip
                mode="outlined"
                textStyle={{ color: getStatusColor(user.status), fontSize: 12 }}
                style={{ borderColor: getStatusColor(user.status) }}
              >
                {getStatusText(user.status)}
              </Chip>
            </View>
          </View>

          <View style={styles.userDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="phone-portrait-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{user.phone || 'Não informado'}</Text>
            </View>

            {user.license_plate && (
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={16} color={Colors.primary} />
                <Text style={[styles.detailText, { color: Colors.primary, fontWeight: '600' }]}>
                  {user.license_plate}
                </Text>
              </View>
            )}

            {user.total_payments !== undefined && (
              <View style={styles.detailItem}>
                <Ionicons name="card-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  {user.total_payments} pagamentos
                </Text>
              </View>
            )}

            {user.last_payment && (
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Último: {new Date(user.last_payment).toLocaleDateString('pt-BR')}
                </Text>
              </View>
            )}

            {user.is_admin && (
              <View style={styles.detailItem}>
                <Ionicons name="shield-checkmark-outline" size={16} color={Colors.primary} />
                <Text style={[styles.detailText, { color: Colors.primary }]}>
                  Administrador
                </Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

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
});
