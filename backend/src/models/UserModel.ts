import { Pool } from 'pg';

// Initialize the Postgres connection pool
// Render injects the DATABASE_URL environment variable automatically
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Initialize tables on startup
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        role VARCHAR(50) NOT NULL,
        phone VARCHAR(20) UNIQUE,
        name VARCHAR(100),
        fcm_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Add fcm_token column if it doesn't exist (for existing DBs)
    try {
      await pool.query(`ALTER TABLE users ADD COLUMN fcm_token VARCHAR(255)`);
      console.log('Added fcm_token column to users table.');
    } catch (e: any) {
      // Ignore error if column already exists (code 42701 in Postgres)
    }
    
    console.log('Database tables verified.');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
};

initDB();

export interface User {
  id?: number;
  role: 'supplier' | 'store_owner';
  phone?: string;
  name?: string;
  fcm_token?: string;
}

export class UserModel {
  static async findByPhone(phone: string): Promise<User | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    return result.rows[0] as User | undefined;
  }

  static async findById(id: number): Promise<User | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] as User | undefined;
  }

  static async create(user: User): Promise<User> {
    const result = await pool.query(
      'INSERT INTO users (role, phone, name, fcm_token) VALUES ($1, $2, $3, $4) RETURNING *',
      [user.role, user.phone, user.name, user.fcm_token]
    );
    return result.rows[0] as User;
  }

  static async updateFcmToken(userId: number, token: string): Promise<void> {
    await pool.query('UPDATE users SET fcm_token = $1 WHERE id = $2', [token, userId]);
  }
}
