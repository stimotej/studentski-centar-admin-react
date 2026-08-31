/**
 * Apply the agreed English terminology across English fields.
 *
 *   node scripts/wp-terminology-en.mjs            # dry run (default)
 *   node scripts/wp-terminology-en.mjs --write
 *
 * This is an English-to-English pass, not a translation: it makes one Croatian
 * term render as one English term everywhere, which is rule 7 of the glossary
 * in wp-translate.mjs and the thing bulk translation is worst at. The glossary
 * asked for "student hall", but it lived only in the prompt with nothing
 * enforcing it, so the model used it about a third of the time and reached for
 * "dormitory" otherwise. Studentski centar's own English page (post 7909) says
 * "student dormitory", so that is the form everything is moved to.
 *
 * Safety: reads and writes `*_en` meta and nothing else, so `npm run wp:diff`
 * must still report a clean additive run afterwards.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { authenticate, apiBase } from "./wp-auth.mjs";

const argv = process.argv.slice(2);
const WRITE = argv.includes("--write");

const TYPES = ["posts", "pages", "obavijesti", "event"];
const ORG = "University of Zagreb Student Centre";

/** Reproduce the source's capitalisation on the replacement. */
const matchCase = (sample, text) => {
  if (sample === sample.toUpperCase() && /[A-Z]{2}/.test(sample)) return text.toUpperCase();
  if (/^[A-Z]/.test(sample)) return text[0].toUpperCase() + text.slice(1);
  return text;
};

/**
 * Only unambiguous compounds are rewritten.
 *
 * A bare "hall" is usually a venue on this site — "the hall has 1100
 * comfortable seats", "fitness hall", "SKUC hall", "Grand Hall of &TD" — so
 * rewriting it would rename concert halls into dormitories. The handful of
 * bare "hall" occurrences that do mean a dormitory are listed explicitly
 * below; anything else is left for a human to read.
 */
const RULES = [
  // A qualifier already present must not be doubled: "student and pupil halls
  // of residence" would otherwise become "student and pupil student
  // dormitories".
  [/\b(student and pupil|student|pupil)\s+halls\s+of\s+residence\b/gi, "$1 dormitories"],
  [/\b(student and pupil|student|pupil)\s+hall\s+of\s+residence\b/gi, "$1 dormitory"],
  [/\bhalls\s+of\s+residence\b/gi, "student dormitories"],
  [/\bhall\s+of\s+residence\b/gi, "student dormitory"],
  [/\bHALL-OF-RESIDENCE\b/g, "DORMITORY"],
  [/\bstudent\s+halls\b/gi, "student dormitories"],
  [/\bstudent\s+hall\b/gi, "student dormitory"],
  [/\bpupil\s+halls\b/gi, "pupil dormitories"],
  [/\bpupil\s+hall\b/gi, "pupil dormitory"],
  [/\bstudent\s+residences\b/gi, "student dormitories"],
  [/\bstudent\s+residence\b/gi, "student dormitory"],
  // The Croatian building phrase, left untranslated by the first pass. SN and
  // SD are different places, so "studentsko naselje" must become village and
  // never dormitory — translation-guard.mjs protects the abbreviations for
  // exactly this reason.
  // Marked, not replaced outright: the article and capitalisation depend on
  // where the phrase sits, and that has to be decided only for occurrences
  // this pass creates. Resolving it for every "student dormitory" on the site
  // rewrote SC's own English in post 7909.
  [/\b[Ss]tudentsko\s+naselje\b/g, "\u0000village\u0000"],
  [/\b[Ss]tudentski\s+dom\b/g, "\u0000dormitory\u0000"],

  // Bare "hall" that demonstrably means the dormitory, by phrase.
  [/\bhall\s+internet\b/gi, "dormitory internet"],
  [/\bHall\s+(Rules|Order)\b/g, "Dormitory $1"],
  [/\bpreferred\s+hall\b/gi, "preferred dormitory"],
];

