/**
 * Bulk HR → EN translation for WordPress content.
 *
 *   node scripts/wp-translate.mjs --category 176              # dry run (default)
 *   node scripts/wp-translate.mjs --category 176 --write
 *   node scripts/wp-translate.mjs --ids 4200,4156 --write
 *   node scripts/wp-translate.mjs --category 176 --limit 3 --write
 *
 * Safety properties, in order of importance:
 *
 *   1. It writes ONLY `<key>_en` meta. Croatian fields, the slug, the status,
 *      categories and media are never in the payload — so a bad translation
 *      cannot damage the original. Prove it afterwards with `npm run wp:diff`.
 *   2. Dry run is the default. Writing requires --write.
 *   3. It never operates on "everything": --category or --ids is required.
 *   4. Every field is checked by scripts/translation-guard.mjs before it is
 *      written. A field that fails is skipped and reported, never written.
 *   5. A non-empty existing `_en` is left alone unless --force, so editor
 *      corrections are not clobbered by a re-run.
 *   6. Every write is appended to a JSONL log so any run can be reversed.
 *
 * Environment — one of these two for the model:
 *   AI_GATEWAY_API_KEY  routes through Vercel AI Gateway (zero markup, and it
 *                       spends Vercel credits rather than an Anthropic balance)
 *   ANTHROPIC_API_KEY   calls Anthropic directly
 * and, only to write:
 *   WP_USER / WP_APP_PASSWORD  a WordPress application password
 *
 * Override the model with --model or TRANSLATE_MODEL. Gateway slugs use dots
 * and a provider prefix (anthropic/claude-opus-4.6); the direct API uses bare
 * ids (claude-opus-5). The default follows whichever route is active.
 */

import fs from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { checkTranslation, PROTECTED_TERMS } from "./translation-guard.mjs";
import { authenticate } from "./wp-auth.mjs";

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? undefined : argv[i + 1];
};

const WRITE = flag("write");
const FORCE = flag("force");
const LIMIT = Number(value("limit") || 0);
const CATEGORY = value("category");
const IDS = (value("ids") || "").split(",").map((s) => s.trim()).filter(Boolean);
const TYPE = value("type") || "posts";

const base = (process.env.WP_API_BASE || "https://www.sczg.unizg.hr/wp-json").replace(/\/$/, "");
const wpUser = process.env.WP_USER;
const wpPass = process.env.WP_APP_PASSWORD;

if (!CATEGORY && IDS.length === 0) {
  console.error(
    "Refusing to run without a target.\n" +
      "  --category <id>   translate one category\n" +
      "  --ids 1,2,3       translate specific posts"
  );
  process.exit(2);
}
if (WRITE && !(wpUser && wpPass)) {
  console.error("--write needs WP_USER and WP_APP_PASSWORD (a WordPress application password).");
  process.exit(2);
}
const GATEWAY_KEY = process.env.AI_GATEWAY_API_KEY;
const USE_GATEWAY = Boolean(GATEWAY_KEY);

if (!USE_GATEWAY && !process.env.ANTHROPIC_API_KEY) {
  console.error(
    "No model credentials. Set one of:\n" +
      "  AI_GATEWAY_API_KEY   route via Vercel AI Gateway\n" +
      "  ANTHROPIC_API_KEY    call Anthropic directly"
  );
  process.exit(2);
}

// Gateway model ids are provider-prefixed and dot-versioned; direct ids are bare.
const MODEL =
  value("model") ||
  process.env.TRANSLATE_MODEL ||
  (USE_GATEWAY ? "anthropic/claude-opus-4.6" : "claude-opus-5");

/**
 * What gets translated, and where the English goes.
 *
 * `read` pulls the Croatian out of the REST representation. Structured fields
 * carry only their translatable sub-properties, index-aligned with the original
 * (docs/i18n/CONVENTIONS.md) — media ids, prices and URLs are never duplicated.
 */
