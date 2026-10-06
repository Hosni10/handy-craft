# هاندي كرافت | Handy Craft

سوق المنتجات اليدوية المصرية الأصيلة — Etsy-style marketplace for Egyptian handmade artisans.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui (RTL Arabic) |
| State | Zustand + TanStack Query |
| Routing | React Router v6 |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Monorepo | npm workspaces |
| Auth | Phone OTP + JWT (httpOnly cookies) |

---

## Prerequisites

- Node.js ≥ 20
- npm ≥ 10
- PostgreSQL 15+ running locally (or a cloud connection string)

---

## Setup

### 1. Install dependencies

```bash
# From the repo root
npm install
```

### 2. Configure environment

```bash
cp .env.example apps/api/.env
# Edit apps/api/.env — set DATABASE_URL and JWT_SECRET at minimum
```

### 3. Run database migrations

```bash
npm run db:migrate
# This also runs prisma generate automatically
```

### 4. Seed the database

```bash
npm run seed
```

This creates:
- **Admin** — phone `01000000000`, OTP `1234`
- **4 verified sellers** — phones `01100000001`–`01100000004`, OTP `1234`
- **Sample buyer** — phone `01200000001`, OTP `1234`
- 9 root categories + sub-categories
- 20 realistic Arabic products (ceramics, crochet, copper, embroidery)
- 2 sample orders at different statuses
- 3 homepage banners

### 5. Start development servers

```bash
# Start both API and web in parallel
npm run dev

# Or start separately:
npm run dev:api   # http://localhost:4000
npm run dev:web   # http://localhost:5173
```

---

## Project Structure

```
handy-craft/
├── apps/
│   ├── api/                  # Express API
│   │   ├── prisma/
│   │   │   ├── schema.prisma # Full database schema
│   │   │   └── seed.ts       # Seed script
│   │   └── src/
│   │       ├── config/       # App config (commission, fees, OTP expiry)
│   │       ├── controllers/  # Route handlers (Phase 2+)
│   │       ├── interfaces/   # Service interfaces (SMS, Payment, Courier, Storage)
│   │       ├── lib/          # Prisma client, response helpers, AppError
│   │       ├── middlewares/  # auth, validate, upload, errorHandler
│   │       ├── repositories/ # DB access layer (Phase 2+)
│   │       ├── routes/       # Express routers
│   │       └── services/     # Business logic + mock implementations
│   └── web/                  # React frontend
│       └── src/
│           ├── components/
│           │   ├── layout/   # Navbar, Footer, RootLayout
│           │   └── ui/       # shadcn/ui components
│           ├── lib/          # api client, utils
│           ├── pages/        # Route pages
│           └── router/       # React Router config
└── packages/
    └── shared/               # Shared TypeScript types + Zod schemas
        └── src/
            ├── schemas/      # auth, product, order, store
            ├── types/        # Domain types
            └── utils/        # formatEGP, governorates list
```

---

## API Conventions

All endpoints return:

```json
{ "success": true, "data": { ... } }
// or
{ "success": false, "error": "رسالة خطأ بالعربية" }
```

### Endpoints overview

| Mount | Who | Purpose |
|---|---|---|
| `/api/health` | public | Health check |
| `/api/auth` | public | `send-otp`, `verify-otp`, `refresh`, `logout`, `me` |
| `/api/products`, `/api/categories`, `/api/stores`, `/api/banners` | public | Catalog, store directory, store pages, hero banners |
| `/api/orders` | buyer | Checkout, list/detail, COD OTP, review, `POST /:id/dispute` |
| `/api/custom-orders` | buyer + seller | Request → seller quotes → buyer accepts (deposit via Paymob stub) → seller completes |
| `/api/disputes` | buyer + seller + admin | List mine, thread detail, post messages |
| `/api/wallet` | signed-in | Balance + transactions (refunds, earnings) |
| `/api/files` | signed-in | Image upload (dispute evidence, banners) |
| `/api/seller` | seller | Store, verification, products, orders, earnings, withdrawals |
| `/api/admin` | admin | KPIs, reports, approvals, disputes, settlements, banners, categories, store badges |

### Money flows

- **Order delivered** → seller wallet credited with `subtotal − commission`.
- **Dispute resolved for buyer** → buyer wallet credited with the order total; the seller's earnings credit for that order is reversed; order `paymentStatus = refunded`.
- **Withdrawal requested** → amount held (debited) from seller wallet. **Admin marks paid** → done. **Admin rejects** → amount returned to the wallet.
- **Custom order accepted** → deposit (`CUSTOM_ORDER_DEPOSIT_PCT` of the quote) charged via the Paymob stub.

---

## Dev OTP

In development the OTP for every phone number is always **1234**.  
`SmsService` logs it to the console instead of sending an SMS.

---

## Configuration

Business constants live in `apps/api/src/config/index.ts` and are driven by `.env`:

| Variable | Default | Description |
|---|---|---|
| `COMMISSION_PCT` | `10` | Platform commission % per order |
| `OTP_EXPIRY_SECONDS` | `300` | OTP validity window |
| `DISPUTE_WINDOW_HOURS` | `48` | How long after delivery a buyer can open a dispute |
| `CUSTOM_ORDER_DEPOSIT_PCT` | `30` | Deposit share of a custom-order quote |
| `UPLOAD_DIR` | `uploads` | Local file upload directory |

Shipping fees per zone are in `config.shippingFees` (edit without redeploying by moving to DB in a later phase).

---

## Phases

| Phase | Status | Description |
|---|---|---|
| 1 | ✅ Complete | Scaffold + schema + design system + seed |
| 2 | ✅ Complete | Auth + buyer browse/search/product pages |
| 3 | ✅ Complete | Cart + checkout + orders + COD OTP + tracking + reviews |
| 4 | ✅ Complete | Seller onboarding, product CRUD, orders dashboard, earnings |
| 5 | ✅ Complete | Custom orders + disputes + wallet |
| 6 | ✅ Complete | Admin panel (approvals, settlements, CMS, reports) |
| 7 | ✅ Complete | Polish — skeletons, empty states, static pages, stores directory, README |

## Main pages

| Area | Routes |
|---|---|
| Buyer | `/`, `/search`, `/products/:id`, `/stores`, `/stores/:id`, `/cart`, `/checkout`, `/orders`, `/orders/:id` |
| Account | `/account`, `/account/wallet`, `/account/custom-orders`, `/account/disputes`, `/disputes/:id` |
| Seller | `/seller/onboarding`, `/seller/products`, `/seller/orders`, `/seller/custom-orders`, `/seller/disputes`, `/seller/earnings` |
| Admin | `/admin`, `/admin/approvals`, `/admin/disputes`, `/admin/disputes/:id`, `/admin/settlements`, `/admin/cms` |
| Static | `/help`, `/shipping-policy`, `/return-policy`, `/contact`, `/privacy`, `/terms` |

> **Windows note:** if `prisma migrate dev` / `prisma generate` fails with `EPERM ... query_engine-windows.dll.node`, stop `npm run dev` first (the running API locks the engine file), then run `npm run db:generate`.
