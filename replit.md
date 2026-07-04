# Secure Login Portal (SafePort)

A legitimate, secure account portal where a person signs in with real authentication (Clerk) and manages their own profile, account summary, and recent security activity.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- API contract (source of truth): `lib/api-spec/openapi.yaml` — regenerate hooks/schemas with the codegen command after edits.
- DB schema: `lib/db/src/schema/` (`users.ts`, `activityEvents.ts`), re-exported from `index.ts`.
- Auth + user provisioning logic: `artifacts/api-server/src/lib/currentUser.ts`.
- Protected routes: `artifacts/api-server/src/routes/me/index.ts` (`/me`, `/me/stats`, `/activity`).
- Clerk server wiring: `artifacts/api-server/src/app.ts` + `src/middlewares/clerkProxyMiddleware.ts`.
- Frontend: `artifacts/portal/src/` — `App.tsx` (Clerk + wouter routing), `pages/` (landing, dashboard, auth, not-found).

## Architecture decisions

- Authentication is Replit-managed Clerk. Web uses cookie-based sessions — no Bearer tokens on browser API calls.
- Users are provisioned just-in-time on first authenticated request (from Clerk identity), not via webhooks.
- Sign-in counts/events are tracked by detecting Clerk session-id changes, kept race-safe (see Gotchas).
- API is contract-first: OpenAPI drives generated React Query hooks and Zod schemas used for request/response validation.

## Product

Public landing page for signed-out visitors; branded Clerk sign-in/sign-up; and a private dashboard showing profile (editable display name), account summary (secure logins, member since, last active), and a recent security-activity feed.

## User preferences

- Communicate with this user in Indonesian.

## Gotchas

- The dashboard fires `GET /me`, `/me/stats`, `/activity` in parallel on load. JIT provisioning and sign-in tracking in `currentUser.ts` MUST stay race-safe (insert with `onConflictDoNothing` + read-after-conflict; session transition via conditional `UPDATE ... RETURNING`). A naive check-then-insert causes duplicate-key 500s on first load.
- `cors({ credentials: true, origin: true })` is intentional (required by the Clerk proxy setup) — do not "harden" it to a fixed origin.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