const FIELDS = [
  { label: "title", to: "title_en", read: (p) => p.title?.rendered },
  { label: "excerpt", to: "excerpt_en", read: (p) => p.excerpt?.rendered },
  { label: "content", to: "content_en", read: (p) => p.content?.rendered },
  { label: "sadrzaj", to: "sadrzaj_en", read: (p) => p.meta?.sadrzaj },
  { label: "kontakt", to: "kontakt_en", read: (p) => p.meta?.kontakt },
  {
    label: "radno_vrijeme_blagajni",
    to: "radno_vrijeme_blagajni_en",
    read: (p) => p.meta?.radno_vrijeme_blagajni,
  },
  { label: "footnotes", to: "footnotes_en", read: (p) => p.meta?.footnotes },
  {
    label: "accordion_items",
    to: "accordion_items_en",
    array: { read: (p) => p.meta?.accordion_items, props: ["title", "description"] },
  },
  {
    label: "image_groups",
    to: "image_groups_en",
    array: { read: (p) => p.meta?.image_groups, props: ["title"] },
  },
  {
    label: "features",
    to: "features_en",
    array: { read: (p) => p.meta?.features, props: ["title", "description"] },
  },
];

const SYSTEM = `You translate Croatian web content for Studentski centar Zagreb into English for international students.

Rules, in order of priority:

1. Preserve every phone number, email address, URL, IBAN, OIB and monetary amount EXACTLY as written. Do not reformat, re-space or localise them.
2. Preserve the HTML markup exactly: the same tags, in the same order, with the same attributes. Translate only the human-readable text between tags.
3. Do not translate proper names: \${PROTECTED_TERMS.join(", ")}, dormitory and student-village names, street names, or personal names. Croatian street addresses stay in Croatian.
4. Copy every abbreviation EXACTLY as written. SN (Studentsko naselje) and SD (Studentski dom) are different places — never convert one into the other, never expand them, never "correct" them. The same applies to SC, MZO, PDV, OIB and any other abbreviation.
5. Translate dates and opening hours faithfully. Never change a number, a day or a deadline.
6. Use clear, plain British English suited to students. Match the register of the original.

Return ONLY the translated text. No commentary, no code fences, no explanation. If the input is empty or has nothing to translate, return it unchanged.`;

/**
 * The gateway speaks the Anthropic Messages API, so the same SDK works for
 * both routes — only the base URL and the credential change.
 */
const anthropic = USE_GATEWAY
  ? new Anthropic({
      baseURL: "https://ai-gateway.vercel.sh",
      authToken: GATEWAY_KEY,
      apiKey: null,
    })
  : new Anthropic();

// Populated by main() when credentials are present. The JWT plugin on this
// site rejects Basic auth outright — see scripts/wp-auth.mjs.
let headers = { Accept: "application/json", "Content-Type": "application/json" };
let authenticated = false;

async function translate(text) {
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 16000,
    // Provider-specific extras are sent only on the direct route. The gateway
    // normalises across providers and may reject parameters it does not model.
    ...(USE_GATEWAY
      ? {}
      : { thinking: { type: "adaptive" }, output_config: { effort: "low" } }),
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: String(text) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error(`model refused: ${response.stop_details?.category ?? "unknown"}`);
  }
  return response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();
}