/** See wp-rename-org-en.mjs — same reasoning, same article handling. */
const article = (before, after) => {
  const tail = before
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:[a-zA-Z]+|#\d+);/g, " ")
    .replace(/\s+$/, "");
  if (tail === "" || /[.!?:;]$/.test(tail) || /["“(]$/.test(tail)) return "The ";
  const lastWords = tail.split(/\s+/).slice(-3).join(" ");
  if (/\b(?:the|a|an|its|our|their|this)\b/i.test(lastWords)) return "";
  if (/,\s*$/.test(before) && /^\s*,/.test(after)) return "";
  return "the ";
};

const retermed = (text) => {
  let out = String(text);

  for (const [rx, replacement] of RULES) {
    out = out.replace(rx, (match, ...rest) => {
      const groups = rest.slice(0, -2);
      let value = replacement;
      groups.forEach((g, i) => (value = value.replace(`$${i + 1}`, g)));
      return matchCase(match, value);
    });
  }

  // Resolve the marks. The Croatian proper name carried no article, so English
  // needs one unless the surrounding text already supplies a determiner.
  out = out.replace(/\u0000(dormitory|village)\u0000/g, (match, kind, offset, whole) => {
    const before = whole.slice(0, offset);
    const phrase = `student ${kind}`;

    // A block boundary starts a sentence just as a full stop does. Without
    // this, "…accommodated</p><p><strong>Studentski dom „Stjepan Radić”"
    // reads as mid-sentence and gains a stray "the".
    const atBlockStart =
      /(?:<\/(?:p|li|h[1-6]|div|td|th)>|<(?:br|p|li|h[1-6]|div|td|th)[^>]*>)\s*(?:<[^>]*>\s*)*$/i.test(
        before
      );

    const tail = before
      .replace(/<[^>]*>/g, " ")
      .replace(/&(?:[a-zA-Z]+|#\d+);/g, " ")
      .trim();

    // Only an OPENING quote starts a sentence. `Hall "SKUC" Studentski dom`
    // ends in a closing one and is mid-sentence.
    const afterOpeningQuote = /(?:^|[\s(])["“(]$/.test(tail);

    if (atBlockStart || tail === "" || /[.!?:;]$/.test(tail) || afterOpeningQuote)
      return `Student ${kind}`;

    // A determiner in the last couple of words already governs the phrase, so
    // a second one would read "in a the student dormitory". Prepositions are
    // deliberately NOT in this list: "of student dormitory X" is exactly the
    // case that needs an article supplied.
    const lastWords = tail.split(/\s+/).slice(-2).join(" ");
    if (/\b(?:the|a|an|its|our|their|this|your|each|one)\b/i.test(lastWords))
      return phrase;

    return `the ${phrase}`;
  });

  // "SC Zagreb" is deliberately left alone. Of its six occurrences one is a
  // Croatian proper name ("Fb: Poslovnica za sport SC Zagreb") that must not
  // change, and the other five are attributive ("the following SC Zagreb
  // subsidised dining restaurants"), where the full name reads badly. SC is
  // already a protected abbreviation in translation-guard.mjs.

  return out.replace(/\b(the)\s+the\b/gi, "$1");
};

async function fetchAll(type, headers) {
  const items = [];
  let offset = 0;
  let total = Infinity;
  while (offset < total) {
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
    `${new Date().toISOString().replace(/[:.]/g, "-")}_terms${WRITE ? "" : "_dryrun"}.jsonl`
  );

  let items = 0;
  let fields = 0;
  let failed = 0;
  const samples = [];

  for (const type of TYPES) {
    for (const post of await fetchAll(type, headers)) {
      const changed = {};

      for (const [key, value] of Object.entries(post.meta ?? {})) {
        if (!key.endsWith("_en") || typeof value !== "string" || !value) continue;
        const next = retermed(value);
        if (next === value) continue;
        changed[key] = next;
        fields++;

        if (samples.length < 6) {
          const at = value.search(/student halls?|halls? of residence|SC Zagreb/i);
          if (at !== -1)
            samples.push({
              id: post.id,
              key,
              before: value.slice(Math.max(0, at - 55), at + 75).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
              after: next.slice(Math.max(0, at - 55), at + 85).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
            });
        }
      }

      if (!Object.keys(changed).length) continue;
      items++;
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
        failed++;
        console.log(`    FAIL ${type}:${post.id} -> HTTP ${res.status}`);
      }
    }
  }

  console.log(`\n  ${fields} field(s) across ${items} item(s)   failed: ${failed}\n`);
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
