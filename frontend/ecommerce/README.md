# ShopSphere — E-Commerce Frontend

A full-featured e-commerce frontend built with React 19, TypeScript, and Tailwind CSS v4. Includes a customer-facing storefront, admin panel, and a clean service layer ready for backend integration.

---

## Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Other Commands

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check + production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run oxlint |
| `npm test` | Run all tests (vitest) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

---

## Environment Variables

No `.env` file is needed for development — the API base URL and app name are configured in `src/constants/env.ts`:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://dummyjson.com` | Base URL for API requests |
| `VITE_APP_NAME` | `ShopSphere` | Application display name |

To override, create a `.env.local` file in `frontend/ecommerce/`:

```env
VITE_API_BASE_URL=https://your-api.example.com
VITE_APP_NAME=MyStore
```

---

## Demo Credentials

### Customer Account

| Field | Value |
|---|---|
| Username | `emilys` |
| Password | `emilyspass` |

### Admin Account

| Field | Value |
|---|---|
| URL | `/admin/login` |
| Username | `emilys` |
| Password | `emilyspass` |

> The admin role is determined by the user's `role` field returned from DummyJSON's `/users/:id` endpoint. User `emilys` has the `admin` role.

---

## Project Structure

```
src/
├── app/                    # App-level setup
│   └── queryClient.ts      # React Query client config
│
├── components/
│   ├── common/             # Shared non-UI components
│   │   ├── ErrorBoundary.tsx
│   │   ├── PageLoader.tsx
│   │   ├── PrivateRoute.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RecommendedProducts.tsx
│   ├── layout/             # Layout shells
│   │   ├── AdminHeader.tsx
│   │   ├── AdminLayout.tsx
│   │   ├── AdminSidebar.tsx
│   │   ├── CustomerLayout.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/                 # Primitive UI components
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── ProductCard.tsx
│       └── ToastContainer.tsx
│
├── constants/              # App-wide constants
│   ├── env.ts              # Environment variables
│   ├── queryKeys.ts        # TanStack Query key factories
│   ├── routes.ts           # Route path constants
│   └── shipping.ts         # FREE_SHIPPING_THRESHOLD, SHIPPING_COST
│
├── context/
│   └── AuthContext.tsx     # Authentication state + login/logout
│
├── hooks/                  # Feature-level data hooks
│   ├── useAdminProducts.ts # Session-only CRUD (cache-only, no API)
│   ├── useCart.ts          # Cart mutations + Zustand sync
│   ├── useOrders.ts        # Order CRUD + status updates
│   ├── useProducts.ts      # Product queries (list, detail, search, category)
│   └── useRecommendations.ts
│
├── pages/
│   ├── admin/              # Admin panel pages
│   │   ├── AdminLoginPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   ├── CustomersPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── OrdersPage.tsx
│   │   └── ProductsPage.tsx
│   └── customer/           # Storefront pages
│       ├── auth/
│       │   ├── LoginPage.tsx
│       │   └── SignupPage.tsx
│       ├── CartPage.tsx
│       ├── CheckoutPage.tsx
│       ├── OrdersPage.tsx
│       ├── OrderSuccessPage.tsx
│       ├── ProductDetailPage.tsx
│       ├── ProductsPage.tsx
│       └── ProfilePage.tsx
│
├── routes/
│   └── index.tsx           # createBrowserRouter config (lazy, protected)
│
├── services/               # API communication layer
│   ├── authService.ts      # Login, signup, getMe, localStorage helpers
│   ├── axiosInstance.ts    # Axios with Bearer token + 401 handler
│   ├── cartService.ts      # DummyJSON cart endpoints
│   ├── orderService.ts     # localStorage-based order persistence
│   └── productService.ts   # DummyJSON product endpoints
│
├── store/                  # Global client state (Zustand)
│   ├── cartStore.ts        # Cart items (persisted to localStorage)
│   └── toastStore.ts       # Toast notification queue
│
├── types/
│   ├── dummyjson.ts        # Raw DummyJSON API response types
│   └── index.ts            # Domain types (Product, User, Order, etc.)
│
└── utils/
    ├── formatters.ts       # formatCurrency, formatDate, formatOrderStatus
    ├── mappers.ts          # DummyJSON → domain type transforms
    └── recommendation.ts  # Product scoring algorithm
```

---

## Architecture Overview

### Data Flow

```
DummyJSON API
    │
    ▼
axiosInstance  ←─ Bearer token (localStorage) + 401 logout
    │
    ▼
services/      ─── pure async functions, no React imports
    │
    ▼
hooks/         ─── useQuery / useMutation wrappers (TanStack Query)
    │
    ▼
components/    ─── read data props, call hook actions
```

### State Management

| Concern | Tool |
|---|---|
| Server state (products, orders) | TanStack React Query |
| Cart items | Zustand + `persist` (localStorage key: `cart-storage`) |
| Auth user + token | React Context + localStorage |
| Toast notifications | Zustand (in-memory, no persist) |

### Order Persistence

Orders are stored in `localStorage` (key: `orders`) since DummyJSON does not persist POST requests. When integrating a real backend, replace `orderService.ts` with actual API calls — the hook signatures in `useOrders.ts` remain unchanged.

### Admin Product CRUD

Admin product create/edit/delete operations update the **React Query cache only** (no API calls), because DummyJSON's mutation endpoints return fake responses. When connecting a real backend:
1. Replace the `mutationFn` in `useAdminProducts.ts` with actual API calls
2. Remove the `setQueriesData` calls — React Query invalidation will repopulate from the server

---

## API Integration Checklist

When replacing DummyJSON with a real backend, update these files:

| File | What to replace |
|---|---|
| `src/services/axiosInstance.ts` | Base URL, token header name |
| `src/services/authService.ts` | `login`, `signup`, `getMe` endpoints |
| `src/services/productService.ts` | Product list, search, detail, category endpoints |
| `src/services/cartService.ts` | Cart get/add endpoints |
| `src/services/orderService.ts` | Replace localStorage with POST/GET order endpoints |
| `src/hooks/useAdminProducts.ts` | Replace `mutationFn` stubs with real API calls |
| `src/utils/mappers.ts` | Update mapping functions to match real API response shape |

---

## Testing

Tests live alongside the code they test under `__tests__/` directories:

```
src/
├── services/__tests__/authService.test.ts   # localStorage helpers (getStoredUser, logout)
├── store/__tests__/cartStore.test.ts        # Zustand cart actions
└── utils/__tests__/
    ├── formatters.test.ts                   # Currency, date, status formatting
    ├── mappers.test.ts                      # DummyJSON → domain type mapping
    └── recommendation.test.ts              # Product scoring algorithm
```

Run all tests:

```bash
npm test
```

---

## Key Libraries

| Library | Version | Purpose |
|---|---|---|
| React | 19 | UI framework |
| TypeScript | 6 | Type safety |
| Vite | 8 | Build tool + dev server |
| Tailwind CSS | 4 | Utility-first styling |
| React Router DOM | 7 | Client-side routing (createBrowserRouter) |
| TanStack React Query | 5 | Server state management |
| Zustand | 5 | Client state (cart, toasts) |
| React Hook Form | 7 | Form state + validation |
| Zod | 4 | Schema validation |
| Axios | 1 | HTTP client |
| Recharts | 3 | Admin dashboard charts |
| Lucide React | latest | Icons |
| Vitest | 4 | Unit testing |
