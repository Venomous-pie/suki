import jwt from 'jsonwebtoken';
import { UserModel, User } from '../models/UserModel';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-suki-key';

interface AuthResult {
  token: string;
  user: User;
}

export class AuthService {
  // Simple in-memory store for OTPs
  private static otpStore = new Map<string, { code: string; expiresAt: number }>();

  static async registerSupplier(name: string, phone: string): Promise<AuthResult> {
    let user = await UserModel.findByPhone(phone);
    if (!user) {
      user = await UserModel.create({ role: 'supplier', phone, name });
    }
    return { token: this.generateToken(user), user };
  }

  static async requestOtp(phone: string): Promise<string> {
    // Generate a 6-digit random OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Expires in 5 minutes
    this.otpStore.set(phone, { code: otp, expiresAt: Date.now() + 5 * 60 * 1000 });
    
    // In a real app, integrate with Twilio/SNS here to SMS the code.
    // For now, we just return it so AuthController can send it back in _mockOtp for testing.
    return otp;
  }

  static async verifyOtp(phone: string, otp: string): Promise<AuthResult> {
    const record = this.otpStore.get(phone);
    
    if (!record || record.code !== otp || record.expiresAt < Date.now()) {
      throw new Error('Invalid or expired OTP');
    }

    // OTP is valid, remove it
    this.otpStore.delete(phone);

    let user = await UserModel.findByPhone(phone);
    if (!user) {
      user = await UserModel.create({ role: 'store_owner', phone });
    }
    return { token: this.generateToken(user), user };
  }

  static async socialLogin(provider: string, email: string): Promise<AuthResult> {
    // Mock social login — find or create by a synthetic phone
    let user = await UserModel.findByPhone(`social_${email}`);
    if (!user) {
      user = await UserModel.create({ role: 'store_owner', name: email, phone: `social_${email}` });
    }
    return { token: this.generateToken(user), user };
  }

  private static generateToken(user: User): string {
    return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  }
}
