# Beredskab

Dansk dropshipping-webshop for beredskabs- og overlevelsesudstyr. Se den fulde
arkitekturplan i `C:\Users\techn\.claude\plans\valiant-fluttering-gem.md`.

Status: Fase 1 (projektsetup, datamodel, seed-data, design-system) er bygget.
Resten af README'en (deploy-guide, fuld opsætningstjekliste) kommer i Fase 9.

## Stack

Next.js (App Router) + TypeScript, Tailwind CSS, PostgreSQL + Prisma 7
(driver-adapter: `@prisma/adapter-pg`), Stripe, Auth.js, Resend, Zod, Vitest,
Playwright.

## Kom i gang lokalt

1. Kopiér `.env.example` til `.env` og udfyld `DATABASE_URL` med en rigtig
   Postgres-forbindelse (lokal, Docker eller en gratis Neon/Supabase-database).
2. Installer afhængigheder: `npm install`
3. Generér Prisma-klienten: `npm run db:generate`
4. Kør migrationer mod din database: `npm run db:migrate`
5. Seed demo-data (8 kategorier, ca. 40 produkter, fragtpriser, butiksindstillinger):
   `npm run db:seed`
6. Start dev-serveren: `npm run dev` og åbn [http://localhost:3000](http://localhost:3000)

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run test` — Vitest (unit-tests)
- `npm run test:e2e` — Playwright (kræver bygget app, se `playwright.config.ts`)
- `npm run db:generate` / `npm run db:migrate` / `npm run db:seed`
