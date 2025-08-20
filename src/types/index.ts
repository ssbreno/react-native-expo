// User and Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Vehicle Types
export interface Vehicle {
  id: string;
  name: string;
  model: string;
  brand: string;
  year: number;
  plate: string;
  color: string;
  status: 'ativo' | 'inativo' | 'manutencao';
  rentalExpiration: string; // ISO date string
  monthlyPrice: number;
  imageUrl: string;
  features: string[];
  description?: string;
}

// Payment Types
export interface Payment {
  id: string;
  vehicleId: string;
  vehicleName: string;
  amount: number;
  date: string | null; // ISO date string or null if not paid
  status: 'pago' | 'pendente' | 'vencido';
  method: PaymentMethod | null;
  dueDate: string; // ISO date string
  description?: string;
}

export type PaymentMethod = 'Cartão de Crédito' | 'PIX' | 'Boleto' | 'Débito';

export interface PaymentHistory {
  payments: Payment[];
  totalPaid: number;
  totalPending: number;
}

// Subscription Types
export interface Subscription {
  id: string;
  vehicleId: string;
  userId: string;
  status: 'ativa' | 'cancelada' | 'suspensa';
  startDate: string;
  endDate?: string;
  monthlyAmount: number;
  autoRenewal: boolean;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Navigation Types
export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  VehicleDetail: { vehicleId: string };
};

export type MainTabParamList = {
  Veículos: undefined;
  Histórico: undefined;
  Assinatura: undefined;
  Perfil: undefined;
};

// Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

export interface VehicleContextType {
  vehicles: Vehicle[];
  paymentHistory: Payment[];
  loading: boolean;
  getVehicleById: (id: string) => Vehicle | undefined;
  getPaymentsByVehicle: (vehicleId: string) => Payment[];
  getPendingPayments: () => Payment[];
  processPayment: (paymentId: string, paymentMethod: PaymentMethod) => Promise<ApiResponse>;
  loadVehicles: () => Promise<void>;
  refreshData: () => Promise<void>;
}

// Utility Types
export interface DateInfo {
  date: Date;
  formatted: string;
  daysFromNow: number;
  isOverdue: boolean;
  isNearExpiration: boolean; // within 7 days
}

export interface PaymentSummary {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
}
