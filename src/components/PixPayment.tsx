import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  ScrollView,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentService, PixPaymentData } from '../services/paymentService';
import { Vehicle } from '../types';
import { Colors } from '../constants/colors';

interface PixPaymentProps {
  paymentId: number;
  amount: number;
  description?: string;
  onPaymentComplete?: (paymentData: PixPaymentData) => void;
}

const PixPayment: React.FC<PixPaymentProps> = ({
  paymentId,
  amount,
  description,
  onPaymentComplete,
}) => {
  const [pixData, setPixData] = useState<PixPaymentData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusPolling, setStatusPolling] = useState<NodeJS.Timeout | null>(null);

  const handlePixPayment = async () => {
    if (processing) return;

    setProcessing(true);
    try {
      console.log('[PixPayment] Generating PIX QR code for payment:', paymentId);

      // First try to get existing QR code
      let result = await paymentService.getPixQRCode(paymentId);

      // If no existing QR code, generate new one
      if (!result.success) {
        console.log('[PixPayment] No existing QR code, generating new one');
        result = await paymentService.generatePixQRCode(paymentId);
      }

      if (result.success && result.data) {
        console.log('[PixPayment] PIX QR code obtained successfully:', result.data);
        setPixData(result.data);
        setShowModal(true);

        // Start status polling
        startStatusPolling();
      } else {
        console.error('[PixPayment] Failed to get PIX QR code:', result.error);
        Alert.alert('Erro', result.error || 'Erro ao gerar QR code PIX');
      }
    } catch (error) {
      console.error('[PixPayment] PIX QR code generation error:', error);
      Alert.alert('Erro', 'Erro inesperado ao gerar QR code');
    } finally {
      setProcessing(false);
    }
  };

  const startStatusPolling = () => {
    // Clear any existing polling
    if (statusPolling) {
      clearInterval(statusPolling);
    }

    const interval = setInterval(async () => {
      try {
        const result = await paymentService.checkPixPaymentStatus(paymentId);
        if (result.success && result.data) {
          if (result.data.status === 'completed' || result.data.status === 'paid') {
            console.log('[PixPayment] Payment completed!');
            clearInterval(interval);
            setStatusPolling(null);
            onPaymentComplete?.(result.data);
            setShowModal(false);
          }
        }
      } catch (error) {
        console.error('[PixPayment] Status polling error:', error);
      }
    }, 3000); // Check every 3 seconds

    setStatusPolling(interval);

    // Stop polling after 10 minutes
    setTimeout(() => {
      clearInterval(interval);
      setStatusPolling(null);
    }, 600000);
  };

  // Cleanup polling on unmount
  React.useEffect(() => {
    return () => {
      if (statusPolling) {
        clearInterval(statusPolling);
      }
    };
  }, [statusPolling]);

  const copyToClipboard = async () => {
    if (pixData?.pix_copy_paste) {
      await Clipboard.setString(pixData.pix_copy_paste);
      Alert.alert('Copiado!', 'Código PIX copiado para a área de transferência');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const closeModal = () => {
    setShowModal(false);
    setPixData(null);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={handlePixPayment}
        disabled={processing}
        style={[styles.payButton, processing && styles.payButtonDisabled]}
      >
        {processing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <View style={styles.payButtonContent}>
            <Ionicons name="qr-code-outline" size={20} color="#fff" />
            <Text style={styles.payButtonText}>Pagar {formatCurrency(amount)} via PIX</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.headerIcon}>
                  <Ionicons name="qr-code-outline" size={32} color={Colors.primary} />
                </View>
                <Text style={styles.modalTitle}>Pagamento PIX Gerado</Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.paymentInfo}>
                <Text style={styles.vehicleName}>{description || 'Pagamento PIX'}</Text>
                <Text style={styles.amount}>{formatCurrency(pixData?.amount || amount)}</Text>
                <Text style={styles.description}>
                  {pixData?.description || 'Pagamento via PIX'}
                </Text>
              </View>

              <View style={styles.pixSection}>
                <Text style={styles.sectionTitle}>Código PIX Copia e Cola</Text>
                <View style={styles.pixCodeContainer}>
                  <Text style={styles.pixCode} numberOfLines={3}>
                    {pixData?.pix_copy_paste}
                  </Text>
                  <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
                    <Ionicons name="copy-outline" size={20} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.instructionsSection}>
                <Text style={styles.sectionTitle}>Como pagar:</Text>
                <View style={styles.instruction}>
                  <Text style={styles.instructionNumber}>1.</Text>
                  <Text style={styles.instructionText}>
                    Abra o app do seu banco ou carteira digital
                  </Text>
                </View>
                <View style={styles.instruction}>
                  <Text style={styles.instructionNumber}>2.</Text>
                  <Text style={styles.instructionText}>Escolha a opção PIX e "Copia e Cola"</Text>
                </View>
                <View style={styles.instruction}>
                  <Text style={styles.instructionNumber}>3.</Text>
                  <Text style={styles.instructionText}>
                    Cole o código copiado e confirme o pagamento
                  </Text>
                </View>
              </View>

              <View style={styles.statusSection}>
                <View style={styles.statusBadge}>
                  <Ionicons name="time-outline" size={16} color="#ff9800" />
                  <Text style={styles.statusText}>Aguardando pagamento</Text>
                </View>
                <Text style={styles.expiresText}>
                  Expira em:{' '}
                  {pixData?.expires_at
                    ? new Date(pixData.expires_at).toLocaleString('pt-BR')
                    : 'N/A'}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={copyToClipboard} style={styles.copyActionButton}>
                <Ionicons name="copy-outline" size={18} color={Colors.primary} />
                <Text style={styles.copyActionText}>Copiar Código</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={closeModal} style={styles.closeActionButton}>
                <Text style={styles.closeActionText}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  amount: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  closeActionButton: {
    alignItems: 'center',
    backgroundColor: Colors.text.secondary,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  closeActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
  },
  container: {
    marginVertical: 10,
  },
  copyActionButton: {
    alignItems: 'center',
    borderColor: Colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  copyActionText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  copyButton: {
    marginLeft: 12,
    padding: 4,
  },
  description: {
    color: '#666',
    fontSize: 14,
  },
  expiresText: {
    color: '#666',
    fontSize: 12,
  },
  headerIcon: {
    marginRight: 12,
  },
  instruction: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: 8,
  },
  instructionNumber: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
    minWidth: 20,
  },
  instructionText: {
    color: '#666',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  instructionsSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  modalActions: {
    borderTopColor: '#f0f0f0',
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomColor: '#f0f0f0',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 20,
  },
  modalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalTitle: {
    color: '#333',
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    elevation: 2,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  payButtonContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  payButtonDisabled: {
    backgroundColor: '#a8a8a8',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  paymentInfo: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 20,
  },
  pixCode: {
    color: '#495057',
    flex: 1,
    fontFamily: 'monospace',
    fontSize: 12,
  },
  pixCodeContainer: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  pixSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusBadge: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#fff3cd',
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusSection: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  statusText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  vehicleName: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
});

export default PixPayment;
