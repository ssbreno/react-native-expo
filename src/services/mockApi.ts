import { Vehicle, Payment, User, AuthResponse, ApiResponse, PaymentMethod } from '../types';

// Mock Data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'test@example.com',
    name: 'João Silva',
    phone: '(11) 99999-9999',
    createdAt: '2024-01-15T10:00:00Z'
  }
];

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    name: 'Honda Civic 2023',
    model: 'Civic',
    brand: 'Honda',
    year: 2023,
    plate: 'ABC-1234',
    color: 'Prata',
    status: 'ativo',
    rentalExpiration: '2024-02-15T23:59:59Z',
    monthlyPrice: 1200.00,
    imageUrl: 'https://via.placeholder.com/300x200/2196F3/ffffff?text=Honda+Civic',
    features: ['Ar condicionado', 'Direção hidráulica', 'Vidros elétricos', 'Trava elétrica', 'Airbag duplo'],
    description: 'Sedan compacto com excelente consumo de combustível e conforto para toda a família.'
  },
  {
    id: '2',
    name: 'Toyota Corolla 2022',
    model: 'Corolla',
    brand: 'Toyota',
    year: 2022,
    plate: 'XYZ-5678',
    color: 'Branco',
    status: 'ativo',
    rentalExpiration: '2024-03-20T23:59:59Z',
    monthlyPrice: 1150.00,
    imageUrl: 'https://via.placeholder.com/300x200/4CAF50/ffffff?text=Toyota+Corolla',
    features: ['Ar condicionado', 'Câmbio automático', 'Central multimídia', 'Sensor de ré', 'Bluetooth'],
    description: 'Sedan médio com tecnologia avançada e alta confiabilidade.'
  },
  {
    id: '3',
    name: 'Hyundai HB20 2023',
    model: 'HB20',
    brand: 'Hyundai',
    year: 2023,
    plate: 'DEF-9012',
    color: 'Azul',
    status: 'ativo',
    rentalExpiration: '2024-01-30T23:59:59Z',
    monthlyPrice: 900.00,
    imageUrl: 'https://via.placeholder.com/300x200/FF9800/ffffff?text=Hyundai+HB20',
    features: ['Ar condicionado', 'Direção elétrica', 'Vidros elétricos', 'Som MP3'],
    description: 'Hatchback compacto perfeito para o dia a dia na cidade.'
  }
];

const mockPayments: Payment[] = [
  // Honda Civic payments
  {
    id: '1',
    vehicleId: '1',
    vehicleName: 'Honda Civic 2023',
    amount: 1200.00,
    date: '2024-01-15T10:00:00Z',
    status: 'pago',
    method: 'Cartão de Crédito',
    dueDate: '2024-01-15T23:59:59Z',
    description: 'Mensalidade Janeiro 2024'
  },
  {
    id: '2',
    vehicleId: '1',
    vehicleName: 'Honda Civic 2023',
    amount: 1200.00,
    date: '2023-12-15T14:30:00Z',
    status: 'pago',
    method: 'PIX',
    dueDate: '2023-12-15T23:59:59Z',
    description: 'Mensalidade Dezembro 2023'
  },
  {
    id: '3',
    vehicleId: '1',
    vehicleName: 'Honda Civic 2023',
    amount: 1200.00,
    date: null,
    status: 'pendente',
    method: null,
    dueDate: '2024-02-15T23:59:59Z',
    description: 'Mensalidade Fevereiro 2024'
  },
  // Toyota Corolla payments
  {
    id: '4',
    vehicleId: '2',
    vehicleName: 'Toyota Corolla 2022',
    amount: 1150.00,
    date: '2024-01-20T09:15:00Z',
    status: 'pago',
    method: 'Boleto',
    dueDate: '2024-01-20T23:59:59Z',
    description: 'Mensalidade Janeiro 2024'
  },
  {
    id: '5',
    vehicleId: '2',
    vehicleName: 'Toyota Corolla 2022',
    amount: 1150.00,
    date: null,
    status: 'pendente',
    method: null,
    dueDate: '2024-02-20T23:59:59Z',
    description: 'Mensalidade Fevereiro 2024'
  },
  // HB20 payments
  {
    id: '6',
    vehicleId: '3',
    vehicleName: 'Hyundai HB20 2023',
    amount: 900.00,
    date: '2024-01-10T16:45:00Z',
    status: 'pago',
    method: 'Débito',
    dueDate: '2024-01-10T23:59:59Z',
    description: 'Mensalidade Janeiro 2024'
  },
  {
    id: '7',
    vehicleId: '3',
    vehicleName: 'Hyundai HB20 2023',
    amount: 900.00,
    date: null,
    status: 'vencido',
    method: null,
    dueDate: '2024-01-25T23:59:59Z',
    description: 'Mensalidade Janeiro 2024 (2ª parcela)'
  }
];

