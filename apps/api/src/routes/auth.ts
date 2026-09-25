import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { sendOtpSchema, verifyOtpSchema } from '@craftsouq/shared';

const router = Router();

// Public
router.post('/send-otp', validate(sendOtpSchema), (req, res, next) => {
  authController.sendOtp(req, res).catch(next);
});

router.post('/verify-otp', validate(verifyOtpSchema.extend({ otp: verifyOtpSchema.shape.otp })), (req, res, next) => {
  authController.verifyOtp(req, res).catch(next);
});

router.post('/refresh', (req, res, next) => {
  authController.refresh(req, res).catch(next);
});

router.post('/logout', (req, res) => {
  authController.logout(req, res);
});

// Protected
router.get('/me', authenticate, (req, res, next) => {
  authController.me(req, res).catch(next);
});

export default router;
