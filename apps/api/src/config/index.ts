import 'dotenv/config';

/**
 * Central application configuration.
 * All business constants live here — never hardcoded in service/route files.
 */
export const config = {
  // Server
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  // Auth
  jwtSecret: process.env.JWT_SECRET ?? 'change-me-in-production',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '30d',
  otpExpirySeconds: Number(process.env.OTP_EXPIRY_SECONDS ?? 300), // 5 minutes
  /** COD delivery confirmation OTP lifetime */
  codOtpExpirySeconds: Number(process.env.COD_OTP_EXPIRY_SECONDS ?? 3600),
  /** In dev mode the OTP is always this value */
  devOtp: '1234',
  /** In dev mode COD OTP is always this value (logged via SMS stub) */
  devCodOtp: '5678',

  // Business rules
  commissionPct: Number(process.env.COMMISSION_PCT ?? 10),
  /** Buyers may open a dispute within this many hours after delivery */
  disputeWindowHours: Number(process.env.DISPUTE_WINDOW_HOURS ?? 48),
  /** Share of a custom-order quote paid upfront as a deposit */
  customOrderDepositPct: Number(process.env.CUSTOM_ORDER_DEPOSIT_PCT ?? 30),

  /**
   * Flat shipping fees per governorate zone (in EGP).
   * Zones: 'cairo_giza' | 'lower_egypt' | 'upper_egypt' | 'frontier'
   */
  shippingFees: {
    cairo_giza: 35,
    lower_egypt: 50,
    upper_egypt: 65,
    frontier: 80,
  } as Record<string, number>,

  /** Default fee for governorates not mapped to a zone */
  defaultShippingFee: 60,

  // External services (passed to stubs — real credentials go in .env)
  paymobApiKey: process.env.PAYMOB_API_KEY ?? '',
  bostaApiKey: process.env.BOSTA_API_KEY ?? '',

  // File uploads
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/quicktime',
  ],
};
