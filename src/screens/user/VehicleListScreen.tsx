import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Text,
  ActivityIndicator,
  Button,
  Surface,
  useTheme
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useVehicle } from '../../contexts/VehicleContext';
import { Vehicle, Payment } from '../../types';
import { formatCurrency, formatDate } from '../../utils/dateUtils';

const { width } = Dimensions.get('window');

interface VehicleListScreenProps {
  navigation: any;
}

export default function VehicleListScreen({ navigation }: VehicleListScreenProps) {
  const { vehicles, loading, refreshData, getPendingPayments } = useVehicle();
  const theme = useTheme();

  useEffect(() => {
    refreshData();
  }, []);

  const handleVehiclePress = (vehicleId: string) => {
    navigation.navigate('VehicleDetail', { vehicleId });
  };

  // Get payment status for a vehicle
  const getVehiclePaymentStatus = (vehicleId: number) => {
    const pendingPayments = getPendingPayments();
    const vehiclePayments = pendingPayments.filter(payment => 
      payment.vehicle_id === vehicleId || parseInt(payment.vehicleId || '0') === vehicleId
    );
    
    if (vehiclePayments.length === 0) {
      // Create a default next payment date (30 days from now)
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      return { 
        status: 'upcoming', 
        text: formatDate(nextMonth.toISOString()).split('/').slice(0, 2).join('/'), 
        color: '#4caf50', 
        days: 30,
        dueDate: formatDate(nextMonth.toISOString())
      };
    }
    
    // Find the next due payment
    const nextPayment = vehiclePayments
      .sort((a, b) => new Date(a.due_date || a.dueDate || '').getTime() - new Date(b.due_date || b.dueDate || '').getTime())[0];
    
    const dueDate = new Date(nextPayment.due_date || nextPayment.dueDate || '');
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      // Overdue
      return {
        status: 'overdue',
        text: `${Math.abs(diffDays)} dias atrasado`,
        color: '#f44336',
        days: Math.abs(diffDays),
        dueDate: formatDate(dueDate.toISOString())
      };
    } else if (diffDays === 0) {
      // Due today
      return {
        status: 'due_today',
        text: 'Vence hoje',
        color: '#ff9800',
        days: 0,
        dueDate: formatDate(dueDate.toISOString())
      };
    } else {
      // Future due date
      return {
        status: 'upcoming',
        text: `${diffDays} dias`,
        color: '#4caf50',
        days: diffDays,
        dueDate: formatDate(dueDate.toISOString())
      };
    }
  };

  const renderVehicleCard = ({ item }: { item: Vehicle }) => {
    // Get vehicle name from API fields
    const vehicleName = `${item.brand} ${item.model}`;
    const displayYear = item.manufacture_year || item.model_year || 'N/A';
    
    // Status mapping from API to display
    const getStatusDisplay = (status: string) => {
      switch (status) {
        case 'available': return { text: 'DISPONÍVEL', color: '#4caf50' };
        case 'rented': return { text: 'ALUGADO', color: '#ff9800' };
        case 'maintenance': return { text: 'MANUTENÇÃO', color: '#f44336' };
        default: return { text: status.toUpperCase(), color: '#666' };
      }
    };

    const statusDisplay = getStatusDisplay(item.status);
    const paymentStatus = getVehiclePaymentStatus(item.id);

    return (
      <TouchableOpacity
        onPress={() => handleVehiclePress(item.id.toString())}
        style={styles.cardContainer}
      >
        <Card style={styles.card}>
          <View style={styles.cardContent}>
            {/* Vehicle Icon (since no image in API) */}
            <View style={styles.vehicleImagePlaceholder}>
              <Ionicons name="car" size={40} color="#666" />
            </View>
            
            {/* Vehicle Info */}
            <View style={styles.vehicleInfo}>
              <Title style={styles.vehicleName} numberOfLines={2}>
                {vehicleName}
              </Title>
              
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Ionicons name="card" size={16} color="#666" />
                  <Text style={styles.detailText}>{item.license_plate}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="color-palette" size={16} color="#666" />
                  <Text style={styles.detailText}>{item.color}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Ionicons name="calendar" size={16} color="#666" />
                  <Text style={styles.detailText}>{displayYear}</Text>
                </View>
              </View>

              {/* Price */}
              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>Mensalidade:</Text>
                <Text style={[styles.price, { color: theme.colors.primary }]}>
                  {formatCurrency(item.price)}
                </Text>
              </View>

              {/* Vencimento Status */}
              <View style={styles.statusContainer}>
                <Text style={styles.expirationLabel}>Vencimento:</Text>
                <Surface style={[
                  styles.expirationChip, 
                  { backgroundColor: paymentStatus.status === 'overdue' ? '#ffebee' : paymentStatus.status === 'due_today' ? '#fff3e0' : '#e8f5e8' }
                ]}>
                  <Text style={[styles.expirationText, { color: paymentStatus.color }]}>
                    {paymentStatus.text}
                  </Text>
                </Surface>
              </View>

              {/* Status Badge */}
              <Chip
                mode="outlined"
                style={[
                  styles.statusChip,
                  { borderColor: statusDisplay.color }
                ]}
                textStyle={{ color: statusDisplay.color }}
              >
                {statusDisplay.text}
              </Chip>
            </View>
          </View>

          {/* Action Button */}
          <Card.Actions style={styles.cardActions}>
            <Button
              mode="outlined"
              onPress={() => handleVehiclePress(item.id.toString())}
              icon="arrow-right"
              contentStyle={styles.buttonContent}
            >
              Ver Detalhes
            </Button>
          </Card.Actions>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color="#ccc" />
      <Title style={styles.emptyTitle}>Nenhum veículo encontrado</Title>
      <Paragraph style={styles.emptyText}>
        Você ainda não possui veículos alugados.
      </Paragraph>
      <Button
        mode="contained"
        onPress={refreshData}
        style={styles.retryButton}
      >
        Atualizar
      </Button>
    </View>
  );

  if (loading && vehicles.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando veículos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header}>
        <Title style={styles.headerTitle}>Meus Veículos</Title>
        <Text style={styles.headerSubtitle}>
          {vehicles.length} veículo{vehicles.length !== 1 ? 's' : ''} alugado{vehicles.length !== 1 ? 's' : ''}
        </Text>
      </Surface>

      {/* Vehicle List */}
      <FlatList
        data={vehicles}
        renderItem={renderVehicleCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContainer,
          vehicles.length === 0 && styles.emptyListContainer
        ]}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshData}
            colors={[theme.colors.primary]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    elevation: 2,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  listContainer: {
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
  },
  cardContainer: {
    marginBottom: 16,
  },
  card: {
    elevation: 4,
    backgroundColor: 'white',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  vehicleImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 16,
  },
  vehicleImagePlaceholder: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  vehicleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailsContainer: {
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  expirationLabel: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  expirationChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 1,
  },
  expirationText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  buttonContent: {
    paddingVertical: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
  },
});
