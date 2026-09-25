# كرافت سوق | CraftSouq

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
craftsouq/
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

### Health check

```
GET /api/health
```

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
| `UPLOAD_DIR` | `uploads` | Local file upload directory |

Shipping fees per zone are in `config.shippingFees` (edit without redeploying by moving to DB in a later phase).

---

## Phases

| Phase | Status | Description |
|---|---|---|
| 1 | ✅ Complete | Scaffold + schema + design system + seed |
| 2 | Pending | Auth + buyer browse/search/product pages |
| 3 | Pending | Cart + checkout + orders + COD OTP + tracking + reviews |
| 4 | Pending | Seller onboarding, product CRUD, orders dashboard, earnings |
| 5 | Pending | Custom orders + disputes + wallet |
| 6 | Pending | Admin panel (approvals, settlements, CMS, reports) |
| 7 | Pending | Polish — skeletons, empty states, responsive QA, final README |
