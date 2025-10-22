import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, Clipboard, Dimensions, ScrollView } from 'react-native';
import {
  Modal,
  Portal,
  Card,
  Title,
  Text,
  Button,
  Surface,
  ActivityIndicator,
  useTheme,
  Divider,
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { PixPaymentData, paymentService } from '../services/paymentService';
import { formatCurrency } from '../utils/dateUtils';
import { useVehicle } from '../contexts/VehicleContext';
import { Colors } from '../constants/colors';

interface PixPaymentModalProps {
  visible: boolean;
  onDismiss: () => void;
  paymentData: PixPaymentData | null;
  onPaymentConfirmed?: () => void;
}

const { width } = Dimensions.get('window');

export default function PixPaymentModal({
  visible,
  onDismiss,
  paymentData,
  onPaymentConfirmed,
}: PixPaymentModalProps) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [checkingPayment, setCheckingPayment] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<number>(5000); // Adaptive polling interval
  const [retryCount, setRetryCount] = useState<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastStatusCheckRef = useRef<number>(0);
  const theme = useTheme();
  const { updatePaymentStatus } = useVehicle();

  useEffect(() => {
    if (!paymentData?.expires_at) return;

    const calculateTimeLeft = () => {
      const expirationTime = new Date(
        paymentData.expires_at || new Date(Date.now() + 30 * 60 * 1000)
      ).getTime();
      const currentTime = new Date().getTime();
      const difference = expirationTime - currentTime;

      return Math.max(0, Math.floor(difference / 1000));
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData?.expires_at]);

  // Polling effect to check payment status automatically
  useEffect(() => {
    if (!visible || !paymentData?.payment_id) return;

    setPaymentStatus(paymentData.status || 'pending');

    const checkPaymentStatus = async () => {
      const now = Date.now();

      // Avoid duplicate calls within 2 seconds
      if (now - lastStatusCheckRef.current < 2000) {
        return;
      }
      lastStatusCheckRef.current = now;

      try {
        setCheckingPayment(true);
        // Use abacate_pay_id for checking status if available, otherwise fall back to payment_id
        const checkId = paymentData.abacate_pay_id || paymentData.payment_id.toString();
        console.log(`[PixPaymentModal] Verificando status com ID: ${checkId}`);
        const result = await paymentService.checkPaymentStatus(checkId);

        if (result.success && result.data) {
          const newStatus = result.data.status;
          setPaymentStatus(newStatus);
          setRetryCount(0); // Reset retry count on success

          // Optimize polling frequency based on status
          if (newStatus === 'pending') {
            setPollingInterval(5000); // Check every 5 seconds for pending
          } else if (newStatus === 'processing') {
            setPollingInterval(2000); // Check every 2 seconds when processing
          }

          // If payment is confirmed, notify and close modal
          if (newStatus === 'paid' || newStatus === 'confirmed') {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            // Update payment data in context
            try {
              await updatePaymentStatus(paymentData.payment_id);
            } catch (updateError) {
              console.warn('Falha ao atualizar dados locais:', updateError);
            }

            Alert.alert(
              'Pagamento Confirmado! ✅',
              'Seu pagamento PIX foi processado com sucesso!',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    onPaymentConfirmed?.();
                    onDismiss();
                  },
                },
              ]
            );
          }
        } else if (!result.success) {
          // Network error or API error - implement exponential backoff
          setRetryCount(prev => prev + 1);
          const backoffInterval = Math.min(30000, 5000 * Math.pow(1.5, retryCount));
          setPollingInterval(backoffInterval);
          // Silently retry - errors are expected during polling
        }
      } catch (error: any) {
        // Handle network connectivity issues with exponential backoff
        setRetryCount(prev => prev + 1);
        const backoffInterval = Math.min(30000, 5000 * Math.pow(1.5, retryCount));
        setPollingInterval(backoffInterval);

        // Silently handle connectivity issues during polling

        // Only stop polling if payment has expired
        if (timeLeft <= 0) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      } finally {
        setCheckingPayment(false);
      }
    };

    // Start adaptive polling
    const startPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      pollingIntervalRef.current = setInterval(checkPaymentStatus, pollingInterval);
    };

    startPolling();

    // Initial check
    checkPaymentStatus();

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [visible, paymentData?.payment_id, onPaymentConfirmed, onDismiss]);

  // Effect to update polling interval when it changes
  useEffect(() => {
    if (!visible || !pollingIntervalRef.current) return;

    // Restart polling with new interval
    clearInterval(pollingIntervalRef.current);
    pollingIntervalRef.current = setInterval(() => {
      // Only check if modal is still visible and payment not completed
      if (visible && paymentStatus !== 'paid' && paymentStatus !== 'confirmed') {
        const checkPaymentStatus = async () => {
          const now = Date.now();
          if (now - lastStatusCheckRef.current < 2000) return;
          lastStatusCheckRef.current = now;

          try {
            setCheckingPayment(true);
            // Use abacate_pay_id for checking status if available, otherwise fall back to payment_id
            const checkId =
              paymentData?.abacate_pay_id || paymentData?.payment_id?.toString() || '';
            console.log(`[PixPaymentModal] Verificando status (polling) com ID: ${checkId}`);
            const result = await paymentService.checkPaymentStatus(checkId);

            if (result.success && result.data) {
              const newStatus = result.data.status;
              setPaymentStatus(newStatus);
              setRetryCount(0);

              if (newStatus === 'paid' || newStatus === 'confirmed') {
                if (pollingIntervalRef.current) {
                  clearInterval(pollingIntervalRef.current);
                  pollingIntervalRef.current = null;
                }

                try {
                  await updatePaymentStatus(paymentData?.payment_id || 0);
                } catch (updateError) {
                  console.warn('Falha ao atualizar dados locais:', updateError);
                }

                Alert.alert(
                  'Pagamento Confirmado! ✅',
                  'Seu pagamento PIX foi processado com sucesso!',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        onPaymentConfirmed?.();
                        onDismiss();
                      },
                    },
                  ]
                );
              }
            }
          } catch (error) {
            // Silently handle polling errors
          } finally {
            setCheckingPayment(false);
          }
        };

        checkPaymentStatus();
      }
    }, pollingInterval);
  }, [
    pollingInterval,
    visible,
    paymentStatus,
    paymentData?.payment_id,
    updatePaymentStatus,
    onPaymentConfirmed,
    onDismiss,
  ]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyPixCode = async () => {
    if (paymentData?.pix_copy_paste) {
      await Clipboard.setString(paymentData.pix_copy_paste);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência');
    }
  };

  const handlePaymentConfirmed = () => {
    Alert.alert('Pagamento Confirmado', 'Seu pagamento foi processado com sucesso!', [
      {
        text: 'OK',
        onPress: () => {
          onPaymentConfirmed?.();
          onDismiss();
        },
      },
    ]);
  };

  if (!paymentData) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="wallet-outline" size={28} color="#4169E1" />
              </View>
              <View style={styles.headerTextContainer}>
                <Title style={styles.title}>Pagamento PIX</Title>
                <Text style={styles.subtitle}>Pague de forma rápida e segura</Text>
              </View>
            </View>

            {/* Payment Amount Card */}
            <Surface style={styles.amountCard}>
              <Text style={styles.amountLabel}>Valor a pagar</Text>
              <Text style={styles.amount}>{formatCurrency(paymentData.amount)}</Text>
              {paymentData.amount > paymentData.base_amount && (
                <Text style={styles.interestNote}>
                  Inclui juros de {formatCurrency(paymentData.amount - paymentData.base_amount)}
                </Text>
              )}
            </Surface>

            {/* Payment Status Badge */}
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor:
                    paymentStatus === 'paid' || paymentStatus === 'confirmed'
                      ? '#E8F5E9'
                      : paymentStatus === 'pending'
                        ? '#FFF9E6'
                        : '#FFEBEE',
                },
              ]}
            >
              <Ionicons
                name={
                  paymentStatus === 'paid' || paymentStatus === 'confirmed'
                    ? 'checkmark-circle'
                    : paymentStatus === 'pending'
                      ? 'time-outline'
                      : 'alert-circle'
                }
                size={18}
                color={
                  paymentStatus === 'paid' || paymentStatus === 'confirmed'
                    ? '#4CAF50'
                    : paymentStatus === 'pending'
                      ? '#FFA726'
                      : '#EF5350'
                }
              />
              <Text
                style={[
                  styles.statusText,
                  {
                    color:
                      paymentStatus === 'paid' || paymentStatus === 'confirmed'
                        ? '#2E7D32'
                        : paymentStatus === 'pending'
                          ? '#F57C00'
                          : '#C62828',
                  },
                ]}
              >
                {paymentStatus === 'paid' || paymentStatus === 'confirmed'
                  ? 'Pagamento Confirmado'
                  : paymentStatus === 'pending'
                    ? 'Aguardando Pagamento'
                    : 'Verificando...'}
              </Text>
              {checkingPayment && (
                <ActivityIndicator size="small" color="#666" style={{ marginLeft: 8 }} />
              )}
            </View>

            {/* Timer Badge */}
            {timeLeft > 0 && paymentStatus !== 'paid' && paymentStatus !== 'confirmed' && (
              <View style={styles.timerBadge}>
                <Ionicons name="hourglass-outline" size={16} color="#FF6B6B" />
                <Text style={styles.timerText}>Expira em {formatTime(timeLeft)}</Text>
              </View>
            )}

            {/* QR Code Card */}
            <Surface style={styles.qrCard}>
              <Text style={styles.sectionTitle}>Escaneie o QR Code</Text>
              <View style={styles.qrWrapper}>
                {paymentData.pix_qr_code && paymentData.pix_qr_code.length <= 4296 ? (
                  <View style={styles.qrCodeContainer}>
                    <QRCode
                      value={paymentData.pix_qr_code}
                      size={180}
                      backgroundColor="white"
                      color="#1a1a1a"
                    />
                  </View>
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <Ionicons name="qr-code-outline" size={64} color="#BDBDBD" />
                    <Text style={styles.qrPlaceholderText}>
                      {paymentData.pix_qr_code ? 'Use o código abaixo' : 'QR Code indisponível'}
                    </Text>
                  </View>
                )}
              </View>
            </Surface>

            {/* PIX Copy/Paste Card */}
            <Surface style={styles.pixCodeCard}>
              <View style={styles.pixCodeHeader}>
                <Ionicons name="copy-outline" size={20} color="#666" />
                <Text style={styles.sectionTitle}>Código PIX Copia e Cola</Text>
              </View>
              <View style={styles.pixCodeBox}>
                <Text style={styles.pixCode} numberOfLines={3} ellipsizeMode="middle">
                  {paymentData.pix_copy_paste || 'Código não disponível'}
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={copyPixCode}
                style={styles.copyButton}
                labelStyle={styles.copyButtonLabel}
                disabled={!paymentData.pix_copy_paste}
              >
                <Text>Copiar Código</Text>
              </Button>
            </Surface>

            {/* Instructions Card */}
            <Surface style={styles.instructionsCard}>
              <View style={styles.instructionRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>1</Text>
                </View>
                <Text style={styles.instructionText}>Abra o app do seu banco</Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>2</Text>
                </View>
                <Text style={styles.instructionText}>Escolha pagar com PIX</Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>3</Text>
                </View>
                <Text style={styles.instructionText}>Escaneie ou cole o código</Text>
              </View>
              <View style={styles.instructionRow}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepNumber}>4</Text>
                </View>
                <Text style={styles.instructionText}>Confirme o pagamento</Text>
              </View>
            </Surface>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={handlePaymentConfirmed}
                style={styles.confirmButton}
                labelStyle={styles.confirmButtonLabel}
              >
                <Text>Já Paguei</Text>
              </Button>
              <Button
                mode="text"
                onPress={onDismiss}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                <Text>Fechar</Text>
              </Button>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  actionButtons: {
    gap: 12,
    marginBottom: 8,
  },
  amount: {
    color: '#4169E1',
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 4,
  },
  amountCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  amountLabel: {
    color: '#757575',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  cancelButton: {
    borderRadius: 12,
  },
  cancelButtonLabel: {
    color: '#757575',
    fontSize: 15,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    elevation: 0,
  },
  confirmButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 8,
  },
  copyButton: {
    backgroundColor: '#4169E1',
    borderRadius: 10,
  },
  copyButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 16,
  },
  headerIconContainer: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  headerTextContainer: {
    flex: 1,
  },
  instructionRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionText: {
    color: '#424242',
    flex: 1,
    fontSize: 14,
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  interestNote: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  pixCode: {
    color: '#424242',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 16,
  },
  pixCodeBox: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E0E0E0',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  pixCodeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  pixCodeHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  qrCard: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    elevation: 2,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  qrCodeContainer: {
    backgroundColor: 'white',
    borderColor: '#E0E0E0',
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
  },
  qrPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    height: 180,
    justifyContent: 'center',
    width: 180,
  },
  qrPlaceholderText: {
    color: '#9E9E9E',
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  qrWrapper: {
    marginTop: 16,
  },
  sectionTitle: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusBadge: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  stepBadge: {
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 14,
    height: 28,
    justifyContent: 'center',
    marginRight: 12,
    width: 28,
  },
  stepNumber: {
    color: '#4169E1',
    fontSize: 13,
    fontWeight: '700',
  },
  subtitle: {
    color: '#666',
    fontSize: 13,
    fontWeight: '400',
  },
  timerBadge: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFE5E5',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  timerText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  title: {
    color: '#1a1a1a',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 2,
  },
});
