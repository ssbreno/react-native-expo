import { env } from '../config/env';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private static formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = this.getLevelPrefix(level);
    let formattedMessage = `${timestamp} ${prefix} ${message}`;

    if (data) {
      formattedMessage += `\n${JSON.stringify(data, null, 2)}`;
    }

    return formattedMessage;
  }

  private static getLevelPrefix(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return '🐛';
      case 'info':
        return 'ℹ️';
      case 'warn':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '📝';
    }
  }

  private static shouldLog(level: LogLevel): boolean {
    return env.shouldLog(level);
  }

  public static debug(message: string, data?: any): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  public static info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  public static warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  public static error(message: string, error?: Error | any): void {
    if (this.shouldLog('error')) {
      const errorData =
        error instanceof Error
          ? { name: error.name, message: error.message, stack: error.stack }
          : error;

      console.error(this.formatMessage('error', message, errorData));
    }
  }

  // API specific logging
  public static apiRequest(method: string, url: string, data?: any): void {
    this.debug(`API Request: ${method.toUpperCase()} ${url}`, data);
  }

  public static apiResponse(method: string, url: string, status: number, data?: any): void {
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'debug';
    this[level](`API Response: ${method.toUpperCase()} ${url} (${status})`, data);
  }

  public static apiError(method: string, url: string, error: any): void {
    this.error(`API Error: ${method.toUpperCase()} ${url}`, error);
  }

  // Payment specific logging
  public static paymentCreated(paymentId: string, amount: number, method: string): void {
    this.info(`Payment Created: ${paymentId}`, { amount, method });
  }

  public static paymentCompleted(paymentId: string, amount: number): void {
    this.info(`Payment Completed: ${paymentId}`, { amount });
  }

  public static paymentFailed(paymentId: string, error: string): void {
    this.error(`Payment Failed: ${paymentId}`, { error });
  }

  // Authentication specific logging
  public static userLogin(email: string): void {
    this.info(`User Login: ${email}`);
  }

  public static userLogout(email?: string): void {
    this.info(`User Logout${email ? `: ${email}` : ''}`);
  }

  public static authError(error: string): void {
    this.error(`Authentication Error: ${error}`);
  }

  // Performance logging
  public static performance(operation: string, duration: number): void {
    this.debug(`Performance: ${operation} took ${duration}ms`);
  }

  // Feature flag logging
  public static featureFlag(flag: string, enabled: boolean): void {
    this.debug(`Feature Flag: ${flag} = ${enabled}`);
  }
}

// Export convenience functions
export const log = Logger;
export const logger = Logger;
