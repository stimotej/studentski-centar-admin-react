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

## 2026-08-30 — Timotej + Claude — jobs, categories, restaurants; two naming decisions

**Done**
- **Categories**: taxonomy terms have no `_en` twin, so the obavijesti and
  poslovi filters and the card badges rendered Croatian. `src/utils/categoryName.ts`
  maps the sections and the 12 job groups by name, falling back to Croatian.
- **Jobs**: page 4757 title/excerpt translated; the Forms card was *already*
  translated in WordPress (post 8861) but the page rendered `content.rendered`
  unconditionally; "Prijave traju do" moved into `ui.ts`.
- **Organisation name**: 213 occurrences of "Studentski centar" in English
  fields became "University of Zagreb Student Centre" — SC's own English name,
  used on post 7909. `scripts/wp-rename-org-en.mjs`.
- **Dormitory wording**: "student hall" → "student dormitory" everywhere (SC's
  own word, and already the majority), plus the 15 fields still saying
  "Studentski dom". `scripts/wp-terminology-en.mjs`.
- **Restaurants**: `ponuda_en`, `radno_vrijeme_en`, `restaurant_info_en` added
  to the snippet, the translator, the admin editor and the frontend; all 13
  restaurants translated (72 fields).

**Snapshots**
- Five before/after pairs this session, all diffed. **All PASS.**
- The last pair: `2026-08-30T20-46-41-546Z_before-dorm-phrase` →
  `2026-08-30T20-50-25-110Z_after-dorm-phrase`.

**Next action** (the single next thing, specific enough to start cold)
- Deploy `i18n/hr-en-smjestaj` in `studentski-centar-zagreb`. Nothing from this
  migration is public yet, and there is now a lot of it.

**Open questions / blocked on**
- **Nobody has read the English yet.** Two terminology decisions were made from
  evidence rather than a Croatian speaker's judgement, and articles were
  inserted mechanically at 213 sites. This is the biggest outstanding risk.
- New events still appear untranslated; no workflow decided.
- 236 expired obavijesti remain Croatian-only.
- `npm run build` in the admin fails on `/prehrana/dnevni-menu`. Pre-existing,
  reproduces on a clean tree, unrelated to i18n.
- Page 5684 (`sport`) cannot be served in `edit` context at all — WordPress
  fatals on its raw content. Snapshots capture it in `view` context and flag it
  `degraded`. Its raw content is therefore in no backup.

**Gotchas** (what surprised you — the most valuable field here)
- **A glossary rule in the prompt is not a rule.** Protected *names* are checked
  mechanically by translation-guard and held perfectly; "studentski dom →
  student hall" lived only in the prompt and held about a third of the time. If
  a term must be consistent, it belongs in the guard.
- **The guard is a straitjacket as well as a seatbelt.** "Studentski centar" in
  PROTECTED_TERMS is the sole reason 213 English fields kept the Croatian name.
  Protect what must not change; do not protect what merely looks like a name.
- **Verify bulk writes against the site, not the script's own report.** A run
  exited 0 having silently dropped 5 occurrences. Counting against WordPress
  afterwards is the only check that has actually caught things.
- **Unregistered meta writes return HTTP 200 and are discarded.** Check the
  endpoint schema (`OPTIONS .../wp/v2/posts`), never a write's status code.
- **Grep the built HTML, not the source.** A case-sensitive substitution left
  "Student halls" and "STUDENT HALLS" in `ui.ts`; only the built pages showed it.
- Mechanical article insertion is where this kind of pass goes wrong. Every
  defect found was an article: markup or an `&nbsp;` between the article and the
  noun, an existing determiner a few words back, address lines, closing quotes
  read as opening ones, and prepositions wrongly treated as determiners.
- `_fields=id,slug,meta` is what makes heavy posts fetchable at all; asking for
  the whole record 500s on the big ones.

---

## 2026-08-30 — Timotej + Claude — events (kultura) localized end to end

**Done**
- **WordPress**: installed `docs/events-endpoints-snippet.php`, which adds
  `title_en` / `content_en` / `location_en` to all four custom event endpoints
  (`get_events`, the single-event branch of `get_all_events`, `get_slider_events`,
  `get_courses`). The stock `/wp/v2/event` route already exposed the meta; the
  custom routes hand-build their response arrays and so had to be extended by
  hand — that is why the frontend saw no English until the snippet went live.
