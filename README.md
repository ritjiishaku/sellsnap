# SellSnap

**Link-based commerce for Nigerian social sellers.**

SellSnap lets a seller upload a product, get a unique shareable URL, send it on WhatsApp or Instagram, and have the buyer pay through a fast mobile checkout powered by Flutterwave. No store builder. No marketplace. Just a link that turns a WhatsApp message into a paid order.

Built for non-technical sellers on phones — Instagram vendors, WhatsApp sellers, freelancers, and small business owners in Nigeria.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Database | PostgreSQL via Prisma ORM (SQLite in dev) |
| Payments | Flutterwave |
| Styling | Tailwind CSS v4 |
| Auth | JWT via `jose`, httpOnly cookies |
| Email | Nodemailer (Mailtrap in dev) |
| Validation | Zod (shared client/server) |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env .env.local
# Edit .env.local with your keys (see below)
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `FLUTTERWAVE_PUBLIC_KEY` | Yes | Flutterwave API public key |
| `FLUTTERWAVE_SECRET_KEY` | Yes | Flutterwave API secret key |
| `FLUTTERWAVE_SECRET_HASH` | Yes | Flutterwave webhook verification hash |
| `SESSION_SECRET` | Yes | JWT signing secret (min 32 chars) |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL (e.g. `http://localhost:3000`) |
| `SMTP_HOST` | No | SMTP host (default: Mailtrap sandbox) |
| `SMTP_PORT` | No | SMTP port (default: 2525) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `SMTP_FROM` | No | From address (default: `noreply@sellsnap.com`) |

### Database

```bash
# Push schema to your database (development)
npx prisma db push

# Or create a migration (production)
npx prisma migrate dev
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build for Production

```bash
npm run build
npm start
```

---

## Routes

### Public

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Login / 2-step signup |
| `/auth/forgot-password` | Request password reset |
| `/auth/reset-password/[token]` | Set new password |
| `/p/[slug]` | **Product page** — SSR'd, shareable, instant load |
| `/p/success` | Payment verification |
| `/p/failed` | Payment failure message |

### Protected (Dashboard)

| Route | Description |
|-------|-------------|
| `/dashboard` | Overview — stats, revenue, recent orders/products |
| `/dashboard?tab=products` | Product management — grid, search, sort, create/edit/delete |
| `/dashboard?tab=orders` | Order management — filter by status, click for detail |
| `/dashboard/orders/[id]` | Order detail — product, buyer, payment info |
| `/dashboard/settings` | Profile settings, password change |

### API

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/payments/verify` | GET | Post-payment redirect from Flutterwave |
| `/api/webhooks/flutterwave` | POST | Flutterwave webhook receiver |
| `/api/seller/onboarding-seen` | PATCH | Mark onboarding as seen |

---

## Database Schema

Six models — see `prisma/schema.prisma` for details.

- **User** — account with email, password, business name, onboarding flags
- **Product** — name, description, price (in kobo), image, unique slug
- **Order** — links buyer to product, tracks status (pending/paid/failed), unique `txRef`
- **Payment** — paired 1:1 with Order, stores Flutterwave gateway reference
- **RateLimit** — DB-backed rate limiting per key

**Key design decisions:**
- Prices stored in **kobo** (smallest unit) — never use floats for money
- `txRef` and `gatewayReference` are unique at the DB level — duplicate charges are impossible
- All numeric amounts are integers representing kobo (divide by 100 for NGN display)

---

## Architecture

### Payment Flow

1. Buyer lands on `/p/[slug]` (SSR'd, instant load)
2. Buyer enters name + email → **Flutterwave payment modal** opens
3. Buyer completes payment → redirected to `/api/payments/verify`
4. Verify endpoint confirms transaction with Flutterwave server-side, marks order as `paid`
5. **Flutterwave webhook** also hits `/api/webhooks/flutterwave` as a backup confirmation
6. Buyer sees success page at `/p/success` with polling verification

### Security

- Every payment is **verified server-side** — never trust the client
- Webhook HMAC signature is validated before processing
- Rate limiting on auth actions: 3/min signup, 5/min login, 3/min password reset
- File uploads validated by magic bytes (not just extension)
- Sessions in httpOnly cookies
- Duplicate transaction references blocked at the database level

---

## Project Structure

```
app/                          # Next.js App Router
├── (auth)/                   # Auth route group
├── api/                      # API routes
├── dashboard/                # Seller dashboard
├── p/                        # Public product pages
└── products/                 # Redirects

components/
├── ui/                       # Button, Input, Card, etc.
├── dashboard/                # Sidebar, mobile nav, shell
└── onboarding/               # Onboarding wizard

lib/
├── auth.ts                   # JWT session management
├── db.ts                     # Prisma client
├── flutterwave.ts            # Payment init + verification
├── email.ts                  # Nodemailer transport
├── rate-limit.ts             # DB-backed rate limiter
├── storage.ts                # File upload (local/S3)
├── format.ts                 # NGN price formatting
└── validators/               # Zod schemas

prisma/
└── schema.prisma             # Database schema
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma db push` | Push schema without migration |
| `npx prisma migrate dev` | Create and apply migration |
| `npx prisma studio` | Open Prisma Studio (DB browser) |

---

## License

Private — all rights reserved.
