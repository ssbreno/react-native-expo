import api from './api';

export interface VehicleCost {
  id: number;
  vehicle_id: number;
  description: string;
  amount: number;
  date: string;
  created_at: string;
  updated_at: string;
  // Dados do veículo (quando incluído)
  vehicle?: {
    brand: string;
    model: string;
    license_plate: string;
  };
}

export interface VehicleCostCreate {
  vehicle_id: number;
  description: string;
  amount: number;
  date: string;
}

export interface VehicleCostUpdate {
  description?: string;
  amount?: number;
  date?: string;
}

export interface VehicleCostsResponse {
  costs: VehicleCost[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  total_amount: number;
}

export interface VehicleCostSummary {
  vehicle_id: number;
  brand: string;
  model: string;
  license_plate: string;
  total_costs: number;
  total_amount: number;
}

export interface VehicleCostsSummaryResponse {
  vehicles: VehicleCostSummary[];
  grand_total: number;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const vehicleCostService = {
  /**
   * Criar novo custo
   */
  async createCost(data: VehicleCostCreate): Promise<ApiResponse<VehicleCost>> {
    try {
      console.log('💰 [VehicleCost] Creating cost:', data);
      const response = await api.post('/vehicle-costs', data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ [VehicleCost] Error creating cost:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao criar custo',
      };
    }
  },

  /**
   * Listar custos com filtros e paginação
   */
  async getCosts(params?: {
    vehicle_id?: number;
    month?: number;
    year?: number;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<VehicleCostsResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.vehicle_id) queryParams.append('vehicle_id', params.vehicle_id.toString());
      if (params?.month) queryParams.append('month', params.month.toString());
      if (params?.year) queryParams.append('year', params.year.toString());
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      console.log('💰 [VehicleCost] Getting costs with params:', params);
      const response = await api.get(`/vehicle-costs?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ [VehicleCost] Error getting costs:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar custos',
      };
    }
  },

  /**
   * Buscar resumo de custos por veículo
   */
  async getCostsSummary(params?: {
    month?: number;
    year?: number;
  }): Promise<ApiResponse<VehicleCostsSummaryResponse>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.month) queryParams.append('month', params.month.toString());
      if (params?.year) queryParams.append('year', params.year.toString());

      console.log('💰 [VehicleCost] Getting summary with params:', params);
      const response = await api.get(`/vehicle-costs/summary?${queryParams.toString()}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ [VehicleCost] Error getting summary:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar resumo',
      };
    }
  },

  /**
   * Buscar custo por ID
   */
  async getCostById(id: number): Promise<ApiResponse<VehicleCost>> {
    try {
      console.log('💰 [VehicleCost] Getting cost by ID:', id);
      const response = await api.get(`/vehicle-costs/${id}`);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ [VehicleCost] Error getting cost:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao buscar custo',
      };
    }
  },

  /**
   * Atualizar custo
   */
  async updateCost(id: number, data: VehicleCostUpdate): Promise<ApiResponse<VehicleCost>> {
    try {
      console.log('💰 [VehicleCost] Updating cost:', id, data);
      const response = await api.put(`/vehicle-costs/${id}`, data);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.error('❌ [VehicleCost] Error updating cost:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar custo',
      };
    }
  },

  /**
   * Deletar custo
   */
  async deleteCost(id: number): Promise<ApiResponse<void>> {
    try {
      console.log('💰 [VehicleCost] Deleting cost:', id);
      await api.delete(`/vehicle-costs/${id}`);
      
      return {
        success: true,
      };
    } catch (error: any) {
      console.error('❌ [VehicleCost] Error deleting cost:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao deletar custo',
      };
    }
  },
};
