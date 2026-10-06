// ============================================================
// Domain Types — mirroring the Prisma schema for frontend use
// ============================================================

export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export type BadgeStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type ProductStatus = 'draft' | 'pending' | 'active' | 'rejected';

export type OrderStatus =
  | 'new'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refused';

export type PaymentMethod = 'cod' | 'electronic';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved_buyer'
  | 'resolved_seller';

export type WithdrawalMethod = 'instapay' | 'vodafone_cash' | 'bank';

export type WithdrawalStatus = 'pending' | 'paid' | 'rejected';

export type WalletTransactionType = 'credit' | 'debit';

export type CustomOrderStatus =
  | 'pending'
  | 'quoted'
  | 'accepted'
  | 'rejected'
  | 'completed';

// ─── Entities ────────────────────────────────────────────────

export interface User {
  id: string;
  phone: string;
  name: string;
  email?: string | null;
  role: UserRole;
  governorate?: string | null;
  avatar?: string | null;
  createdAt: string;
}

export interface Store {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  bio?: string | null;
  logo?: string | null;
  governorate?: string | null;
  badgeStatus: BadgeStatus;
  shippingZones: string[];
  ratingAvg: number;
  ratingCount: number;
}

export interface Category {
  id: string;
  nameAr: string;
  parentId?: string | null;
  image?: string | null;
  children?: Category[];
}

export interface Product {
  id: string;
  storeId: string;
  categoryId: string;
  name: string;
  description: string;
  materials?: string | null;
  priceEgp: number;
  stockQty: number;
  madeToOrder: boolean;
  productionDays?: number | null;
  images: string[];
  videoUrl?: string | null;
  status: ProductStatus;
  rejectionReason?: string | null;
  featured: boolean;
  createdAt: string;
  store?: Store;
  category?: Category;
}

export interface Order {
  id: string;
  buyerId: string;
  storeId: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotalEgp: number;
  shippingFeeEgp: number;
  commissionEgp: number;
  totalEgp: number;
  addressSnapshot: AddressSnapshot;
  notes?: string | null;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  qty: number;
  unitPrice: number;
  customizationSnapshot?: Record<string, unknown> | null;
  product?: Pick<Product, 'id' | 'name' | 'images'>;
}

export interface AddressSnapshot {
  name: string;
  phone: string;
  governorate: string;
  street: string;
  apartment?: string;
}

export interface Review {
  id: string;
  orderId: string;
  storeId: string;
  buyerId: string;
  rating: number;
  comment?: string | null;
  images: string[];
  createdAt?: string;
  buyer?: Pick<User, 'id' | 'name' | 'avatar'>;
}

export interface ShipmentInfo {
  id: string;
  courier: string;
  trackingNumber?: string | null;
  status: string;
  codAmount: number;
  createdAt: string;
}

export interface CodOtpInfo {
  confirmed: boolean;
  expiresAt: string;
}

export interface OrderDetail extends Order {
  orderNumber: string;
  store?: Pick<Store, 'id' | 'name' | 'slug' | 'logo'>;
  items: OrderItem[];
  shipment?: ShipmentInfo | null;
  codOtp?: CodOtpInfo | null;
  review?: Review | null;
  canReview: boolean;
  deliveredAt?: string | null;
  canDispute: boolean;
  dispute?: { id: string; status: DisputeStatus } | null;
}

export interface CreateOrderResult {
  order: OrderDetail;
  paymentIntent?: { paymentKey: string; iframeUrl: string };
  codOtpSent?: boolean;
  /** Present in development to simulate SMS without reading server logs */
  codOtpDevCode?: string;
}

export interface ShippingQuote {
  governorate: string;
  zone: string;
  shippingFeeEgp: number;
}

export interface SellerStoreProfile {
  id: string;
  name: string;
  slug: string;
  bio?: string | null;
  logo?: string | null;
  governorate?: string | null;
  badgeStatus: BadgeStatus;
  shippingZones: string[];
  ratingAvg: number;
  ratingCount: number;
  latestVerification?: {
    id: string;
    status: string;
    mediaUrls: string[];
    note?: string | null;
    reviewNote?: string | null;
    createdAt: string;
  } | null;
}

export interface SellerDashboard {
  user: Pick<User, 'id' | 'name' | 'phone' | 'role' | 'governorate'>;
  store: SellerStoreProfile | null;
  stats: {
    pendingOrders: number;
    activeProducts: number;
    walletBalanceEgp: number;
  };
}

export interface SellerOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  totalEgp: number;
  subtotalEgp: number;
  commissionEgp: number;
  netEgp: number;
  createdAt: string;
  buyerName: string;
  itemsCount: number;
  shipment?: { trackingNumber?: string | null; status: string } | null;
}

