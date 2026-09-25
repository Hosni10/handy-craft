export interface CourierPickupInput {
  orderId: string;
  sellerAddress: string;
  sellerPhone: string;
  buyerAddress: string;
  buyerPhone: string;
  codAmount?: number; // EGP — 0 means prepaid
}

export interface CourierPickupResult {
  trackingNumber: string;
  courierOrderId: string;
  estimatedDays: number;
}

export interface CourierTrackResult {
  status: string;          // Bosta native status string
  lastUpdate: string;      // ISO timestamp
  events: { time: string; description: string }[];
}

/**
 * Courier service interface.
 * Implemented as a Bosta stub — replace with real API when credentials are available.
 */
export interface CourierService {
  requestPickup(input: CourierPickupInput): Promise<CourierPickupResult>;
  track(trackingNumber: string): Promise<CourierTrackResult>;
}
