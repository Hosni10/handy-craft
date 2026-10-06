You are a senior full-stack architect and product engineer. Build a production-grade, 
marketplace web application called "Handy Craft" — an Etsy-style marketplace EXCLUSIVELY 
for Egyptian handmade artisans ("Handmade-only" is our core identity).

# BUSINESS CONTEXT
- Market: Egypt. Currency: EGP (جنيه مصري).
- Language: FULL Arabic UI, RTL layout (dir="rtl"), with clean, warm, artisan-craft 
  visual identity (earthy tones: terracotta, sand, olive). Use a modern Arabic font 
  (e.g., IBM Plex Sans Arabic / Tajawal via Google Fonts or Fontsource).
- Business model: Commission on sales (platform takes % of each order).
- Payments: COD (Cash on Delivery) is the PRIMARY method (~75% of orders), plus 
  electronic payment stub (Paymob gateway — cards, Fawry, mobile wallets, InstaPay).
- Shipping: single courier integration STUB (Bosta API) — pickup from artisan workshops, 
  nationwide Egyptian governorates.

# USER ROLES (RBAC)
1. BUYER — browse, search, order, pay (COD/electronic), track, review, open disputes, 
   request custom orders.
2. SELLER (Artisan) — create store, get verified, list products, manage orders, 
   withdraw earnings.
3. ADMIN — approve/reject stores & products, resolve disputes, manage settlements, 
   manage categories/banners, view reports.

# DATA MODEL (PostgreSQL — define full schema with relations, indexes, constraints)
- users (id, phone UNIQUE, name, email?, role, governorate, avatar, created_at) — 
  phone + OTP is the primary auth method
- stores (id, owner_id→users, name, slug, bio, logo, governorate, badge_status 
  [unverified/pending/verified/rejected], shipping_zones, rating_avg, rating_count)
- store_verifications (id, store_id, media_urls[], note, reviewed_by, reviewed_at, status)
- categories (id, name_ar, parent_id?, image) — seed: سيراميك وخزف، كروشيه وتريكو، 
  خشب، جلد طبيعي، نحاس ومعادن، تطريز وأقمشة، شموع، إكسسوارات، فنون
- products (id, store_id, category_id, name, description, materials, price_egp, 
  stock_qty, made_to_order BOOLEAN, production_days, images[], video_url?, 
  status [draft/pending/active/rejected], featured, created_at)
- product_customizations (id, product_id, option_name, choices[], price_delta)
- custom_order_requests (id, buyer_id, product_id, details, quoted_price?, 
  deposit_pct, status [pending/quoted/accepted/rejected/completed])
- orders (id, buyer_id, store_id, status [new/confirmed/preparing/shipped/delivered/
  cancelled/refused], payment_method [cod/electronic], payment_status, subtotal_egp, 
  shipping_fee_egp, commission_egp, total_egp, address_snapshot, notes, created_at)
- order_items (id, order_id, product_id, qty, unit_price, customization_snapshot JSONB)
- shipments (id, order_id, courier, tracking_number?, status, cod_amount, 
  courier_payload JSONB)
- wallets (id, user_id, balance_egp) + wallet_transactions (id, wallet_id, type 
  [credit/debit], amount, ref_type, ref_id, note, created_at)
- withdrawals (id, seller_id, amount, method [instapay/vodafone_cash/bank], 
  destination, status [pending/paid/rejected], processed_by, processed_at)
- reviews (id, order_id, store_id, buyer_id, rating 1-5, comment, images[], 
  UNIQUE(order_id))
- disputes (id, order_id, opened_by, reason, evidence[], status [open/under_review/
  resolved_buyer/resolved_seller], resolution_note, resolved_by)
- banners (id, title, image, link?, position, active)
- notifications (id, user_id, title, body, type, read, ref_url)

# BUYER FEATURES
- Home: hero banner carousel, category grid, "New arrivals", "Verified artisans", 
  "Ready to ship today" sections.
- Search & filters: full-text Arabic search, filter by category, governorate, price 
  range, rating, made_to_order vs ready; sort by newest/price/rating.
- Product page: image gallery, video, artisan card with badge + rating, production 
  time, return policy, delivery estimate, "Request customization" button.
- Cart & checkout: cart, address form (governorate dropdown — all 27 Egyptian 
  governorates), payment method selection (COD default / electronic stub), 
  order confirmation screen with order number.
- COD confirmation: generate 4-digit OTP per order; simulate "confirm via WhatsApp/SMS" 
  flow in-app (mock).
