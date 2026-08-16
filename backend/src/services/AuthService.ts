import jwt from 'jsonwebtoken';
import { UserModel, User } from '../models/UserModel';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-suki-key';

export class AuthService {
  static async registerSupplier(name: string, phone: string): Promise<string> {
    let user = await UserModel.findByPhone(phone);
    if (!user) {
      user = await UserModel.create({ role: 'supplier', phone, name });
    }
    return this.generateToken(user);
  }

  static async requestOtp(phone: string): Promise<string> {
    // In a real app, integrate with Twilio/SNS here
    // For now, return a fixed mock OTP
    return '000000';
  }

  static async verifyOtp(phone: string, otp: string): Promise<string> {
    // Fake OTP verification logic
    if (otp !== '000000') {
      throw new Error('Invalid OTP');
    }

    let user = await UserModel.findByPhone(phone);
    if (!user) {
      user = await UserModel.create({ role: 'store_owner', phone });
    }
    return this.generateToken(user);
  }

  static async socialLogin(provider: string, email: string): Promise<string> {
    // Mock social login
    const mockUser: User = { role: 'store_owner', name: email };
    return this.generateToken(mockUser);
  }

  private static generateToken(user: User): string {
    return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  }
}
