import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { NotificationModel } from '../models/NotificationModel';
import { UserModel } from '../models/UserModel';

let isFirebaseInitialized = false;

try {
  if (process.env.FIREBASE_PROJECT_ID && getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines for proper parsing from .env strings
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    isFirebaseInitialized = true;
    console.log('Firebase Admin initialized successfully.');
  } else if (getApps().length > 0) {
    isFirebaseInitialized = true;
    console.log('Firebase Admin already initialized.');
  } else {
    console.warn('Firebase Admin credentials missing from env. Push notifications will only be saved to DB.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin:', error);
}

export class NotificationService {
  /**
   * Sends a notification via FCM and saves it to the PostgreSQL database for the in-app notification center.
   * Uses "Data Messages" so the frontend can handle routing and deep-linking natively.
   */
  static async sendNotification(userId: number, title: string, body: string, dataPayload?: Record<string, string>) {
    // 1. Save to Database (In-App Notification Center Source of Truth)
    const notification = await NotificationModel.create({
      user_id: userId,
      title,
      body,
      data_payload: dataPayload,
    });

    // 2. Send via FCM if initialized
    if (!isFirebaseInitialized) {
      console.log('Push notification skipped (Firebase not initialized). DB saved.');
      return notification;
    }

    try {
      const user = await UserModel.findById(userId);
      if (!user || !user.fcm_token) {
        console.log(`Push notification skipped for user ${userId} (No FCM Token found)`);
        return notification;
      }

      const message: Message = {
        token: user.fcm_token,
        notification: {
          title,
          body,
        },
        data: {
          ...dataPayload,
          // Stringify any complex objects because FCM data payload only supports strings
          notificationId: notification.id?.toString() || '',
        },
        android: {
          priority: 'high',
        },
        apns: {
          payload: {
            aps: {
              contentAvailable: true,
              sound: 'default',
            },
          },
        },
      };

      const response = await getMessaging().send(message);
      console.log(`Successfully sent message to user ${userId}:`, response);
    } catch (error) {
      console.error(`Error sending push notification to user ${userId}:`, error);
      // We don't throw here because we still want the DB save to succeed so the user sees it in-app
    }

    return notification;
  }
}