- **Content**: the three events on the kultura slider (57738, 57081, 56411 —
  1,392 words) were translated **by hand and loaded through
  `--from-file`**, so no model was called and no gateway credits were spent.
  All six fields passed `translation-guard.mjs`.
- **Frontend** (`studentski-centar-zagreb`, commit `b5bd67f`): `Event` in
  `src/features/types.ts` gained the three optional `_en` fields, and the
  slider (`pages/kultura/index.tsx`), `components/kultura/EventCards.tsx`,
  `pages/kultura/eventi/[slug].tsx` and
  `pages/kultura/tecajevi-i-radionice/[slug].tsx` now read every event field
  through `localized()`. Build clean, `tsc` 0 errors.
- `location_en` was deliberately left empty. The venues are proper names
  ("Galerija SC", "Teatar &TD"); the per-field fallback renders the Croatian,
  which is the correct English too.

**Snapshots**
- before: `wp-snapshots/2026-08-30T19-17-03-757Z_before-slider-events`
- after:  `wp-snapshots/2026-08-30T19-19-42-974Z_after2-slider-events`
- diff:   PASS — 6 translation fields, nothing else touched.

**Next action** (the single next thing, specific enough to start cold)
- Deploy `i18n/hr-en-smjestaj` in `studentski-centar-zagreb`. Nothing from this
  migration is public yet; every commit so far sits on that branch.

**Open questions / blocked on**
- **New events will keep appearing untranslated.** 460 events exist and only
  these 3 carry English. There is no workflow yet for the culture team — either
  they fill the English tab in the admin when they create an event, or a
  scheduled `wp-translate` run picks up new ones. Needs a decision.
- Vercel AI Gateway credits are exhausted (402 `insufficient_funds`). Any
  further bulk translation needs either a top-up or `--from-file`.
- 236 **expired** obavijesti (39,672 words) are still Croatian-only. They are
  filtered out of every list but reachable by direct URL. Recommendation stands:
  drop them from `getObavijestiPaths` rather than pay to translate them.
- Nobody has read the English yet. A Croatian speaker should review it,
  including the glossary in `scripts/wp-translate.mjs`.

**Gotchas** (what surprised you — the most valuable field here)
- **Registering `_en` meta is not enough for custom endpoints.** The `event`
  post type is served to the frontend by hand-rolled routes under `events/v1`,
  not by `/wp/v2/event`. Meta registered on the post type is invisible there
  until each response array is extended. Expect the same for any other custom
  endpoint (`jobs`, `menus`).
- `get_courses()` in that snippet slices with `$number_of_events`, which is
  **never defined** in the function. Pre-existing, untouched, and worth fixing
  separately.
- The event titles are stored as HTML (`<p>…</p>`), one of them wrapped in a
  1.2 kB Tailwind inline-style block pasted from the editor. Translate by
  substituting the inner text into the source's own opening tag — retyping the
  tag fails the guard's structural check, and the style block is easy to
  mangle.
- Entities matter in the title field. `title` is rendered as HTML in the slider
  but used as **plain text** in `alt=` and the page `<title>`, so `&#8211;`
  shows up literally there. Match whatever the Croatian source uses: 57738 uses
  the entity, 57081 uses a literal en dash. This cost one `--force` rewrite.

---

## 2026-08-27 — Timotej + Claude — content complete; interface translated

