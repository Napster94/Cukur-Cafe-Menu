# Çukur Café — Digital Menu & Admin Dashboard

A full-stack digital menu website and admin CMS built for Çukur Café: a
mobile-first customer menu (designed for QR-code access) plus a separate
admin dashboard for managing categories, items, images, and cafe settings.

## Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS, custom design tokens matching the cafe's
  black/gold branding
- **Database:** SQLite via `better-sqlite3` (see "About the database" below)
- **Auth:** JWT session cookie (httpOnly), bcrypt password hashing
- **Images:** Uploaded through the admin panel, optimized to WebP with
  `sharp`, stored under `public/uploads/`

## Getting started

```bash
npm install
cp .env.example .env      # already has sane local defaults
npm run db:seed           # creates dev.db and loads the real menu data
npm run dev
```

Visit:
- **Customer site:** http://localhost:3000
- **Full menu (what a QR code should point to):** http://localhost:3000/menu
- **Admin login:** http://localhost:3000/admin/login

**Seeded admin login:**
- Email: `admin@cukurcafe.com`
- Password: `cukur-admin-2026`

Change this password (or create a new admin and delete the seeded one)
before putting this in front of real customers — see "Production
checklist" below.

## Project structure

```
/app
  /(customer routes: page.tsx, /menu)
  /admin
    /login                 → public login page
    /(dashboard)            → protected: dashboard, categories, menu-items,
                              media, settings (route group, all behind auth)
  /api                      → REST endpoints used by both the customer site
                              (read-only) and the admin dashboard (full CRUD)
/components
  /customer                 → menu UI (header, footer, item cards, modal)
  /admin                    → dashboard UI (sidebar, forms, toasts, dialogs)
/lib                         → db access, auth, formatting helpers
/scripts/seed.ts             → loads the real Çukur Café menu into the DB
/types                       → shared TypeScript types
```

## About the database

The proposed architecture used Prisma + SQLite. This build environment's
network policy blocks the domain Prisma downloads its query-engine binary
from, so the data layer here is a small `better-sqlite3`-backed module
(`lib/db-core.ts` + `lib/prisma.ts`) that exposes the **same Prisma-style
API** (`category.findMany`, `menuItem.create`, `$transaction`, etc.) used
throughout the route handlers. Functionally it's a complete drop-in — every
feature in the brief works — it's just backed by a hand-written data layer
instead of the Prisma client.

If you'd prefer real Prisma (e.g. for Prisma Studio, migrations tooling, or
easy Postgres later), it's a fairly mechanical swap: reintroduce
`prisma/schema.prisma` (a version is described in the architecture notes
below), run `npx prisma generate` and `npx prisma db push` in an
environment with normal internet access, and re-point `lib/prisma.ts`'s
exports at `@prisma/client` instead of the SQLite facade — the route files
themselves don't need to change, since they already call the Prisma-shaped
API.

## Swapping SQLite → Postgres later

However you manage the DB layer, the schema translates directly:
`Admin`, `Category`, `MenuItem`, `DietaryTag`, `Allergen`, and their join
tables, plus a singleton `CafeSettings` row. Move to Postgres by either
(a) doing the Prisma swap above with `provider = "postgresql"`, or
(b) pointing `lib/db-core.ts` at a Postgres client instead of
`better-sqlite3` and adjusting the SQL dialect (mainly quoting and upsert
syntax).

## Swapping local image storage → S3/Cloudinary

`app/api/upload/route.ts` is the only place that writes images to disk.
Replace the `sharp(...).toFile(...)` call with an upload to your storage
provider of choice and return its public URL instead of the local
`/uploads/...` path — nothing else in the app needs to change, since every
image is referenced by URL string.

## Fonts

The design uses a serif display font + a clean sans body font, matching
the printed menu's typography. This sandbox couldn't reach Google Fonts to
bundle them at build time, so `app/globals.css` currently defines
`--font-display` / `--font-body` as system-font stacks (Georgia-based
serif, Inter-based sans) that already look intentional. To use the exact
Playfair Display + Inter pairing, add in `app/layout.tsx`:

```tsx
import { Playfair_Display, Inter } from 'next/font/google';
const display = Playfair_Display({ subsets: ['latin'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], variable: '--font-body' });
// then add `${display.variable} ${body.variable}` to the <html> className
```

