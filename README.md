# ShopSphere — Full-Stack E-Commerce

A complete e-commerce application with a customer storefront and an admin panel,
backed by a single REST API.

- **Backend** — NestJS 10 + MongoDB (Mongoose), JWT auth, role-based access control
- **Frontend** — React 19 + TypeScript + Vite + Tailwind CSS v4, TanStack Query, Zustand

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Run](#setup--run)
- [Seeded Login Credentials](#seeded-login-credentials)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Design Notes](#design-notes)
- [Product Images — Implementation Choice](#product-images--implementation-choice)
- [Product Recommendations — Interpretation & Reasoning](#product-recommendations--interpretation--reasoning)
- [Data Integrity & Security](#data-integrity--security)
- [Testing](#testing)

---

## Features

### Customer Storefront
- Product catalog with name, description, price, image, category, stock
- Search by name, filter by category and price range, sort by price / newest
- Server-side pagination (the list is never fully loaded at once)
- Product detail page with quantity selection and add-to-cart
- Persistent shopping cart (a returning logged-in user sees their cart)
- Multi-step checkout with a **mock payment** step, order confirmation
- Order history with per-order status and cancellation
- Signup / login; customers only ever see their own cart and orders
- "Recommended for you" product suggestions (see below)

### Admin Panel
- Product management (create / edit / delete) with image URL support
- Order management — advance status through `pending → processing → shipped → delivered`, plus a `cancelled` path with **validated transitions**
- Dashboard analytics — total sales, order count by status, top products, with charts
- Access control — admin routes and endpoints are restricted to admin users

---

## Tech Stack

| Layer | Technology |
|---|---|
| API | NestJS 10, Mongoose 8, Passport-JWT, class-validator |
| Database | MongoDB (local or Atlas) |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Data fetching | TanStack React Query |
| Client state | Zustand (cart, toasts) |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Tests | Jest (backend), Vitest (frontend) |

---

## Project Structure

```
Ecommerce-Assessment/
├── backend/                 # NestJS REST API
│   └── src/
│       ├── auth/            # signup, login, JWT strategy
│       ├── users/           # user schema + service
│       ├── products/        # products CRUD + recommendation engine
│       ├── categories/      # category CRUD
│       ├── cart/            # per-user cart with stock checks
│       ├── orders/          # checkout, status lifecycle, stock reservation
│       ├── dashboard/       # admin analytics aggregations
│       ├── seed/            # database seeding
│       └── common/          # guards, filters, interceptors, constants
└── frontend/ecommerce/      # React storefront + admin SPA
    └── src/
        ├── pages/           # customer + admin pages
        ├── components/      # layout + UI components
        ├── services/        # axios API layer
        ├── hooks/           # React Query hooks
        ├── store/           # Zustand stores
        └── context/         # auth context
```

---

## Prerequisites

- **Node.js** 18+ and **npm** 9+
- **MongoDB** — a local instance (`mongodb://localhost:27017`) or a MongoDB Atlas cluster

---

## Setup & Run

Run the backend and frontend in two terminals.

### 1. Backend

```bash
cd backend
npm install

# Create your env file from the template and fill in the values
cp .env.example .env        # Windows PowerShell: copy .env.example .env

# Seed the database (sample products, categories, 1 admin, 1 customer, sample orders)
npm run seed

# Start the API (http://localhost:3000/api)
npm run start:dev
```

Minimum `.env` values:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=any-long-random-string
PORT=3000
```

> Using MongoDB Atlas? Use your `mongodb+srv://…` URI — the API automatically
> applies a DNS workaround for Atlas SRV records only (local URIs are untouched).

### 2. Frontend

```bash
cd frontend/ecommerce
npm install

# Optional — defaults already point at http://localhost:3000/api
cp .env.example .env        # Windows PowerShell: copy .env.example .env

# Start the dev server (http://localhost:5173)
npm run dev
```

Open <http://localhost:5173>. The admin panel login is at `/admin/login`.

---

## Seeded Login Credentials

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@example.com` | `Admin123!` |
| Customer | `customer@example.com` | `Customer123!` |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | yes | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | yes | Secret used to sign JWTs |
| `JWT_EXPIRES_IN` | no | Token lifetime (default `7d`) |
| `PORT` | no | API port (default `3000`) |
| `DB_NAME` | no | Database name (default `ecommerce`) |
| `NODE_ENV` | no | `development` / `production` |

### Frontend (`frontend/ecommerce/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | Base URL of the backend API |
| `VITE_APP_NAME` | `ShopSphere` | App display name |

Secrets are kept out of the codebase — only `.env.example` templates are committed.

---

## API Overview

All routes are prefixed with `/api`. Responses use an envelope: `{ success, data, meta? }`.
Auth uses a `Bearer <token>` header.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/signup` | public | Register a customer |
| POST | `/auth/login` | public | Log in, returns JWT |
| GET | `/auth/me` | auth | Current user |
| GET | `/products` | public | List (search, filter, sort, paginate) |
| GET | `/products/:id` | public | Product detail |
| GET | `/products/:id/recommendations` | public | Related products |
| POST/PATCH/DELETE | `/products(/:id)` | admin | Product management |
| GET | `/categories` | public | List categories |
| GET | `/cart` | auth | Current user's cart |
| POST/PATCH/DELETE | `/cart(/:productId)` | auth | Modify cart |
| POST | `/orders/create` | auth | Checkout (mock payment) |
| GET | `/orders` | auth | My orders |
| PATCH | `/orders/:id/cancel` | auth | Cancel my order |
| GET | `/orders/all` | admin | All orders |
| PATCH | `/orders/:id/status` | admin | Update order status |
| GET | `/dashboard/stats` | admin | Analytics bundle |

---

## Design Notes

The UI is a custom design system (no off-the-shelf template): an indigo brand
palette, consistent spacing/radius/shadows defined as Tailwind v4 `@theme` tokens,
reusable primitives (Button, Input, Badge, Modal, Card), and shared states
(loading skeletons, empty states, error states, toasts, confirmation dialogs).
Layout is responsive across desktop, tablet, and mobile with a sticky storefront
navbar and a dedicated admin shell (sidebar + header).

---

## Product Images — Implementation Choice

Products store an **image URL** (a string), not an uploaded binary. The admin
"Add / Edit Product" form takes an image URL, validated as a URL on the client
and required on the server. Order line items snapshot the product image at order
time so order history stays accurate even if a product later changes.

**Why URL over upload:** it keeps the API stateless and avoids file-storage
infrastructure (disk/S3) that adds little to demonstrating the core commerce
logic. Seed data uses Unsplash image URLs.

---

## Product Recommendations — Interpretation & Reasoning

> *"Customers should be able to see product suggestions that are relevant to them."*

**Interpretation chosen: content-based "more like this".** On a product detail
page, customers see *Recommended For You* — products similar to the one they are
currently viewing. This is the moment a customer has expressed the clearest,
freshest signal of intent (the product in front of them), so similarity to it is
a strong, explainable notion of "relevant".

**How it works** (`backend/src/products/recommendation.service.ts`): each
candidate product is scored in a MongoDB aggregation pipeline:

- **Same category** → +40 points (strongest relevance signal)
- **Price proximity** → up to +40 points (≤10% diff: +40, ≤25%: +25, ≤50%: +10)
- **In stock** → +20 points (purchasable items rank higher)

Candidates below a minimum threshold are discarded, the rest are sorted by score
(newest as a tiebreaker) and the top N are returned.

**Why this approach:** it is transparent, needs no historical purchase data (so
it works for brand-new users — no cold-start problem), and runs entirely in the
database. A natural next step with real traffic would be collaborative filtering
("customers who bought X also bought Y") layered on top of this baseline.

---

## Data Integrity & Security

- **Stock** is reserved atomically at checkout (`findOneAndUpdate` with a
  `stock >= quantity` guard) and rolled back if any line item can't be filled —
  preventing overselling under concurrency. Cancelling an order (by the customer
  or an admin) restores stock.
- **Order totals** are computed server-side from live DB prices, never trusting
  client-supplied amounts. Subtotal, shipping, and total are stored on the order.
- **Order status** transitions are validated against an explicit state machine;
  illegal/terminal transitions are rejected.
- **Validation** runs on both client (Zod / React Hook Form) and server
  (class-validator DTOs with a whitelist that rejects unknown fields).
- **Errors** are normalized by a global exception filter — sensible HTTP status
  codes, no stack traces leaked to clients.
- **Auth** uses JWTs; passwords are hashed with bcrypt and never returned.
  Admin endpoints are guarded by a global JWT guard + a roles guard.

---

## Testing

**Backend (Jest)** — order-lifecycle integrity (legal/illegal/terminal status
transitions, stock restoration on cancel, checkout stock rollback) and shipping
calculation:

```bash
cd backend
npm test
```

**Frontend (Vitest)** — cart store logic, auth storage helpers, formatters,
mappers, and the recommendation utility:

```bash
cd frontend/ecommerce
npm test
```
