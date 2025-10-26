import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, DEFAULT_HEADERS } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: DEFAULT_HEADERS,
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let failedQueue: any[] = [];
let lastTokenClearTime = 0;
let isLoggingOut = false; // Flag to indicate if logout is in progress
const TOKEN_CLEAR_COOLDOWN = 5000; // 5 seconds cooldown

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.request.use(async config => {
  const token = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  if (token && token.trim()) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token.trim()}`;
  }
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Only try to refresh token on 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh if logout is in progress
      if (isLoggingOut) {
        console.log('⚠️ [API] Logout em progresso, ignorando renovação de token');
        error.isTokenExpired = true;
        return Promise.reject(error);
      }

      // Check if we recently cleared tokens - if so, don't retry
      const now = Date.now();
      if (now - lastTokenClearTime < TOKEN_CLEAR_COOLDOWN) {
        error.isTokenExpired = true;
        return Promise.reject(error);
      }

      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await AsyncStorage.getItem(API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          console.log('⚠️ [API] Nenhum refresh token disponível - fazendo logout');
          throw new Error('No refresh token available');
        }

        console.log('🔄 [API] Tentando renovar token...');
        const refreshApi = axios.create({
          baseURL: API_CONFIG.BASE_URL,
          timeout: API_CONFIG.TIMEOUT,
          headers: { 'Content-Type': 'application/json' },
        });

        const refreshResponse = await refreshApi.post('/auth/refresh-token', {
          refresh_token: refreshToken,
        });

        const refreshData = refreshResponse.data;
        console.log('✅ [API] Token renovado com sucesso');

        await AsyncStorage.setItem(API_CONFIG.STORAGE_KEYS.AUTH_TOKEN, refreshData.token);
        if (refreshData.refresh_token) {
          await AsyncStorage.setItem(
            API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
            refreshData.refresh_token
          );
        }

        // Update original request and process queue
        originalRequest.headers['Authorization'] = `Bearer ${refreshData.token}`;
        processQueue(null, refreshData.token);
        isRefreshing = false;

        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ [API] Falha ao renovar token - fazendo logout');
        processQueue(refreshError, null);
        isRefreshing = false;

        // Update cooldown timestamp to prevent immediate retries
        lastTokenClearTime = Date.now();

        // Clear tokens
        await AsyncStorage.multiRemove([
          API_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
          API_CONFIG.STORAGE_KEYS.USER_DATA,
          API_CONFIG.STORAGE_KEYS.REFRESH_TOKEN,
        ]);

        // Mark error as token expired for UI handling
        error.isTokenExpired = true;
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

// Export functions to control logout state
export const setLoggingOut = (value: boolean) => {
  isLoggingOut = value;
  if (value) {
    // Clear refresh flags when starting logout
    isRefreshing = false;
    failedQueue = [];
  }
};

export const resetApiState = () => {
  isRefreshing = false;
  isLoggingOut = false;
  failedQueue = [];
  lastTokenClearTime = 0;
};

export { API_CONFIG };

export default api;
