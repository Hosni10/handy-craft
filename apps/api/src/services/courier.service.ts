import type {
  CourierService,
  CourierPickupInput,
  CourierPickupResult,
  CourierTrackResult,
} from '../interfaces/CourierService.js';

/**
 * Bosta courier stub.
 * Generates a fake tracking number and returns canned events.
 * Replace method bodies with real Bosta API calls when credentials are available.
 */
export class BostaService implements CourierService {
  private generateTrackingNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'BST';
    for (let i = 0; i < 9; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  async requestPickup(input: CourierPickupInput): Promise<CourierPickupResult> {
    console.log('[BostaStub] requestPickup', input);
    await Promise.resolve();
    return {
      trackingNumber: this.generateTrackingNumber(),
      courierOrderId: `bosta_${input.orderId}_${Date.now()}`,
      estimatedDays: 3,
    };
  }

  async track(trackingNumber: string): Promise<CourierTrackResult> {
    console.log('[BostaStub] track', trackingNumber);
    await Promise.resolve();
    const now = new Date().toISOString();
    return {
      status: 'IN_TRANSIT',
      lastUpdate: now,
      events: [
        { time: now, description: 'الشحنة في الطريق إليك' },
        {
          time: new Date(Date.now() - 86400000).toISOString(),
          description: 'تم استلام الشحنة من التاجر',
        },
      ],
    };
  }
}

export const courierService: CourierService = new BostaService();
