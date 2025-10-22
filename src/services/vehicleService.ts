import api from './api';
import { Vehicle, ApiResponse, VehicleUpdateData, VehicleCreateData, AssignVehicleData } from '../types';
import { getUserVehicleIdFromToken } from '../utils/jwtUtils';

export const vehicleService = {
  /**
   * Create a new vehicle (regular user or admin)
   * POST /vehicles
   */
  async createVehicle(vehicleData: VehicleCreateData): Promise<ApiResponse<Vehicle>> {
    try {
      console.log('🚗 [Vehicle] Creating vehicle:', vehicleData.license_plate);
      const response = await api.post('/vehicles', vehicleData);
      console.log('✅ [Vehicle] Vehicle created successfully');
      return {
        success: true,
        data: response.data,
        message: 'Veículo criado com sucesso',
      };
    } catch (error: any) {
      console.error('❌ [Vehicle] Error creating vehicle:', error.response?.data || error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Erro ao criar veículo',
      };
    }
  },

  /**
   * Get available vehicles (not assigned to any user)
   * GET /vehicles/available
   */
  async getAvailableVehicles(page = 1, limit = 20): Promise<ApiResponse<{
    vehicles: Vehicle[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
    };
  }>> {
    try {
      const response = await api.get(`/vehicles/available?page=${page}&limit=${limit}`);
      return {
        success: true,
        data: {
          vehicles: response.data.vehicles || response.data,
          pagination: response.data.pagination || {
            current_page: page,
            total_pages: 1,
            total_items: response.data.vehicles?.length || 0,
            items_per_page: limit,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter veículos disponíveis',
      };
    }
  },

  /**
   * Assign vehicle to user (admin only)
   * POST /vehicles/:id/assign
   */
  async assignVehicle(vehicleId: number, userId: number): Promise<ApiResponse<{
    message: string;
    vehicle: Vehicle;
  }>> {
    try {
      console.log(`🔗 [Vehicle] Assigning vehicle ${vehicleId} to user ${userId}`);
      const response = await api.post(`/vehicles/${vehicleId}/assign`, { user_id: userId });
      console.log('✅ [Vehicle] Vehicle assigned successfully');
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Veículo vinculado com sucesso',
      };
    } catch (error: any) {
      console.error('❌ [Vehicle] Error assigning vehicle:', error.response?.data || error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Erro ao vincular veículo',
      };
    }
  },

  /**
   * Delete vehicle
   * DELETE /vehicles/:id
   */
  async deleteVehicle(vehicleId: number): Promise<ApiResponse> {
    try {
      console.log(`🗑️ [Vehicle] Deleting vehicle ${vehicleId}`);
      const response = await api.delete(`/vehicles/${vehicleId}`);
      console.log('✅ [Vehicle] Vehicle deleted successfully');
      return {
        success: true,
        message: response.data?.message || 'Veículo deletado com sucesso',
      };
    } catch (error: any) {
      console.error('❌ [Vehicle] Error deleting vehicle:', error.response?.data || error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Erro ao deletar veículo',
      };
    }
  },

  async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const response = await api.get('/vehicles');
      return {
        success: true,
        data: response.data.vehicles || response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter lista de veículos',
      };
    }
  },

  async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter detalhes do veículo',
      };
    }
  },

  async getUserVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const userVehicleId = await getUserVehicleIdFromToken();

      if (!userVehicleId) {
        return {
          success: true,
          data: [],
        };
      }

      const response = await api.get(`/vehicles/${userVehicleId}`);

      const vehicleData = response.data;
      return {
        success: true,
        data: [vehicleData],
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Erro ao obter veículos do usuário',
      };
    }
  },

  async updateVehicle(id: number, vehicleData: VehicleUpdateData): Promise<ApiResponse<Vehicle>> {
    try {
      const response = await api.put(`/vehicles/${id}`, vehicleData);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao atualizar veículo',
      };
    }
  },
};
