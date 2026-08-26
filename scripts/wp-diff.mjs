/**
 * Compare two snapshots and prove the migration was additive.
 *
 *   npm run wp:diff -- wp-snapshots/<before> wp-snapshots/<after>
 *
 * Changes are split into two buckets:
 *
 *   TRANSLATION — new or edited `*_en` meta keys. Expected. Reported, not fatal.
 *   PROTECTED   — anything else: Croatian copy, slugs, statuses, media ids,
 *                 categories, deleted posts. Any single one of these fails the
 *                 run with a non-zero exit code.
 *
 * Exit 0 means nothing but English was touched.
 */

import fs from "node:fs/promises";
import path from "node:path";

const [beforeDir, afterDir] = process.argv.slice(2);

if (!beforeDir || !afterDir) {
  console.error(
    "Usage: npm run wp:diff -- <before-snapshot-dir> <after-snapshot-dir>"
  );
  process.exit(2);
}

// Fields WordPress updates on its own whenever a post is saved. Their changing
// says nothing about content loss.
const ignoredPaths = new Set([
  "modified",
  "modified_gmt",
  "_links",
  "_embedded",
  // WordPress sets these on any post update to queue pingback and enclosure
  // processing. Bookkeeping, not content.
  "_pingme",
  "_encloseme",
]);

/** Ignore by leaf name, so nested copies (custom_fields._pingme) match too. */
const isIgnored = (trail) => ignoredPaths.has(trail.split(".").pop());

// `meta` is the writable view; an authenticated (context=edit) snapshot also
// exposes the same values under `custom_fields`. Both are translation paths —
// treating only `meta` as one made an additive run report FAIL.
const isTranslationPath = (fieldPath) =>
  /(^|\.)(meta|custom_fields)\.[A-Za-z0-9_]*_en(\.|$)/.test(fieldPath);

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function diffValues(before, after, trail, out) {
  if (trail && isIgnored(trail)) return;

  if (isObject(before) && isObject(after)) {
    for (const key of new Set([
      ...Object.keys(before),
      ...Object.keys(after),
    ])) {
      diffValues(before[key], after[key], trail ? `${trail}.${key}` : key, out);
    }
    return;
  }

  if (JSON.stringify(before) !== JSON.stringify(after)) {
    out.push({ path: trail, before, after });
  }
}

const preview = (value) => {
  if (value === undefined) return "(absent)";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  return text.length > 120 ? `${text.slice(0, 120)}…` : text;
};

async function readType(dir, type) {
  try {
    return JSON.parse(await fs.readFile(path.join(dir, `${type}.json`), "utf8"));
  } catch {
    return null;
  }
}

async function main() {
  const manifest = JSON.parse(
    await fs.readFile(path.join(beforeDir, "manifest.json"), "utf8")
  );

  const protectedFindings = [];
  let translationCount = 0;

  for (const type of Object.keys(manifest.types)) {
    const before = await readType(beforeDir, type);
    const after = await readType(afterDir, type);

    if (!before || !after) {
      protectedFindings.push({
        type,
        id: "-",
        path: "(whole type)",
        before: before ? "present" : "missing",
        after: after ? "present" : "missing",
      });
      continue;
    }

    const beforeById = new Map(before.map((item) => [item.id, item]));
    const afterById = new Map(after.map((item) => [item.id, item]));

    for (const [id, beforeItem] of beforeById) {
      const afterItem = afterById.get(id);

      if (!afterItem) {
        protectedFindings.push({
          type,
          id,
          path: "(deleted)",
          before: beforeItem.slug || beforeItem.title?.rendered || "",
          after: "(gone)",
        });
        continue;
      }

      const changes = [];
      diffValues(beforeItem, afterItem, "", changes);

      for (const change of changes) {
        if (isTranslationPath(change.path)) translationCount++;
        else protectedFindings.push({ type, id, ...change });
      }
    }
  }

  if (translationCount) {
    console.log(`Translation fields added or changed: ${translationCount}`);
  }

  if (!protectedFindings.length) {
    console.log("\nPASS — no Croatian content, slug, or structural field changed.");
    return;
  }

  console.error(`\nFAIL — ${protectedFindings.length} protected change(s):\n`);
  for (const finding of protectedFindings.slice(0, 60)) {
    console.error(`  ${finding.type}#${finding.id}  ${finding.path}`);
    console.error(`    before: ${preview(finding.before)}`);
    console.error(`    after:  ${preview(finding.after)}`);
  }
  if (protectedFindings.length > 60) {
    console.error(`  … and ${protectedFindings.length - 60} more`);
  }
  process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(2);
});
