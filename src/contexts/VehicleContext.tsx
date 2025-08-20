import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle, Payment, VehicleContextType, PaymentMethod, ApiResponse } from '../types';
import { mockVehicleService, mockPaymentService } from '../services/mockApi';

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

export const useVehicle = (): VehicleContextType => {
  const context = useContext(VehicleContext);
  if (!context) {
    throw new Error('useVehicle deve ser usado dentro de um VehicleProvider');
  }
  return context;
};

interface VehicleProviderProps {
  children: ReactNode;
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([
        loadVehicles(),
        loadPaymentHistory()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async (): Promise<void> => {
    try {
      const response = await mockVehicleService.getVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
      } else {
        console.error('Erro ao carregar veículos:', response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
    }
  };

  const loadPaymentHistory = async (): Promise<void> => {
    try {
      const response = await mockPaymentService.getPaymentHistory();
      if (response.success && response.data) {
        setPaymentHistory(response.data);
      } else {
        console.error('Erro ao carregar histórico de pagamentos:', response.error);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico de pagamentos:', error);
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadInitialData();
  };

  const getVehicleById = (id: string): Vehicle | undefined => {
    return vehicles.find(vehicle => vehicle.id === id);
  };

  const getPaymentsByVehicle = (vehicleId: string): Payment[] => {
    return paymentHistory.filter(payment => payment.vehicleId === vehicleId);
  };

  const getPendingPayments = (): Payment[] => {
    return paymentHistory.filter(payment => 
      payment.status === 'pendente' || payment.status === 'vencido'
    );
  };

  const processPayment = async (
    paymentId: string, 
    paymentMethod: PaymentMethod
  ): Promise<ApiResponse> => {
    try {
      const response = await mockPaymentService.processPayment(paymentId, paymentMethod);
      
      if (response.success && response.data) {
        // Update local payment history
        setPaymentHistory(prevPayments => 
          prevPayments.map(payment => 
            payment.id === paymentId ? response.data! : payment
          )
        );
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  };

  const value: VehicleContextType = {
    vehicles,
    paymentHistory,
    loading,
    getVehicleById,
    getPaymentsByVehicle,
    getPendingPayments,
    processPayment,
    loadVehicles,
    refreshData
  };

  return (
    <VehicleContext.Provider value={value}>
      {children}
    </VehicleContext.Provider>
  );
};