This works fine on Vercel or any environment with normal internet access.

## Deploying so it's reachable from anywhere

The customer menu and the admin dashboard are the same app — once it's
deployed, staff reach the admin panel from any phone/laptop at
`yourdomain.com/admin/login`, and customers reach the menu at
`yourdomain.com/menu` (point your table QR codes there).

**The one thing that matters when picking a host:** this app writes to disk
— the SQLite database and uploaded photos both live under one folder
(`DATA_DIR`, `.data/` by default). That folder needs to *persist* between
deploys and restarts. That rules out pure-serverless platforms like Vercel
or Netlify unless you first swap to Postgres + S3 (see the "Swapping"
sections above) — everything below assumes you don't want to do that yet.

### Option A — Railway (recommended: simplest path, ~$5/month)

1. Push this project to a GitHub repo.
2. In Railway, "New Project" → "Deploy from GitHub repo" → select it.
   Railway auto-detects Next.js and builds it directly (recommended —
   this is the path I could actually verify end-to-end here: `npm run
   build` followed by the production server, hitting the homepage, menu,
   admin login, and API all responded correctly). A `Dockerfile` is also
   included if you'd rather build a container; I wasn't able to run Docker
   in this sandbox to test it, so give it a trial deploy before relying on
   it — if the seed step misbehaves in the container, fall back to
   Railway/Render's native build instead.
3. Add a **Volume**: mount it at `/app/.data`.
4. Set environment variables:
   - `JWT_SECRET` — generate a long random string (e.g. `openssl rand -hex 32`)
   - `DATA_DIR` — `/app/.data` (matches the volume mount)
5. Set the **Start Command** to: `npm run db:seed && npm run start`
   (seeding is safe to run on every boot — it only creates what's missing,
   so this guarantees the admin login exists on a fresh volume without a
   manual step).
6. Deploy. Railway gives you a `*.up.railway.app` URL immediately; add a
   custom domain from the service's Settings → Domains if you have one.

### Option B — Render (also simple, similar price)

Same idea: "New Web Service" from your GitHub repo, add a **Disk** mounted
at `/opt/render/project/src/.data`, set `JWT_SECRET` and `DATA_DIR`
(matching the disk path) as environment variables, and set the start
command to `npm run db:seed && npm run start`. Render's free web-service
tier doesn't support persistent disks — you'll need a paid instance
(disks are billed separately, roughly $0.25/GB/month).

### Option C — Docker on any VPS (cheapest long-term, more setup)

The included `Dockerfile` builds a self-contained image. On any VPS
(Hetzner, DigitalOcean, etc.):

```bash
docker build -t cukur-cafe .
docker volume create cukur-data
docker run -d -p 3000:3000 \
  -e JWT_SECRET="$(openssl rand -hex 32)" \
  -v cukur-data:/app/.data \
  --name cukur-cafe \
  cukur-cafe
```

Put a reverse proxy in front (Caddy or nginx) for HTTPS and your domain —
Caddy is the least fiddly if you haven't set one up before, since it
handles TLS certificates automatically.

### After deploying

- Log into `/admin/login` with the seeded credentials and **change the
  admin password** from Settings → Change password.
- Point your table QR codes at `https://yourdomain.com/menu`.
- The manager can now reach `/admin` from any device, anywhere — it's a
  normal login-protected web page, not tied to any specific network.



- [ ] Set a strong, random `JWT_SECRET` in your production environment
- [ ] Change or replace the seeded admin password
- [ ] Point `DATABASE_FILE` at a persistent volume (SQLite file must survive
      deploys) — or move to Postgres if deploying somewhere without
      persistent disk (e.g. most serverless platforms)
- [ ] Move image uploads to S3/Cloudinary if deploying somewhere without
      persistent disk
- [ ] Swap in real fonts (see above)
- [ ] Point your table QR codes at `/menu`

## What's intentionally not built yet

Per your direction, this is a walk-in-only cafe menu: no online ordering,
cart, checkout, or payments, and no "Games" management in the CMS (the
homepage mentions games as ambience copy, but they aren't a database-backed
menu category). The data model (see `lib/db-core.ts`) leaves room to add
these later without a redesign — e.g. `MenuItem` already has everything
needed for an eventual cart/order flow.
