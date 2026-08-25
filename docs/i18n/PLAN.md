# Croatian → bilingual (HR/EN) migration plan

Master checklist. One section at a time, each fully finished — admin *and*
frontend — before the next one starts.

**Read first:** [CONVENTIONS.md](./CONVENTIONS.md). It holds the decisions this
plan assumes.
**Before you stop working:** append to [HANDOFF.md](./HANDOFF.md).

Status key: `[ ]` not started · `[~]` in progress · `[x]` done

---

## Ground truth

- Content lives in WordPress at `sczg.unizg.hr`, reached over the REST API.
  This admin owns no data of its own.
- **Production is the only environment.** There is no staging. Every save
  during development hits the live site.
- Public sites are four separate headless Next apps: `studentski-centar-zagreb`,
  `teatar-td`, `turizam`, `sczg-eventi`. None has i18n today.
- Current content volume (snapshot 2026-08-14): 236 posts, 25 pages, 290
  obavijesti, 460 events, 524 jobs, 327 products, 9,736 menus, 86 categories,
  2,565 media.

---

## Phase 0 — Secure the data

Nothing else starts until this is green.

Server survey done 2026-08-14. **Result: there was no WordPress backup of any
kind on the server** — `/var/backups` held only Ubuntu package bookkeeping, and
no backup cron existed. The full procedure is now written up in
[docs/BACKUP-RESTORE.md](../BACKUP-RESTORE.md).

### Server-side backup (the real way out)

- [x] Copy `scripts/server/wp-backup.sh` to the server and create
      `/var/backups/sc` — see BACKUP-RESTORE.md § Install the script
- [x] Take the baseline full backup: `sudo bash ~/wp-backup.sh full` — done
      2026-08-20, `2026-08-20_205235_full`
- [x] Verify it, **including the Croatian diacritics check** — a charset-wrong
      dump silently corrupts every `č ć ž š đ` on restore
- [x] `rsync` it to your Mac — at `~/sc-backups/`, checksums verified
      byte-perfect against the server manifest
- [x] **Rehearse the restore** — done 2026-08-20 on post `58004`, using
      Restore A0. Byte-exact, zero collateral damage. See HANDOFF.md
- [x] ~~Add the nightly `db` cron job~~ — **decided 2026-08-20: backups stay
      manual.** Take `sudo bash ~/wp-backup.sh db` before every section and
      before any bulk write. Tradeoff accepted: anything edited between manual
      backups (daily menus especially) is not protected
- [ ] Ask whoever runs the hypervisor whether VM snapshots exist

### REST snapshot (the diff baseline — not a backup)

- [ ] Create a WordPress **application password** for a user with edit rights
      (`wp-admin` → Users → Profile → Application Passwords). Store it in a
      password manager, not in the repo.
- [ ] Take a full authenticated snapshot and confirm every type succeeds:
      ```bash
      WP_USER="..." WP_APP_PASSWORD="..." npm run wp:snapshot -- baseline
      ```
      Unauthenticated snapshots omit drafts and raw content. This snapshot's job
      is proving migrations were additive — it does not restore anything, and it
      contains no media files, users, or plugin config.
- [ ] Confirm `npm run wp:diff -- <snapshot> <same snapshot>` prints `PASS`.

---

## Phase 1 — Baseline

Shared groundwork. Everything after this is repetition.

### 1a. Safety rails

- [x] **Extract the API base URL to an env var.** Done 2026-08-20. Added
      `lib/wp.js` exporting `WP_SITE_URL` / `WP_API_BASE` / `WP_API` / `JWT_API`,
      defaulting to production, and rewrote all 91 occurrences across 20 files.
      Verified the composed URLs are byte-identical to the old literals.
      Override with `NEXT_PUBLIC_WORDPRESS_SITE_URL` or
      `NEXT_PUBLIC_WORDPRESS_API_BASE_URL`.
- [x] **Fix the slug rewrite.** Done 2026-08-20 — `useUpdatePost` now sends
      `slug` only when a caller passes one. Evidence the bug was real: post
      4156's title is `<p>SD Stjepan Radić</p>` and its slug is exactly
      `sd-stjepan-radic`, which is what `sanitize_title` yields from that
      string — the slug was being re-derived from the title on every save.
      - [ ] **Still unproven.** The 2026-08-20 restore drill edited post
            `58004` through *wp-admin*, which preserves slugs — so it did not
            exercise this path. Retest by editing a throwaway post's title
            through the **React admin** (`/zaposlenici`), which is what calls
            `useUpdatePost`. Snapshot before and after.
- [ ] Audit the `documents: cond && arr` pattern (11 occurrences, e.g.
      `pages/smjestaj/index.js:214`). It evaluates to `false`, not `undefined`.
      Verified 2026-08-14: WordPress coerces it to `[]`, which matches intent,
      so this is **not** currently losing data — tidy it to a ternary when
      touching those files, but it does not block anything.

### 1b. WordPress schema

- [x] Write one Code Snippet registering `_en` meta for every translatable key,
      driven by a list rather than repeated calls — `docs/i18n-wordpress-snippet.php`.
- [x] Include `title_en`, `excerpt_en`, `content_en` — the core fields have no
      meta twin by default.
- [x] Confirm the keys read back over REST. **Verified live 2026-08-20:**
      `post` 11 keys, `page` 3, `obavijesti` 4, `event` 5.
- [x] Commit the snippet source to `docs/`.

Covered post types: `post`, `page`, `obavijesti`, `event` — every section in
Phases 2–4. Deliberately excluded: `proizvodi`, `menus` (daily churn), `jobs`
(third-party adverts). **No further WordPress work is needed for the migration.**

