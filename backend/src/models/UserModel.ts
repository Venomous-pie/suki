import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      role TEXT NOT NULL,
      phone TEXT UNIQUE,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

export interface User {
  id?: number;
  role: 'supplier' | 'store_owner';
  phone?: string;
  name?: string;
}

export class UserModel {
  static findByPhone(phone: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE phone = ?', [phone], (err, row) => {
        if (err) reject(err);
        resolve(row as User | undefined);
      });
    });
  }

  static create(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO users (role, phone, name) VALUES (?, ?, ?)',
        [user.role, user.phone, user.name],
        function (err) {
          if (err) reject(err);
          resolve({ ...user, id: this.lastID });
        }
      );
    });
  }
}
