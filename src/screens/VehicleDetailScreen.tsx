import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Dimensions
} from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  Surface,
  ActivityIndicator,
  useTheme,
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useVehicle } from '../contexts/VehicleContext';
import { Vehicle, Payment } from '../types';
import { formatCurrency, getExpirationStatus, getPaymentStatus } from '../utils/dateUtils';

const { width } = Dimensions.get('window');

interface VehicleDetailScreenProps {
  route: {
    params: {
      vehicleId: string;
    };
  };
  navigation: any;
}

export default function VehicleDetailScreen({ route, navigation }: VehicleDetailScreenProps) {
  const { vehicleId } = route.params;
  const { getVehicleById, getPaymentsByVehicle, processPayment, refreshData } = useVehicle();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const theme = useTheme();

  useEffect(() => {
    loadVehicleData();
  }, [vehicleId]);

  const loadVehicleData = async () => {
    setLoading(true);
    try {
      await refreshData();
      const vehicleData = getVehicleById(vehicleId);
      const vehiclePayments = getPaymentsByVehicle(vehicleId);
      
      setVehicle(vehicleData || null);
      setPayments(vehiclePayments);
    } catch (error) {
      console.error('Erro ao carregar dados do veículo:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do veículo');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (payment: Payment) => {
    Alert.alert(
      'Processar Pagamento',
      `Deseja pagar ${formatCurrency(payment.amount)} para ${payment.vehicleName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'PIX', onPress: () => processPaymentWithMethod(payment.id, 'PIX') },
        { text: 'Cartão', onPress: () => processPaymentWithMethod(payment.id, 'Cartão de Crédito') },
        { text: 'Boleto', onPress: () => processPaymentWithMethod(payment.id, 'Boleto') }
      ]
    );
  };

  const processPaymentWithMethod = async (paymentId: string, method: any) => {
    setProcessingPayment(paymentId);
    
    try {
      const result = await processPayment(paymentId, method);
      
      if (result.success) {
        Alert.alert(
          'Sucesso!',
          result.message || 'Pagamento processado com sucesso!',
          [{ text: 'OK', onPress: loadVehicleData }]
        );
      } else {
        Alert.alert(
          'Erro',
          result.error || 'Falha ao processar pagamento. Tente novamente.'
        );
      }
    } catch (error) {
      Alert.alert('Erro', 'Erro interno. Tente novamente.');
    } finally {
      setProcessingPayment(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#f44336" />
        <Title style={styles.errorTitle}>Veículo não encontrado</Title>
        <Text style={styles.errorText}>
          Não foi possível encontrar os detalhes deste veículo.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          Voltar
        </Button>
      </View>
    );
  }

  const expirationStatus = getExpirationStatus(vehicle.rentalExpiration);
  const pendingPayments = payments.filter(p => p.status === 'pendente' || p.status === 'vencido');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Vehicle Image */}
      <Image source={{ uri: vehicle.imageUrl }} style={styles.vehicleImage} />

      {/* Vehicle Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.vehicleName}>{vehicle.name}</Title>
          
          <View style={styles.basicInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="car" size={20} color="#666" />
              <Text style={styles.infoLabel}>Placa:</Text>
              <Text style={styles.infoValue}>{vehicle.plate}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="color-palette" size={20} color="#666" />
              <Text style={styles.infoLabel}>Cor:</Text>
              <Text style={styles.infoValue}>{vehicle.color}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="calendar" size={20} color="#666" />
              <Text style={styles.infoLabel}>Ano:</Text>
              <Text style={styles.infoValue}>{vehicle.year}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color="#666" />
              <Text style={styles.infoLabel}>Marca:</Text>
              <Text style={styles.infoValue}>{vehicle.brand}</Text>
            </View>
          </View>

          {vehicle.description && (
            <>
              <Divider style={styles.divider} />
              <Text style={styles.description}>{vehicle.description}</Text>
            </>
          )}
        </Card.Content>
      </Card>

      {/* Rental Info Card */}
      <Card style={styles.rentalCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Informações do Aluguel</Title>
          
          <View style={styles.rentalInfo}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Valor Mensal:</Text>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                {formatCurrency(vehicle.monthlyPrice)}
              </Text>
            </View>
            
            <View style={styles.expirationContainer}>
              <Text style={styles.expirationLabel}>Status do Contrato:</Text>
              <Surface
                style={[
                  styles.expirationChip,
                  { backgroundColor: expirationStatus.backgroundColor }
                ]}
              >
                <Text style={[styles.expirationText, { color: expirationStatus.color }]}>
                  Vence em {expirationStatus.text}
                </Text>
              </Surface>
            </View>
            
            <View style={styles.statusContainer}>
              <Text style={styles.statusLabel}>Status do Veículo:</Text>
              <Chip
                mode="outlined"
                style={[
                  styles.statusChip,
                  {
                    borderColor: vehicle.status === 'ativo' ? '#4caf50' : '#ff9800'
                  }
                ]}
                textStyle={{
                  color: vehicle.status === 'ativo' ? '#4caf50' : '#ff9800'
                }}
              >
                {vehicle.status.toUpperCase()}
              </Chip>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Features Card */}
      <Card style={styles.featuresCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Características</Title>
          <View style={styles.featuresContainer}>
            {vehicle.features.map((feature, index) => (
              <Chip
                key={index}
                mode="outlined"
                style={styles.featureChip}
                icon="check"
              >
                {feature}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Pending Payments Card */}
      {pendingPayments.length > 0 && (
        <Card style={styles.paymentsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Pagamentos Pendentes</Title>
            {pendingPayments.map((payment) => {
              const status = getPaymentStatus(payment);
              const isProcessing = processingPayment === payment.id;
              
              return (
                <Surface key={payment.id} style={styles.paymentItem}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentDescription}>
                        {payment.description}
                      </Text>
                      <Text style={styles.paymentDueDate}>
                        Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    
                    <View style={styles.paymentAmount}>
                      <Text style={[styles.amount, { color: theme.colors.primary }]}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <Surface
                        style={[
                          styles.paymentStatusChip,
                          { backgroundColor: status.backgroundColor }
                        ]}
                      >
                        <Text style={[styles.paymentStatusText, { color: status.color }]}>
                          {status.text}
                        </Text>
                      </Surface>
                    </View>
                  </View>
                  
                  <Button
                    mode="contained"
                    onPress={() => handlePayment(payment)}
                    style={[
                      styles.payButton,
                      { backgroundColor: payment.status === 'vencido' ? '#f44336' : theme.colors.primary }
                    ]}
                    disabled={isProcessing}
                    contentStyle={styles.payButtonContent}
                  >
                    {isProcessing ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      `Pagar ${formatCurrency(payment.amount)}`
                    )}
                  </Button>
                </Surface>
              );
            })}
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  vehicleImage: {
    width: width,
    height: 250,
    resizeMode: 'cover',
  },
  infoCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 4,
  },
  vehicleName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  basicInfo: {
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 12,
    marginRight: 12,
    minWidth: 60,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  rentalCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  rentalInfo: {
    gap: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  expirationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expirationLabel: {
    fontSize: 16,
    color: '#666',
  },
  expirationChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    elevation: 1,
  },
  expirationText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  statusChip: {
    alignSelf: 'flex-end',
  },
  featuresCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 4,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  featureChip: {
    marginBottom: 8,
  },
  paymentsCard: {
    margin: 16,
    marginTop: 8,
    elevation: 4,
  },
  paymentItem: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    backgroundColor: 'white',
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
    marginRight: 16,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  paymentDueDate: {
    fontSize: 14,
    color: '#666',
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  paymentStatusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    elevation: 1,
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  payButton: {
    marginTop: 8,
  },
  payButtonContent: {
    paddingVertical: 8,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#f5f5f5',
  },
  errorTitle: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
  },
  bottomSpacing: {
    height: 32,
  },
});
