/**
 * SMS service interface.
 * Plug a real SMS provider (Vonage / Twilio / MSG91) by implementing this interface.
 */
export interface SmsService {
  sendOtp(phone: string, otp: string): Promise<void>;
}
