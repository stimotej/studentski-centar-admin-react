# i18n conventions

Decided once, here. Every section, every script, and every frontend follows
these. If something here turns out to be wrong, change it **in this file first**
and note the change in [HANDOFF.md](./HANDOFF.md) — do not diverge per section.

## The model: parallel `_en` meta on the same post

One WordPress post holds both languages. Croatian stays exactly where it is
today. English lives in registered post meta suffixed `_en`.

| Croatian source          | English key      |
| ------------------------ | ---------------- |
| `title.rendered`         | `meta.title_en`  |
| `excerpt.rendered`       | `meta.excerpt_en`|
| `content.rendered`       | `meta.content_en`|
| `meta.sadrzaj`           | `meta.sadrzaj_en`|
| `meta.kontakt`           | `meta.kontakt_en`|
| `meta.<anything>`        | `meta.<anything>_en` |

Rules:

- **The suffix is always `_en`, appended to the existing key.** No `en_`
  prefixes, no `_EN`, no nesting under a `translations` object. `wp-diff.mjs`
  recognises a change as a translation by matching `meta.*_en`; anything else it
  treats as a protected change and fails the run.
- **Croatian keys are never renamed, moved, or given an `_hr` suffix.** Croatian
  is the untouched baseline. Doing otherwise breaks every frontend at once.
- **Structured meta translates field-by-field, keeping shape.** `accordion_items`
  is an array of `{title, description}`; `accordion_items_en` is an array of the
  same shape and the same length, index-aligned. Do not translate in place.
- **Non-text meta is never duplicated.** Media ids, dates, prices, sort orders,
  `image_groups`, `featured_media`, categories — one copy, shared by both
  languages. Only human-readable strings get an `_en` twin.

## Fallback rule

A frontend renders English when the value is a **non-empty string after
trimming**. Otherwise it falls back to Croatian.

```js
const t = (post, key) => {
  const en = post.meta?.[`${key}_en`];
  return typeof en === "string" && en.trim() ? en : post.meta?.[key];
};
```

Missing key, `null`, `""`, and `"   "` all mean "not translated yet" and are
treated identically. Editors will leave fields half-done for weeks; a partially
translated page must render, mixed, rather than showing holes.

Never fall back the other way. English must never leak into the Croatian site.

## How the editing-locale toggle behaves

The toggle in the header switches which language every localized field on the
page is editing. It is the *editing* locale — the admin chrome stays Croatian.

- **Croatian and English are separate React state.** Toggling does not discard
  unsaved work in either language; it only changes which one is on screen.
- **Saving writes both languages at once.** A save made while the toggle is on
  EN still persists unsaved Croatian edits, and vice versa. There is one Save
  button, not one per language.
- **The choice is remembered** in `localStorage` per browser, so an editor who
  works in English stays in English across pages. It never leaves the browser.
- **English fields show the Croatian original** behind a collapsible summary, so
  translating does not require toggling back and forth to read the source.
- **Untranslated fields are marked** with a "nije prevedeno" chip. Empty and
  whitespace-only are treated identically, matching the fallback rule above.

## Writes are additive, always

Production is the only environment. There is no staging. Therefore:

1. **Any script that writes translations sends only `_en` meta keys.** Never
   `title`, `content`, `excerpt`, `slug`, `status`, `featured_media`, or
   `categories` — not even with their current values "just to be safe".
2. **Bulk translation does not go through `features/posts/index.js`.**
   `useUpdatePost` sends the whole meta object and rewrites the slug
   (`slug: slug || title`). The bulk writer uses its own minimal payload.
3. **Snapshot before, snapshot after, diff.** Every section, no exceptions. See
   [PLAN.md](./PLAN.md#phase-0--secure-the-data).

## Slugs and routing

Slugs stay Croatian. The English site reuses the Croatian slug under an `/en`
prefix:

```
/smjestaj/sd-stjepan-radic       (hr)
/en/smjestaj/sd-stjepan-radic    (en)
```

This keeps one post id ↔ one slug and avoids a translation-aware router in four
separate frontends. Revisit only if SEO requires localised slugs, and if so do
it as its own project.

## Machine translation must be verified, not trusted

Content is translated by AI, with staff free to correct it in the admin later.
That is fine for prose. It is **not** fine for the things inside the prose:
across the site there are 194 email addresses, 227 phone numbers, 765 URLs,
5 IBANs and 3 OIB numbers. A silently reformatted phone number or a localised
IBAN is a real-world failure, not a typo.

So every translation is checked mechanically before it is written, by
`scripts/translation-guard.mjs`:

| Check | Result if it fails |
| --- | --- |
| Emails, URLs, IBANs, OIB numbers, money amounts present verbatim | **blocked** |
| Phone numbers present verbatim | **blocked** |
| Phone present but reformatted (same digits) | warning |
| Protected names (`PROTECTED_TERMS`) unchanged | **blocked** |
| HTML opening-tag sequence identical | **blocked** |
| Output at least half the source length | **blocked** |

These are checks on the model's *output*, not instructions in its prompt — the
model cannot decline to follow them.

**What the guard does not catch**, and what review is therefore still for:

- **Semantic errors in dates and rules written as words.** "15. ožujka" →
  "15 May" keeps the digits and passes. A wrong deadline reads perfectly.
- **Street and place names not in `PROTECTED_TERMS`.** Add any name whose
  translation would send someone to the wrong place.
- **Tone and register**, which no check can assess.

## What is explicitly out of scope

- **Admin UI chrome.** Labels, buttons, and toasts in this repo stay Croatian.
  Only *content* becomes bilingual.
- **Daily menus (`menus`) and products (`proizvodi`).** ~9,700 menu records and
  327 products, regenerated daily by kitchen staff. Translating these is an
  ongoing operational burden, not a migration. Deferred; see PLAN.md.
- **Media alt text and file names.**
