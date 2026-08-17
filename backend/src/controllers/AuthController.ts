import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  static async registerSupplier(req: Request, res: Response) {
    try {
      const { name, phone } = req.body;
      const { token, user } = await AuthService.registerSupplier(name, phone);
      res.json({ token, role: 'supplier', user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async requestOtp(req: Request, res: Response) {
    try {
      const { phone } = req.body;
      const otp = await AuthService.requestOtp(phone);
      res.json({ message: 'OTP sent successfully', _mockOtp: otp });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async verifyOtp(req: Request, res: Response) {
    try {
      const { phone, otp } = req.body;
      const { token, user } = await AuthService.verifyOtp(phone, otp);
      res.json({ token, role: 'store_owner', user });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }

  static async socialLogin(req: Request, res: Response) {
    try {
      const { provider, email } = req.body;
      const { token, user } = await AuthService.socialLogin(provider, email);
      res.json({ token, role: 'store_owner', user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
