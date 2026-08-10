# Authenticated Site Boundary

Embers of Light intentionally exposes only the public landing and authentication flows to signed-out visitors.

## Public routes

- `/`
- `/login`
- `/signup`
- `/forgot-password`
- `/reset-password`
- `/auth/*` callback flows

All other page routes are protected by `src/proxy.ts` and require a valid Supabase authenticated session. A signed-out visitor who requests a protected page is redirected to `/login` with a same-origin `returnTo` path so a successful login can return them to the requested page.

This global account gate is separate from and additive to more specific authorization rules such as administrator-only or paid-tier access.

## Analytics boundary

Anonymous browser/session analytics are accepted only for `/`, the public landing page. Internal site analytics require a verified authenticated user and are reported by signed-in account engagement rather than anonymous visitor counts.

API routes are excluded from the global page proxy and must enforce their own authorization where required.
