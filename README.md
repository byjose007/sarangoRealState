# Vestra — premium real estate template

A production-ready Next.js 16 template for a survey-first residential brokerage.
Full filtering, comparison, favourites, mortgage maths, floor plans, 360° tour
and a complete SEO layer, on top of a Prisma/Postgres-backed admin CRM.

Built as a commercial-grade template: strict TypeScript, modular architecture,
no dead files, `next build` passes with 165 pre-rendered pages.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — everything works without keys
npm run db:seed              # admin login + José Sarango, empty catalogue
npm run dev                  # http://localhost:3000
```

Want the UI populated with sample agents/listings while building locally?
Run `npm run db:seed:demo` instead — see "Seeding" below.

Other scripts:

| Script              | What it does                                  |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Dev server with Fast Refresh                  |
| `npm run build`     | Production build (SSG for listings/blog/agents)|
| `npm run start`     | Serve the production build                    |
| `npm run lint`      | ESLint (next/core-web-vitals + TS)            |
| `npm run typecheck` | `tsc --noEmit`                                |
| `npm run format`    | Prettier + Tailwind class sorting             |

Node 20.19+ required (developed on Node 22).

---

## Design direction

The brief asked for premium and minimal; the identity avoids the generic
"luxury real estate" look by borrowing from **surveyor's drawings** instead of
lifestyle photography.

- **Palette** — ink `#0E1512`, verdigris `#1F5D53` (primary), brass `#B98A44`
  (accent hairlines only), porcelain `#F6F5F2` (canvas), plus a full dark theme.
  All colours are HSL channel tokens in `globals.css`, so one class works in
  both themes.
- **Type** — Fraunces (display, high contrast, used with restraint), Manrope
  (body), IBM Plex Mono (every number, reference and label — prices, areas,
  parcel codes). The mono/serif split is what makes the pages feel like records
  rather than brochures.
- **Signature** — architectural annotation over imagery: corner ticks
  (`.tick-frame`), a brass dimension line on the hero, and a `VS-014-TX` parcel
  reference on every card, gallery plate and detail header.
- **Motion** — one orchestrated hero entrance, scroll reveals, hover scale on
  photography. `prefers-reduced-motion` disables all of it globally.

Fonts are loaded via `<link>` rather than `next/font` so the project builds in
network-restricted environments. To switch, import from `next/font/google` in
`src/app/layout.tsx` and assign the CSS variables `--font-display`,
`--font-body`, `--font-mono`.

---

## Architecture

```
src/
├─ app/                 # App Router: routes, metadata, sitemap, robots
│  ├─ properties/[slug] # SSG detail pages (generateStaticParams)
│  ├─ agents/[slug]
│  ├─ blog/[slug]
│  ├─ about · contact · compare · favorites
│  └─ coming-soon · maintenance · not-found · error · loading
├─ components/
│  ├─ ui/               # primitives: button, input, modal, drawer, tabs…
│  ├─ layout/           # navbar (mega menu), footer, chat, preloader…
│  ├─ home/             # one file per home-page section
│  ├─ property/         # cards, gallery, map, calculator, plans, forms
│  ├─ blog/             # article card + markdown renderer
│  └─ shared/           # smart-image, reveal, counter, headings, rating
├─ features/            # composed flows (property search, contact form)
├─ services/            # data access — the only module that knows the source
├─ data/                # deterministic mock catalogue
├─ store/               # Zustand: collections + UI state
├─ hooks/ lib/ types/ constants/ providers/ actions/
```

**Decisions worth knowing:**

1. **`services/property-service.ts` is the seam.** Filtering, sorting,
   pagination, similarity scoring and facets all live there. Swap the array
   lookups for `fetch` calls and no component changes.
2. **Filters live in the URL.** `usePropertyFilters` serialises every filter to
   query params, so results are shareable, bookmarkable and back-button safe.
3. **Mock data is deterministic.** A seeded PRNG (`mulberry32`) generates the
   catalogue, so server and client render identical markup — no hydration drift.
4. **Persisted state is hydration-guarded.** Favourites, comparison and recently
   viewed use `zustand/persist` behind a `useMounted()` check.
5. **One carousel engine.** Embla only — Swiper was dropped deliberately rather
   than shipping two overlapping libraries.
6. **Maps degrade gracefully.** With no API key, `PropertyMap` renders an
   in-house plan view with positioned markers and popovers. Set
   `NEXT_PUBLIC_MAP_PROVIDER=google|mapbox` plus a key to switch.
7. **Images fall back.** `SmartImage` wraps `next/image` and swaps to a seeded
   placeholder on error, so a dead demo asset never breaks a layout.
8. **Server actions stand in for the CRM** (`src/actions/leads.ts`), validated
   with the same Zod schemas the client forms use.

---

## Implemented features

**Pages** — Home · Listings (grid / list / map) · Property detail · Agents index
· Agent profile · Journal index (category filter) · Article · About · Contact ·
Compare · Saved homes · Coming soon · Maintenance · 404 · error boundary.

**Search & filtering** — hero advanced search with buy/rent/new tabs, keyword,
city, type, price range, beds, baths, floor area, amenities, garages, six sort
orders, pagination, URL-synced state, mobile filter drawer, ⌘K search modal.

