# Deployment Guide — Bhartiya Vidyapeeth Playway School

This app is a TanStack Start (React 19 + Vite) application with SSR and server
functions, backed by Supabase. It has **no runtime dependency on any
proprietary platform**: all backend configuration comes from environment
variables, and the build adapter is chosen automatically per host (see
`vite.config.ts`).

---

## 0. First-time setup: regenerate the lockfile

This project's lockfile is intentionally **not** included. The lockfile that
shipped with the exported project pinned every package to Lovable's private
npm registry mirror (`europe-west4-npm.pkg.dev/lovable-core-prod/...`), which
is unreachable outside Lovable's own build environment — installing with that
lockfile would fail on your machine, in CI, or on Netlify/Vercel.

Generate a fresh one from the public npm registry before your first install:

```bash
npm install
```

This creates a normal `package-lock.json` resolved against `registry.npmjs.org`.
Commit it. (If you prefer Bun or pnpm, `bun install` / `pnpm install` work
the same way — just commit whichever lockfile your tool produces.)

---

## 1. Environment variables

| Variable | Scope | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | **Public** (browser) | `https://gcgffxpfoydajzercswj.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | **Public** (browser) | `sb_publishable_38RIySno6y-qq1RR5sYr6A_MOWoVM1y` |
| `VITE_SUPABASE_PROJECT_ID` | Public | `gcgffxpfoydajzercswj` |
| `SUPABASE_URL` | Server | same URL as above |
| `SUPABASE_PUBLISHABLE_KEY` | Server | same publishable key |
| `SUPABASE_PROJECT_ID` | Server | `gcgffxpfoydajzercswj` |
| `SUPABASE_SERVICE_ROLE_KEY` | **SERVER ONLY — secret** | Supabase secret key. Never prefix with `VITE_`, never put in components, never commit. |

The publishable/anon key above is designed to be public (it's what Supabase's
own client SDK ships to browsers) — it is safe to have in this file. The
service role key is not: it is never written to this repo, `.env.example`,
or any log, and it must never be generated or filled in on your behalf by an
AI assistant. Get it yourself from Supabase → Project Settings → API →
**service_role secret key**, and paste it only into your host's environment
variable settings (or your local `.env`, which is git-ignored).

Missing server variables produce an explicit error naming the variable
(`src/lib/env.ts`), never the value.

Where the service role key is used (server only, always loaded inside a
handler): `src/integrations/supabase/client.server.ts`, imported dynamically by
`src/lib/students.functions.ts`, `src/lib/settings.functions.ts`,
`src/lib/gallery.functions.ts`.

---

## 2. Supabase database setup (your project)

The migrations in `supabase/migrations/` are the source of truth: enums
(`app_role`, `school_class` — Play Group / NUR / LKG / UKG — and
`lecture_class` — Nursery through Class 12), tables (`user_roles`,
`students`, `todays_learning`, `homework`, `gallery`, `lecture_links`,
`site_settings`, `class_fee_settings`, `student_fee_payments`), functions
(`has_role`, `my_class`, `my_lecture_class`, `current_fee_year`,
`sync_fee_year`, `sync_student_fee_year`, `update_updated_at_column`), the
`site_settings`/`class_fee_settings`/`student_fee_payments` updated-at
triggers, the trigger that auto-creates a fee payments row for every new
student, all GRANTs, all RLS policies, storage policies for the `gallery`
bucket, the lecture-link seed rows, the class fee structure seed rows, and
the yearly fee reset cron jobs.

Three migrations were added after the site was first deployed and are safe
to apply on top of an existing, already-in-use database — none of them touch
or drop any existing data:

1. `20260810090000_rename_junior_group_to_play_group.sql` — renames the
   `school_class` enum value `Junior Group` to `Play Group` in place (every
   existing row updates automatically; no data is recreated).
2. `20260810090100_lecture_system_nursery_to_class12.sql` — rebuilds
   `lecture_links` on a new `lecture_class` enum (Nursery through Class 12).
   Existing NUR/LKG/UKG Google Drive links are carried over automatically;
   Play Group intentionally has no lecture link, by design.
3. `20260810090200_fee_management_system.sql` — adds `class_fee_settings`
   (per-class Total/Monthly/Registration fee, seeded with the school's
   initial figures) and `student_fee_payments` (per-student registration +
   12 monthly Paid/Unpaid flags, one row per student, auto-created for every
   new and existing student). The original `students.fee_year` /
   `students.fee_months` columns from the first migration are left in place
   untouched but are no longer read by the app — see the comment at the top
   of this migration for why a lossy auto-migration of that old data was
   deliberately avoided.

Apply them to your project:

```bash
npm i -g supabase
supabase login
supabase link --project-ref gcgffxpfoydajzercswj
supabase db push
```

Alternative: open the SQL editor in your Supabase project and run each file in
`supabase/migrations/` in filename order.

Notes:
- `CREATE EXTENSION pg_cron` and the `cron.schedule(...)` line require the
  `pg_cron` extension to be enabled for your project (Database → Extensions).
  If it is unavailable, skip that statement — the app also normalises the fee
  year client-side from the system date, so the tracker still shows the correct
  year; running `select public.sync_fee_year();` once a year keeps the rows tidy.
- RLS stays enabled everywhere. Parents can read only their own student row and
  only their own class's homework/learning; admins manage everything through
  `has_role()`; the public can read only `gallery`, `lecture_links` and
  `site_settings`.

## 3. Supabase Storage setup

Create a bucket named exactly **`gallery`**, **private** (public = off):
Storage → New bucket → name `gallery` → leave "Public bucket" unchecked.

The storage RLS policies (admin insert/select/delete on `bucket_id = 'gallery'`)
ship in migration `20260807140139_*.sql`. Public visitors never read the bucket
directly — the server signs short-lived URLs with the service role key, which
preserves the private model.

## 4. Admin account setup

1. Supabase → Authentication → Users → **Add user** → email + password,
   "Auto confirm user" on. (Use your real admin email; no password is hardcoded
   anywhere in the app.)
2. Copy the new user's UUID.
3. SQL editor:

```sql
insert into public.user_roles (user_id, role)
values ('<PASTE-USER-UUID>', 'admin')
on conflict (user_id, role) do nothing;
```

4. Sign in at `/admin-login`. Parent/student accounts are then created from the
   admin dashboard (server-side, service role) using phone-number logins.

## 5. Netlify deployment

- **Build command:** `npm run build`
- **Publish directory:** `dist/client` (set by the official
  `@netlify/vite-plugin-tanstack-start` Vite plugin — see `vite.config.ts` and
  `netlify.toml`)
- **Node version:** 22.12 or newer (required by the plugin and by Vite 8/TanStack Start)
- The Netlify build environment sets `NETLIFY=true` automatically, which
  `vite.config.ts` reads to select the Netlify plugin at build time —
  application code contains no Netlify-specific logic.
- Add every variable from section 1 in Site configuration → Environment
  variables (mark `SUPABASE_SERVICE_ROLE_KEY` as a secret). Redeploy after
  changing them; `VITE_*` values are inlined at build time.
- Do **not** add a `/* -> /index.html` SPA redirect — it would shadow SSR and
  the server functions. Direct visits and refreshes of `/`, `/admin-login`,
  `/admin`, `/parent-login`, `/parent` are handled by the SSR function.
- If you deploy with the Netlify CLI, use netlify-cli **17.31 or newer**
  (required by `@netlify/vite-plugin-tanstack-start`).

## 5b. Vercel deployment

No code changes are needed. When `NETLIFY` is not set, `vite.config.ts` falls
back to plain Nitro (`nitro/vite`), which auto-detects Vercel's build
environment (`VERCEL=1`) and applies its `vercel` preset with zero extra
configuration.

- **Framework preset:** Vercel detects TanStack Start + Nitro automatically —
  no build/output overrides needed.
- **Environment variables:** same table as section 1, added in Project
  Settings → Environment Variables (mark `SUPABASE_SERVICE_ROLE_KEY` as
  sensitive/secret).
- No `netlify.toml` or `vercel.json` conflict: `netlify.toml` is only read by
  Netlify's build system, so it's harmless to leave in the repo.

## 6. Supabase Auth URL configuration (after first deploy)

Supabase → Authentication → URL Configuration:
- **Site URL:** your production URL, e.g. `https://your-site.netlify.app`
  (or your custom domain once connected).
- **Redirect URLs:** add `https://your-site.netlify.app/**` and any custom
  domain. No production URL is hardcoded in the app.

## 7. Local verification

```bash
npm install      # generates a fresh lockfile — see section 0
npm run build
npm run preview
```

`npm run preview` serves the production build locally so you can click through
the site, log in as admin/parent, and confirm gallery/storage/fees before
deploying.

## 8. Known limitations / manual steps

- Regenerating the lockfile (section 0), applying the migrations, creating the
  `gallery` bucket, creating the first admin user, and setting the environment
  variables on your host are manual one-time steps — they need either
  credentials or a real `npm install` run, neither of which this codebase (or
  an AI assistant working from an offline export of it) can supply for you.
- Existing content (students, gallery rows, site settings, uploaded logo) lives
  in the old database; students specifically are **not** copied by the
  migrations or the seed file (see section 9) — recreate them in the admin
  panel.
- Every student (new or existing) gets a fresh, all-unpaid `student_fee_payments`
  row from the fee management migration; it does not attempt to infer past
  payment history from the old `fee_months` tracker, since that tracker had
  no registration fee and used calendar months (Jan–Dec) rather than the
  school's April–March year. If you need to record fees already collected
  before this update, mark them Paid from the admin Students tab — the old
  data is preserved untouched on the `students` table if you need to check it.
- `pg_cron` availability depends on your Supabase plan (see section 2).

## 9. Migrating existing content

`supabase/seed/content-export.sql` contains the current site settings, gallery
rows, homework and learning entries. Run it in your Supabase SQL editor **after**
the migrations.

| Data | Status |
|---|---|
| Site settings (name, tagline, phone, address, timings, map) | **Migrated automatically** via `content-export.sql` |
| Gallery rows + captions | **Migrated automatically** via `content-export.sql` |
| Today's learning / homework entries | **Migrated automatically** via `content-export.sql` |
| Lecture links (per class) | **Migrated automatically** — the original NUR/LKG/UKG links carry over into the new Nursery/LKG/UKG rows during migration; add links for Class 1–12 from the admin Lectures tab as needed. Play Group never had (and never gets) a lecture link. |
| Gallery images and the logo | **Migrated automatically** — committed to `public/img/` and referenced by relative path (`/img/<file>.webp`), served by your own deployment. Nothing to copy into Storage; the `gallery` bucket is used only for *new* admin uploads and an admin-uploaded logo. |
| Students | **Cannot be migrated automatically** — each student row is tied to a Supabase Auth user, and Auth users cannot be copied between Supabase projects. |

### Student / parent account migration (manual)

Each student's login is a Supabase Auth user with a phone-derived internal
email (`<phone>@bvps.parent.local`) and a password only the school knows —
that password is never stored in plaintext or exported anywhere this
migration can read it, so it cannot be carried over automatically. For each
existing student:

1. Sign in to `/admin-login` on the new deployment.
2. Admin panel → Students → **Add student** → enter name, class, phone number,
   and a **new** temporary password.
3. This creates a fresh Supabase Auth user (via the service-role server
   function in `src/lib/students.functions.ts`), a matching `students` row
   linked to that user's ID, and the `parent` role is implied by that link —
   the relationships (`auth user → students row → class → homework/fees`) are
   created consistently by that one action, so there's nothing to reconcile
   by hand afterward.
4. Give the parent their phone number and the new password, and ask them to
   change it after first login if you'd like (there's no in-app password-change
   flow yet — a password reset means the admin sets a new one from the same
   Students panel).

The two students present in the exported data are listed as comments at the
end of `supabase/seed/content-export.sql` (name, class, phone, and which
months are already marked paid) so you have everything needed to recreate them
in step 2.
