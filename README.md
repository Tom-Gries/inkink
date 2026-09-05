# InkInk

Monorepo für die InkInk-Web-App (TanStack Start) und die Hono-API (Better Auth + MongoDB).

## Struktur

```
apps/
  api/        Hono-API (Better Auth, MongoDB) – Einstieg src/server.ts + src/index.ts
  web/        TanStack Start / React (Frontend)
packages/
  api/        Typsicherer API-Client (@inkink/api) + Auth-Guard
  auth/       Better-Auth-Instanz (@inkink/auth)
  core/       Kern-Typen (Definition/Router)
  i18n/       Übersetzungen
  inks/       Feature-Inks (learnink, settink, startink)
  routing/    Router-Guards (@inkink/routing)
  ui/         UI-Bausteine
  ui-auth/    Auth-Store + LoginGate/Buttons
```

## Dev-Workflow

```bash
pnpm install
pnpm dev:all          # API (Port 8787) + Web (Port 3000) parallel
pnpm dev:api          # nur API
pnpm test             # Vitest
pnpm validate         # Typecheck + Lint (Biome) + Test
pnpm build:api        # Vercel-Bundle für apps/api (Build Output API v3)
```

## Umgebungsvariablen

- `apps/api/.env` – API-Secrets: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_URL`, `WEB_ORIGIN`, `CORS_ORIGINS`.
- `apps/web/.env` – `VITE_API_URL` (z. B. `http://localhost:8787`), `VITE_AUTH_LOG_LEVEL`.
- Siehe `apps/api/.env.example` / `apps/web/.env.example`.

## Auth / OAuth (Better Auth)

- Login via Google OAuth; Better Auth speichert den OAuth-`state` im Cookie
  (`storeStateStrategy: 'cookie'`).
- Ohne `COOKIE_DOMAIN`/`crossSubDomainCookies` ist das Cookie **host-only**.
- **Debug bei `state_mismatch`:** Temporär `AUTH_DEBUG=1` als Env-Variable
  setzen. Dann zeigt `https://inkink-api.vercel.app/api/auth/error?error=state_mismatch`
  eine Diagnose-Seite (nur Metadaten/Hashes, nie geheime Werte), und die
  Callback-Logs (Vercel-Function-Logs) enthalten `state_sha256` + Cookie-Hashes.

## Vercel-Deploy (API)

`apps/api` wird über `pnpm build:api` (esbuild) als **eine** Serverless-Function
(`__server.func`) gebaut. Die Vercel-`config.json` routet `/api/(.*)` sowie `/`
und `/error` (Diagnose) auf diese Function.

## CI

`.github/workflows/ci.yml`: Typecheck, Lint, Tests, API-Build, Web-Build.

## Wichtige Hinweise

- **Keine Secrets committen.** `.env*`, `.env.local` und `*.log` sind ignoriert.
- Die Biome-Formatierung gilt **repo-weit** (Root-`biome.json`); `apps/web/biome.json`
  wurde entfernt.