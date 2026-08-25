# Section: Smještaj (pilot)

First section. Deliberately the densest one in the app, so the pattern is proven
against the hardest case rather than the easiest.

## Scope

- Admin page: [pages/smjestaj/index.js](../../../pages/smjestaj/index.js) (761 lines, 12 rich-text editors)
- Also in this section, but handled in Phase 3 as shared layouts:
  `ObavijestEditorLayout`, `FAQLayout`
- Frontend: `studentski-centar-zagreb`, routes under `/smjestaj`
- WordPress: 26 posts in category `176` (`adminSmjestajCategory`)
- Sub-categories: `283` natječaj, `371` toggles, `372` cards

Content mix (from the 2026-08-14 snapshot): 4 dormitory posts with the full
field set (`4156` Stjepan Radić, `4197` Cvjetno naselje, `4200` Lašćina, `4202`
Dr. Ante Starčević), plus ~22 informational posts that mostly use `sadrzaj`
alone, plus what look like three test posts (`58002`, `58004`, `58013` —
**confirm before touching**).

## Field inventory

| Field (admin state) | WP key | Type | Translate? | Notes |
| ------------------- | ------ | ---- | ---------- | ----- |
| `title` | `title` | string | **yes** → `title_en` | Core field, needs a meta twin |
| `excerpt` | `excerpt` | HTML | **yes** → `excerpt_en` | Core field |
| `content` | `content` | HTML | **yes** → `content_en` | Core field |
| `sadrzaj` | `meta.sadrzaj` | HTML | **yes** | Facilities list. The one field every post in this section uses — do this one first |
| `kontakt` | `meta.kontakt` | HTML | **yes** | Contains `mailto:` links; keep the markup, translate the prose around it |
| `radnoVrijemeBlagajni` | `meta.radno_vrijeme_blagajni` | HTML | **yes** | Opening hours prose ("Od ponedjeljka do petka…") |
| `actionTitle` | `meta.footnotes` | string | **yes** | Button label. Note the key name does not match its meaning |
| `imageGroups[].title` | `meta.image_groups` | array | **yes**, title only | Array of `{id, title, images}`. Translate `title`; keep image ids and array order identical. Index-aligned twin per CONVENTIONS.md |
| `natjecajTitle` | `title` | string | **yes** | On the natječaj-dokument post |
| `natjecajOpis` | `excerpt` | HTML | **yes** | On the natječaj-dokument post |
| `lokacija` | `meta.lokacija` | HTML | **no** | A Google Maps `<iframe>` embed, not prose. Verified on post 4156. Shared between languages |
| `images` | `meta.images` | array | **no** | Media id strings, e.g. `["3280","3282\|3709"]` |
| `image` / `imageId` | `featured_media` | int | **no** | Media id |
| `actionLink` | `meta.link` | string | **no** | URL |
| `status` | `status` | string | **no** | Publish state is shared, not per-language |
| `category` | `categories` | array | **no** | Structural |
| `documents[]` | `meta.documents` | array | **deferred** | Titles are user-visible, but these are media-library records shared across sections. Decide in Phase 3 with the shared layouts, and record the decision here |

## Checklist

### Prepare
- [ ] Phase 0 and Phase 1 complete — do not start otherwise
- [ ] Confirm whether `58002` / `58004` / `58013` are disposable test posts
- [ ] `_en` keys read back over REST on post `4156`
- [ ] Before-snapshot: `WP_SNAPSHOT_TYPES=posts,categories npm run wp:snapshot -- pre-smjestaj`

### Vertical slice — `sadrzaj` only
Prove the whole pipeline on one field before wiring the other eleven.

- [ ] `sadrzaj_en` registered in WP
- [ ] Surfaced in `features/posts/format.js`
- [ ] Carried in the `useUpdatePost` payload
- [ ] Editable in the admin behind the HR/EN toggle
- [ ] Translated on post `4156` only, by hand, no bulk script yet
- [ ] Renders on the frontend at `/en/smjestaj/sd-stjepan-radic`
- [ ] The other 25 posts, untranslated, still render Croatian at `/en`
- [ ] Diff **PASS**
- [ ] **Stop and review.** Anything learned here goes into PLAN.md and
      CONVENTIONS.md before continuing — this is the cheapest moment to change
      the approach

### Remaining fields
- [ ] All `yes` rows above wired
- [ ] `image_groups_en` keeps array length and order identical to `image_groups`
- [ ] Toggling to EN and saving leaves every Croatian field byte-identical

### Translate
- [ ] Dry-run reviewed by a human who reads both languages — dormitory names and
      street addresses must **not** be translated
- [ ] Written for real, log kept

### Frontend
- [ ] `/en/smjestaj/*` routes live
- [ ] Fallback rule applied
- [ ] Map embed, images, and documents identical in both languages

### Verify
- [ ] After-snapshot taken
- [ ] `npm run wp:diff` prints **PASS**
- [ ] Croatian `/smjestaj` pages spot-checked live and unchanged
- [ ] An editor other than the implementer has edited one English field
- [ ] HANDOFF.md entry written

## Gotchas found in this section

- `meta.footnotes` holds the action-button label, not footnotes. Naming
  artefact; do not rename it, four frontends read it.
- Post meta is registered globally on `post`, so a dormitory post carries
  `teatar_td_phone`, `menu_date`, `price` and friends as empty values. Ignore
  them — but it means the `_en` registration in Phase 1b covers every section at
  once, not just this one.
- `meta.images` mixes plain ids with pipe-joined pairs (`"3282|3709"`). Leave
  the strings exactly as found.
