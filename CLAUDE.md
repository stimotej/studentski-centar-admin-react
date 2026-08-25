# studentski-centar-admin-react

Admin interface for Studentski centar Zagreb. It is a **thin client over the
WordPress REST API** at `sczg.unizg.hr` — it owns no data of its own. Every
editor here maps onto WP posts, custom post types, or registered post meta.

The public sites are separate headless Next.js repos: `studentski-centar-zagreb`,
`teatar-td`, `turizam`, `sczg-eventi`.

## Critical: there is no staging environment

`https://www.sczg.unizg.hr` is production and is the only target. **Any save
you make while developing hits the live site used by real students.**

The base URL now comes from `lib/wp.js`, which defaults to production. Point the
admin elsewhere with `NEXT_PUBLIC_WORDPRESS_SITE_URL` (or
`NEXT_PUBLIC_WORDPRESS_API_BASE_URL`) in `.env.local` — no source edits needed.

Before running anything that writes:

- Take a snapshot: `npm run wp:snapshot -- <label>`
- Verify afterwards: `npm run wp:diff -- <before> <after>`

Never bulk-write without an explicit dry-run first.

## Known hazards

- `useUpdatePost` sends `slug: slug || title` (`features/posts/index.js:236`)
  and most callers pass no slug, so **editing a post title can move its slug**
  and break frontend URLs.
- `useUpdatePost` sends the entire meta object on every call. Prefer a minimal
  purpose-built payload for scripted writes.
- Post meta is registered globally on `post`, so unrelated keys
  (`teatar_td_phone`, `menu_date`, `price`) appear empty on every post. Normal.

## Ongoing work: HR → HR/EN content migration

Croatian content is being made bilingual, one section at a time.

**If you are asked to work on translations, multi-language content, or `_en`
fields, read these first:**

- [docs/i18n/PLAN.md](docs/i18n/PLAN.md) — master checklist and current phase
- [docs/i18n/CONVENTIONS.md](docs/i18n/CONVENTIONS.md) — naming and fallback
  rules, decided once and not to be diverged from per section
- [docs/i18n/HANDOFF.md](docs/i18n/HANDOFF.md) — what happened last, what is
  next, and the gotchas already paid for

**Append a HANDOFF.md entry before you stop working.** Sessions have no memory;
that log is the only continuity this project has.

## Commands

```bash
npm run dev
npm run lint
npm run build

npm run wp:snapshot -- <label>          # read-only content backup
npm run wp:diff -- <before> <after>     # prove a change was additive
```
