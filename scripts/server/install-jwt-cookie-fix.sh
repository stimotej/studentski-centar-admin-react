#!/usr/bin/env bash
#
# Fixes /zaposlenici failing with 401 rest_not_logged_in / 400 rest_forbidden_status
# when the browser also holds WordPress login cookies:
#   - updates snippet "Change password REST API route" so a password change sets no cookies
#   - adds snippet "REST: JWT takes precedence over login cookies"
# Run as uviplay on www20:   bash ~/install-jwt-cookie-fix.sh
# (copy first: scp docs/change-password-wordpress-snippet.php docs/jwt-over-cookies-wordpress-snippet.php www20:~/)
#
# Backs up the changed snippet, lints both, and on any failed check restores the
# old code and removes the new snippet. Test requests change no password.

sudo bash <<'ROOT'
set -u
CP_NAME="Change password REST API route"
NEW_NAME="REST: JWT takes precedence over login cookies"
CP_SRC=/home/uviplay/change-password-wordpress-snippet.php
NEW_SRC=/home/uviplay/jwt-over-cookies-wordpress-snippet.php
SITE=https://www.sczg.unizg.hr
B=/home/uviplay/app-backups/$(date +%Y-%m-%d_%H%M%S)_jwt-cookie-fix
q() { mysql --connect-timeout=5 --default-character-set=utf8mb4 wordpress "$@"; }
hex() { python3 -I -c 'import sys; print(open(sys.argv[1], "rb").read().hex())' "$1"; }
code_of() { q -N -e "SELECT HEX(code) FROM wp_snippets WHERE id=$1" | python3 -I -c 'import sys; sys.stdout.buffer.write(bytes.fromhex(sys.stdin.read().strip()))'; }
same_as() { [ "$(q -N -e "SELECT SHA2(code,256) FROM wp_snippets WHERE id=$1")" = "$(sha256sum < "$2" | cut -d' ' -f1)" ]; }
mkdir -p "$B"

echo "== Guards"
for f in "$CP_SRC" "$NEW_SRC"; do
  [[ -f "$f" ]] || { echo "missing $f; nothing changed"; exit 1; }
  php -l "$f" | grep -q "No syntax errors" || { echo "$f does not lint; nothing changed"; exit 1; }
done
CP_ID=$(q -N -e "SELECT id FROM wp_snippets WHERE name='$CP_NAME'")
[[ -n "$CP_ID" ]] || { echo "snippet '$CP_NAME' not found; nothing changed"; exit 1; }
[[ "$(q -N -e "SELECT COUNT(*) FROM wp_snippets WHERE name='$NEW_NAME'")" == 0 ]] || { echo "'$NEW_NAME' already exists; nothing changed"; exit 1; }
code_of "$CP_ID" > "$B/snippet-$CP_ID-original.php"
CP_MOD=$(q -N -e "SELECT modified FROM wp_snippets WHERE id=$CP_ID")
tail -n +2 "$CP_SRC"  > "$B/snippet-$CP_ID-new.php"
tail -n +2 "$NEW_SRC" > "$B/jwt-over-cookies.php"
STAFF_ID=$(q -N -e "SELECT ID FROM wp_users WHERE user_login='katarina.tackovic'")
LOGPOS=$(stat -c %s /var/log/apache2/error.log)
echo "ok: both lint; snippet $CP_ID backed up to $B; test user $STAFF_ID"

NEW_ID=""
rollback() {
  echo "!! $1 -> rolling back"
  q -e "UPDATE wp_snippets SET code = CONVERT(UNHEX('$(hex "$B/snippet-$CP_ID-original.php")') USING utf8mb4), modified = '$CP_MOD' WHERE id = $CP_ID"
  same_as "$CP_ID" "$B/snippet-$CP_ID-original.php" && echo "snippet $CP_ID restored" || echo "!! restore mismatch: original in $B"
  [[ -n "$NEW_ID" ]] && q -e "DELETE FROM wp_snippets WHERE id=$NEW_ID" && echo "snippet $NEW_ID removed"
  chown -R uviplay:uviplay "$B"
  exit 1
}

