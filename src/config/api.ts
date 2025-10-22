export const API_CONFIG = {
  BASE_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  STORAGE_KEYS: {
    AUTH_TOKEN: 'auth_token',
    USER_DATA: 'user_data',
    REFRESH_TOKEN: 'refresh_token',
    DEVICE_ID: 'device_id',
  },
  ENDPOINTS: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',

    VEHICLES: '/vehicles',
    USER_VEHICLES: '/vehicles/user',
    RENT_VEHICLE: '/vehicles/:id/rent',
    RETURN_VEHICLE: '/vehicles/:id/return',
    EXTEND_RENTAL: '/vehicles/:id/extend',

    PAYMENTS: '/payments',
    PAYMENT_HISTORY: '/payments/history',
    PAYMENT_BY_ID: '/payments/:id',
    PAYMENT_HISTORY_BY_ID: '/payments/:id/history',

    ADMIN_DASHBOARD: '/admin/dashboard',
    ADMIN_USERS: '/admin/users',
    ADMIN_PAYMENTS: '/admin/payments',
    ADMIN_UPDATE_OVERDUE: '/admin/payments/update-overdue',
    ADMIN_USER_BY_ID: '/admin/users/:id',
    ADMIN_USER_STATUS: '/admin/users/:id/status',
    ADMIN_ANALYTICS: '/admin/analytics/payments',
    ADMIN_REPORTS: '/admin/reports/payments',

    WEBHOOK_ABACATE_PAY: '/webhook/abacatepay',
  },
};

// Environment-specific configurations
export const ENVIRONMENTS = {
  development: {
    BASE_URL: 'http://localhost:8080/api/v1',
    DEBUG: true,
  },
  production: {
    BASE_URL: 'https://vehicles-go-production.up.railway.app/api/v1',
    DEBUG: false,
  },
  staging: {
    BASE_URL: 'https://vehicles-go-staging.up.railway.app/api/v1',
    DEBUG: true,
  },
};

export const getCurrentEnvironment = () => {
  const env = process.env.NODE_ENV || 'development';
  return ENVIRONMENTS[env as keyof typeof ENVIRONMENTS] || ENVIRONMENTS.development;
};

export const buildEndpoint = (endpoint: string, params?: Record<string, string>) => {
  let url = endpoint;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, value);
    });
  }
  return url;
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

export const TIMEOUT_CONFIG = {
  SHORT: 5000,
  MEDIUM: 10000,
  LONG: 30000,
};
