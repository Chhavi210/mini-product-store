# Mini Product Store

A production-quality single-page product store built with React, TypeScript, Tailwind CSS, Zustand, and Axios.

## Getting Started

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`.

No environment variables required — the app uses the public [DummyJSON](https://dummyjson.com) API.

### Test Credentials

| Username | Password     |
|----------|--------------|
| emilys   | emilyspass   |
| michaelw | michaelwpass |
| sophiab  | sophiabpass  |

You can fetch the full list at `https://dummyjson.com/users`.

### Running Tests

```bash
npm run test          # watch mode
npm run test -- --run # single run
```

---

## Self-Assessment & Completed Work

### Core Requirements

- [x] Public + protected routes
- [x] Redirect to login when not authenticated
- [x] Redirect back to the originally requested page after login
- [x] Logged-in user redirected away from `/login`
- [x] Login + inline validation + error on bad credentials
- [x] Session persists across refresh (restored via token + `/auth/me`)
- [x] Working logout with state cleanup
- [x] Single configured HTTP client with auto token injection
- [x] 401 response handling (clear session → cleanup → redirect to login)
- [x] Product list with debounced search (400ms)
- [x] Category filter
- [x] Pagination (20 per page, URL-synced)
- [x] Product detail page
- [x] Add/remove favorites (from list + detail)
- [x] Favorites persist and are scoped per user
- [x] Dark / light mode toggle via Tailwind `dark` class + config tokens, persisted
- [x] Loading / error / empty states everywhere data is fetched

### Bonus Items Attempted

| Bonus item | Done? | Where / how to test |
|---|---|---|
| Silent token refresh | ✅ | `src/api/client.ts` — response interceptor retries once on 401; queue ensures concurrent requests all retry |
| URL-synced state | ✅ | `src/hooks/useProducts.ts` — search q, category, page all live in URL (`/?q=phone&category=smartphones&page=2`) |
| Request cancellation | ✅ | `src/hooks/useProducts.ts` — `AbortController` cancels in-flight search when query changes |
| Cart | ✅ | `src/store/cartStore.ts` + `src/components/layout/CartDrawer.tsx` — cart icon in navbar, per-user, persisted; full quantity management |
| Optimistic UI | ✅ | `src/components/ui/FavoriteButton.tsx` — favorite/unfavorite updates instantly, with rollback on failure |
| Tests | ✅ | `src/test/app.test.tsx` — authStore, ProtectedRoute redirect, PublicOnlyRoute redirect, favoritesStore |
| Accessibility | ✅ | `aria-label`, `aria-invalid`, `aria-pressed`, `aria-current`, breadcrumb `nav`, keyboard-operable cart drawer (Escape to close), visible focus rings throughout |
| Skeleton loaders & Error Boundary | ✅ | `src/components/ui/Skeleton.tsx` (ProductCardSkeleton, ProductDetailSkeleton); `src/components/layout/ErrorBoundary.tsx` (global) |
| Performance / code splitting | ✅ | `src/App.tsx` — all routes are `lazy()`; each page is a separate chunk |
| Toasts / notifications | ✅ | `react-hot-toast` — login success, logout, add to cart, add/remove favorites, error states |
| `prefers-color-scheme` default | ✅ | `src/store/themeStore.ts` — reads `matchMedia` on first visit; persisted after that |

### Key Decisions & Trade-offs

**State management — Zustand with `persist` middleware**  
Zustand was the preferred choice and fits the app well: minimal boilerplate, excellent TypeScript support, and the `persist` middleware handles localStorage serialization with a clean `partialize` API. Favorites and cart are stored keyed by userId string, giving user-scoped isolation without a server round-trip. Favorites are *not* cleared on logout (they survive across sessions for the same user), but each user's data is separate.

**HTTP layer — single Axios instance**  
All requests go through `src/api/client.ts`. Request interceptors attach Bearer tokens; response interceptors handle 401 by attempting a silent token refresh once before clearing auth and redirecting. A `failedQueue` pattern ensures concurrent 401s don't trigger multiple refresh calls.

**URL-synced filters**  
Search query, category, and page live in URL query params (`useSearchParams`). This makes the list view bookmarkable and browser-back works as expected. `setSearchParams` with `replace: true` keeps the history clean.

**Race condition handling**  
`useProducts` creates a new `AbortController` on every fetch and cancels the previous one. This ensures a slow earlier search can't overwrite a newer result when the user types quickly.

**Theming**  
Tailwind's `darkMode: 'class'` strategy, driven by a single `themeStore` that adds/removes the `dark` class on `<html>`. All color tokens are defined once in `tailwind.config.js` — no hardcoded colors in components. `prefers-color-scheme` is read on first visit.

**Favorites on FavoritesPage**  
DummyJSON doesn't support bulk-by-ID, so `getProductsByIds` fires concurrent requests with `Promise.allSettled`. This is fast for typical favorite counts but would need a backend endpoint for scale.

**No form library**  
The login form is simple enough (two fields) that a small custom validation function is cleaner than pulling in Zod + react-hook-form. I noted this decision here so it's clear it was deliberate, not an oversight.

### What I'd Improve With More Time

- **End-to-end tests** with Playwright — particularly the 401 interceptor flow (tamper the stored token, verify redirect and re-login) and the redirect-back-after-login flow.
- **Infinite scroll** as an alternative to pagination for the product list.
- **Image gallery lightbox** on the product detail page.
- **Toast for session expiry** — currently a hard redirect; a modal or banner would be more graceful.
- **Stale-while-revalidate caching** for product data (or swap to TanStack Query) to avoid re-fetching on every navigation.
- **List virtualization** with `@tanstack/react-virtual` for category lists with hundreds of items.
- **More test coverage** — the `useProducts` hook (debounce, AbortController), the 401 interceptor behaviour, and the cart store.

### Folder Structure

```
src/
├── api/            # Axios client + endpoint functions
│   ├── client.ts   # Singleton with interceptors
│   ├── auth.ts
│   └── products.ts
├── components/
│   ├── layout/     # Navbar, CartDrawer, ErrorBoundary
│   ├── products/   # ProductCard, CategoryFilter, Pagination
│   └── ui/         # Button, Skeleton, StarRating, FavoriteButton, LoadingSpinner
├── hooks/          # useAuth, useDebounce, useProducts
├── pages/          # One file per route
├── router/         # ProtectedRoute, PublicOnlyRoute
├── store/          # authStore, favoritesStore, themeStore, cartStore
├── test/           # Vitest + RTL tests
└── types/          # Shared TypeScript types
```
