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
  ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { paymentService, PixPaymentData } from '../services/paymentService';
import { Vehicle } from '../types';

interface PixPaymentProps {
  paymentId: number;
  amount: number;
  description?: string;
  onPaymentComplete?: (paymentData: PixPaymentData) => void;
}

const PixPayment: React.FC<PixPaymentProps> = ({ paymentId, amount, description, onPaymentComplete }) => {
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
      currency: 'BRL'
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
            <Text style={styles.payButtonText}>
              Pagar {formatCurrency(amount)} via PIX
            </Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <View style={styles.headerIcon}>
                  <Ionicons name="qr-code" size={32} color="#32a852" />
                </View>
                <Text style={styles.modalTitle}>Pagamento PIX Gerado</Text>
                <TouchableOpacity 
                  onPress={closeModal}
                  style={styles.closeButton}
                >
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
                  <TouchableOpacity 
                    onPress={copyToClipboard}
                    style={styles.copyButton}
                  >
                    <Ionicons name="copy-outline" size={20} color="#32a852" />
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
                  <Text style={styles.instructionText}>
                    Escolha a opção PIX e "Copia e Cola"
                  </Text>
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
                  Expira em: {pixData?.expires_at ? new Date(pixData.expires_at).toLocaleString('pt-BR') : 'N/A'}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                onPress={copyToClipboard}
                style={styles.copyActionButton}
              >
                <Ionicons name="copy-outline" size={18} color="#32a852" />
                <Text style={styles.copyActionText}>Copiar Código</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={closeModal}
                style={styles.closeActionButton}
              >
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
  container: {
    marginVertical: 10,
  },
  payButton: {
    backgroundColor: '#32a852',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  payButtonDisabled: {
    backgroundColor: '#a8a8a8',
  },
  payButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerIcon: {
    marginRight: 12,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  paymentInfo: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  amount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#32a852',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  pixSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  pixCodeContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  pixCode: {
    flex: 1,
    fontSize: 12,
    color: '#495057',
    fontFamily: 'monospace',
  },
  copyButton: {
    marginLeft: 12,
    padding: 4,
  },
  instructionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  instruction: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  instructionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#32a852',
    marginRight: 8,
    minWidth: 20,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statusSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#856404',
    fontWeight: '500',
  },
  expiresText: {
    fontSize: 12,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  copyActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#32a852',
    borderRadius: 8,
    gap: 6,
  },
  copyActionText: {
    color: '#32a852',
    fontSize: 16,
    fontWeight: '500',
  },
  closeActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#6c757d',
    borderRadius: 8,
  },
  closeActionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default PixPayment;