### 1c. Admin plumbing

- [x] `LocaleContext` (`lib/locale.js`) + `LocaleToggle`, opted into per page
      via `<Header localeToggle />` so pages with nothing translatable do not
      show a switch that does nothing.
- [x] `LocalizedField` (`components/Elements/LocalizedField.js`) — wraps any
      `value`/`onChange` editor, so it works with `QuillTextEditor` and MUI
      `TextField` alike. Shows the Croatian original for reference and marks
      untranslated fields.
- [x] Extend `features/posts/format.js` to surface `_en` keys.
- [x] Extend the `useUpdatePost` payload to carry `_en` keys.
- [x] Toggle semantics decided and documented in CONVENTIONS.md — separate
      state per language, one Save button writing both, choice remembered in
      `localStorage`.

**Not yet proven.** No page uses `LocalizedField` yet; the Phase 2 vertical
slice is what will show whether this design survives contact with a real
editor.

### 1d. Bulk translation tooling

- [ ] `scripts/wp-translate.mjs` — reads a section's posts, produces English via
      AI, writes **only** `_en` meta keys. Minimal payload, never through
      `useUpdatePost` (see CONVENTIONS.md).
- [ ] `--dry-run` is the default. Writing requires an explicit flag.
- [ ] Operates on an explicit id list or category, never "all posts".
- [ ] Refuses to overwrite a non-empty `_en` value unless forced, so editor
      corrections are never clobbered by a re-run.
- [ ] Logs every write to a file so a bad run can be reversed post hoc.

---

## Phase 2 — Smještaj (pilot)

First real section. 26 posts under category `176`, the densest editor in the app
(12 rich-text fields). Detailed checklist:
[sections/smjestaj.md](./sections/smjestaj.md).

- [~] Do **one field end to end first** — `sadrzaj` only, through WP, admin, AI
      pass, frontend, and verification — before wiring the other eleven.
      - [x] WordPress: `sadrzaj_en` registered
      - [x] Admin: `/zaposlenici/smjestaj` has the HR/EN toggle and a localized
            Sadržaj field
      - [x] Frontend (`studentski-centar-zagreb`, branch `i18n/hr-en-smjestaj`):
            `/en` routing, fallback rule, `sadrzaj_en` read on
            `/smjestaj/domovi/[slug]`. Both locales verified rendering locally.
      - [x] **Translated one post and confirmed English appears.** Done
            2026-08-25 on post 4200 (SD Lašćina). Verified additive: slug,
            title, status, categories and every content meta field unchanged;
            `documents`/`link`/`footnotes` confirmed to have had no rows before
            the save (checked against the 2026-08-20 backup), so nothing was
            cleared. `/smjestaj/domovi/sd-lascina` renders Croatian and
            `/en/...` renders English, with no leakage either way.

**The vertical slice is proven.** The design survives contact with production.
- [ ] Then the remaining fields.
- [ ] Then the frontend in `studentski-centar-zagreb`.
- [ ] Write up what the pilot changed about the plan in HANDOFF.md, and fix this
      document before starting Phase 3.

---

## Phase 3 — Shared layouts

These are used by *many* sections, so doing them once pays out everywhere.
Worth taking straight after the pilot rather than section by section.

- [ ] `components/ObavijestEditorLayout.js` — obavijesti, all sections (290 records)
- [ ] `components/EventEditorLayout.js` — kultura + teatar-td (460 records)
- [ ] `components/FAQLayout.js` — 6 sections

---

## Phase 4 — Remaining sections

Each one repeats the same checklist. Copy
[sections/_TEMPLATE.md](./sections/_TEMPLATE.md) per section.

- [ ] sport
- [ ] kultura
- [ ] student-servis
- [ ] pocetna-stranica
- [ ] prehrana (page content only — not daily menus)
- [ ] turizam
- [ ] eventi
- [ ] catering
- [ ] teatar-td

---

## Gap found during the pilot: frontend UI strings

The migration as planned makes **content** bilingual. It does not touch the
static Croatian strings baked into the frontends' own components — section
headings ("Popratni sadržaj", "Kontakt"), navigation, buttons, form labels,
error messages.

So an `/en` page today renders English *content* inside Croatian *chrome*. That
is honest and usable, but it is not a finished English site.

This is a separate workstream of real size (four repos, every component) and is
**not costed in this plan**. Decide before cutover whether it is in scope, and
if so whether to use a library (`next-intl`) or a simple string map.

---

## Phase 5 — Cutover

- [ ] Language switcher visible on each public site.
- [ ] `<html lang>` follows the active locale (currently hard-coded `hr`).
- [ ] `hreflang` tags pairing each HR page with its EN counterpart.
- [ ] Decide what `/en` does for a page with zero translated fields — render
      Croatian, or 404. (Recommendation: render Croatian; a mixed page beats a
      dead link.)

---

## Deferred, with reasons

- **Daily menus and products.** 9,736 menus, 327 products, regenerated daily.
  Needs a recurring-dish translation table and a staff process, not a
  migration. Decide separately whether English menus are wanted at all.
- **Admin UI chrome.** Out of scope per CONVENTIONS.md.
- **Localised slugs.** See CONVENTIONS.md.

---

## Standing rules

1. One section at a time. A section is done when the frontend renders it in
   English, not when the admin can edit it.
2. Snapshot → change → snapshot → diff. Every section.
3. `npm run wp:diff` must print `PASS` before a section is ticked off. A single
   protected change is a stop-and-investigate, not a warning.
4. Never write Croatian fields. Additive only.
5. Update HANDOFF.md before stopping work, however short the session.
