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

Layered by responsibility — each folder owns one concern, and dependencies flow
downward (`pages` → `hooks` → `services` → `lib`), never back up.

```
src/
├── main.tsx            Vite entry: mounts <App />, loads global CSS
├── app/                Application shell — App.tsx, React Query client
├── assets/
│   ├── images/         Raster art (hero, banners)
│   └── icons/          SVG icons imported by JS
├── components/         Reusable, route-agnostic UI
│   ├── ui/             Design-system primitives (Button, Input, Badge, Modal, …)
│   ├── common/         Cross-cutting widgets (ErrorBoundary, PageLoader, spinner)
│   └── product/        Product-domain widgets (ProductCard, RecommendedProducts)
├── config/             Runtime configuration read from import.meta.env
├── constants/          Fixed values — routes, query keys, shipping thresholds
├── context/            React context providers (AuthContext)
├── hooks/              TanStack Query wrappers + generic hooks (useDebounce, …)
├── layouts/            Page shells rendered around <Outlet />
│   ├── customer/       CustomerLayout, Navbar, Footer
│   └── admin/          AdminLayout, AdminSidebar, AdminHeader
├── lib/                Configured third-party clients (axios instance, Stripe)
├── pages/              Route components, one file per screen
│   ├── public/         Home, NotFound
│   ├── auth/           Login, Signup, AdminLogin (full-screen, no layout)
│   ├── customer/       Products, ProductDetail, Cart, Checkout, Orders, Profile
│   └── admin/          Dashboard, Products, Orders, Analytics, Customers
├── routes/             router.tsx (lazy routes) + guards/ (Private, Protected)
├── services/           Domain API modules — one per backend resource
├── store/              Zustand stores (cartStore, toastStore)
├── styles/             Global stylesheet, split by scope
│   ├── theme/          Design tokens exposed to Tailwind via @theme
│   ├── base/           Resets, animations, accessibility primitives
│   ├── components/     Styles owned by a shared component or layout
│   └── pages/          Route-scoped styles (.sz-home, .sz-detail, …)
├── types/              Shared domain + API response types
└── utils/              Pure helpers (formatters, mappers, recommendation)
```

### Import conventions

The `@/*` alias points at `src/`. Most folders expose an `index.ts` barrel, so
import from the module root:

```ts
import { ROUTES } from '@/constants'
import { useCart, useOrders } from '@/hooks'
```

Three groups are imported by file path on purpose:

| Group | Why |
|---|---|
| `pages/` | Barrelling them would defeat route-level code splitting |
| `components/ui/` | Keeps each primitive in its own chunk instead of the eager bundle |
| `services/`, `lib/` | Lets a test mock one module without pulling in the HTTP layer |

Files inside a folder import their siblings relatively (`./Navbar`) rather than
through their own barrel, which keeps the module free of import cycles.

---

## Testing

Tests live under `__tests__/` next to the code they cover:

- `store/__tests__/cartStore.test.ts` — cart store (service mocked)
- `services/__tests__/authService.test.ts` — auth storage helpers
- `utils/__tests__/` — formatters, mappers, recommendation scoring

```bash
npm test
```
