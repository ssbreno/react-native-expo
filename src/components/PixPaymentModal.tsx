import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Clipboard,
  Dimensions
} from 'react-native';
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
  Divider
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { PixPaymentData, paymentService } from '../services/paymentService';
import { formatCurrency } from '../utils/dateUtils';
import { useVehicle } from '../contexts/VehicleContext';

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
  onPaymentConfirmed 
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
      const expirationTime = new Date(paymentData.expires_at || new Date(Date.now() + 30 * 60 * 1000)).getTime();
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
                  }
                }
              ]
            );
          }
        } else if (!result.success) {
          // Network error or API error - implement exponential backoff
          setRetryCount(prev => prev + 1);
          const backoffInterval = Math.min(30000, 5000 * Math.pow(1.5, retryCount));
          setPollingInterval(backoffInterval);
          console.warn('Erro temporário ao verificar pagamento:', result.error);
        }
      } catch (error: any) {
        // Handle network connectivity issues with exponential backoff
        setRetryCount(prev => prev + 1);
        const backoffInterval = Math.min(30000, 5000 * Math.pow(1.5, retryCount));
        setPollingInterval(backoffInterval);
        
        console.error('Erro de conectividade ao verificar pagamento:', error);
        
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
            const checkId = paymentData?.abacate_pay_id || paymentData?.payment_id?.toString() || '';
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
                      }
                    }
                  ]
                );
              }
            }
          } catch (error) {
            console.error('Polling error:', error);
          } finally {
            setCheckingPayment(false);
          }
        };
        
        checkPaymentStatus();
      }
    }, pollingInterval);
    
  }, [pollingInterval, visible, paymentStatus, paymentData?.payment_id, updatePaymentStatus, onPaymentConfirmed, onDismiss]);

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
    Alert.alert(
      'Pagamento Confirmado',
      'Seu pagamento foi processado com sucesso!',
      [
        {
          text: 'OK',
          onPress: () => {
            onPaymentConfirmed?.();
            onDismiss();
          }
        }
      ]
    );
  };

  if (!paymentData) return null;

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
        <Card style={styles.card}>
          <Card.Content>
            {/* Header */}
            <View style={styles.header}>
              <Ionicons name="logo-bitcoin" size={32} color={theme.colors.primary} />
              <Title style={styles.title}>Pagamento PIX</Title>
            </View>

            {/* Payment Info */}
            <Surface style={styles.paymentInfo}>
              {/* Verificar se há juros aplicados */}
              {paymentData.amount > paymentData.base_amount ? (
                <>
                  <Text style={styles.amountLabel}>Valor Original:</Text>
                  <Text style={[styles.baseAmount, { color: '#666' }]}>
                    {formatCurrency(paymentData.base_amount)}
                  </Text>
                  
                  <Text style={styles.interestLabel}>+ Juros de Atraso:</Text>
                  <Text style={[styles.interestAmount, { color: '#f44336' }]}>
                    {formatCurrency(paymentData.amount - paymentData.base_amount)}
                  </Text>
                  
                  <View style={styles.totalDivider} />
                  
                  <Text style={styles.totalLabel}>Total a Pagar:</Text>
                  <Text style={[styles.amount, { color: theme.colors.primary }]}>
                    {formatCurrency(paymentData.amount)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.amountLabel}>Valor a pagar:</Text>
                  <Text style={[styles.amount, { color: theme.colors.primary }]}>
                    {formatCurrency(paymentData.amount)}
                  </Text>
                </>
              )}
            </Surface>

            {/* Payment Status */}
            <Surface style={[
              styles.statusContainer,
              { backgroundColor: 
                paymentStatus === 'paid' || paymentStatus === 'confirmed' ? '#e8f5e8' :
                paymentStatus === 'pending' ? '#fff3cd' : '#ffebee'
              }
            ]}>
              <View style={styles.statusRow}>
                <Ionicons 
                  name={
                    paymentStatus === 'paid' || paymentStatus === 'confirmed' ? 'checkmark-circle' :
                    paymentStatus === 'pending' ? 'time-outline' : 'alert-circle'
                  } 
                  size={20} 
                  color={
                    paymentStatus === 'paid' || paymentStatus === 'confirmed' ? '#4caf50' :
                    paymentStatus === 'pending' ? '#ff9800' : '#f44336'
                  } 
                />
                <Text style={[styles.statusText, {
                  color: 
                    paymentStatus === 'paid' || paymentStatus === 'confirmed' ? '#4caf50' :
                    paymentStatus === 'pending' ? '#ff9800' : '#f44336'
                }]}>
                  {paymentStatus === 'paid' || paymentStatus === 'confirmed' ? 'Pagamento Confirmado' :
                   paymentStatus === 'pending' ? 'Aguardando Pagamento' : 'Status Desconhecido'}
                </Text>
                {checkingPayment && <ActivityIndicator size="small" color="#666" />}
              </View>
            </Surface>

            {/* Timer */}
            {timeLeft > 0 && paymentStatus !== 'paid' && paymentStatus !== 'confirmed' && (
              <Surface style={styles.timerContainer}>
                <Ionicons name="time-outline" size={20} color="#f44336" />
                <Text style={styles.timerText}>
                  Expira em: {formatTime(timeLeft)}
                </Text>
              </Surface>
            )}

            <Divider style={styles.divider} />

            {/* QR Code */}
            <View style={styles.qrContainer}>
              <Text style={styles.qrLabel}>Escaneie o QR Code:</Text>
              <Surface style={styles.qrCodeSurface}>
                {paymentData.pix_qr_code ? (
                  <QRCode
                    value={paymentData.pix_qr_code}
                    size={200}
                    backgroundColor="white"
                    color="black"
                  />
                ) : (
                  <View style={styles.qrPlaceholder}>
                    <Ionicons name="qr-code-outline" size={60} color="#ccc" />
                    <Text style={styles.qrPlaceholderText}>QR Code não disponível</Text>
                  </View>
                )}
              </Surface>
            </View>

            <Divider style={styles.divider} />

            {/* PIX Code */}
            <View style={styles.pixCodeContainer}>
              <Text style={styles.pixCodeLabel}>Ou copie o código PIX:</Text>
              <Surface style={styles.pixCodeSurface}>
                <Text style={styles.pixCode} numberOfLines={3}>
                  {paymentData.pix_copy_paste || 'Código PIX não disponível'}
                </Text>
              </Surface>
              
              <Button
                mode="outlined"
                onPress={copyPixCode}
                style={styles.copyButton}
                icon="content-copy"
                disabled={!paymentData.pix_copy_paste}
              >
                Copiar Código PIX
              </Button>
            </View>

            <Divider style={styles.divider} />

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                onPress={handlePaymentConfirmed}
                style={[styles.actionButton, { backgroundColor: '#4caf50' }]}
                icon="check-circle"
              >
                Já Paguei
              </Button>
              
              <Button
                mode="outlined"
                onPress={onDismiss}
                style={styles.actionButton}
                icon="close"
              >
                Cancelar
              </Button>
            </View>

            {/* Instructions */}
            <Surface style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Como pagar:</Text>
              <Text style={styles.instructionText}>
                1. Abra o app do seu banco{'\n'}
                2. Escaneie o QR Code ou cole o código PIX{'\n'}
                3. Confirme o pagamento{'\n'}
                4. Clique em "Já Paguei" após efetuar o pagamento
              </Text>
            </Surface>
          </Card.Content>
        </Card>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    marginLeft: 12,
    fontSize: 24,
    fontWeight: 'bold',
  },
  paymentInfo: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#ffebee',
    marginBottom: 16,
  },
  timerText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#f44336',
  },
  divider: {
    marginVertical: 16,
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  qrCodeSurface: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: 'white',
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
  },
  pixCodeContainer: {
    alignItems: 'center',
  },
  pixCodeLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  pixCodeSurface: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  pixCode: {
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'center',
    color: '#333',
  },
  copyButton: {
    marginBottom: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  instructionsContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  statusContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  baseAmount: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  interestLabel: {
    fontSize: 14,
    color: '#f44336',
    marginTop: 8,
    marginBottom: 4,
  },
  interestAmount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
});
