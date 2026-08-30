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
import { authenticate } from "./wp-auth.mjs";

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

// Filled in by main() when credentials are present. Basic auth does not work
// against this site — the JWT plugin owns the Authorization header.
let headers = { Accept: "application/json" };

const isTaxonomy = (type) =>
  type === "categories" || type === "tags" || type === "media_folder";

/**
 * Window sizes to try, largest first.
 *
 * Some pages on this site cannot be serialised at all: a handful carry 80 kB
 * to 1.7 MB of legacy attachment markup with base64-inlined images, and PHP
 * dies assembling the response (HTTP 500, "kritična greška"). Before this
 * existed, the fixed per_page=100 meant the whole `pages` type failed and was
 * never captured once.
 *
 * A 500 here is a server capacity problem, not a missing collection, so the
 * fix is to ask for less at a time rather than give up on the type.
 */
const WINDOW_SIZES = [100, 50, 20, 10, 5, 2, 1];
const smaller = (size) => WINDOW_SIZES[WINDOW_SIZES.indexOf(size) + 1];

/**
 * Windows are addressed by `offset`, not `page`, so a window that fails can be
 * retried smaller at the same position. With `page` the item boundaries move
 * whenever per_page changes, which makes a partial retry unsound.
 */
async function fetchWindow(type, offset, perPage, context) {
  const url = new URL(`${base}/wp/v2/${type}`);
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("orderby", "id");
  url.searchParams.set("order", "asc");
  if (authenticated) url.searchParams.set("context", context);
  // Taxonomies have no post status; asking for one is a 400.
  if (!isTaxonomy(type) && authenticated) url.searchParams.set("status", "any");

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `${type} offset ${offset} (per_page ${perPage}) -> HTTP ${response.status}: ${body.slice(0, 200)}`
    );
  }

  return {
    items: await response.json(),
    total: Number(response.headers.get("x-wp-total") || 0),
  };
}

async function fetchAll(type) {
  const context = authenticated ? "edit" : "view";
  const items = [];
  /** Items captured at reduced fidelity, so the manifest can say so. */
  const degraded = [];

  let offset = 0;
  let total = Infinity;
  let size = WINDOW_SIZES[0];

  while (offset < total) {
    try {
      const window = await fetchWindow(type, offset, size, context);
      total = window.total;
      if (window.items.length === 0) break;
      items.push(...window.items);
      offset += window.items.length;
      // Only the window that actually struggled pays the step-down cost.
      size = WINDOW_SIZES[0];
      continue;
    } catch (error) {
      if (!/HTTP 500/.test(error.message)) throw error;
      if (size > 1) {
        size = smaller(size);
        continue;
      }
    }

    // A single item that WordPress cannot serialise in `edit` context. Page
    // 5684 (`sport`) is one: its raw content is too large, though the public
    // `view` representation renders fine. Take what can be had and record the
    // loss rather than lose the other 25 pages with it.
    const fallback = await fetchWindow(type, offset, 1, "view");
    if (fallback.items.length === 0) break;
    items.push(...fallback.items);
    degraded.push(fallback.items[0]?.id ?? `offset ${offset}`);
    offset += 1;
    size = WINDOW_SIZES[0];
  }

  return { items, degraded };
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

  if (authenticated) {
    const auth = await authenticate({ user, password: appPassword });
    headers = auth.headers;
    console.log(`Authenticated as ${auth.user}\n`);
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
      const { items, degraded } = await fetchAll(type);
      await fs.writeFile(
        path.join(dir, `${type}.json`),
        JSON.stringify(items, null, 2)
      );
      manifest.types[type] = { count: items.length, checksum: checksum(items) };
      if (degraded.length) manifest.types[type].degraded = degraded;
      console.log(
        `${items.length}` +
          (degraded.length
            ? ` (${degraded.length} captured in view context: ${degraded.join(", ")})`
            : "")
      );
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
