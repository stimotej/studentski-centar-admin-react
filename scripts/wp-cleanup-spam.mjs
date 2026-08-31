/**
 * Remove the injected spam posts, with a review step in between.
 *
 *   node scripts/wp-cleanup-spam.mjs            # build a review list, delete nothing
 *   node scripts/wp-cleanup-spam.mjs --confirm  # trash exactly what the list contains
 *   node scripts/wp-cleanup-spam.mjs --confirm --permanent
 *
 * The selection rule is date-based, not keyword-based. Accounts 6 (express),
 * 8 (lascina) and 26 (poslovi) were dormant from early 2023 until they were
 * compromised in 2026, so "authored by one of them in 2026" identifies the
 * spam exactly — and does not depend on guessing which words look spammy.
 * Keyword matching had already missed "Chicken Road" and "The Holyluck
 * Experience".
 *
 * Nothing is deleted without --confirm, and then only the ids left in the
 * review file. Delete a line from that file to spare that post.
 *
 * Posts are TRASHED by default, so WordPress can restore them. --permanent
 * skips the bin. Either way the full content is written to disk first.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { authenticate, apiBase } from "./wp-auth.mjs";

const argv = process.argv.slice(2);
const CONFIRM = argv.includes("--confirm");
const PERMANENT = argv.includes("--permanent");

const COMPROMISED_AUTHORS = [6, 8, 26];
const COMPROMISED_FROM = "2026-01-01";
/** Individually identified spam outside the rule above. */
const EXTRA_IDS = [58436]; // Polish casino post attributed to the admin account

const OUT_DIR = "spam-cleanup";
const REVIEW = path.join(OUT_DIR, "review.txt");
const BACKUP = path.join(OUT_DIR, "deleted-content.jsonl");

const TYPES = ["posts", "pages", "obavijesti", "event", "jobs", "proizvodi", "menus"];
const clean = (s) => String(s ?? "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

async function collect(headers) {
  const found = new Map();

  for (const type of TYPES) {
    for (const author of COMPROMISED_AUTHORS) {
      const url = `${apiBase()}/wp/v2/${type}?author=${author}&per_page=100&status=any&context=edit`;
      const res = await fetch(url, { headers });
      if (!res.ok) continue;
      for (const p of await res.json()) {
        // `...p` last would let the post's own `type` ("post") overwrite the
        // REST route segment ("posts"), which is what sent every DELETE to a
        // non-existent endpoint the first time this ran.
        if (p.date >= COMPROMISED_FROM) found.set(`${type}:${p.id}`, { ...p, type });
      }
    }
  }

  for (const id of EXTRA_IDS) {
    const res = await fetch(`${apiBase()}/wp/v2/posts/${id}?context=edit`, { headers });
    if (res.ok) found.set(`posts:${id}`, { ...(await res.json()), type: "posts" });
  }

  return [...found.values()].sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function main() {
  const { headers, user } = await authenticate();
  console.log(`  wordpress: ${user}\n`);
  await fs.mkdir(OUT_DIR, { recursive: true });

  if (!CONFIRM) {
    const items = await collect(headers);
    const lines = [
      "# Spam cleanup review list.",
      "# Delete any line you want to KEEP, then re-run with --confirm.",
      "# Everything still listed here will be removed.",
      "#",
      `# rule: authored by ${COMPROMISED_AUTHORS.join("/")} on or after ${COMPROMISED_FROM}`,
      `# built: ${new Date().toISOString()}`,
      "",
      ...items.map(
        (p) =>
          `${p.type}:${p.id}\t${p.date.slice(0, 10)}\tauthor=${p.author}\t${clean(p.title?.rendered).slice(0, 62)}`
      ),
    ];
    await fs.writeFile(REVIEW, lines.join("\n") + "\n");

    console.log(`  ${items.length} item(s) selected for removal`);
    for (const p of items.slice(0, 12))
      console.log(`    ${p.type}:${p.id}  ${p.date.slice(0, 10)}  ${clean(p.title?.rendered).slice(0, 56)}`);
    if (items.length > 12) console.log(`    … and ${items.length - 12} more`);
    console.log(`\n  Review list: ${REVIEW}`);
    console.log("  Read it, delete any line you want to keep, then:");
    console.log("    node scripts/wp-cleanup-spam.mjs --confirm");
    return;
  }

  let list;
  try {
    list = (await fs.readFile(REVIEW, "utf8"))
      .split("\n")
      .filter((l) => l.trim() && !l.startsWith("#"))
      .map((l) => {
        const [ref, date, author, title] = l.split("\t");
        const [rawType, id] = ref.split(":");
        // A review list produced before the fix says "post"/"page"; the REST
        // routes are plural. Accept both rather than make anyone redo edits.
        const type = { post: "posts", page: "pages", attachment: "media" }[rawType] ?? rawType;
        return { type, id: Number(id), date, author, title };
      });
  } catch {
    console.error(`No review list at ${REVIEW}. Run without --confirm first.`);
    process.exit(2);
  }

  console.log(`  ${PERMANENT ? "PERMANENTLY DELETING" : "Trashing"} ${list.length} item(s)\n`);
  let done = 0;
  let failed = 0;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    try {
      // Keep a copy before it goes, so a mistake is recoverable even from the bin.
      const before = await fetch(`${apiBase()}/wp/v2/${item.type}/${item.id}?context=edit`, { headers });
      if (before.ok) {
        await fs.appendFile(
          BACKUP,
          JSON.stringify({ at: new Date().toISOString(), ...(await before.json()) }) + "\n"
        );
      }

      const res = await fetch(
        `${apiBase()}/wp/v2/${item.type}/${item.id}${PERMANENT ? "?force=true" : ""}`,
        { method: "DELETE", headers }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status} ${(await res.text()).slice(0, 120)}`);
      done++;
      console.log(`    ok    ${item.type}:${item.id}  ${item.title ?? ""}`.slice(0, 96));
    } catch (error) {
      failed++;
      console.log(`    FAIL  ${item.type}:${item.id}  ${error.message}`.slice(0, 120));
    }

    // Deleting a post cascades into postmeta, terms, and a WSAL audit row.
    // Doing 70 of those back-to-back exhausted MySQL's connection pool once
    // already, so pause between batches.
    if ((i + 1) % 5 === 0 && i + 1 < list.length) {
      process.stdout.write(`    … ${i + 1}/${list.length}, pausing\n`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  console.log(`\n  removed ${done}   failed ${failed}`);
  console.log(`  content saved to ${BACKUP}`);
  if (!PERMANENT) console.log("  Posts are in the WordPress bin and can be restored from there.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
