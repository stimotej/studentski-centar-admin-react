# Section: <name>

Copy this file to `docs/i18n/sections/<name>.md` and fill it in **before**
writing code. The inventory is what makes "we covered everything" checkable
rather than a feeling.

## Scope

- Admin page(s): `pages/<name>/…`
- Shared layouts used: …
- Frontend repo + routes: …
- WordPress categories / post ids: …
- Record count: …

## Field inventory

Every editable field on the page. Decide translatable or not for each, with a
reason for every "no" — that reason is what stops the next person re-litigating
it.

| Field (admin state) | WP key | Type | Translate? | Notes |
| ------------------- | ------ | ---- | ---------- | ----- |
| | | | | |

Fields deliberately **not** translated, and why:

- …

## Checklist

### Prepare
- [ ] Inventory above complete, every field decided
- [ ] `_en` keys for this section's fields exist in the WP snippet and read back over REST
- [ ] Before-snapshot taken: `WP_SNAPSHOT_TYPES=posts,categories npm run wp:snapshot -- pre-<name>`

### Admin
- [ ] `features/*/format.js` surfaces the `_en` keys
- [ ] Mutation payload carries the `_en` keys
- [ ] Fields swapped to `LocalizedField`
- [ ] HR/EN toggle switches every field on the page, with none left stuck on Croatian
- [ ] Saving in EN leaves Croatian untouched — verified by diff, not by eye

### Translate
- [ ] `wp-translate.mjs --dry-run` output reviewed by a human who reads both languages
- [ ] Written for real
- [ ] Write log kept

### Frontend
- [ ] Locale routing reaches these pages under `/en`
- [ ] Fallback rule applied per CONVENTIONS.md
- [ ] Untranslated field falls back to Croatian rather than rendering empty
- [ ] Non-text fields (media, maps, dates, prices) render identically in both

### Verify
- [ ] After-snapshot taken
- [ ] `npm run wp:diff -- <before> <after>` prints **PASS**
- [ ] Croatian pages spot-checked live and unchanged
- [ ] An editor who is not you has opened the page and edited one English field
- [ ] HANDOFF.md entry written

## Gotchas found in this section

- …
