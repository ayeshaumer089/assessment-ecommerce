# ShopSphere — Frontend

Customer storefront + admin panel SPA built with React 19, TypeScript, Vite, and
Tailwind CSS v4. It talks to the NestJS API in [`../../backend`](../../backend).

> For full-stack setup (backend + database + seed credentials), see the
> [root README](../../README.md). This file covers the frontend only.

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

The dev server expects the backend running at `http://localhost:3000/api`
(see [Environment Variables](#environment-variables)).

### Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run oxlint |
| `npm test` | Run tests (Vitest) |
| `npm run test:coverage` | Tests with coverage |

---

## Environment Variables

Defaults are baked in, so a `.env` is optional. To override, copy the template:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:3000/api` | Backend API base URL |
| `VITE_APP_NAME` | `ShopSphere` | App display name |

---

## Architecture

```
API (axios + Bearer token, 401 → logout)
        ↓
services/      pure async API functions, response mappers
        ↓
hooks/         TanStack Query wrappers (useProducts, useCart, useOrders, …)
        ↓
components/    read data, call hook actions
```

| Concern | Tool |
|---|---|
| Server state (products, orders, dashboard) | TanStack React Query |
| Cart (server-backed, synced on login) | Zustand + cartService |
| Auth user + token | React Context + localStorage |
| Toasts | Zustand (in-memory) |
| Forms + validation | React Hook Form + Zod |

The cart lives on the server (per user). On login the store hydrates from
`GET /cart`; on logout it resets. Mutations go through the API and the store
stores the returned cart.

---

## Project Structure

```
src/
├── app/            React Query client config
├── components/
│   ├── common/     ErrorBoundary, RecommendedProducts, route guards
│   ├── layout/     Navbar, Footer, Customer/Admin layouts, sidebar, header
│   └── ui/         Button, Input, Badge, Modal, Card, ProductCard, toasts
├── constants/      env, routes, query keys, shipping thresholds
├── context/        AuthContext
├── hooks/          useProducts, useCart, useOrders, useAdminProducts, …
├── pages/
│   ├── admin/      Dashboard, Products, Orders, Analytics, Customers, login
│   └── customer/   Products, ProductDetail, Cart, Checkout, Orders, Profile, auth
├── routes/         createBrowserRouter (lazy + protected routes)
├── services/       axiosInstance, auth/product/cart/order/dashboard services
├── store/          cartStore, toastStore
├── types/          domain types
└── utils/          formatters, recommendation helper
```

---

## Testing

Tests live under `__tests__/` next to the code they cover:

- `store/__tests__/cartStore.test.ts` — cart store (service mocked)
- `services/__tests__/authService.test.ts` — auth storage helpers
- `utils/__tests__/` — formatters, mappers, recommendation scoring

```bash
npm test
```
