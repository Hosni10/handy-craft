export interface PaymentIntentInput {
  orderId: string;
  amountEgp: number;
  phone: string;
  name: string;
  email?: string;
}

export interface PaymentIntentResult {
  paymentKey: string;
  iframeUrl: string;
}

export interface PaymentVerifyResult {
  orderId: string;
  success: boolean;
  transactionId: string;
}

/**
 * Payment gateway service interface.
 * Replace the stub with a real Paymob implementation when ready.
 */
export interface PaymentService {
  createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult>;
  verifyWebhook(rawBody: string, signature: string): Promise<PaymentVerifyResult>;
}
