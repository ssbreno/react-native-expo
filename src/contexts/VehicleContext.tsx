import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Vehicle, Payment, VehicleContextType, PaymentMethod, ApiResponse } from '../types';
import { vehicleService } from '../services/vehicleService';
import { paymentService } from '../services/paymentService';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user]);

  const loadInitialData = async (): Promise<void> => {
    setLoading(true);
    try {
      await Promise.all([loadVehicles(), loadPaymentHistory()]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async (): Promise<void> => {
    try {
      // Skip loading user vehicles for admin users
      if (user?.is_admin === true) {
        setVehicles([]);
        return;
      }

      const response = await vehicleService.getUserVehicles();
      if (response.success && response.data) {
        setVehicles(response.data);
      } else {
        console.error('Erro ao carregar veículos:', response.error);
      }
    } catch (error: any) {
      if (error.isTokenExpired) {
        console.log(
          '⚠️ [VehicleContext] Token expirado ao carregar veículos - será necessário fazer login novamente'
        );
      } else {
        console.error('Erro ao carregar veículos:', error);
      }
    }
  };

  const loadPaymentHistory = async (): Promise<void> => {
    try {
      // Skip loading payment history for admin users
      if (user?.is_admin === true) {
        setPaymentHistory([]);
        return;
      }

      const response = await paymentService.getMyPayments();
      if (response.success && response.data) {
        setPaymentHistory(response.data);
      } else {
        console.error('Erro ao carregar histórico de pagamentos:', response.error);
      }
    } catch (error: any) {
      if (error.isTokenExpired) {
        console.log(
          '⚠️ [VehicleContext] Token expirado ao carregar pagamentos - será necessário fazer login novamente'
        );
      } else {
        console.error('Erro ao carregar histórico de pagamentos:', error);
      }
    }
  };

  const refreshData = async (): Promise<void> => {
    await loadInitialData();
  };

  const getVehicleById = (id: number): Vehicle | undefined => {
    return vehicles.find(vehicle => vehicle.id === id);
  };

  const getPaymentsByVehicle = (vehicleId: number): Payment[] => {
    return paymentHistory.filter(
      payment =>
        payment.vehicle_id === vehicleId || parseInt(payment.vehicleId || '0') === vehicleId
    );
  };

  const getPendingPayments = (): Payment[] => {
    return paymentHistory.filter(
      payment => payment.status === 'pending' || payment.status === 'overdue'
    );
  };

  const processPayment = async (
    paymentId: number,
    paymentMethod: PaymentMethod
  ): Promise<ApiResponse> => {
    try {
      // For now, keep the existing mock logic for non-PIX payments
      // PIX payments are handled by the PixPayment component
      const response = { success: false, error: 'Use PIX payment component for new payments' };
      return response;
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      return {
        success: false,
        error: 'Erro interno do servidor',
      };
    }
  };

  const updatePaymentStatus = async (paymentId: number): Promise<boolean> => {
    try {
      // Refresh payment history to get updated status
      await loadPaymentHistory();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error);
      return false;
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
    updatePaymentStatus,
    loadVehicles,
    refreshData,
  };

  return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
};