// Simulate network delay
const delay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Services
export const mockAuthService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    await delay(1500);
    
    // Simple validation - any email/password combination works for demo
    if (!email || !password) {
      return {
        success: false,
        error: 'Email e senha são obrigatórios'
      };
    }

    if (!email.includes('@')) {
      return {
        success: false,
        error: 'Email inválido'
      };
    }

    // Find or create user
    let user = mockUsers.find(u => u.email === email);
    if (!user) {
      user = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        phone: '(11) 99999-9999',
        createdAt: new Date().toISOString()
      };
      mockUsers.push(user);
    }

    const token = `mock-token-${Date.now()}`;
    
    return {
      success: true,
      user,
      token
    };
  },

  async logout(): Promise<ApiResponse> {
    await delay(500);
    return { success: true };
  },

  async getCurrentUser(token: string): Promise<ApiResponse<User>> {
    await delay(800);
    
    if (!token || !token.startsWith('mock-token-')) {
      return {
        success: false,
        error: 'Token inválido'
      };
    }

    return {
      success: true,
      data: mockUsers[0] // Return first mock user
    };
  }
};

export const mockVehicleService = {
  async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    await delay(1200);
    
    return {
      success: true,
      data: mockVehicles
    };
  },

  async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    await delay(800);
    
    const vehicle = mockVehicles.find(v => v.id === id);
    if (!vehicle) {
      return {
        success: false,
        error: 'Veículo não encontrado'
      };
    }

    return {
      success: true,
      data: vehicle
    };
  }
};

export const mockPaymentService = {
  async getPaymentHistory(): Promise<ApiResponse<Payment[]>> {
    await delay(1000);
    
    return {
      success: true,
      data: mockPayments
    };
  },

  async getPaymentsByVehicle(vehicleId: string): Promise<ApiResponse<Payment[]>> {
    await delay(800);
    
    const payments = mockPayments.filter(p => p.vehicleId === vehicleId);
    
    return {
      success: true,
      data: payments
    };
  },

  async processPayment(paymentId: string, paymentMethod: PaymentMethod): Promise<ApiResponse<Payment>> {
    await delay(2000); // Simulate payment processing
    
    const paymentIndex = mockPayments.findIndex(p => p.id === paymentId);
    if (paymentIndex === -1) {
      return {
        success: false,
        error: 'Pagamento não encontrado'
      };
    }

    // Simulate payment processing
    const randomSuccess = Math.random() > 0.1; // 90% success rate
    
    if (!randomSuccess) {
      return {
        success: false,
        error: 'Falha no processamento do pagamento. Tente novamente.'
      };
    }

    // Update payment
    mockPayments[paymentIndex] = {
      ...mockPayments[paymentIndex],
      status: 'pago',
      method: paymentMethod,
      date: new Date().toISOString()
    };

    return {
      success: true,
      data: mockPayments[paymentIndex],
      message: 'Pagamento processado com sucesso!'
    };
  },

  async getPendingPayments(): Promise<ApiResponse<Payment[]>> {
    await delay(600);
    
    const pendingPayments = mockPayments.filter(p => p.status === 'pendente' || p.status === 'vencido');
    
    return {
      success: true,
      data: pendingPayments
    };
  }
};
