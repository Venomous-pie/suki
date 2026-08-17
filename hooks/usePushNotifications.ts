import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { router } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

// We import types only to keep TypeScript happy
import type * as NotificationsType from 'expo-notifications';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let Notifications: typeof NotificationsType | null = null;

if (!isExpoGo) {
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn('Failed to load expo-notifications', error);
  }
}

export function usePushNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<NotificationsType.Notification | undefined>();
  // We use any here for the ref because EventSubscription type might be tricky if not imported directly
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (isExpoGo || !Notifications) {
      console.warn('Push notifications are not supported in Expo Go. Please use a development build.');
      return;
    }

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        setExpoPushToken(token);
        // If logged in, send the token to the backend
        if (user?.id) {
          registerTokenWithBackend(user.id, token);
        }
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      // Handle deep linking based on data payload
      const data = response.notification.request.content.data;
      if (data?.type === 'batch' && data.batchId) {
        console.log('User tapped batch notification, deep linking to batch:', data.batchId);
        router.push(`/supplier/batches/${data.batchId}`);
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [user?.id]);

  return {
    expoPushToken,
    notification,
  };
}

async function registerTokenWithBackend(userId: number, token: string) {
  try {
    const backendUrl = process.env.EXPO_PUBLIC_API_URL || 'https://suki-auth-api.loca.lt';
    await fetch(`${backendUrl}/api/notifications/register-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, fcmToken: token }),
    });
  } catch (err) {
    console.error('Failed to register FCM token with backend:', err);
  }
}

async function registerForPushNotificationsAsync() {
  let token;

  if (!Notifications) {
    return token;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    // Learn more about projectId: https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    try {
      // By passing nothing here, we request an Expo push token. 
      // If we strictly want the device FCM token, we use getDevicePushTokenAsync().
      // For this implementation, we will use the device push token to send raw FCM directly.
      const deviceToken = await Notifications.getDevicePushTokenAsync();
      token = deviceToken.data;
    } catch (e) {
      console.error(e);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