export interface SellerEarningsSummary {
  walletBalanceEgp: number;
  pendingNetEgp: number;
  totalEarnedEgp: number;
  recentTransactions: WalletTransactionRow[];
  orderBreakdown: SellerOrderRow[];
}

export interface WalletTransactionRow {
  id: string;
  type: WalletTransactionType;
  amount: number;
  refType?: string | null;
  refId?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface WithdrawalRow {
  id: string;
  amount: number;
  method: WithdrawalMethod;
  destination: string;
  status: WithdrawalStatus;
  createdAt: string;
  processedAt?: string | null;
}

export interface PrintLabelResult {
  orderId: string;
  orderNumber: string;
  trackingNumber?: string | null;
  storeName: string;
  buyerName: string;
  addressLine: string;
  codAmount: number;
}

export interface CustomOrderRow {
  id: string;
  status: CustomOrderStatus;
  details: string;
  quotedPrice?: number | null;
  quotedDays?: number | null;
  sellerNote?: string | null;
  depositPct: number;
  depositPaid: boolean;
  /** quotedPrice × depositPct, null until quoted */
  depositEgp?: number | null;
  createdAt: string;
  product: Pick<Product, 'id' | 'name' | 'images'>;
  store: Pick<Store, 'id' | 'name'>;
  buyer: Pick<User, 'id' | 'name'>;
}

export interface AcceptCustomOrderResult {
  customOrder: CustomOrderRow;
  paymentIntent: { paymentKey: string; iframeUrl: string };
}

export interface DisputeSummary {
  id: string;
  orderId: string;
  orderNumber: string;
  status: DisputeStatus;
  reason: string;
  evidence: string[];
  resolutionNote?: string | null;
  createdAt: string;
  resolvedAt?: string | null;
  storeName: string;
  buyerName: string;
  orderTotalEgp: number;
}

export interface DisputeMessageRow {
  id: string;
  body: string;
  images: string[];
  createdAt: string;
  author: Pick<User, 'id' | 'name' | 'role'>;
}

export interface DisputeDetail extends DisputeSummary {
  messages: DisputeMessageRow[];
}

export interface WalletSummary {
  balanceEgp: number;
  transactions: WalletTransactionRow[];
}

export interface Banner {
  id: string;
  title: string;
  image: string;
  link?: string | null;
  position: number;
  active: boolean;
}

export interface AdminKpis {
  gmvTodayEgp: number;
  ordersToday: number;
  activeStores: number;
  pendingApprovals: number;
  openDisputes: number;
  pendingWithdrawals: number;
}

export interface AdminVerificationRow {
  id: string;
  status: string;
  mediaUrls: string[];
  note?: string | null;
  reviewNote?: string | null;
  createdAt: string;
  store: Pick<Store, 'id' | 'name' | 'governorate' | 'badgeStatus'> & { ownerName: string; ownerPhone: string };
}

export interface AdminProductRow {
  id: string;
  name: string;
  description: string;
  priceEgp: number;
  images: string[];
  status: ProductStatus;
  madeToOrder: boolean;
  rejectionReason?: string | null;
  createdAt: string;
  store: Pick<Store, 'id' | 'name'>;
  category: Pick<Category, 'id' | 'nameAr'>;
}

export interface AdminStoreRow {
  id: string;
  name: string;
  governorate?: string | null;
  badgeStatus: BadgeStatus;
  ratingAvg: number;
  ratingCount: number;
  ownerName: string;
  ownerPhone: string;
  productsCount: number;
}

export interface AdminWithdrawalRow extends WithdrawalRow {
  adminNote?: string | null;
  sellerName: string;
  sellerPhone: string;
  storeName?: string | null;
}

export interface SettlementWeek {
  /** ISO date (Saturday) the week starts on */
  weekStart: string;
  pendingEgp: number;
  paidEgp: number;
  withdrawals: AdminWithdrawalRow[];
}

export interface SellerBalanceRow {
  sellerId: string;
  sellerName: string;
  storeName?: string | null;
  balanceEgp: number;
}

export interface AdminSettlements {
  weeks: SettlementWeek[];
  sellerBalances: SellerBalanceRow[];
}

export interface AdminReports {
  salesByCategory: { categoryId: string; nameAr: string; totalEgp: number; orders: number }[];
  salesByGovernorate: { governorate: string; totalEgp: number; orders: number }[];
  cod: { total: number; refused: number; refusalRatePct: number };
  topStores: { storeId: string; name: string; gmvEgp: number; orders: number; ratingAvg: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  refUrl?: string | null;
  createdAt: string;
}

// ─── API response wrapper ─────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ─── Pagination ───────────────────────────────────────────────
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