**Content — done**
- **202 of 202 published posts** carry English. **57 of 57 live obavijesti** too.
- Verified additive throughout. The only non-`_en` changes since the baseline
  were: 100 spam deletions (deliberate), four draft `date` bumps (WordPress
  floats a draft's date on any save), and five posts edited by staff in
  wp-admin on the morning of 27 Aug.

**Interface — done** (`studentski-centar-zagreb`)
- `src/utils/ui.ts`: a typed Croatian dictionary with an English overlay. A
  missing English entry falls back to Croatian, never to a key.
- Called as `ui("key")`. Content translation stays `t(hr, en)` — the two must
  not share a name, and several pages have both.
- Navigation, page headings, buttons, empty states, allergen names, job-advert
  field labels, the accessibility panel and the footer.

**Vercel AI Gateway credits are exhausted** (402 `insufficient_funds`). Further
script translation needs a top-up; `--from-file` still works with no credits.

**Next**
- Deploy `i18n/hr-en-smjestaj` in `studentski-centar-zagreb`. Nothing is public.
- A Croatian speaker should review the English before it ships — all of it is
  machine or Claude output, including the glossary in `wp-translate.mjs` that
  propagates everywhere (`natječaj` → "call for applications", `studentski dom`
  → "student hall").

**Gotchas**
- **`slides` and `faqs` in `src/utils/constants.ts` are dead code** — exported,
  imported nowhere, 141 strings and 14 KB. The "Opći podaci" block they appear
  to define actually comes from WordPress post **8585**; the constants are a
  stale duplicate. Worth deleting.
- **`fetchPosts` did not paginate.** `per_page=100` with no page loop meant a
  114-post category returned 100 and fourteen posts were never seen — they
  looked translated because they were never counted. Fixed.
- **String scanning by regex under-counted badly.** Requiring JSX text to share
  a line with its tags hid every string Prettier had wrapped: the real total was
  351, not the 211 first reported. Measure rendered output, not source patterns.
- **`>text<` also matches inside quoted attributes** that contain HTML
  (`content="… <strong>x</strong> …"`), producing a `{` inside a string
  attribute. Mask attribute values before any JSX-text pass.
- **Module-level arrays cannot call hooks.** Nav links, home cards, meal types
  and allergens all became `buildX(ui)` called inside the component. Keep the
  literal-union types on the builder's return, or lookups that index into them
  break.
- **Sub-components need their own hook.** `SectionCard`, `IconCard` and
  `SheetContent` sit below the main component in their files and were missed by
  a once-per-file insertion.
- Staff edited Croatian on two posts after they were translated, leaving the
  English stating an old wage rate. Fixed by hand. Staleness detection was
  considered and **deliberately not built** — once editors work with the HR/EN
  toggle, updating both is the workflow, not an accident to be detected.

---

## 2026-08-26 — Timotej + Claude — translation finished; site compromise found and closed

**Translation — done for `posts`**
- 207 posts remain after cleanup; **200 carry English, 553 fields populated**.
- Every run verified additive by snapshot diff. The one protected change ever
  flagged was `date` on draft 36347, which WordPress floats on any save.
- Cost ≈ $4 via Vercel AI Gateway (`anthropic/claude-opus-4.6`). About a third
  of that was spent translating spam before we knew it was there.

**Security incident — found while translating, now closed**
- 95 casino spam posts, published, injected 2026-06-24 → 2026-08-26.
- Cause: **stolen passwords** on four dormant accounts — `test` (deleted),
  `lascina`, `express`, `poslovi`. The audit log shows successful logins to
  each from many different IPs worldwide within minutes of each other; real
  staff log in from `192.168.43.4`.
- **No administrator account was ever reached** — only `sc-admin` from the
  office IP. So no code execution, and `wp_snippets` (which holds the `sc/v1`
  API) was never at risk.
- Fixed: `test` deleted with its 25 posts, new generated passwords and forced
  logout on the other three, 76 spam posts removed via
  `scripts/wp-cleanup-spam.mjs`.
- Verified after: 0 items dated 2026 remain under those accounts; all 50 of
  their legitimate 2022–23 items intact.

**Still open**
- Those three accounts have been unused since Feb 2023. Safer to disable them
  outright than to leave them with new passwords.
- Post `58436` was attributed to the admin account though no admin logged in
  externally. Unexplained.
- Brute force against `wp-login.php` was ongoing. Restricting that path to the
  office IP would end it.
- Check in a day or two that no new spam appears. If it does, the passwords
  were not the entry point.

**Gotchas**
- **Deleting a user with content can exhaust MySQL's connection pool.** Removing
  `test` (25 posts) cascaded through postmeta, terms and a WSAL row each, the
  request timed out, and WordPress showed "Error establishing a database
  connection" — but the transaction completed server-side. Check whether the
  work finished before retrying; retrying a half-done cascade is how a scare
  becomes damage. `wp-cleanup-spam.mjs` batches five at a time with pauses.
- **`{ type, ...post }` puts the WordPress object's own `type` last**, so
  `"posts"` became `"post"` and every DELETE hit a non-existent route. All 76
  failed harmlessly. Spread order matters when merging API responses.
- Spam detection by keyword missed "Chicken Road" and "The Holyluck
  Experience". The reliable rule was **dormant account + 2026 date**.

---

## 2026-08-26 — Timotej + Claude — first bulk translation run (posts)

**Done**
- Translated smještaj (cat 176) and the eleven other admin categories.
  **884 English fields across ~180 posts.** Verified additive.
- Cost so far ≈ $1.30 via Vercel AI Gateway on `anthropic/claude-opus-4.6`.

**Verification**
- `npm run wp:diff` against `2026-08-26T18-31-13-420Z_before-full`: 884
  translation fields, and exactly two protected changes — `date` / `date_gmt`
  on post 36347. That post is an unpublished **draft**; WordPress treats a
  draft's date as floating and stamps it to now on any save. Our payload
  contained only `meta`. Benign, and it will be set correctly on publish.

**Next action**
- The remaining `posts` outside the twelve admin categories: run categories
  169 (Informacije, 178 posts), 32 (Restoran), 253, 254, 257, 1. Roughly 434
  fields, ~$2.
- Then decide about `--type obavijesti`: ~55 are live, 238 have expired, and
  all 460 events are in the past.

**Gotchas — every one of these came from running it, not reading it**
- **A transient write failure silently discarded a whole post's work** while the
  log recorded `wrote: true` with the full key list. Three posts (7633, 41058,
  41057) lost nine fields this way. Writes now retry, and the log records the
  real outcome plus the error. If a run reports `failed N`, cross-check the
  live values — do not trust an old log.
- **Six of the first seven blocks were the guard being wrong, not the model.**
  Ordinary Croatian words in capitals (DA, NA, TE, KOJI, OPĆE, PRAVA, KVOTI)
  tripped an over-broad acronym check; `NAPIŠ` matched out of the middle of
  NAPIŠITE because JavaScript word boundaries are ASCII-only and break next to
  Š. Read a block before believing it.
- **`excerpt.rendered` has its tags stripped by WordPress**, so
  `…@sczg.hr</p><p>Informacije` arrives as `…@sczg.hrInformacije`. The email
  pattern captured the run-together mess and then blocked every correct
  translation for "losing" it.
- **Word-pasted content is fragmented across dozens of `<span>` tags** with
  near-identical inline colours (post 13556 has 34 mid-sentence). Translation
  consolidates a few. `<span>` and `<font>` are now excluded from the structural
  comparison; links, lists and headings stay strict.
- **wp-diff reported FAIL twice on runs that were entirely additive**: an
  authenticated snapshot mirrors meta under `custom_fields`, and WordPress
  returns `[]` for that container until the first key exists, so adding English
  looked like the container changing type. Both handled.
- WordPress sets `_pingme` / `_encloseme` on any post update. Bookkeeping.

---

## 2026-08-26 — Claude — Phases 3 and 4 complete; main frontend done

**Done**
- **Phase 3** — shared layouts: `ObavijestEditorLayout` (290 records, every
  section), `EventEditorLayout` (460 records), `FAQLayout` (6 sections).
- **Phase 4** — all nine remaining section pages in the admin.
- **Frontend** `studentski-centar-zagreb` (branch `i18n/hr-en-smjestaj`,
  through commit 6ee5ccd): every page that renders editable content now reads
  its English twin — section pages, five FAQ pages, obavijesti, informacije,
  mediji, restaurant detail. 30 route/locale combinations verified 200.

**Next action**
- The other three frontends: `teatar-td`, `turizam`, `sczg-eventi`. None has
  locale routing yet. Copy the approach from `studentski-centar-zagreb`:
  `next.config.js` i18n block, `src/utils/i18n.ts`, `_document` lang, and
  explicit locales in every `getStaticPaths`.

**Open questions / blocked on**
- No frontend branch is deployed. Public site unchanged.
- Frontend UI strings still Croatian on `/en`. Uncosted — needs a scope call.
- Almost nothing is translated yet: one field on one post. The bulk translation
  tooling (Phase 1d, `scripts/wp-translate.mjs`) was never built.

**Gotchas**
- **Two admin pages have state names that lie about where the data goes.**
  kultura's single `excerpt` state saves to `sadrzaj` for teatar posts and to
  `excerpt` otherwise; pocetna-stranica's `excerpt` state is stored as
  `sadrzaj`, and only on the Opće informacije post. Mirror the Croatian
  *behaviour*, not the field names.
- A generated loader had a precedence bug worth watching for when mirroring
  conditionals: `x ? a : b || ""` applies the fallback only to the false
  branch. Parenthesise: `(x ? a : b) || ""`.
- Event `location` and the structured editors (turizam `rental_options`, eventi
  `features`) are still deferred — all three are non-trivial widgets rather
  than plain value/onChange fields.
- `poslovi` is intentionally excluded everywhere: employer-written adverts, no
  `_en` registered for the `jobs` post type.
- `/en/` (with trailing slash) returns 308 to `/en`. Normal Next behaviour, not
  a routing fault.

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