async function fetchPosts() {
  const url = new URL(`${base}/wp/v2/${TYPE}`);
  url.searchParams.set("per_page", "100");
  url.searchParams.set("context", authenticated ? "edit" : "view");
  if (CATEGORY) url.searchParams.set("categories", CATEGORY);
  if (IDS.length) url.searchParams.set("include", IDS.join(","));
  if (authenticated) url.searchParams.set("status", "any");

  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`fetch ${TYPE}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

/** Minimal, additive payload. Never through features/posts — that rewrites slugs. */
async function writeMeta(id, meta) {
  const res = await fetch(`${base}/wp/v2/${TYPE}/${id}`, {
    method: "POST",
    headers,
    body: JSON.stringify({ meta }),
  });
  if (!res.ok) throw new Error(`write ${id}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const isBlank = (v) => v === undefined || v === null || String(v).trim() === "";

async function main() {
  if (wpUser && wpPass) {
    const auth = await authenticate();
    headers = auth.headers;
    authenticated = true;
    console.log(`  wordpress: ${auth.user}`);
  }

  const posts = await fetchPosts();
  const targets = LIMIT ? posts.slice(0, LIMIT) : posts;

  console.log(`  model: ${MODEL} via ${USE_GATEWAY ? "Vercel AI Gateway" : "Anthropic direct"}`);
  console.log(
    `${WRITE ? "WRITING" : "DRY RUN"} — ${targets.length} ${TYPE}` +
      (CATEGORY ? ` in category ${CATEGORY}` : "") +
      (FORCE ? " (force: existing English will be overwritten)" : "")
  );
  console.log();

  await fs.mkdir("translation-logs", { recursive: true });
  const logPath = path.join(
    "translation-logs",
    `${new Date().toISOString().replace(/[:.]/g, "-")}${WRITE ? "" : "_dryrun"}.jsonl`
  );

  let translated = 0, skipped = 0, blocked = 0, failed = 0;

  for (const post of targets) {
    const title = (post.title?.rendered || post.slug || post.id).toString().slice(0, 48);
    const meta = {};
    const notes = [];

    for (const field of FIELDS) {
      try {
        if (field.array) {
          const source = field.array.read(post);
          if (!Array.isArray(source) || source.length === 0) continue;
          if (!FORCE && Array.isArray(post.meta?.[field.to]) && post.meta[field.to].length) {
            skipped++; notes.push(`${field.label}: already translated`); continue;
          }
          const out = [];
          for (const item of source) {
            const entry = {};
            for (const prop of field.array.props) {
              const src = item?.[prop];
              entry[prop] = isBlank(src) ? "" : await translate(src);
              if (!isBlank(src)) {
                const check = checkTranslation(src, entry[prop]);
                if (!check.ok) {
                  throw new Error(`${field.label}.${prop}: ${check.errors[0]}`);
                }
              }
            }
            out.push(entry);
          }
          meta[field.to] = out;   // index-aligned with the Croatian array
          translated++;
          notes.push(`${field.label}: ${out.length} item(s)`);
          continue;
        }

        const source = field.read(post);
        if (isBlank(source)) continue;
        if (!FORCE && !isBlank(post.meta?.[field.to])) {
          skipped++; notes.push(`${field.label}: already translated`); continue;
        }

        const out = await translate(source);
        const check = checkTranslation(source, out);
        if (!check.ok) {
          blocked++;
          notes.push(`${field.label}: BLOCKED — ${check.errors.join("; ")}`);
          continue;                       // never written
        }
        for (const w of check.warnings) notes.push(`${field.label}: warning — ${w}`);
        meta[field.to] = out;
        translated++;
        notes.push(`${field.label}: ok (${out.length} chars)`);
      } catch (error) {
        failed++;
        notes.push(`${field.label}: FAILED — ${error.message}`);
      }
    }

    const keys = Object.keys(meta);
    console.log(`  ${post.id}  ${title}`);
    for (const n of notes) console.log(`      ${n}`);

    if (keys.length && WRITE) {
      try {
        await writeMeta(post.id, meta);
        console.log(`      → wrote ${keys.length} field(s)`);
      } catch (error) {
        failed++;
        console.log(`      → WRITE FAILED: ${error.message}`);
      }
    } else if (keys.length) {
      console.log(`      → would write ${keys.length} field(s)`);
    }

    await fs.appendFile(
      logPath,
      JSON.stringify({
        at: new Date().toISOString(),
        id: post.id,
        slug: post.slug,
        wrote: WRITE,
        keys,
        // The previous value of every key touched, so a run can be reversed.
        previous: Object.fromEntries(keys.map((k) => [k, post.meta?.[k] ?? null])),
        next: meta,
        notes,
      }) + "\n"
    );
  }

  console.log();
  console.log(`  translated ${translated}   skipped ${skipped}   blocked ${blocked}   failed ${failed}`);
  console.log(`  log: ${logPath}`);
  if (!WRITE) console.log("\n  Dry run — nothing was written. Re-run with --write.");
  else console.log("\n  Now prove it was additive:  npm run wp:diff -- <before> <after>");
  if (blocked || failed) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
