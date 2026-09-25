import { config } from '../config/index.js';
import {
  getShippingZoneForGovernorate,
  type ShippingZone,
} from '@craftsouq/shared';

export function resolveShippingFeeEgp(governorate: string): { zone: ShippingZone; shippingFeeEgp: number } {
  const zone = getShippingZoneForGovernorate(governorate);
  const shippingFeeEgp = config.shippingFees[zone] ?? config.defaultShippingFee;
  return { zone, shippingFeeEgp };
}

export function orderDisplayNumber(orderId: string): string {
  return orderId.replace(/-/g, '').slice(0, 8).toUpperCase();
}

function decimalToNumber(value: { toNumber(): number } | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

export function serializeOrder<T extends Record<string, unknown>>(order: T): T {
  const out = { ...order } as Record<string, unknown>;
  for (const key of ['subtotalEgp', 'shippingFeeEgp', 'commissionEgp', 'totalEgp'] as const) {
    if (key in out && out[key] != null) {
      out[key] = decimalToNumber(out[key] as { toNumber(): number });
    }
  }
  if (Array.isArray(out.items)) {
    out.items = (out.items as Record<string, unknown>[]).map((item) => ({
      ...item,
      unitPrice: item.unitPrice != null ? decimalToNumber(item.unitPrice as { toNumber(): number }) : item.unitPrice,
      product: item.product
        ? {
            ...item.product,
            priceEgp:
              (item.product as Record<string, unknown>).priceEgp != null
                ? decimalToNumber((item.product as Record<string, unknown>).priceEgp as { toNumber(): number })
                : (item.product as Record<string, unknown>).priceEgp,
          }
        : item.product,
    }));
  }
  if (out.shipment && typeof out.shipment === 'object') {
    const s = out.shipment as Record<string, unknown>;
    out.shipment = {
      ...s,
      codAmount: s.codAmount != null ? decimalToNumber(s.codAmount as { toNumber(): number }) : s.codAmount,
    };
  }
  return out as T;
}
