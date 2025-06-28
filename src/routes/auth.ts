import express from 'express';
import { authService } from '../services/authService';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = express.Router();

// Register
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    error.statusCode = 400;
    next(error);
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      res.status(400).json({ error: 'Email and OTP are required' });
      return;
    }
    
    const result = await authService.verifyOTP(email, otp);
    res.json(result);
  } catch (error: any) {
    error.statusCode = 400;
    next(error);
  }
});

// Login
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error: any) {
    error.statusCode = 400;
    next(error);
  }
});

// Request password reset
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    
    const result = await authService.requestPasswordReset(email);
    res.json(result);
  } catch (error: any) {
    error.statusCode = 400;
    next(error);
  }
});

// Reset password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      res.status(400).json({ error: 'Email, OTP, and new password are required' });
      return;
    }
    
    const result = await authService.resetPassword(email, otp, newPassword);
    res.json(result);
  } catch (error: any) {
    error.statusCode = 400;
    next(error);
  }
});

export { router as authRoutes };
