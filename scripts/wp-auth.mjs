/**
 * Authenticated headers for the WordPress REST API.
 *
 * This site runs the JWT auth plugin, which claims the `Authorization` header
 * and rejects anything that is not `Bearer <token>` with
 * `jwt_auth_bad_auth_header`. So HTTP Basic — the normal way to use a WordPress
 * Application Password — does not work here at all.
 *
 * The application password does work as the password in a JWT token exchange,
 * so that is what this does: swap credentials for a token once, then send
 * Bearer on every request.
 */

const stripTrailingSlash = (v = "") => v.replace(/\/+$/, "");

export const apiBase = () =>
  stripTrailingSlash(process.env.WP_API_BASE || "https://www.sczg.unizg.hr/wp-json");

/**
 * @returns {Promise<{headers: object, user: string, roles: string[]}>}
 */
export async function authenticate({ user, password } = {}) {
  const username = user ?? process.env.WP_USER;
  const secret = password ?? process.env.WP_APP_PASSWORD;

  if (!username || !secret) {
    throw new Error("WP_USER and WP_APP_PASSWORD are required for authenticated requests.");
  }

  const res = await fetch(`${apiBase()}/jwt-auth/v1/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password: secret }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.token) {
    const reason = String(body.message ?? res.status).replace(/<[^>]+>/g, " ").trim();
    throw new Error(`WordPress auth failed: ${reason}`);
  }

  return {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${body.token}`,
    },
    user: body.user_display_name || body.user_nicename || username,
    roles: body.user_roles ?? [],
  };
}

export default authenticate;
