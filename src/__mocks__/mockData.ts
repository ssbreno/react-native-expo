/**
 * Mock data for testing
 */

export const mockUser = {
  id: 1,
  name: 'João Silva',
  email: 'joao@example.com',
  cpf: '12345678909',
  phone: '11999999999',
  address: 'Rua Exemplo, 123',
  zip_code: '12345-678',
  age: 25,
  document_number: '12345678909',
  document_type: 'cpf' as const,
  birth_date: '1998-01-01T00:00:00Z',
  is_admin: false,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockAdmin = {
  ...mockUser,
  id: 2,
  name: 'Admin User',
  email: 'admin@vehicles.com',
  is_admin: true,
};

export const mockVehicle = {
  id: 1,
  user_id: 1,
  brand: 'Toyota',
  model: 'Corolla',
  year: 2023,
  manufacture_year: 2023,
  model_year: 2023,
  license_plate: 'ABC-1234',
  color: 'Preto',
  chassis: '1HGBH41JXMN109186',
  mileage: 15000,
  fuel_type: 'flex' as const,
  status: 'available' as const,
  price: 150000,
  description: 'Veículo em excelente estado',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
};

export const mockPayment = {
  id: 1,
  user_id: 1,
  vehicle_id: 1,
  amount: 750.0,
  base_amount: 750.0,
  interest_amount: 0,
  payment_type: 'pix',
  payment_method: 'pix',
  status: 'paid' as const,
  transaction_id: 'WP_1_1_20250121',
  payment_date: '2025-01-21T10:00:00Z',
  due_date: '2025-01-21T00:00:00Z',
  week_start_date: '2025-01-14T00:00:00Z',
  description: 'Pagamento semanal - 21/01/2025',
  recurrence_type: 'weekly',
  interest_rate: 0.0003333,
  days_overdue: 0,
  is_recurring: true,
  recurrence_active: true,
  created_at: '2025-01-14T00:00:00Z',
  updated_at: '2025-01-21T10:00:00Z',
};

export const mockDashboardStats = {
  total_users: 50,
  total_payments: 150,
  total_revenue: 112500.0,
  pending_payments: 10,
  overdue_payments: 5,
  active_vehicles: 45,
};

export const mockAuthResponse = {
  access_token: 'mock_access_token_12345',
  refresh_token: 'mock_refresh_token_67890',
  token_type: 'Bearer',
  expires_in: 604800,
  user: mockUser,
};

export const mockAdminUser = {
  ...mockUser,
  status: 'active' as const,
  total_payments: 10,
  last_payment: '2025-01-21T10:00:00Z',
  payment_status: 'up_to_date' as const,
  pending_amount: 0,
  days_overdue: 0,
  vehicle_name: 'Toyota Corolla',
  license_plate: 'ABC-1234',
  weekly_amount: 750,
  monthly_amount: 3000,
};

export const mockPaymentList = [
  mockPayment,
  {
    ...mockPayment,
    id: 2,
    status: 'pending' as const,
    payment_date: null,
    description: 'Pagamento semanal - 28/01/2025',
    due_date: '2025-01-28T00:00:00Z',
  },
  {
    ...mockPayment,
    id: 3,
    status: 'overdue' as const,
    payment_date: null,
    description: 'Pagamento semanal - 14/01/2025',
    due_date: '2025-01-14T00:00:00Z',
    days_overdue: 7,
  },
];

export const mockErrorResponse = {
  response: {
    status: 400,
    data: {
      error: 'Erro de validação',
      message: 'Dados inválidos',
    },
  },
};

export const mockUnauthorizedResponse = {
  response: {
    status: 401,
    data: {
      error: 'Não autorizado',
      message: 'Token inválido ou expirado',
    },
  },
};

export const mock404Response = {
  response: {
    status: 404,
    data: {
      error: 'Não encontrado',
      message: 'Recurso não encontrado',
    },
  },
};
