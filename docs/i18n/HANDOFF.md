# Handoff log

Append-only. Newest entry at the top. Write one **before you stop working**,
even for a short session — especially if you are stopping mid-section.

The point is that whoever picks this up next (you in three weeks, a colleague,
or an AI agent with no memory of this) can resume without re-deriving anything.
Assume the reader knows nothing beyond [PLAN.md](./PLAN.md) and
[CONVENTIONS.md](./CONVENTIONS.md).

## How to write an entry

Copy the template. Be concrete: post ids, file paths, exact commands. "Fixed the
editor" is useless six weeks later; "added `sadrzaj_en` to
`features/posts/format.js:29`, verified on post 4156" is not.

The **Gotchas** field is the one that earns its keep. Anything that surprised
you, cost you an hour, or that you only understood on the second attempt goes
there.

```markdown
## YYYY-MM-DD — <who> — <section / phase>

**Done**
- …

**Snapshots**
- before: `wp-snapshots/…`
- after:  `wp-snapshots/…`
- diff:   PASS / FAIL (if FAIL: what, and why it was acceptable)

**Next action** (the single next thing, specific enough to start cold)
- …

**Open questions / blocked on**
- …

**Gotchas** (what surprised you — the most valuable field here)
- …
```

---

## 2026-08-25 — Timotej + Claude — Smještaj complete (admin + frontend)

**Done**
- Admin: wired every remaining translatable field on `/zaposlenici/smjestaj` —
  title, excerpt, content, kontakt, radno vrijeme blagajni, action button label,
  natječaj title + description, and image-group captions.
- `ReorderImages` now takes optional `imageGroupsEn`/`setImageGroupsEn`. Only
  captions are bilingual; images are shared. The English array is rebuilt
  index-aligned on every edit so the two can never drift.
- Frontend (`studentski-centar-zagreb`, branch `i18n/hr-en-smjestaj`, commits
  ff68f0e → 2a3da51): dormitory page and index page both read every English
  twin with the fallback rule. `ImageGallery` takes optional `imageGroupsEn`.

**Verification**
- All four routes 200: `/smjestaj`, `/en/smjestaj`, `/smjestaj/domovi/sd-lascina`,
  `/en/smjestaj/domovi/sd-lascina`.
- On the one translated post: `/en` shows English `sadrzaj` while `kontakt`,
  untranslated, still renders Croatian on both. Mixed rendering works.

**Next action**
- Either translate the rest of smještaj's content and deploy the frontend
  branch, or start Phase 3 (the shared `ObavijestEditorLayout` and `FAQLayout`,
  which light up obavijesti and FAQ editing across every section at once).

**Open questions / blocked on**
- The frontend branch is **not deployed**. Public site is unchanged.
- Frontend UI strings are still Croatian on `/en` pages — see the gap noted in
  PLAN.md. Not costed, needs a scope decision before cutover.
- `npm run build` still fails locally in the admin repo on Node 25 (unrelated,
  see the 2026-08-20 entry). Frontend repo builds fine.

**Gotchas**
- The smještaj index page shapes some data in `getStaticProps` (which receives
  `locale` in its context) and some in the component (which uses
  `useRouter().locale`). Both must be localized — doing only one leaves half the
  page Croatian, and it is not obvious from reading either half alone.
- `documents` on smještaj is still deferred: the titles are user-visible but the
  records are shared media-library entries. Decide during Phase 3.

---

## 2026-08-25 — Timotej + Claude — Phase 2 vertical slice PROVEN

**Done**
- Wired `sadrzaj` end to end: WordPress `sadrzaj_en` → admin HR/EN toggle on
  `/zaposlenici/smjestaj` → `/en` routing in `studentski-centar-zagreb` →
  rendered English on the public page.
- Timotej translated post 4200 (SD Lašćina) through the admin. First production
  write of the project.
- Frontend work is on branch `i18n/hr-en-smjestaj` in
  `studentski-centar-zagreb`, commit ff68f0e. **Not deployed yet.**

**Verification**
- Additive: slug `sd-lascina`, title, status, categories and every content meta
  field unchanged. `documents`/`link`/`footnotes` read empty afterwards, but the
  2026-08-20 backup shows they had **no rows before the save either** — nothing
  was cleared.
- `/smjestaj/domovi/sd-lascina` → Croatian, `lang="hr"`.
  `/en/smjestaj/domovi/sd-lascina` → English, `lang="en"`.
  Neither leaks the other language into visible content.

**Next action**
- Wire the remaining 11 smještaj fields (see `sections/smjestaj.md`), then
  decide whether to deploy the frontend branch.

**Gotchas**
- **`fallback: true` silently broke the English pages.** `getStaticPaths`
  returned paths with no `locale`, so EN was only generated on demand and a
  request without JS (crawler, curl, preview bot) got the loading shell. Fixed
  by pre-rendering every locale explicitly. Any other dynamic route converted
  later needs the same treatment — this would have shipped unnoticed.
- `_document.tsx` hardcoded `<html lang="hr">`, mislabelling every `/en` page.
- Both languages appear in the page's `__NEXT_DATA__` payload regardless of
  locale — that is the serialised post object, not a render leak. Strip
  `<script>` blocks before grepping a page to check for leakage.
