import type { SmsService } from '../interfaces/SmsService.js';

/**
 * Mock SMS service — logs OTP to console instead of sending a real SMS.
 * Replace with a real provider implementation (Twilio / Vonage / MSG91).
 */
export class MockSmsService implements SmsService {
  async sendOtp(phone: string, otp: string): Promise<void> {
    // In production this would call a real SMS gateway
    console.log(`[MockSmsService] OTP for ${phone}: ${otp}`);
  }
}

export const smsService: SmsService = new MockSmsService();
