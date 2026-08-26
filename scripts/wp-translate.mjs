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
 * Environment:
 *   ANTHROPIC_API_KEY   for translation
 *   WP_USER / WP_APP_PASSWORD  WordPress application password, for writing
 */

import fs from "node:fs/promises";
import path from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { checkTranslation, PROTECTED_TERMS } from "./translation-guard.mjs";

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
if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set.");
  process.exit(2);
}

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
3. Do not translate proper names: ${PROTECTED_TERMS.join(", ")}, other dormitory names, street names, or personal names. Croatian street addresses stay in Croatian.
4. Translate dates and opening hours faithfully. Never change a number, a day or a deadline.
5. Use clear, plain British English suited to students. Match the register of the original.

Return ONLY the translated text. No commentary, no code fences, no explanation. If the input is empty or has nothing to translate, return it unchanged.`;

const anthropic = new Anthropic();

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
  ...(wpUser && wpPass
    ? { Authorization: "Basic " + Buffer.from(`${wpUser}:${wpPass}`).toString("base64") }
    : {}),
};

async function translate(text) {
  const response = await anthropic.messages.create({
    model: "claude-opus-5",
    max_tokens: 16000,
    thinking: { type: "adaptive" },
    output_config: { effort: "low" },
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
  url.searchParams.set("context", wpUser ? "edit" : "view");
  if (CATEGORY) url.searchParams.set("categories", CATEGORY);
  if (IDS.length) url.searchParams.set("include", IDS.join(","));
  if (wpUser) url.searchParams.set("status", "any");

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
  const posts = await fetchPosts();
  const targets = LIMIT ? posts.slice(0, LIMIT) : posts;

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