- The slug fix is confirmed working in production: saving 4200 left
  `sd-lascina` untouched.

---

## 2026-08-20 — Timotej + Claude — Phase 1a + 1b complete

**Done**
- **1a:** added `lib/wp.js` (`WP_SITE_URL`, `WP_API_BASE`, `WP_API`, `JWT_API`),
  defaulting to production, and rewrote all 91 hardcoded URLs across 20 files.
  Verified the composed URLs are byte-identical to the old literals.
- **1b:** wrote `docs/i18n-wordpress-snippet.php` and installed it via Code
  Snippets. Registers `_en` meta on `post` (11 keys), `page` (3), `obavijesti`
  (4), `event` (5). Verified live over REST.

**Next action**
- Phase 1c: `LocaleContext`, the HR/EN toggle in `components/Header.js`, and the
  `LocalizedField` wrapper.

**Open questions / blocked on**
- **`npm run build` is broken locally and it is not our doing.** Confirmed by
  stashing all changes and rebuilding. `buffer-equal-constant-time` (via
  `jsonwebtoken@8.5.1` → `jws` → `jwa`) reads `SlowBuffer.prototype`, removed in
  recent Node. Local Node is v25.9.0. Webpack still reports "Compiled
  successfully"; the failure is at page-data collection. **Check what Node the
  server runs before the next deploy** — if it is also on 24+, deploys will fail.
- The slug rewrite is still unproven — see the previous entry.

**Gotchas**
- Custom post types do **not** inherit meta registered on `post`. Each type
  needs its own `register_post_meta` call. `page` was missed on the first pass
  and caught only by checking the live schema per type — verify empirically,
  do not assume.
- Structured `_en` twins carry only translatable sub-properties:
  `image_groups_en` has captions but no image ids, `rental_options_en` has
  titles but no prices. Index-aligned with the Croatian original.
- `useCreatePageFAQ` / `useUpdatePageFAQ` / `useDeletePageFAQ` in
  `features/page/index.js` are **dead code** — nothing imports them. The live
  FAQ editor (`components/FAQLayout.js`) uses `useUpdatePost` against regular
  posts. Do not spend time translating that code path.
- The `page` post type is used by exactly one screen:
  `pages/student-servis/stranica-poslovi.js`, editing page id 4757.
- Code Snippets needs the snippet **without** the opening `<?php` tag and with
  scope "Run everywhere" — REST requests are neither admin nor frontend.

---

## 2026-08-20 — Timotej + Claude — Phase 0: backups taken and restore rehearsed

**Done**
- Installed `wp-backup.sh` on www20. Took both a `db` and a `full` backup.
- Copied both to `~/sc-backups/` on the Mac. **Verified byte-perfect** — SHA-256
  of all four archives matches the server manifest, including the 5.6 GB tar.
- Archive contents confirmed: 57,030 entries, uploads 26,971, plugins 23,142,
  themes 2,657, mu-plugins 3, `wp-config.php` and `.htaccess` present. Cache
  directories correctly excluded (0 entries each).
- Croatian diacritics verified in the dump — `Lašćina` ×47, zero mojibake. The
  `utf8mb3` pinning works.
- Added **Restore A0** to BACKUP-RESTORE.md: restore a single post via a scratch
  database. Zero blast radius, and the tool most likely to be needed during the
  i18n work. Restore A now carries an explicit blast-radius warning.
- **Rehearsed the restore and it passed.** Broke post `58004` on purpose (title
  → `RESTORE DRILL`), restored with A0, verified against a REST baseline
  captured beforehand.

**Snapshots**
- `~/sc-backups/2026-08-20_203535_db` (db only)
- `~/sc-backups/2026-08-20_205235_full` (db + 5.6 GB files) ← the baseline
- Restore verification: title, slug, modified, status, excerpt, categories, and
  the attached PDF all returned **byte-exact**, including the `<p>` wrapper and
  `post_modified` reverting to 2026-07-06.
- Collateral check after restore: 286 posts, dormitory posts intact with correct
  diacritics, `sc/v1` alive, admin responding. Nothing outside `58004` moved.

**Next action**
- Add the nightly `db` cron job, then start Phase 1a (extract the API base URL
  to an env var).

**Open questions / blocked on**
- Does the hypervisor take VM snapshots? Still unasked.
- Post `58004 bokbobkobk` is junk test content but is **published** at
  `/informacije/bokbobkobk/` and sits in the smještaj category (176) with a real
  natječaj PDF attached. Worth unpublishing — separate from this work.

**Gotchas**
- **The slug hypothesis is still untested.** The drill edited `58004` through
  wp-admin, which preserves the slug of an already-published post. The suspect
  path is `useUpdatePost` in the React admin. Retest there before assuming
  either way.
- **The React admin stores HTML in post titles.** `58004`'s title was literally
  `<p>bokbobkobk</p>`; editing via wp-admin replaced it with plain text. Any
  `title_en` handling must expect markup, not a bare string.
