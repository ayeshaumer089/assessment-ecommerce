# NOTES.md — ShopZone E-Commerce Assessment

---

## 1. Agent Workflow

### Tool Used
**Claude Code** (Anthropic's agentic CLI) was the primary tool used throughout this build, running inside VS Code via the Claude Code extension. All backend scaffolding, frontend components, business logic, tests, and debugging were driven through Claude Code.

### How I Drove the Agent

**Project context file (`CLAUDE.md`)** — A project-context file was not used in this session. Instead, context was maintained conversationally, with each prompt carrying enough surrounding detail for the agent to act correctly. For a longer engagement I would establish a CLAUDE.md early.

**Task scoping** — Work was broken into discrete, well-bounded tasks rather than given as one large "build me an e-commerce app" prompt. Typical scope per prompt:
- "Scaffold NestJS backend with auth, products, orders, cart modules"
- "Implement JWT strategy with RolesGuard and @Public() decorator"
- "Build the customer ProductsPage with server-side search, filter, and pagination"
- "Fix: admin login always returns 401 — the form sends `username` but the backend's LoginDto validates `@IsEmail`"

**Supervision loop** — After each generated file or feature, I reviewed the output, tested it in the browser or via API calls, and issued targeted correction prompts when the agent got something wrong. The agent was rarely given free rein over multiple files simultaneously without a review checkpoint.

**Subagent use** — For broad codebase questions (e.g. "why is nothing showing on the admin dashboard?") I used the `Explore` subagent type to scout the relevant files before asking the main agent to make targeted edits. This kept the main context focused and avoided the agent hallucinating about files it hadn't actually read.

**Incremental commits** — Commits were made after each logical unit of work: auth setup, product module, cart, orders, seed script, frontend pages, etc.

---

## 2. Where the Agent Helped and Where It Failed

### Where It Helped

- **Boilerplate speed** — NestJS module/controller/service/schema scaffolding, DTO classes with class-validator decorators, Mongoose schema hooks (bcrypt hashing pre-save), and global interceptors were generated correctly and quickly with minimal correction.

- **Business logic** — The order status state machine (legal transitions enforced server-side), atomic stock reservation using MongoDB `findOneAndUpdate`, and shipping cost calculation with threshold-based free shipping were all produced correctly on the first attempt.

- **TanStack Query integration** — The full pattern of `useQuery`/`useMutation` hooks, cache invalidation on mutation success, and optimistic updates in the cart was wired correctly without manual intervention.

- **Recommendation engine** — The content-based scoring algorithm (category match + price proximity + stock bonus) implemented as a MongoDB aggregation pipeline was a strong output with no logical errors.

- **Test generation** — The order lifecycle tests (`orders.service.spec.ts`) covering valid/invalid status transitions and stock restoration on cancellation were accurate and covered the most important invariants.

### Where It Failed (Caught and Corrected)

| Bug | What the Agent Did Wrong | How I Caught It | Fix Applied |
|-----|--------------------------|-----------------|-------------|
| Admin login always failed | `AdminLoginPage` form used a `username` field; backend `LoginDto` validates with `@IsEmail` — non-email strings always rejected | Tried logging in with `admin@example.com`, got 401; read both files and spotted the field name mismatch | Changed form field from `username` to `email` with zod email validation |
| Customer login threw "An unexpected error occurred" | `authService.getStoredUser()` was called on line 41 of `LoginPage.tsx` but `authService` was never imported — ReferenceError caught by try/catch and shown as generic error | Error message in browser; traced to missing import | Added `import { authService }` |
| Admin dashboard and orders page showed nothing | `orderService.getAllOrders()` called `data.data.map(mapOrder)` — but the axios response interceptor already unwraps `{ success, data }` envelopes, so `data` was already the array and `.data` on it was `undefined`. React Query caught the TypeError silently and defaulted to `[]` | Pages showed "No orders found" even after seeding; read the axios interceptor and the service method side-by-side and spotted the double-unwrap | Changed to `data.map(mapOrder)` |
| Admin can access `/cart` after login | `PrivateRoute` only checked `isAuthenticated`, not `user.role` — so an authenticated admin passed through to customer pages | Reported by user: navigating to `/cart` as admin showed the cart page | Added role check: if `user?.role === 'admin'` redirect to `/admin` |
| Demo credentials wrong on both login pages | Agent used `emilys`/`emilyspass` (DummyJSON demo credentials) which don't exist in our seeded MongoDB | Login attempts with demo autofill always failed | Updated both pages to `admin@example.com`/`Admin123!` and `customer@example.com`/`Customer123!` |
| Frontend not starting — `index.html` missing | The Vite project root `index.html` was absent; only `dist/index.html` (from a previous build) existed | `npm run build` failed with `Cannot resolve entry module index.html` | Recreated `index.html` with correct `<script type="module" src="/src/main.tsx">` entry |
| TypeScript build errors blocking compilation | Unused imports (`Badge`, `STATUS_BADGE_VARIANT` in `OrdersPage`; `Star`, `user` in `LoginPage`) caused `tsc -b` to fail with TS6133 errors | `npm run build` output listed the exact files and lines | Removed the four unused declarations |
| `React.CSSProperties` not resolved | Navbar rewrite used `React.CSSProperties` type annotation without importing React (new JSX transform doesn't auto-import for type references) | TypeScript error on build | Added `import React` to Navbar.tsx |
| CSS `@import` ordering warning | Google Fonts `@import url(...)` was pushed below CSS rules when new styles were prepended to `index.css`, violating the CSS spec | Build produced a warning about `@import rules must precede all rules` | Moved the font import back to the top, removed the duplicate |

---

## 3. Supervision & Verification

**Code review before accepting** — Every generated file was read before moving on. I didn't accept multi-file outputs blindly; I specifically checked:
- That API endpoints matched what the frontend was calling
- That DTO field names matched what the form was sending
- That axios response interceptor behaviour was accounted for in service methods
- That route guards were applied to the correct endpoints

**Browser testing** — After each feature (login, products page, cart, checkout, admin dashboard), I tested the golden path manually in the browser. Errors in the network tab and console were the primary signal that something was wrong.

**TypeScript compilation** — Running `npm run build` was used as a final check to catch unused variables and type errors that the dev server's loose esbuild compilation wouldn't surface.

**Reading both sides** — When a bug appeared, I always read both the frontend service/hook and the backend controller/service before asking the agent to fix it, rather than letting it guess from symptoms alone. The `getAllOrders` double-unwrap bug was caught this way.

**Seed verification** — After running `npm run seed`, I checked the MongoDB collections directly and verified that 12 products, 5 categories, 2 users, and 3 orders were present before testing the admin dashboard.

---

## 4. Design Workflow

### Tool Used
The UI design was driven using **Claude** (design mode / artifact generation) to produce reference HTML mockups for key pages, then the Claude Code agent was used to port those designs into the React components. The reference HTML files are committed to the repository under `frontend/ecommerce/`:

- `admin-login.html` — admin login page design
- `navbar.html` — navigation bar design
- `footer.html` — footer design
- `shopzone-orders.html`, `shopzone-signin.html`, `shopzone-signup.html` — customer-facing page designs

### Design Decisions

**Visual identity** — A consistent indigo (`#5b4ff5`) primary colour was used across both the storefront and admin panel. The storefront uses a light, airy feel (white backgrounds, soft purple tints); the admin uses a deep navy dark theme (`#0a0e1a`) to visually distinguish the two surfaces.

**Typography** — Fraunces (serif) for headings gives the storefront an editorial, premium feel. Inter (sans-serif) is used for body copy and UI elements across both sides.

**Design system** — Instead of a component library, a custom token-based system was built using Tailwind CSS v4's `@theme` block. All brand colours, radii, and shadows are defined as CSS custom properties, keeping the design coherent without external dependencies.

**Component-level decisions**:
- Navbar: gradient logo mark, underline-animated nav links, cart button as a bordered icon square, sign-up as a gradient pill — all matching the reference HTML
- Footer: dark navy with radial gradient glow, social icon row, column links with hover colour + left nudge
- Admin login: frosted card on deep navy with two radial gradient glows, identical to the reference HTML mockup
- Hero: large serif headline with gradient italic accent, stats row, featured product card rotated 1.2° for visual interest

**Iteration** — The admin login page went through one design iteration (the initial output used Tailwind utility classes; after seeing the reference HTML the agent was asked to port it precisely, which required switching to inline styles for the navy colour palette that Tailwind's default scale doesn't cover).

---

## 5. Assumptions

### Authentication
- **JWT stored in localStorage** — Session storage would be more secure against XSS but localStorage was chosen for simplicity in a demo context. In production, httpOnly cookies would be preferred.
- **7-day token expiry** — No refresh token mechanism was implemented. With more time, a refresh token flow with rotation would be the right approach.
- **Single admin role** — The spec mentions admin vs customer. No "superadmin" or granular permission tiers were implemented.

### Cart
- **Server-side cart only** — The cart is persisted to MongoDB per user. There is no guest cart or localStorage cart for unauthenticated users. Guest shopping would require a separate cart-merge flow at login.

### Payment
- **Always-succeed mock** — The assessment spec explicitly allows a mock payment step. The mock always returns success with a generated transaction ID. No card details are transmitted to any processor. In production, Stripe test mode with a real SDK integration would be the target.

### Product Images
- **URL-based, not file upload** — Products store an image URL rather than accepting file uploads. This avoids the need for a file storage service (S3/Cloudinary) in the assessment context. The admin product form accepts an image URL. This is documented in the README.

### Stock
- **No reservation during browsing** — Stock is only checked and decremented atomically at checkout, not when items are added to cart. This means two users could both add the last unit to their carts, but only the first to complete checkout would succeed. The second would receive a stock error at the checkout stage.

### Pagination
- **12 items per page** — Chosen as a sensible default for a 3-column grid. The page size is not user-configurable.

### Admin Panel
- **No product image upload** — Admin creates/edits products with a URL field, consistent with the storefront assumption above.
- **Status transition validation server-side only** — The frontend dropdown shows all statuses but the backend enforces the legal transition graph. Illegal transitions return a 400 error which the frontend surfaces as a toast.

---

## 6. Open-Ended Requirement: Product Recommendations

### Interpretation

"Relevant to them" was interpreted as **content-based product similarity** rather than collaborative filtering (which would require meaningful user behaviour history that doesn't exist in a seeded demo). The goal is: given the product a customer is currently viewing, surface other products they are likely to also want.

"Relevant" was defined by two signals:
1. **Same category** — the strongest proxy for shared intent (someone browsing electronics probably wants more electronics)
2. **Similar price point** — a customer's willingness to spend is bounded; a $20 and a $2,000 item are unlikely to be co-purchased even in the same category

### Implementation

**Backend** (`backend/src/products/recommendation.service.ts`):
A MongoDB aggregation pipeline scores candidate products against the source product:

| Signal | Points |
|--------|--------|
| Same category | +40 |
| Price within ±10% | +40 |
| Price within ±25% | +25 |
| Price within ±50% | +10 |
| In stock | +20 |
| Minimum to qualify | 40 |

Results are sorted by score descending; rating breaks ties. The source product is excluded. The endpoint is public (`GET /products/:id/recommendations`).

**Frontend fallback** (`frontend/ecommerce/src/utils/recommendation.ts`):
A simpler client-side scorer is used when the backend recommendation endpoint is unavailable, using a similar but lighter scoring model. The `RecommendedProducts` component on the product detail page renders up to 4 recommendations.

### What I'd Do With More Time

- **Collaborative filtering** — Once real user order history accumulates, "customers who bought X also bought Y" would be more powerful than content similarity.
- **View history signals** — Tracking which products a user browses (not just buys) would improve personalisation without requiring purchases.
- **A/B testing** — Compare click-through rates of content-based vs collaborative recommendations to validate the approach empirically.

---

## 7. Trade-offs and Scope

### Fully Built
- ✅ Product catalog with server-side search, filter (category, price range), sort, and pagination
- ✅ Product detail page with add-to-cart
- ✅ Shopping cart — persistent in MongoDB, per-user, synced on login
- ✅ Checkout flow with shipping address capture and mock payment
- ✅ Order history for customers
- ✅ Admin: product CRUD (create, edit, delete)
- ✅ Admin: order management with status transitions
- ✅ Admin: dashboard with total sales, order count by status, top products chart (recharts)
- ✅ Role-based access control (JWT + RolesGuard) on all protected endpoints
- ✅ Input validation (class-validator on backend DTOs, zod on frontend forms)
- ✅ Seed script populating 12 products, 5 categories, 2 users, 3 orders
- ✅ Product recommendations (content-based, backend + frontend fallback)
- ✅ Automated tests: order lifecycle, shipping, cart store, formatters, recommendation scorer

### Mocked / Simplified
- ⚠️ **Payment** — mock that always succeeds; no real Stripe integration
- ⚠️ **Image upload** — URL input only; no S3/Cloudinary
- ⚠️ **Email notifications** — no order confirmation or status-change emails
- ⚠️ **Admin analytics** — fetches all orders client-side and aggregates; the backend `/dashboard/stats` endpoint exists and provides server-side aggregation but is not yet wired to the frontend (frontend uses `useAllOrders` and reduces locally)
- ⚠️ **Guest cart** — no cart for unauthenticated users; must be logged in to add items
- ⚠️ **Refresh tokens** — single JWT with 7-day expiry; no refresh/rotation mechanism

### What I'd Do With More Time
1. Wire the frontend dashboard to the existing `/dashboard/stats` endpoint instead of client-side aggregation — the backend already computes totals, revenue by day, and top products via MongoDB aggregation.
2. Stripe test-mode integration for a realistic payment flow.
3. Refresh token rotation for better session security.
4. File upload for product images (Cloudinary or S3 presigned URLs).
5. Email confirmations using Resend or SendGrid.
6. Guest cart with merge-on-login flow.
7. End-to-end tests with Playwright covering the full checkout path.
8. Rate limiting on auth endpoints to prevent brute-force attacks.

---

## 8. Stack Rationale

| Choice | Reason |
|--------|--------|
| **NestJS** | Structured, opinionated — forces a module boundary that keeps the backend from sprawling; built-in DI, guards, interceptors, and pipes map directly to the cross-cutting requirements (auth, validation, error handling) |
| **MongoDB + Mongoose** | Flexible schema during rapid prototyping; document model suits the order-items-as-embedded-array pattern; Atlas free tier removes local DB setup friction |
| **React 19 + Vite** | Fast iteration; TanStack Query for server state keeps components clean |
| **TanStack Query** | Cache invalidation on mutation, background refetch, and loading/error states without boilerplate |
| **Zustand** | Lightweight client state for cart UI and toast notifications; no Redux overhead |
| **Tailwind CSS v4** | `@theme` block provides a real design token system; utility classes keep styles co-located with components |
| **Zod** | Runtime schema validation on the frontend that mirrors the backend class-validator DTOs |

---

## 9. Security Notes

- Passwords hashed with **bcrypt at 12 rounds** before storage; never returned in API responses (`select: false` on the password field)
- JWT secret in environment variable, never committed
- `.env` files excluded via `.gitignore`; `.env.example` committed with placeholder values
- All admin endpoints protected by `@Roles(Role.ADMIN)` + `RolesGuard`
- Order totals computed **server-side** at checkout; client-submitted prices are ignored
- Stock reservation is **atomic** (`findOneAndUpdate` with a stock guard) to prevent overselling
- HTTP exception filter strips stack traces from error responses in production
- CORS configured to allow only the frontend origin
