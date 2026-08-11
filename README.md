# Bhartiya Vidyapeeth Playway School — Website & Parent Portal

An independent, self-hosted website and parent/admin portal for Bhartiya
Vidyapeeth Playway School (Sikanderpur, Ballia). It has no dependency on any
proprietary platform at runtime — the backend is your own Supabase project,
and the app deploys to any host that runs a Node.js server (Netlify, Vercel,
or a plain Node server).

## Stack

- [TanStack Start](https://tanstack.com/start) (React 19 + Vite, SSR + server functions)
- TypeScript
- Tailwind CSS 4
- [Supabase](https://supabase.com) (Postgres, Auth, Storage) as the backend
- [Nitro](https://nitro.build) for the deployable server build

## Features

- Public site: hero, about, admission info, photo gallery, contact — all
  editable from the admin panel. Admission classes are Play Group, NUR, LKG
  and UKG.
- Parent portal: phone-number sign-in, per-class homework, today's learning,
  a class-scoped online lecture link, and a read-only fee tracker (Total /
  Paid / Due amounts, plus Paid/Unpaid status for registration and each
  month — never the individual registration/monthly amounts).
- Lectures: a separate Nursery-through-Class-12 system (Play Group excluded)
  for Google Drive lecture links, managed per class from the admin panel and
  scoped to each parent's own class by Row Level Security.
- Fee management: per-class fee structure (Total / Monthly / Registration,
  editable from the admin Fee Settings tab) and per-student payment tracking
  (registration + 12 school-year months). Paid Fee and Due Fee are always
  computed from the payment statuses, never stored or hand-edited.
- Admin panel: manage students and their parent logins, per-student fee
  payments, class fee settings, lecture links, site settings (including logo
  upload), and the gallery.
- Supabase Auth + Postgres Row Level Security for both portals; admin-only
  operations are also re-checked server-side. Fee amounts are additionally
  kept out of the parent-facing network responses — see `DEPLOYMENT.md`.

## Local development

Requires Node.js 22.12+ and a Supabase project (see [`DEPLOYMENT.md`](./DEPLOYMENT.md)
for full setup: migrations, storage, and Auth).

```sh
git clone <this-repository-url>
cd <repository-name>
cp .env.example .env   # then fill in your Supabase values
npm install
npm run dev
```

## Building & deploying

```sh
npm install
npm run build
npm run preview   # verify the production build locally
```

See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for the full production deployment guide,
including database migrations, Storage/Auth setup, environment variables, and
step-by-step instructions for Netlify and Vercel.

## Project structure

- `src/routes/` — file-based routes (public site, `/admin`, `/parent`, logins)
- `src/components/` — UI components (`site/` = public site, `admin/` = admin panel, `ui/` = shadcn/ui primitives)
- `src/lib/*.functions.ts` — server functions (run only on the server; never shipped to the browser)
- `src/integrations/supabase/` — Supabase clients (browser, server/admin, and auth middleware)
- `supabase/migrations/` — database schema, RLS policies, and functions
- `supabase/seed/content-export.sql` — existing site content to import after migrations
