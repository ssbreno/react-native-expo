import api from './api';
import { Vehicle, ApiResponse } from '../types';
import { getUserVehicleIdFromToken } from '../utils/jwtUtils';

export const vehicleService = {
  async getVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const response = await api.get('/vehicles');
      return {
        success: true,
        data: response.data.vehicles || response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter lista de veículos'
      };
    }
  },

  async getVehicleById(id: string): Promise<ApiResponse<Vehicle>> {
    try {
      const response = await api.get(`/vehicles/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Erro ao obter detalhes do veículo'
      };
    }
  },

  async getUserVehicles(): Promise<ApiResponse<Vehicle[]>> {
    try {
      const userVehicleId = await getUserVehicleIdFromToken();
      
      if (!userVehicleId) {
        return {
          success: true,
          data: []
        };
      }

      const response = await api.get(`/vehicles/${userVehicleId}`);
      
      const vehicleData = response.data;
      return {
        success: true,
        data: [vehicleData]
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.response?.data?.message || 'Erro ao obter veículos do usuário'
      };
    }
  },

};
