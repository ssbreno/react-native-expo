// User and Authentication Types
export interface User {
  id: number;
  name: string;
  address: string;
  document_number: string;
  document_type: 'cpf' | 'cnpj' | 'rg' | 'passport';
  age: number;
  password?: string;
  email: string;
  cpf: string;
  phone: string;
  birth_date: string;
  zip_code: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
  vehicles?: Vehicle[];
  payments?: Payment[];
  // Legacy compatibility
  createdAt?: string;
  isAdmin?: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

// Admin Types
export interface DashboardStats {
  total_users: number;
  total_payments: number;
  total_revenue: number;
  pending_payments: number;
  overdue_payments: number;
  active_vehicles: number;
}

export interface AdminUser extends User {
  status?: 'active' | 'inactive' | 'suspended';
  total_payments?: number;
  last_payment?: string;
}

export interface AdminApiResponse<T> {
  success: boolean;
  data?: T;
  users?: T;
  stats?: T;
  updatedCount?: number;
  message?: string;
  error?: string;
}

// Vehicle Types
export interface Vehicle {
  id: number;
  user_id: number;
  brand: string;
  model: string;
  year: number;
  manufacture_year: number;
  model_year: number;
  color: string;
  license_plate: string;
  chassis: string;
  mileage: number;
  fuel_type: 'gasoline' | 'ethanol' | 'diesel' | 'electric' | 'hybrid';
  price: number;
  status: 'ativo' | 'inativo';
  description: string;
  created_at: string;
  updated_at: string;
  user?: User;
  payments?: Payment[];
  // Legacy fields for backward compatibility
  name?: string;
  plate?: string;
  rentalExpiration?: string;
  monthlyPrice?: number;
  imageUrl?: string;
  features?: string[];
}

export interface VehicleUpdateData {
  brand: string;
  chassis: string;
  color: string;
  description: string;
  fuel_type: 'gasoline' | 'ethanol' | 'diesel' | 'electric' | 'hybrid';
  manufacture_year: number;
  mileage: number;
  model: string;
  model_year: number;
  price: number;
  status: 'ativo' | 'inativo';
}

// Payment Types
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'cancelled' | 'overdue';

export interface Payment {
  id: number;
  user_id: number;
  vehicle_id?: number;
  amount: number;
  base_amount: number;
  interest_amount: number;
  payment_type: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer';
  payment_method: 'pix' | 'credit_card' | 'debit_card' | 'cash' | 'bank_transfer';
  status: PaymentStatus;
  transaction_id: string;
  abacate_pay_id?: string;
  payment_date?: string;
  due_date: string;
  description: string;
  recurrence_type?: 'weekly' | 'monthly' | 'yearly';
  next_payment_date?: string;
  installment_count?: number;
  current_installment?: number;
  interest_rate: number;
  days_overdue: number;
  is_recurring: boolean;
  recurrence_active: boolean;
  parent_payment_id?: number;
  pix_key?: string;
  pix_qr_code?: string;
  pix_copy_paste_code?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  vehicle?: Vehicle;
  child_payments?: Payment[];
  // Legacy fields for backward compatibility
  vehicleId?: string;
  vehicleName?: string;
  date?: string;
  method?: string;
  dueDate?: string;
}

export type PaymentMethod = 'Cartão de Crédito' | 'PIX' | 'Boleto' | 'Débito';

// PIX Payment Types
export interface PixPaymentData {
  payment_id: number;
  pix_qr_code: string;
  pix_copy_paste: string;
  amount: number;
  status: string;
  expires_at: string;
}

export interface PaymentHistoryItem {
  id: string;
  payment_id: string;
  status: string;
  amount: number;
  created_at: string;
  updated_at: string;
  notes?: string;
}

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
  AdminDashboard: undefined;
  UsersList: undefined;
  UserDetails: { userId: number };
  VehicleDetail: { vehicleId: number };
  VehicleEdit: { vehicleId: number };
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
  getVehicleById: (id: number) => Vehicle | undefined;
  getPaymentsByVehicle: (vehicleId: number) => Payment[];
  getPendingPayments: () => Payment[];
  processPayment: (paymentId: number, paymentMethod: PaymentMethod) => Promise<ApiResponse>;
  updatePaymentStatus: (paymentId: number) => Promise<boolean>;
  loadVehicles: () => Promise<void>;
  refreshData: () => Promise<void>;
}

// API Configuration Types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  retries: number;
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
