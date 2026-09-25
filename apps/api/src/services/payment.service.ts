import type {
  PaymentService,
  PaymentIntentInput,
  PaymentIntentResult,
  PaymentVerifyResult,
} from '../interfaces/PaymentService.js';

/**
 * Paymob stub — returns a fake iframe URL and payment key.
 * Replace the body of each method with real Paymob API calls.
 */
export class PaymobService implements PaymentService {
  async createIntent(input: PaymentIntentInput): Promise<PaymentIntentResult> {
    console.log('[PaymobStub] createIntent', input);
    // Simulate async work
    await Promise.resolve();
    return {
      paymentKey: `stub_pk_${input.orderId}_${Date.now()}`,
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/stub?token=stub_pk_${input.orderId}`,
    };
  }

  async verifyWebhook(rawBody: string, _signature: string): Promise<PaymentVerifyResult> {
    console.log('[PaymobStub] verifyWebhook rawBody length:', rawBody.length);
    await Promise.resolve();
    // In prod: validate HMAC, parse JSON, return real result
    return {
      orderId: 'stub_order',
      success: true,
      transactionId: `stub_txn_${Date.now()}`,
    };
  }
}

export const paymentService: PaymentService = new PaymobService();
