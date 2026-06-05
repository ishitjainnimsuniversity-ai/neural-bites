# Auth, Cloud Sync & Curated Academy Videos

## 1. Authentication
- Add email/password + Google sign-in using Lovable Cloud managed auth (`lovable.auth.signInWithOAuth`).
- New `/auth` page (sign-in / sign-up tabs) and `/reset-password` page.
- Navbar: show user email + Sign out when logged in; Sign in button otherwise.
- `useSession` hook with `onAuthStateChange` + `getUser()` for trusted checks.
- Email confirmation stays on (default). Auto-confirm NOT enabled.

## 2. Database (one migration)
Tables (all RLS-enabled, GRANTs included, `user_id uuid references auth.users on delete cascade`):
- `profiles` — name, age, sex, height_cm, weight_kg, goal, intensity, target_fat_kg, fasting_hours, photo_url
- `course_progress` — course_id, watched jsonb, last_active_at
- `exam_attempts` — course_id, exam_id, score numeric, passed bool, at timestamptz
- `certificates` — serial (unique), course_id, course_title, user_name, issued_at
- Trigger: auto-insert empty `profiles` row on new auth user (handle_new_user)
- `updated_at` trigger on profiles & course_progress

RLS: each user can select/insert/update/delete only their own rows. Certificates: owner can read+insert; **anon can SELECT** (for public `/verify/:serial` page).

## 3. Sync layer
- `src/lib/cloudSync.ts` — load/save profile, progress, certs against the DB when authed; fall back to localStorage when not authed.
- On login, one-shot migrate any local `nb.*` keys → DB, then clear local copies.
- `loadProfile`, `enroll`, `saveProgress`, `issueCertificate` in `src/lib/profile.ts` / `academy.ts` become async-capable wrappers; UI uses React Query to read.
- `/verify/:serial` reads from DB first, falls back to local.

## 4. AIMirror / Academy / Certificate UI
- Gate "Issue certificate" and "Save progress" behind auth — prompt sign-in if anonymous (with friendly modal, still allow local demo mode).
- Show "Synced ✓" indicator when authed.
- Certificate page fetches by serial from DB.

## 5. Curated academy videos
Swap module `videoId`s in `src/lib/academy.ts` to well-known stable lectures (e.g. Yoga With Adriene, TED-Ed, Harvard T.H. Chan, Mayo Clinic, Jeff Nippard, Andrew Huberman public clips). Verify each ID via oEmbed before committing.

## 6. Out of scope this round
- Profile photo upload to storage (kept as data URL / null for now).
- Realtime collaboration, admin dashboards.
- Course/module CRUD in DB — courses remain static in `academy.ts`; only per-user progress is in DB.

## Technical notes
- Use `@/integrations/lovable` for OAuth; `@/integrations/supabase/client` for queries.
- Order: migration → auth pages → useSession + Navbar → cloudSync + wire AIMirror/Academy/Certificate → curate videos.
- Video curation done via oEmbed check script in /tmp to avoid dead links.