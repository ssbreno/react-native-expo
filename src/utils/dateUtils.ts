import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateInfo } from '../types';

export const formatDate = (dateString: string | undefined | null): string => {
  if (!dateString) {
    return 'Data não informada';
  }
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data inválida';
  }
};

export const formatDateTime = (dateString: string | undefined | null): string => {
  if (!dateString) {
    return 'Data não informada';
  }
  try {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Data inválida';
  }
};

export const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
};

export const getDateInfo = (dateString: string): DateInfo => {
  try {
    const date = parseISO(dateString);
    const now = new Date();
    const daysFromNow = differenceInDays(date, now);

    return {
      date,
      formatted: formatDate(dateString),
      daysFromNow,
      isOverdue: daysFromNow < 0,
      isNearExpiration: daysFromNow >= 0 && daysFromNow <= 7,
    };
  } catch (error) {
    console.error('Error getting date info:', error);
    return {
      date: new Date(),
      formatted: 'Data inválida',
      daysFromNow: 0,
      isOverdue: false,
      isNearExpiration: false,
    };
  }
};

export const getExpirationStatus = (expirationDate: string) => {
  const dateInfo = getDateInfo(expirationDate);

  if (dateInfo.isOverdue) {
    return {
      color: '#f44336',
      text: 'Vencido',
      backgroundColor: '#ffebee',
      priority: 'high' as const,
    };
  }

  if (dateInfo.isNearExpiration) {
    return {
      color: '#ff9800',
      text: `${dateInfo.daysFromNow} dias`,
      backgroundColor: '#fff3e0',
      priority: 'medium' as const,
    };
  }

  return {
    color: '#4caf50',
    text: `${dateInfo.daysFromNow} dias`,
    backgroundColor: '#e8f5e8',
    priority: 'low' as const,
  };
};

export const getPaymentStatus = (payment: { status: string; dueDate: string }) => {
  switch (payment.status) {
    case 'completed':
    case 'pago':
      return {
        color: '#4caf50',
        backgroundColor: '#e8f5e8',
        text: 'Pago',
        icon: 'checkmark-circle' as const,
      };
    case 'pending':
    case 'pendente':
      const dateInfo = getDateInfo(payment.dueDate);
      if (dateInfo.isOverdue) {
        return {
          color: '#f44336',
          backgroundColor: '#ffebee',
          text: 'Vencido',
          icon: 'alert-circle' as const,
        };
      }
      return {
        color: '#ff9800',
        backgroundColor: '#fff3e0',
        text: 'Pendente',
        icon: 'time' as const,
      };
    case 'overdue':
    case 'vencido':
      return {
        color: '#f44336',
        backgroundColor: '#ffebee',
        text: 'Vencido',
        icon: 'alert-circle' as const,
      };
    case 'failed':
      return {
        color: '#f44336',
        backgroundColor: '#ffebee',
        text: 'Falhou',
        icon: 'close-circle' as const,
      };
    case 'cancelled':
      return {
        color: '#666',
        backgroundColor: '#f5f5f5',
        text: 'Cancelado',
        icon: 'close-circle' as const,
      };
    default:
      return {
        color: '#666',
        backgroundColor: '#f5f5f5',
        text: 'Desconhecido',
        icon: 'help-circle' as const,
      };
  }
};
