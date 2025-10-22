import { LogLevel } from '../utils/logger';

export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  apiTimeout: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '10000', 10),
  apiRetryAttempts: parseInt(process.env.EXPO_PUBLIC_API_RETRY_ATTEMPTS || '3', 10),
  apiRetryDelay: parseInt(process.env.EXPO_PUBLIC_API_RETRY_DELAY || '1000', 10),
  appName: process.env.EXPO_PUBLIC_APP_NAME || 'Nanquim Locações',
  appVersion: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  debug: process.env.EXPO_PUBLIC_DEBUG === 'true',
  enablePushNotifications: process.env.EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS === 'true',
  enablePixPayments: process.env.EXPO_PUBLIC_PIX_ENABLED === 'true',
  pixProvider: process.env.EXPO_PUBLIC_PIX_PROVIDER || 'abacatepay',

  /**
   * Determines if a log level should be logged based on environment
   * @param level - The log level to check
   * @returns true if the log should be output
   */
  shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (this.isProduction) {
      return level === 'warn' || level === 'error';
    }

    // In development with debug enabled, log everything
    if (this.debug) {
      return true;
    }

    // In development without debug, log info, warn, and error
    return level !== 'debug';
  },

  /**
   * Get current environment name
   */
  get environment(): 'development' | 'production' | 'staging' {
    if (this.isProduction) return 'production';
    if (process.env.NODE_ENV === 'staging') return 'staging';
    return 'development';
  },
};

// Export individual config values for convenience
export const {
  apiUrl,
  apiTimeout,
  apiRetryAttempts,
  apiRetryDelay,
  appName,
  appVersion,
  isDevelopment,
  isProduction,
  debug,
  enablePushNotifications,
  enablePixPayments,
  pixProvider,
} = env;
