/**
 * Where this admin talks to WordPress.
 *
 * There is no staging environment — the defaults below point at production, so
 * behaviour is unchanged unless the env vars are set. Setting them is the only
 * way to point this admin somewhere else (a staging clone, a local WP) without
 * editing source.
 *
 * These must be NEXT_PUBLIC_* because the browser bundle needs them; the
 * server-only equivalents in lib/newsletter.js (WORDPRESS_API_BASE_URL) stay
 * as they are.
 */

const stripTrailingSlash = (value = "") => value.replace(/\/+$/, "");

export const WP_SITE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_WORDPRESS_SITE_URL || "https://www.sczg.unizg.hr",
);

export const WP_API_BASE = stripTrailingSlash(
  process.env.NEXT_PUBLIC_WORDPRESS_API_BASE_URL || `${WP_SITE_URL}/wp-json`,
);

/** WordPress core REST namespace — wp/v2 */
export const WP_API = `${WP_API_BASE}/wp/v2`;

/** JWT auth plugin namespace */
export const JWT_API = `${WP_API_BASE}/jwt-auth/v1`;
