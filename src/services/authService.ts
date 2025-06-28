import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { database } from '../config/database';
import { emailService } from './emailService';
import { User, RegisterRequest, LoginRequest } from '../types';

class AuthService {
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateJWT(userId: number, email: string): string {
    const payload = { id: userId, email };
    // @ts-ignore
    return jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });
  }

  async register(userData: RegisterRequest): Promise<{ message: string }> {
    const { email, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await database.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUser.length > 0) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS!) || 12);

    // Generate OTP
    const otpCode = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Insert user
    await database.query(
      `INSERT INTO users (email, password, first_name, last_name, otp_code, otp_expires_at) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, firstName, lastName, otpCode, otpExpiresAt]
    );

    // Send OTP email
    await emailService.sendOTP(email, otpCode);

    return { message: 'Registration successful! Please check your email for OTP verification.' };
  }

  async verifyOTP(email: string, otp: string): Promise<{ message: string; token: string }> {
    const users = await database.query(
      'SELECT id, otp_code, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    if (!user.otp_code || user.otp_code !== otp) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      throw new Error('OTP has expired');
    }

    // Update user as verified and clear OTP
    await database.query(
      'UPDATE users SET is_verified = TRUE, otp_code = NULL, otp_expires_at = NULL WHERE email = ?',
      [email]
    );

    // Generate JWT token
    const token = this.generateJWT(user.id, email);

    return {
      message: 'Email verified successfully!',
      token,
    };
  }

  async login(loginData: LoginRequest): Promise<{ message: string; token: string; user: any }> {
    const { email, password } = loginData;

    const users = await database.query(
      'SELECT id, email, password, first_name, last_name, is_verified FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('Invalid email or password');
    }

    const user = users[0];

    if (!user.is_verified) {
      throw new Error('Please verify your email before logging in');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateJWT(user.id, user.email);

    return {
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    };
  }

  async resendOTP(email: string): Promise<{ message: string }> {
    const users = await database.query(
      'SELECT id FROM users WHERE email = ? AND is_verified = FALSE',
      [email]
    );

    if (users.length === 0) {
      throw new Error('User not found or already verified');
    }

    const otpCode = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await database.query(
      'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?',
      [otpCode, otpExpiresAt, email]
    );

    await emailService.sendOTP(email, otpCode);

    return { message: 'OTP resent successfully!' };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const users = await database.query(
      'SELECT id FROM users WHERE email = ? AND is_verified = TRUE',
      [email]
    );

    if (users.length === 0) {
      throw new Error('User not found or email not verified');
    }

    const otpCode = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await database.query(
      'UPDATE users SET otp_code = ?, otp_expires_at = ? WHERE email = ?',
      [otpCode, otpExpiresAt, email]
    );

    await emailService.sendPasswordResetOTP(email, otpCode);

    return { message: 'Password reset OTP sent to your email!' };
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ message: string }> {
    const users = await database.query(
      'SELECT id, otp_code, otp_expires_at FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      throw new Error('User not found');
    }

    const user = users[0];

    if (!user.otp_code || user.otp_code !== otp) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      throw new Error('OTP has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS!) || 12);

    await database.query(
      'UPDATE users SET password = ?, otp_code = NULL, otp_expires_at = NULL WHERE email = ?',
      [hashedPassword, email]
    );

    return { message: 'Password reset successfully!' };
  }

  verifyToken(token: string): { id: number; email: string } {
    try {
      // @ts-ignore
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      return { id: decoded.id, email: decoded.email };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }
}

export const authService = new AuthService();