- Post `58004` was not visible in `/zaposlenici/smjestaj` despite being in
  category 176 — worth understanding before relying on that page's post list
  during the pilot.
- A0 re-inserts meta **without** the original `meta_id` so MySQL assigns fresh
  ones; reusing old ids risks colliding with rows created since the backup.

---

## 2026-08-14 — Claude — server survey + backup procedure

**Done**
- Surveyed the production server over SSH (user ran the commands, read-only).
  Wrote [../BACKUP-RESTORE.md](../BACKUP-RESTORE.md) and
  `scripts/server/wp-backup.sh` against the real paths.
- Rewrote PLAN.md Phase 0 to separate the *server backup* (the actual way out)
  from the *REST snapshot* (a diff baseline that restores nothing).

**Findings**
- **There was no WordPress backup on the server.** `/var/backups` held only
  Ubuntu package bookkeeping; no backup cron; `ai1wm-backups` empty. Nothing to
  restore from existed before today.
- WP root `/var/www/sc` (6.3 GB), db `wordpress` on MySQL 8.0.46, prefix `wp_`.
  uploads 5.7 GB, DB 406 MB.
- `wp_snippets` has **104 rows** — the `sc/v1` endpoints and almost certainly
  the `register_post_meta` calls are PHP stored in the database, not on disk.
  The Phase 1b `_en` registration will live in the same place, so it is only
  ever covered by a *database* backup.
- No `%newsletter%` or `%subscriber%` tables — newsletter subscribers are the
  `newsletter` CPT, i.e. rows in `wp_posts`. Corrects an earlier assumption.
- `sudo mysql` works via socket auth, so no DB password is needed or stored.

**Next action**
- Run the baseline `full` backup, verify it, rsync it off the server, and do the
  restore rehearsal. Then Phase 1.

**Open questions / blocked on**
- Still unconfirmed: are `58002` / `58004` / `58013` throwaway test posts? One is
  the rehearsal target.
- Does the hypervisor take VM snapshots?

**Gotchas**
- Database charset is **`utf8mb3_unicode_ci`**, not utf8mb4. Every dump and
  every restore must pin `--default-character-set=utf8mb3` or Croatian
  diacritics come back as mojibake. Both scripts pin it; the verify step greps
  for `Lašćina` specifically to catch it early.
- A truncated `mysqldump` still passes `gzip -t`. Only the trailing
  `Dump completed` marker proves a dump finished — the script checks for it.
- 186 MB of the 406 MB database is `wp_wsal` (security audit log). Bulky, not
  important.
- WP Super Cache *and* four PM2 Next.js apps cache independently. A correct
  restore looks broken until caches are cleared and pm2 is restarted.

---

## 2026-08-14 — Claude — Phase 0 scaffolding

**Done**
- Surveyed the stack. This admin is a thin client over the WordPress REST API;
  the four public sites are separate headless Next repos with no i18n today. WP
  has no Polylang/WPML installed — custom backend logic lives in the Code
  Snippets plugin (`sc/v1` namespace).
- Chose the parallel `_en` meta model over Polylang. Rationale: ~80 hardcoded
  term/post ids in `lib/constants.js` would each need an EN counterpart under a
  duplicate-post model. Written up in CONVENTIONS.md.
- Added `scripts/wp-snapshot.mjs` (read-only) and `scripts/wp-diff.mjs`,
  wired as `npm run wp:snapshot` / `npm run wp:diff`.
- Wrote PLAN.md, CONVENTIONS.md, this log, and the section template.

**Snapshots**
- Unauthenticated test snapshot only — 14,353 items across 12 types, 114 MB.
  Discarded. **A real authenticated baseline has not been taken yet.**
- Verified `wp-diff` in both directions: permits `meta.*_en`, and correctly
  fails on a changed slug, a wiped title, and a deleted post.

**Next action**
- Phase 0: create the WP application password, take the authenticated baseline
  snapshot, and get the host's DB backup confirmed in writing.

**Open questions / blocked on**
- Does a full WordPress DB + uploads backup exist, and how old is it? Nobody has
  confirmed this yet.
- Are posts `58002 dobar-dan` / `58004 bokbobkobk` / `58013 prijava` throwaway
  test content? If so one of them is the restore-drill target. **Confirm before
  touching.**

**Gotchas**
- `useUpdatePost` sends `slug: slug || title` (`features/posts/index.js:236`),
  and most callers pass no slug. Editing a title therefore moves the slug and
  breaks frontend URLs. Unverified against production — test on a throwaway post
  before assuming either way.
- `documents: cond && arr` (11 sites) evaluates to `false`, not `undefined`. I
  expected this to corrupt meta; checked all 236 posts in the snapshot and none
  stores `false` — WordPress coerces it to `[]`, which matches intent. Benign.
  Recorded so nobody else spends time on it.
- `menus` is 9,736 records and dominates snapshot time. Use
  `WP_SNAPSHOT_TYPES=posts,categories` for per-section verification.
- The Divi builder leaves `_et_pb_use_builder` / `_et_gb_content_width` meta on
  older posts. Unrelated to this work; ignore.
