import React, { useEffect, useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import {
  Card,
  Title,
  Text,
  Button,
  Chip,
  Surface,
  ActivityIndicator,
  useTheme,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { useVehicle } from '../../contexts/VehicleContext';
import { Vehicle, Payment, RootStackParamList } from '../../types';
import { formatCurrency, getPaymentStatus } from '../../utils/dateUtils';
import PixPaymentModal from '../../components/PixPaymentModal';
import { paymentService, PixPaymentData } from '../../services/paymentService';
import { styles } from './VehicleDetailScreen.styles';

type VehicleDetailScreenProps = StackScreenProps<RootStackParamList, 'VehicleDetail'>;

export default function VehicleDetailScreen({ route, navigation }: VehicleDetailScreenProps) {
  const { vehicleId } = route.params;
  const { getVehicleById, getPaymentsByVehicle, processPayment, refreshData } = useVehicle();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [pixPaymentData, setPixPaymentData] = useState<PixPaymentData | null>(null);
  const [generatingPix, setGeneratingPix] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    loadVehicleData();
  }, [vehicleId]);

  const loadVehicleData = async () => {
    setLoading(true);
    try {
      await refreshData();
      console.log(`[VehicleDetail] Loading vehicle ${vehicleId}`);
      const vehicleData = getVehicleById(vehicleId);
      const vehiclePayments = getPaymentsByVehicle(vehicleId);

      console.log(`[VehicleDetail] Vehicle found:`, vehicleData);
      console.log(`[VehicleDetail] Vehicle payments:`, vehiclePayments);

      setVehicle(vehicleData || null);
      setPayments(vehiclePayments);
    } catch (error) {
      console.error('Erro ao carregar dados do veículo:', error);
      Alert.alert('Erro', 'Falha ao carregar dados do veículo');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (payment: Payment) => {
    setGeneratingPix(true);
    setProcessingPayment(parseInt(payment.id.toString()));

    try {
      console.log('[VehicleDetail] Gerando pagamento PIX para:', payment.id);

      // Tenta obter QR code existente primeiro
      let result = await paymentService.getPixQRCode(payment.id);

      // Se não existir, gera novo
      if (!result.success) {
        console.log('[VehicleDetail] Gerando novo QR code PIX');
        result = await paymentService.generatePixQRCode(payment.id);
      }

      if (result.success && result.data) {
        console.log('[VehicleDetail] QR code PIX obtido com sucesso');
        setPixPaymentData(result.data);
        setPixModalVisible(true);
      } else {
        console.error('[VehicleDetail] Falha ao gerar PIX:', result.error);
        Alert.alert('Erro', result.error || 'Erro ao gerar pagamento PIX');
      }
    } catch (error) {
      console.error('[VehicleDetail] Erro ao processar pagamento:', error);
      Alert.alert('Erro', 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setGeneratingPix(false);
      setProcessingPayment(null);
    }
  };

  const handlePixPaymentConfirmed = () => {
    setPixModalVisible(false);
    setPixPaymentData(null);
    loadVehicleData();
  };

  const handlePixModalDismiss = () => {
    setPixModalVisible(false);
    setPixPaymentData(null);
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
        <Text style={styles.errorText}>Não foi possível encontrar os detalhes deste veículo.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text>Voltar</Text>
        </Button>
      </View>
    );
  }

  // Since API doesn't have rental expiration, use a placeholder
  const expirationStatus = { color: '#4caf50', text: '0 dias', backgroundColor: '#e8f5e8' };
  const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'overdue');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Vehicle Icon Placeholder */}
      <View style={styles.vehicleImagePlaceholder}>
        <Ionicons name="car" size={80} color="#666" />
      </View>

      {/* Vehicle Info Card */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title style={styles.vehicleName}>{`${vehicle.brand} ${vehicle.model}`}</Title>

          <View style={styles.basicInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="car" size={20} color="#666" />
              <Text style={styles.infoLabel}>Placa:</Text>
              <Text style={styles.infoValue}>{vehicle.license_plate || 'N/A'}</Text>
            </View>

            {!!vehicle.color && (
              <View style={styles.infoRow}>
                <Ionicons name="color-palette" size={20} color="#666" />
                <Text style={styles.infoLabel}>Cor:</Text>
                <Text style={styles.infoValue}>{vehicle.color}</Text>
              </View>
            )}

            {vehicle.manufacture_year && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar" size={20} color="#666" />
                <Text style={styles.infoLabel}>Ano:</Text>
                <Text style={styles.infoValue}>{vehicle.manufacture_year}</Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Ionicons name="business" size={20} color="#666" />
              <Text style={styles.infoLabel}>Marca:</Text>
              <Text style={styles.infoValue}>{vehicle.brand}</Text>
            </View>

            {vehicle.fuel_type && (
              <View style={styles.infoRow}>
                <Ionicons name="speedometer" size={20} color="#666" />
                <Text style={styles.infoLabel}>Combustível:</Text>
                <Text style={styles.infoValue}>{vehicle.fuel_type}</Text>
              </View>
            )}
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
                {formatCurrency(vehicle.price)}
              </Text>
            </View>

            <View style={styles.expirationContainer}>
              <Text style={styles.expirationLabel}>Status do Contrato:</Text>
              <Surface
                style={[
                  styles.expirationChip,
                  { backgroundColor: expirationStatus.backgroundColor },
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
                    borderColor: vehicle.status === 'ativo' ? '#4caf50' : '#ff9800',
                  },
                ]}
                textStyle={{
                  color: vehicle.status === 'ativo' ? '#4caf50' : '#ff9800',
                }}
              >
                {vehicle.status === 'ativo' ? 'ATIVO' : vehicle.status.toUpperCase()}
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
            {vehicle.features && vehicle.features.length > 0 ? (
              vehicle.features.map((feature, index) => (
                <Chip key={index} mode="outlined" style={styles.featureChip} icon="check">
                  {feature}
                </Chip>
              ))
            ) : (
              <Text style={styles.noFeaturesText}>Nenhuma característica especial listada</Text>
            )}
          </View>
        </Card.Content>
      </Card>

      {/* Pending Payments Card */}
      {pendingPayments.length > 0 && (
        <Card style={styles.paymentsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Pagamentos Pendentes</Title>
            {pendingPayments.map(payment => {
              const status = getPaymentStatus({
                ...payment,
                dueDate: payment.dueDate || payment.due_date || new Date().toISOString(),
              });
              const isProcessing = processingPayment === parseInt(payment.id.toString());

              return (
                <Surface key={payment.id} style={styles.paymentItem}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentDescription}>{payment.description}</Text>
                      <Text style={styles.paymentDueDate}>
                        Vencimento:{' '}
                        {new Date(payment.dueDate || payment.due_date || '').toLocaleDateString(
                          'pt-BR'
                        )}
                      </Text>
                    </View>

                    <View style={styles.paymentAmount}>
                      <Text style={[styles.amount, { color: theme.colors.primary }]}>
                        {formatCurrency(payment.amount)}
                      </Text>
                      <Surface
                        style={[
                          styles.paymentStatusChip,
                          { backgroundColor: status.backgroundColor },
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
                      {
                        backgroundColor:
                          payment.status === 'overdue' ? '#f44336' : theme.colors.primary,
                      },
                    ]}
                    disabled={isProcessing || generatingPix}
                    contentStyle={styles.payButtonContent}
                  >
                    {isProcessing || generatingPix ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text>{`Pagar ${formatCurrency(payment.amount)} via PIX`}</Text>
                    )}
                  </Button>
                </Surface>
              );
            })}
          </Card.Content>
        </Card>
      )}

      <View style={styles.bottomSpacing} />

      {/* PIX Payment Modal */}
      <PixPaymentModal
        visible={pixModalVisible}
        onDismiss={handlePixModalDismiss}
        paymentData={pixPaymentData}
        onPaymentConfirmed={handlePixPaymentConfirmed}
      />
    </ScrollView>
  );
}
