import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, DEFAULT_HEADERS } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: DEFAULT_HEADERS,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (token && token.trim()) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const refreshApi = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: { 'Content-Type': 'application/json' }
          });

          const refreshResponse = await refreshApi.post('/auth/refresh-token', { 
            refresh_token: refreshToken 
          });

          const refreshData = refreshResponse.data;

          await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN, refreshData.token);
          if (refreshData.refresh_token) {
            await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshData.refresh_token);
          }

          originalRequest.headers['Authorization'] = `Bearer ${refreshData.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      await AsyncStorage.multiRemove([
        API_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
        API_CONFIG.STORAGE_KEYS.USER_DATA,
        API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN
      ]);
    }
    
    return Promise.reject(error);
  }
);

export { API_CONFIG };

export default api;
