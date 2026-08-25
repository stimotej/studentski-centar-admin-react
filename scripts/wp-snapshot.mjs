/**
 * Read-only snapshot of all WordPress content behind the admin.
 *
 * Writes one JSON file per content type into wp-snapshots/<timestamp>/ plus a
 * manifest with per-type counts and a checksum. Never issues a write request.
 *
 *   WP_USER="admin" WP_APP_PASSWORD="xxxx xxxx xxxx" npm run wp:snapshot
 *
 * Without credentials it falls back to unauthenticated `view` context, which
 * omits drafts and raw (unrendered) content. Always authenticate for a backup
 * you intend to restore from.
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const base = (
  process.env.WP_API_BASE || "https://www.sczg.unizg.hr/wp-json"
).replace(/\/$/, "");

const user = process.env.WP_USER;
const appPassword = process.env.WP_APP_PASSWORD;
const authenticated = !!(user && appPassword);

const outRoot = process.env.WP_SNAPSHOT_DIR || "wp-snapshots";
const label = process.argv[2];

// Every type the admin reads or writes. Keep in sync with features/*/index.js.
const allTypes = [
  "posts",
  "pages",
  "obavijesti",
  "event",
  "jobs",
  "proizvodi",
  "menus",
  "contact_mails",
  "categories",
  "tags",
  "media",
  "media_folder",
];

// A full snapshot is ~14k items. Per-section verification only needs a slice,
// so WP_SNAPSHOT_TYPES=posts,categories keeps the before/after loop fast.
const types = process.env.WP_SNAPSHOT_TYPES
  ? process.env.WP_SNAPSHOT_TYPES.split(",").map((t) => t.trim())
  : allTypes;

const unknown = types.filter((type) => !allTypes.includes(type));
if (unknown.length) {
  console.error(`Unknown type(s): ${unknown.join(", ")}`);
  process.exit(2);
}

const headers = {
  Accept: "application/json",
  ...(authenticated
    ? {
        Authorization:
          "Basic " +
          Buffer.from(`${user}:${appPassword}`).toString("base64"),
      }
    : {}),
};

const isTaxonomy = (type) =>
  type === "categories" || type === "tags" || type === "media_folder";

async function fetchPage(type, page) {
  const url = new URL(`${base}/wp/v2/${type}`);
  url.searchParams.set("per_page", "100");
  url.searchParams.set("page", String(page));
  url.searchParams.set("orderby", "id");
  url.searchParams.set("order", "asc");
  if (authenticated) url.searchParams.set("context", "edit");
  // Taxonomies have no post status; asking for one is a 400.
  if (!isTaxonomy(type) && authenticated) url.searchParams.set("status", "any");

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `${type} page ${page} -> HTTP ${response.status}: ${body.slice(0, 300)}`
    );
  }

  return {
    items: await response.json(),
    totalPages: Number(response.headers.get("x-wp-totalpages") || 1),
  };
}

async function fetchAll(type) {
  const first = await fetchPage(type, 1);
  const items = [...first.items];

  for (let page = 2; page <= first.totalPages; page++) {
    const next = await fetchPage(type, page);
    items.push(...next.items);
  }

  return items;
}

const checksum = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");

async function main() {
  if (!authenticated) {
    console.warn(
      "! No WP_USER / WP_APP_PASSWORD set — snapshotting published content only.\n" +
        "  Drafts and raw content will be missing. Not restore-grade.\n"
    );
  }

  const startedAt = new Date();
  const stamp = startedAt.toISOString().replace(/[:.]/g, "-");
  const dir = path.join(outRoot, label ? `${stamp}_${label}` : stamp);
  await fs.mkdir(dir, { recursive: true });

  const manifest = {
    takenAt: startedAt.toISOString(),
    base,
    context: authenticated ? "edit" : "view",
    label: label || null,
    types: {},
  };

  for (const type of types) {
    process.stdout.write(`  ${type} ... `);
    try {
      const items = await fetchAll(type);
      await fs.writeFile(
        path.join(dir, `${type}.json`),
        JSON.stringify(items, null, 2)
      );
      manifest.types[type] = { count: items.length, checksum: checksum(items) };
      console.log(`${items.length}`);
    } catch (error) {
      // A type that fails is recorded rather than silently missing, so a diff
      // against this snapshot can refuse to treat it as "nothing there".
      manifest.types[type] = { error: String(error.message) };
      console.log(`FAILED — ${error.message}`);
    }
  }

  await fs.writeFile(
    path.join(dir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  const failed = Object.entries(manifest.types).filter(([, v]) => v.error);
  console.log(`\nSnapshot written to ${dir}`);

  if (failed.length) {
    console.error(
      `\n! ${failed.length} type(s) failed: ${failed
        .map(([t]) => t)
        .join(", ")}\n  This snapshot is INCOMPLETE. Do not treat it as a backup.`
    );
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
