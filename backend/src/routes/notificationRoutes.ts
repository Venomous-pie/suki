import { Router } from 'express';
import { UserModel } from '../models/UserModel';
import { NotificationModel } from '../models/NotificationModel';
import { NotificationService } from '../services/NotificationService';

const router = Router();

// In a real app, these endpoints would be protected by JWT auth middleware
// For this POC, we will accept a `userId` in the body/query for simplicity.

// 1. Register FCM Token
router.post('/register-token', async (req, res) => {
  try {
    const { userId, fcmToken } = req.body;
    if (!userId || !fcmToken) {
      return res.status(400).json({ error: 'userId and fcmToken are required' });
    }
    await UserModel.updateFcmToken(userId, fcmToken);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to register token' });
  }
});

// 2. Fetch Notifications (In-App Center)
router.get('/', async (req, res) => {
  try {
    const userId = parseInt(req.query.userId as string, 10);
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const notifications = await NotificationModel.findByUserId(userId);
    res.json({ notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// 3. Mark Notification as Read
router.post('/read', async (req, res) => {
  try {
    const { userId, notificationId } = req.body;
    if (!userId || !notificationId) {
      return res.status(400).json({ error: 'userId and notificationId are required' });
    }
    await NotificationModel.markAsRead(notificationId, userId);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// 4. Mock Trigger (For testing push notifications)
router.post('/mock-trigger', async (req, res) => {
  try {
    const { userId, type } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    let title = '';
    let body = '';
    let dataPayload: Record<string, string> = {};

    switch (type) {
      case 'new_order':
        title = 'New Order Placed!';
        body = 'Aling Nena Sari-Sari just ordered 3 items.';
        dataPayload = { type: 'order', routeId: 'batch-24' };
        break;
      case 'low_stock':
        title = 'Low Stock Alert';
        body = 'Jasmine Rice 25kg is down to 3 sacks.';
        dataPayload = { type: 'product', productId: '1' };
        break;
      case 'batch_closing':
        title = 'Batch Closing Soon';
        body = 'Batch #24 for Poblacion Route closes in 1 hour.';
        dataPayload = { type: 'batch', batchId: '24' };
        break;
      default:
        title = 'System Alert';
        body = 'This is a generic system notification.';
        dataPayload = { type: 'system' };
    }

    const notification = await NotificationService.sendNotification(userId, title, body, dataPayload);
    res.json({ success: true, notification });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to trigger notification' });
  }
});

export default router;
