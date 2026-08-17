import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        body TEXT NOT NULL,
        data_payload JSONB,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Notifications table verified.');
  } catch (err) {
    console.error('Error initializing notifications table:', err);
  }
};

initDB();

export interface Notification {
  id?: number;
  user_id: number;
  title: string;
  body: string;
  data_payload?: Record<string, any>;
  is_read?: boolean;
  created_at?: Date;
}

export class NotificationModel {
  static async create(notification: Notification): Promise<Notification> {
    const result = await pool.query(
      'INSERT INTO notifications (user_id, title, body, data_payload) VALUES ($1, $2, $3, $4) RETURNING *',
      [notification.user_id, notification.title, notification.body, notification.data_payload]
    );
    return result.rows[0] as Notification;
  }

  static async findByUserId(userId: number): Promise<Notification[]> {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return result.rows;
  }

  static async markAsRead(notificationId: number, userId: number): Promise<void> {
    await pool.query('UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2', [notificationId, userId]);
  }
}
