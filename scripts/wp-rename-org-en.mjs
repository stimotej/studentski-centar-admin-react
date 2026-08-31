/**
 * Replace the Croatian organisation name with its official English name,
 * in English fields only.
 *
 *   node scripts/wp-rename-org-en.mjs            # dry run (default)
 *   node scripts/wp-rename-org-en.mjs --write
 *
 * "The University of Zagreb Student Centre" is not a translation anyone chose
 * here — it is the name Studentski centar uses for itself on its own English
 * page for international students (post 7909), where it introduces itself as
 * "The University of Zagreb Student Centre (Studentski centar u Zagrebu)".
 *
 * Every occurrence of the Croatian name in an English field got there because
 * scripts/translation-guard.mjs listed "Studentski centar" in PROTECTED_TERMS
 * and mechanically rejected any translation that changed it.
 *
 * Safety: this reads and writes `*_en` meta and nothing else. It never touches
 * a Croatian field, a title, a slug or a status, so `npm run wp:diff` must
 * still report a clean additive run afterwards.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { authenticate, apiBase } from "./wp-auth.mjs";

const argv = process.argv.slice(2);
const WRITE = argv.includes("--write");

const EN_NAME = "University of Zagreb Student Centre";

const TYPES = ["posts", "pages", "obavijesti", "event"];

/**
 * Ordered longest-first, so "Studentski centar u Zagrebu" is consumed before
 * the bare "Studentski centar" inside it can match.
 */
const NAME_FORMS = [
  /Studentskog\s+[Cc]entra\s+u\s+Zagrebu/g,
  /Studentski\s+[Cc]entar\s+u\s+Zagrebu/g,
  /Studentski\s+[Cc]entar\s+Zagreb\b/g,
  /STUDENTSKI\s+CENTAR\s+U\s+ZAGREBU/g,
  /STUDENTSKI\s+CENTAR/g,
  /Studentski\s+[Cc]entar\b/g,
];

/** The generic plural is a common noun, not the organisation. */
const GENERIC = [[/studentskih\s+centara/g, "student centres"]];

/**
 * English wants an article in front of the name and Croatian has none to carry
 * over, so one is supplied from the surrounding text.
 *
 * Markup is stripped before looking backwards: "via the <strong>Studentski
 * centar" otherwise looks like a sentence start (the character before the
 * match is ">") and produced "via the The University …".
 */
const article = (before, after) => {
  // Entities go too, not just tags: "via the&nbsp;<a …>" ends in ";", which
  // the sentence-start test below would otherwise read as punctuation.
  const tail = before
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:[a-zA-Z]+|#\d+);/g, " ")
    .replace(/\s+$/, "");

  // Sentence, quote or field start.
  if (tail === "" || /[.!?:;]$/.test(tail) || /["“(]$/.test(tail)) return "The ";

  // A determiner within the last few words already governs the noun phrase.
  // "via the official Studentski centar website" must not gain a second one.
  const lastWords = tail.split(/\s+/).slice(-3).join(" ");
  if (/\b(?:the|a|an|its|our|their|this)\b/i.test(lastWords)) return "";

  // An address line — "Sveučilište u Zagrebu, Studentski centar, Savska 25".
  // Commas on both sides mean this is a list entry, which takes no article.
  if (/,\s*$/.test(before) && /^\s*,/.test(after)) return "";

  return "the ";
};

const rename = (text) => {
  let out = String(text);

  for (const [rx, replacement] of GENERIC) out = out.replace(rx, replacement);

  for (const rx of NAME_FORMS) {
    out = out.replace(rx, (match, offset, whole) => {
      const upper = match === match.toUpperCase();
      const name = upper ? EN_NAME.toUpperCase() : EN_NAME;
      const lead = article(whole.slice(0, offset), whole.slice(offset + match.length));
      return (upper ? lead.toUpperCase() : lead) + name;
    });
  }

  // An article supplied next to one already present, e.g. "of the the ...".
  return out.replace(/\b(the)\s+the\b/gi, "$1");
};

async function fetchAll(type, headers) {
  const items = [];
  let offset = 0;
  let total = Infinity;

  while (offset < total) {
    // `_fields` is what keeps this working. Page 5684 blows PHP's memory up
    // when its raw content is serialised, so asking for the whole record
    // fails with a 500 even one at a time. Meta is all this script reads.
    const url =
      `${apiBase()}/wp/v2/${type}?per_page=20&offset=${offset}` +
      `&orderby=id&order=asc&context=edit&status=any&_fields=id,slug,meta`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`${type} offset ${offset} -> HTTP ${res.status}`);
    total = Number(res.headers.get("x-wp-total") || 0);
    const batch = await res.json();
    if (!batch.length) break;
    items.push(...batch);
    offset += batch.length;
  }

  return items;
}

async function main() {
  const { headers, user } = await authenticate();
  console.log(`  wordpress: ${user}`);
  console.log(`  ${WRITE ? "WRITING" : "DRY RUN"} — English fields only\n`);

  await fs.mkdir("translation-logs", { recursive: true });
  const logPath = path.join(
    "translation-logs",
    `${new Date().toISOString().replace(/[:.]/g, "-")}_rename${WRITE ? "" : "_dryrun"}.jsonl`
  );

  let posts = 0;
  let fields = 0;
  let occurrences = 0;
  const samples = [];

  for (const type of TYPES) {
    for (const post of await fetchAll(type, headers)) {
      const changed = {};

      for (const [key, value] of Object.entries(post.meta ?? {})) {
        if (!key.endsWith("_en") || typeof value !== "string" || !value) continue;
        const next = rename(value);
        if (next === value) continue;

        const hits = [...value.matchAll(/Studentsk\w*\s+[Cc]ent\w*/g)].length;
        occurrences += hits;
        fields++;
        changed[key] = next;

        if (samples.length < 8) {
          const at = value.search(/Studentsk\w*\s+[Cc]ent\w*/);
          samples.push({
            id: post.id,
            key,
            before: value.slice(Math.max(0, at - 60), at + 90).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
            after: next.slice(Math.max(0, at - 60), at + 110).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
          });
        }
      }

      if (!Object.keys(changed).length) continue;
      posts++;

      await fs.appendFile(
        logPath,
        JSON.stringify({ type, id: post.id, slug: post.slug, meta: changed }) + "\n"
      );

      if (!WRITE) continue;

      const res = await fetch(`${apiBase()}/wp/v2/${type}/${post.id}`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ meta: changed }),
      });
      if (!res.ok) {
        console.log(`    FAIL ${type}:${post.id} -> HTTP ${res.status}`);
      } else {
        console.log(`    ok   ${type}:${post.id}  ${Object.keys(changed).join(", ")}`);
      }
    }
  }

  console.log(`\n  ${occurrences} occurrence(s) in ${fields} field(s) across ${posts} item(s)\n`);
  for (const s of samples) {
    console.log(`  ${s.id} ${s.key}`);
    console.log(`    -  ${s.before}`);
    console.log(`    +  ${s.after}\n`);
  }
  console.log(`  full change list: ${logPath}`);
  if (!WRITE) console.log("\n  Dry run — nothing was written. Re-run with --write.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
