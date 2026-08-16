import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();

router.post('/supplier/register', AuthController.registerSupplier);
router.post('/store-owner/request-otp', AuthController.requestOtp);
router.post('/store-owner/verify-otp', AuthController.verifyOtp);
router.post('/social-login', AuthController.socialLogin);

export default router;
