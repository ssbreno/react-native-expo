import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { notificationService } from '../services/notificationService';
import { adminService } from '../services/adminService';
import { useAuth } from '../contexts/AuthContext';

interface UseNotificationsProps {
  onNotificationReceived?: (notification: Notifications.Notification) => void;
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void;
  autoRegister?: boolean;
}

/**
 * Hook para gerenciar notificações push no app
 *
 * @example
 * ```tsx
 * const { expoPushToken } = useNotifications({
 *   onNotificationResponse: (response) => {
 *     const data = response.notification.request.content.data;
 *     if (data.type === 'payment_reminder') {
 *       navigation.navigate('PaymentHistory');
 *     }
 *   },
 *   autoRegister: true
 * });
 * ```
 */
export function useNotifications({
  onNotificationReceived,
  onNotificationResponse,
  autoRegister = true,
}: UseNotificationsProps = {}) {
  const { user } = useAuth();
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  useEffect(() => {
    // Auto-register para notificações se habilitado
    if (autoRegister && user?.id) {
      registerForPushNotifications();
    }

    // Adicionar listeners
    if (onNotificationReceived) {
      notificationListener.current =
        notificationService.addNotificationReceivedListener(onNotificationReceived);
    }

    if (onNotificationResponse) {
      responseListener.current =
        notificationService.addNotificationResponseListener(onNotificationResponse);
    }

    // Cleanup
    return () => {
      if (notificationListener.current) {
        notificationService.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        notificationService.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [autoRegister, user?.id]);

  const registerForPushNotifications = async () => {
    if (!user?.id) {
      console.log('⚠️ Usuário não autenticado, não é possível registrar para notificações');
      return null;
    }

    try {
      const token = await notificationService.registerForPushNotifications();

      if (token) {
        // Registrar token no servidor
        const result = await adminService.registerPushToken(user.id.toString(), token);

        if (result.success) {
          console.log('✅ Push token registrado com sucesso:', token);
          return token;
        } else {
          console.error('❌ Erro ao registrar push token no servidor:', result.error);
        }
      }

      return token;
    } catch (error) {
      console.error('❌ Erro ao registrar para notificações:', error);
      return null;
    }
  };

  const sendLocalNotification = async (
    title: string,
    body: string,
    data?: any,
    delaySeconds: number = 0
  ) => {
    try {
      const notificationId = await notificationService.scheduleLocalNotification(
        title,
        body,
        data,
        delaySeconds
      );
      return notificationId;
    } catch (error) {
      console.error('❌ Erro ao enviar notificação local:', error);
      return null;
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationService.clearAllNotifications();
    } catch (error) {
      console.error('❌ Erro ao limpar notificações:', error);
    }
  };

  const setBadgeCount = async (count: number) => {
    try {
      await notificationService.setBadgeCount(count);
    } catch (error) {
      console.error('❌ Erro ao definir badge count:', error);
    }
  };

  return {
    expoPushToken: notificationService.getExpoPushToken(),
    registerForPushNotifications,
    sendLocalNotification,
    clearAllNotifications,
    setBadgeCount,
  };
}