**Property detail** — editorial gallery with lightbox and keyboard nav, tabbed
record (details, amenities, floor plans as inline SVG, downloadable documents,
what's nearby), lazy video walkthrough, draggable 360° tour, location map,
mortgage calculator with amortisation chart (Recharts), schedule-a-visit form,
agent contact form, WhatsApp, share sheet, similar listings, recently viewed,
JSON-LD `SingleFamilyResidence`.

**Cross-site** — favourites, up to four-way comparison with a sticky tray,
recently viewed history, quick-view modal, dark mode, sticky auto-hiding header,
mega menu, scroll reveals, animated counters, skeletons and loading/empty/error
states, toasts, floating contact launcher, back to top, preloader.

**SEO & quality** — per-page metadata, Open Graph, Twitter cards, canonical
URLs, `sitemap.xml` (all 150+ routes), `robots.txt`, organisation JSON-LD,
breadcrumbs, semantic landmarks, skip link, visible focus rings, ARIA on all
interactive controls, reduced-motion support, responsive from 360px up.

---

## Customising

- **Brand & copy** — `src/constants/site.ts` (name, offices, phone, hours) and
  `src/constants/navigation.ts` (menus).
- **Colours & type** — `src/app/globals.css` tokens and `tailwind.config.ts`.
- **Catalogue** — `src/data/*`. Replace `properties.ts` / `agents.ts` /
  `articles.ts` with your API and keep the `types/index.ts` contracts.
- **Images** — `src/data/images.ts` holds the Unsplash IDs; point `unsplash()`
  at your own CDN and add the hostname to `next.config.mjs` → `remotePatterns`.

## Deploying

Works unchanged on Vercel (`vercel deploy`), or `npm run build && npm run start`
behind any Node host. Set `NEXT_PUBLIC_SITE_URL` in production so metadata,
canonicals and the sitemap resolve to the right origin.

## Seeding

`src/data/{agents,properties}.ts` still carries this project's original
Vestra template: a real agent (José Sarango) alongside a leftover fake one
("Arlene McCoy" — her social links are literally copy-pasted from José's) and
~100 procedurally generated listings with stock Unsplash photography.

`npm run db:seed` is production-safe by default: it seeds only the admin
login and José Sarango, with an empty property catalogue — add real listings
(with real photos) through `/admin/properties`. Use `npm run db:seed:demo`
(or `SEED_DEMO_DATA=1 npm run db:seed`) instead when you want the template's
fake agent and generated listings for trying the UI out locally; never run
that against a real/production database.

## Backups

`docker-compose.yml`'s `postgres_data` volume is local to whatever host runs
it — if that disk dies, so does the database, unless dumps exist somewhere
else. `scripts/backup-db.sh` dumps the `db` container to a gzipped,
timestamped file under `./backups` (kept `RETENTION_DAYS`, default 14) and
`scripts/restore-db.sh <file>` restores one back.

Wire it up once the VPS is provisioned — from the project root, as a daily
cron job:

```bash
chmod +x scripts/backup-db.sh scripts/restore-db.sh
crontab -e
# Add:
0 2 * * * cd /opt/vestra && ./scripts/backup-db.sh >> /var/log/vestra-backup.log 2>&1
```

`./backups` is gitignored (dumps hold client PII) and stays on the same
disk as the database by default — copy it off-server too (`rclone`/`rsync`
to S3, Backblaze, or another host) so a backup survives the host it backs
up, not just the container.

## Enabling HTTPS

`nginx/nginx.conf` currently only serves plain HTTP — admin credentials and
session cookies travel unencrypted until this is done. It's written to be a
5-minute job once there's a real domain, not a redesign:

1. **Point DNS first.** Create an A record for your domain (and `www` if you
   want it) pointing at the VPS's IP. Certbot's HTTP-01 challenge fails
   without this — do it before anything below and give it a few minutes to
   propagate.
2. **Start the stack** so nginx is up to serve the challenge:
   `docker compose --profile full up -d --build`.
3. **Request the certificate** (replace `example.com` and the email):
   ```bash
   docker compose run --rm certbot certonly \
     --webroot -w /var/www/certbot \
     -d example.com -d www.example.com \
     --email you@example.com --agree-tos --no-eff-email
   ```
4. **Uncomment the 443 `server` block** in `nginx/nginx.conf`, replace every
   `example.com` in it with your real domain, and uncomment the
   `return 301 https://...` redirect near the top of the port-80 block (it
   sits right above the `/uploads/` location — leave `/.well-known/acme-challenge/`
   reachable over HTTP, renewal needs it).
5. **Uncomment `- '443:443'`** under the `nginx` service in
   `docker-compose.yml`.
6. **Reload:** `docker compose up -d nginx` (or `restart`).

**Renewal** — certificates expire every 90 days. Add a host cron job next to
the backup one:

```bash
0 3 * * * cd /opt/vestra && docker compose run --rm certbot renew --quiet && docker compose exec nginx nginx -s reload
```

---

Demo content is fictional. Photography is served from Unsplash for preview
purposes — license your own assets before going live.
