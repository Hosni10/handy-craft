/**
 * Maps each Egyptian governorate to a shipping fee zone.
 * Fee amounts live in server config — use GET /orders/shipping-quote for exact EGP.
 */
export type ShippingZone = 'cairo_giza' | 'lower_egypt' | 'upper_egypt' | 'frontier';

const ZONE_MAP: Record<ShippingZone, readonly string[]> = {
  cairo_giza: ['القاهرة', 'الجيزة'],
  lower_egypt: [
    'الإسكندرية',
    'الدقهلية',
    'البحيرة',
    'الغربية',
    'المنوفية',
    'القليوبية',
    'الشرقية',
    'كفر الشيخ',
    'دمياط',
    'بورسعيد',
    'الإسماعيلية',
    'السويس',
  ],
  upper_egypt: [
    'الفيوم',
    'المنيا',
    'أسيوط',
    'سوهاج',
    'قنا',
    'الأقصر',
    'أسوان',
    'بني سويف',
  ],
  frontier: [
    'مطروح',
    'شمال سيناء',
    'جنوب سيناء',
    'البحر الأحمر',
    'الوادي الجديد',
  ],
};

export function getShippingZoneForGovernorate(governorate: string): ShippingZone {
  for (const [zone, governorates] of Object.entries(ZONE_MAP) as [ShippingZone, readonly string[]][]) {
    if (governorates.includes(governorate)) return zone;
  }
  return 'upper_egypt';
}

/** Mirror of API config defaults — used for client-side estimates only */
export const DEFAULT_SHIPPING_FEES: Record<ShippingZone, number> = {
  cairo_giza: 35,
  lower_egypt: 50,
  upper_egypt: 65,
  frontier: 80,
};

export const DEFAULT_SHIPPING_FEE_FALLBACK = 60;

export function estimateShippingFeeEgp(governorate: string): number {
  const zone = getShippingZoneForGovernorate(governorate);
  return DEFAULT_SHIPPING_FEES[zone] ?? DEFAULT_SHIPPING_FEE_FALLBACK;
}
