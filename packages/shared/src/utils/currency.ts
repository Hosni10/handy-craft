/**
 * Format a number as Egyptian Pounds using Arabic locale.
 * Example: 1500 → "١٬٥٠٠٫٠٠ ج.م."
 */
export function formatEGP(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number as EGP without the currency symbol.
 */
export function formatEGPAmount(amount: number): string {
  return new Intl.NumberFormat('ar-EG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
