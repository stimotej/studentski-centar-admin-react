/**
 * Bulk HR → EN translation for WordPress content.
 *
 *   node scripts/wp-translate.mjs --category 176              # dry run (default)
 *   node scripts/wp-translate.mjs --category 176 --write
 *   node scripts/wp-translate.mjs --ids 4200,4156 --write
 *   node scripts/wp-translate.mjs --category 176 --limit 3 --write
 *   node scripts/wp-translate.mjs --category 176 --write --concurrency 12
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
// Fields are translated in parallel. Fixed per-request overhead dominates,
// so this is close to a linear speed-up until the provider rate-limits.
const CONCURRENCY = Math.max(1, Number(value("concurrency") || process.env.TRANSLATE_CONCURRENCY || 8));

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

/** Run `worker` over `items` with at most `limit` in flight. */
async function pool(items, limit, worker) {
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      await worker(items[i], i);
    }
  });
  await Promise.all(runners);
}

/** Retry transient failures — rate limits and provider hiccups. */
async function withRetry(fn, attempts = 4) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const status = error?.status ?? error?.statusCode;
      const retryable = status === 429 || status === 408 || status >= 500 || !status;
      if (!retryable || attempt === attempts) throw error;
      await new Promise((r) => setTimeout(r, 1000 * 2 ** (attempt - 1)));
    }
  }
  throw lastError;
}

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
  console.log(`  concurrency: ${CONCURRENCY}`);
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

  // ---- Phase 1: plan every field, so nothing is decided mid-flight ---------
  let skipped = 0;
  const plans = [];

  for (const post of targets) {
    const plan = { post, meta: {}, notes: [], jobs: [], dropped: new Set() };

    for (const field of FIELDS) {
      if (field.array) {
        const source = field.array.read(post);
        if (!Array.isArray(source) || source.length === 0) continue;
        const existing = post.meta?.[field.to];
        if (!FORCE && Array.isArray(existing) && existing.length) {
          skipped++; plan.notes.push(`${field.label}: already translated`); continue;
        }
        const shell = source.map(() => ({}));
        let needed = 0;
        source.forEach((item, index) => {
          for (const prop of field.array.props) {
            const src = item?.[prop];
            if (isBlank(src)) { shell[index][prop] = ""; continue; }
            needed++;
            plan.jobs.push({ target: field.to, label: field.label, index, prop, source: src });
          }
        });
        // An array whose translatable text is entirely empty is not a translation.
        if (needed === 0) continue;
        plan.meta[field.to] = shell;
      } else {
        const source = field.read(post);
        if (isBlank(source)) continue;
        if (!FORCE && !isBlank(post.meta?.[field.to])) {
          skipped++; plan.notes.push(`${field.label}: already translated`); continue;
        }
        plan.jobs.push({ target: field.to, label: field.label, source });
      }
    }

    plans.push(plan);
  }

  // ---- Phase 2: translate, many at a time ---------------------------------
  // Attach the plan to each job in place — spreading into copies would leave
  // phase 3 reading the originals, which never received a result.
  const jobs = plans.flatMap((plan) => {
    for (const job of plan.jobs) job.plan = plan;
    return plan.jobs;
  });
  let done = 0;
  const started = Date.now();

  await pool(jobs, CONCURRENCY, async (job) => {
    try {
      const out = await withRetry(() => translate(job.source));
      const check = checkTranslation(job.source, out);
      if (!check.ok) {
        job.blocked = check.errors;
      } else {
        job.result = out;
        job.warnings = check.warnings;
      }
    } catch (error) {
      job.failed = error.message;
    }
    done++;
    if (done % 10 === 0 || done === jobs.length) {
      const rate = done / ((Date.now() - started) / 1000);
      const left = rate > 0 ? (jobs.length - done) / rate : 0;
      process.stdout.write(
        `\r  ${done}/${jobs.length} fields   ~${Math.ceil(left / 60)} min left        `
      );
    }
  });
  if (jobs.length) console.log("\n");

  // ---- Phase 3: assemble, report, write ----------------------------------
  let translated = 0, blocked = 0, failed = 0;

  for (const plan of plans) {
    for (const job of plan.jobs) {
      if (job.blocked) {
        blocked++;
        plan.notes.push(`${job.label}: BLOCKED — ${job.blocked.join("; ")}`);
        plan.dropped.add(job.target);
        continue;
      }
      if (job.failed) {
        failed++;
        plan.notes.push(`${job.label}: FAILED — ${job.failed}`);
        plan.dropped.add(job.target);
        continue;
      }
      for (const w of job.warnings ?? []) plan.notes.push(`${job.label}: warning — ${w}`);

      if (job.index === undefined) {
        plan.meta[job.target] = job.result;
        plan.notes.push(`${job.label}: ok (${job.result.length} chars)`);
      } else {
        plan.meta[job.target][job.index][job.prop] = job.result;
      }
      translated++;
    }

    // A partially blocked array cannot be written — it would no longer line up
    // with the Croatian original. Drop the whole field rather than misalign it.
    for (const target of plan.dropped) delete plan.meta[target];

    const keys = Object.keys(plan.meta);
    const title = (plan.post.title?.rendered || plan.post.slug || plan.post.id).toString().slice(0, 48);
    console.log(`  ${plan.post.id}  ${title}`);
    for (const n of plan.notes) console.log(`      ${n}`);

    if (keys.length && WRITE) {
      try {
        await writeMeta(plan.post.id, plan.meta);
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
        id: plan.post.id,
        slug: plan.post.slug,
        wrote: WRITE,
        keys,
        // The previous value of every key touched, so a run can be reversed.
        previous: Object.fromEntries(keys.map((k) => [k, plan.post.meta?.[k] ?? null])),
        next: plan.meta,
        notes: plan.notes,
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