echo
echo "== Update and insert"
q -e "UPDATE wp_snippets SET code = CONVERT(UNHEX('$(hex "$B/snippet-$CP_ID-new.php")') USING utf8mb4), modified = UTC_TIMESTAMP() WHERE id = $CP_ID"
same_as "$CP_ID" "$B/snippet-$CP_ID-new.php" || rollback "snippet $CP_ID stored code differs"
echo "snippet $CP_ID updated"
q -e "INSERT INTO wp_snippets (name, description, code, tags, scope, priority, active, modified)
      VALUES ('$NEW_NAME', 'With an Authorization: Bearer header, WordPress login cookies are ignored for that request, so the /zaposlenici admin keeps working when the browser is also logged into wp-admin.',
              CONVERT(UNHEX('$(hex "$B/jwt-over-cookies.php")') USING utf8mb4), 'auth, rest', 'global', 10, 1, UTC_TIMESTAMP())"
NEW_ID=$(q -N -e "SELECT id FROM wp_snippets WHERE name='$NEW_NAME'")
same_as "$NEW_ID" "$B/jwt-over-cookies.php" || rollback "new snippet stored code differs"
echo "snippet $NEW_ID \"$NEW_NAME\" inserted (active)"

echo
echo "== Checks"
ok() { for i in 1 2 3; do [ "$(curl -s -o /dev/null -m 30 -w '%{http_code}' "$1")" = 200 ] && return 0; sleep 3; done; return 1; }
ok "$SITE/" && ok "$SITE/wp-json/" && ok "$SITE/wp-login.php" && ok "$SITE/wp-json/wp/v2/posts?per_page=1&_fields=id" \
  && echo "site, REST and wp-login answer 200" || rollback "site not answering 200"
bad=$(curl -s -m 30 -H 'Authorization: Bearer not-a-real-token' -w ' %{http_code}' "$SITE/wp-json/wp/v2/users/me")
echo "$bad" | grep -qE 'jwt_auth_[a-z_]+.* 403$' && echo "bad token still refused by the JWT plugin (403)" || rollback "bad token answer: $bad"

check_php() {
  sudo -u www-data env "$@" php -d display_errors=stderr -r '
    $_SERVER["HTTP_HOST"] = "www.sczg.unizg.hr"; $_SERVER["REQUEST_URI"] = "/wp-json/"; $_SERVER["SERVER_NAME"] = "www.sczg.unizg.hr";
    define("WP_USE_THEMES", false);
    require "/var/www/sc/wp-load.php";
    echo has_filter("determine_current_user", "wp_validate_auth_cookie") === false ? "off" : "on";
  ' 2>/dev/null | tail -c 3
}
with=$(check_php HTTP_AUTHORIZATION="Bearer test")
without=$(check_php X_NONE=1)
echo "cookie login with Bearer header: $with, without: $without"
[ "$with" = "off" ] && [ "$without" = "on" ] || rollback "cookie switch-off not behaving as expected"

sudo -u www-data STAFF_ID="$STAFF_ID" php -d display_errors=stderr -r '
  $_SERVER["HTTP_HOST"] = "www.sczg.unizg.hr"; $_SERVER["REQUEST_URI"] = "/"; $_SERVER["SERVER_NAME"] = "www.sczg.unizg.hr";
  define("WP_USE_THEMES", false);
  require "/var/www/sc/wp-load.php";
  $id = (int) getenv("STAFF_ID");
  wp_set_current_user($id);
  $r = new WP_REST_Request("POST", "/sc/v1/change-password");
  $r->set_body_params(array("current_password" => wp_generate_password(32), "new_password" => "irrelevant-123"));
  $res = rest_do_request($r); $d = $res->get_data();
  delete_transient("sc_change_password_fails_" . $id);
  printf("change-password, wrong current password: %d %s\n", $res->get_status(), $d["code"] ?? "");
  exit(($res->get_status() === 403 && ($d["code"] ?? "") === "sc_incorrect_password") ? 0 : 1);
' 2>&1 | grep -vE "^PHP (Deprecated|Notice|Warning)|^(Deprecated|Notice|Warning):" | sed 's/^/    /'
[ "${PIPESTATUS[0]}" = 0 ] || rollback "change-password endpoint check failed"

sleep 15
fatals=$(tail -c +$((LOGPOS + 1)) /var/log/apache2/error.log | grep -c "PHP Fatal")
echo "PHP Fatal in error.log since change: $fatals"
[ "$fatals" = 0 ] || rollback "PHP fatal errors after change"

chown -R uviplay:uviplay "$B"
echo
echo "Done. Snippet $CP_ID updated, snippet $NEW_ID added. Backup: $B"
echo "Undo the new one: sudo mysql wordpress -e \"UPDATE wp_snippets SET active=0 WHERE id=$NEW_ID\""
ROOT