- Order tracking: timeline (confirmed → preparing → shipped with tracking # → delivered).
- Reviews: after delivery only.
- Custom orders: request form → artisan quotes price + days → buyer pays 30% deposit 
  (stub) → status flow.
- Disputes: open within 48h of delivery with evidence images.
- Wallet: view balance (from refunds), transactions history.

# SELLER FEATURES
- Onboarding wizard: phone OTP → store profile (name, governorate, shipping zones) → 
  verification upload (3-5 workshop images/video) → status = pending.
- Product CRUD with image upload (multi), made-to-order toggle, production days, 
  rich Arabic description.
- Orders dashboard: kanban/list by status (new/confirmed/preparing/shipped/delivered), 
  actions: confirm order, print label (mock), request courier pickup (Bosta stub).
- Earnings: balance overview, per-order breakdown (price − commission = net), 
  withdrawals with method + destination, history.
- Custom order inbox: view requests, quote price/days.
- Store public page with all products + reviews.

# ADMIN PANEL (separate route /admin, clean dashboard UI)
- KPI cards: GMV today, orders today, active stores, pending approvals.
- Approval queues: store verifications, pending products — approve/reject with reason.
- Disputes inbox: view evidence, chat-like thread, resolve in favor of buyer 
  (refund wallet) or seller.
- Settlements: weekly batch view of seller balances, mark withdrawals paid.
- CMS: banners CRUD, categories CRUD, manual badge grant.
- Reports: sales by category/governorate, COD refusal rate, top stores table.

# TECHNICAL REQUIREMENTS
- Stack: React + Vite + TypeScript (frontend), Node.js + Express
  (backend), PostgreSQL, Prisma or Drizzle ORM, Tailwind CSS + shadcn/ui, 
  Zustand or React Query for state/data fetching, React Router.
- AUTH: phone number + OTP (mock OTP for dev: always "1234"; design the service 
  behind an interface so a real SMS provider plugs in later). JWT access + refresh 
  tokens, httpOnly cookies, role-based route guards (middleware on every API).
- FOLDER STRUCTURE: monorepo with /apps/web, /apps/api, /packages/shared (types + 
  zod schemas shared between client/server). Generate the complete folder tree and 
  scaffold it. Use a clean layered architecture: routes → controllers → services → 
  repositories.
- FILE UPLOADS: local /uploads dir with multer, validate mime-type + size, serve via 
  static route. Abstract behind a storage interface (S3-compatible later).
- VALIDATION: zod schemas on every endpoint; consistent API response format 
  { success, data, error }.
- ERRORS: global error handler, Arabic user-facing messages.
- SEED SCRIPT: seed admin account (phone 01000000000, otp 1234), 4 sample sellers 
  with verified badges, 3 categories deep, 20 realistic products in Arabic (ceramics, 
  crochet, copper) with picsum placeholder images, 2 sample orders across statuses, 
  realistic Egyptian governorates data.
- In-app mock integrations (clearly isolated behind service interfaces, never 
  crash the app): PaymentService (Paymob stub), CourierService (Bosta stub with 
  tracking number generator), SmsService (console.log OTP).
- ENV: .env.example with DATABASE_URL, JWT_SECRET, PAYMOB_API_KEY, BOSTA_API_KEY, 
  COMMISSION_PCT=10.
- CONFIG: commission percentage, shipping fees per zone, OTP expiry — all in a 
  config file, never hardcoded.
- Currency formatting: Intl.NumberFormat('ar-EG', { currency: 'EGP' }) everywhere.

# DELIVERY — BUILD IN PHASES, ONE PHASE PER RESPONSE. After each phase, stop and 
wait for my "continue" before the next phase:
  PHASE 1: Folder structure + monorepo scaffold + Prisma schema + seed script + 
           design system (Tailwind theme, RTL setup, layout shell, Arabic typography).
  PHASE 2: Auth (OTP mock, JWT, RBAC middleware) + Buyer browse/search/product pages.
  PHASE 3: Cart + checkout + orders + COD OTP + tracking + reviews.
  PHASE 4: Seller onboarding, product CRUD, orders dashboard, earnings & withdrawals.
  PHASE 5: Custom orders + disputes + wallet.
  PHASE 6: Admin panel (approvals, settlements, CMS, reports).
  PHASE 7: Polish — loading skeletons, empty states, responsive QA on mobile widths, 
           README with setup instructions.

# QUALITY BAR
- Mobile-first responsive (360px and up) — most Egyptian users are on phones.
- Every list view needs: loading skeleton, empty state (with Arabic message + CTA), 
  and error state.
- No TODO stubs in UI — every button either works or is hidden.
- Keep code clean and Cursor-friendly: typed, commented at service boundaries, 
  consistent naming.

Start with PHASE 1 now. Confirm you understand the full scope, show me the folder 
tree and tech choices, then implement it.