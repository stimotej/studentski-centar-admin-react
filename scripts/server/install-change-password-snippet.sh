#!/usr/bin/env bash
#
# Installs docs/change-password-wordpress-snippet.php as a new Code Snippets row.
# Run as uviplay on www20:   bash ~/install-change-password-snippet.sh
# (copy the snippet next to it first: scp docs/change-password-wordpress-snippet.php www20:~/)
#
# Guards: aborts if a snippet with this name exists, lints the code first.
# Checks after insert, and deletes the new row automatically if any fails:
#   - WordPress still answers 200, the new route is registered, anonymous calls get 401
#   - inside WordPress, as a non-admin: users/me { password } is refused (403), and
#     the new endpoint refuses a wrong current password (403)
#   - as an administrator: users/me is not blocked
# Test requests cannot change a password (wrong current password / empty new one),
# and both test users' password hashes are compared before and after.

sudo bash <<'ROOT'
set -u
NAME="Change password REST API route"
SRC=/home/uviplay/change-password-wordpress-snippet.php
SITE=https://www.sczg.unizg.hr
q() { mysql --connect-timeout=5 --default-character-set=utf8mb4 wordpress "$@"; }
T=$(mktemp -d /tmp/cp-snippet.XXXXXX)
trap 'rm -rf "$T"' EXIT

echo "== Guards"
[[ -f "$SRC" ]] || { echo "missing $SRC; nothing changed"; exit 1; }
[[ "$(q -N -e "SELECT COUNT(*) FROM wp_snippets WHERE name='$NAME'")" == 0 ]] || { echo "a snippet named '$NAME' already exists; nothing changed"; exit 1; }
php -l "$SRC" | grep -q "No syntax errors" || { echo "snippet does not lint; nothing changed"; exit 1; }
tail -n +2 "$SRC" > "$T/code.php"     # Code Snippets stores the code without the opening <?php
HEX=$(python3 -I -c 'import sys; print(open(sys.argv[1], "rb").read().hex())' "$T/code.php")
LOGPOS=$(stat -c %s /var/log/apache2/error.log)
ADMIN_ID=$(q -N -e "SELECT u.ID FROM wp_users u JOIN wp_usermeta m ON m.user_id=u.ID AND m.meta_key='wp_capabilities' WHERE m.meta_value LIKE '%\"administrator\"%' ORDER BY u.ID LIMIT 1")
STAFF_ID=$(q -N -e "SELECT ID FROM wp_users WHERE user_login='katarina.tackovic'")
echo "ok: name free, code lints; test users admin=$ADMIN_ID non-admin=$STAFF_ID"
hashes() { q -N -e "SELECT ID, SHA2(user_pass,256) FROM wp_users WHERE ID IN ($ADMIN_ID,$STAFF_ID) ORDER BY ID"; }
hashes > "$T/hash-before"

echo
echo "== Insert"
q -e "INSERT INTO wp_snippets (name, description, code, tags, scope, priority, active, modified)
      VALUES ('$NAME', 'POST /sc/v1/change-password with the current password checked on the server; blocks password changes via /wp/v2/users for non-admins. Used by the admin Moj profil page.',
              CONVERT(UNHEX('$HEX') USING utf8mb4), 'auth, rest', 'global', 10, 1, UTC_TIMESTAMP())"
NEW_ID=$(q -N -e "SELECT id FROM wp_snippets WHERE name='$NAME'")
echo "inserted snippet id $NEW_ID (active)"

rollback() {
  echo "!! $1 -> removing snippet $NEW_ID"
  q -e "DELETE FROM wp_snippets WHERE id=$NEW_ID"
  echo "removed. Site is back to before."
  exit 1
}

echo
echo "== Checks"
ok() { for i in 1 2 3; do [ "$(curl -s -o /dev/null -m 30 -w '%{http_code}' "$1")" = 200 ] && return 0; sleep 3; done; return 1; }
ok "$SITE/wp-json/" && ok "$SITE/wp-login.php" && ok "$SITE/" && echo "WordPress and site answer 200" || rollback "site not answering 200"
curl -s -m 30 "$SITE/wp-json/sc/v1" | grep -q '"\\/sc\\/v1\\/change-password"' && echo "route /sc/v1/change-password registered" || rollback "route not registered"
anon=$(curl -s -o /dev/null -m 30 -w '%{http_code}' -X POST -H 'Content-Type: application/json' -d '{"current_password":"x","new_password":"y"}' "$SITE/wp-json/sc/v1/change-password")
[ "$anon" = 401 ] && echo "anonymous call refused (401)" || rollback "anonymous call returned $anon"

sudo -u www-data ADMIN_ID="$ADMIN_ID" STAFF_ID="$STAFF_ID" php -d display_errors=stderr -r '
  $_SERVER["HTTP_HOST"] = "www.sczg.unizg.hr"; $_SERVER["REQUEST_URI"] = "/"; $_SERVER["SERVER_NAME"] = "www.sczg.unizg.hr";
  define("WP_USE_THEMES", false);
  require "/var/www/sc/wp-load.php";
  $staff = (int) getenv("STAFF_ID"); $admin = (int) getenv("ADMIN_ID");
  $call = function ($user, $method, $route, $params) {
    wp_set_current_user($user);
    $r = new WP_REST_Request($method, $route);
    $r->set_body_params($params);
    $res = rest_do_request($r);
    $d = $res->get_data();
    return array($res->get_status(), is_array($d) ? ($d["code"] ?? "") : "");
  };
  $fail = 0;
  [$s, $c] = $call($staff, "POST", "/wp/v2/users/me", array("password" => ""));
  printf("non-admin users/me password: %d %s\n", $s, $c); if ($s !== 403 || $c !== "sc_password_change_disabled") $fail = 1;
  [$s, $c] = $call($staff, "POST", "/sc/v1/change-password", array("current_password" => wp_generate_password(32), "new_password" => "irrelevant-123"));
  printf("non-admin wrong current password: %d %s\n", $s, $c); if ($s !== 403 || $c !== "sc_incorrect_password") $fail = 1;
  delete_transient("sc_change_password_fails_" . $staff);
  [$s, $c] = $call($admin, "POST", "/wp/v2/users/me", array("password" => ""));
  printf("admin users/me empty password: %d %s (must not be sc_password_change_disabled)\n", $s, $c); if ($c === "sc_password_change_disabled") $fail = 1;
  exit($fail);
' 2>&1 | grep -vE "^PHP (Deprecated|Notice|Warning)|^(Deprecated|Notice|Warning):" | sed 's/^/    /'
[ "${PIPESTATUS[0]}" = 0 ] && echo "in-WordPress checks passed" || rollback "in-WordPress checks failed"

hashes > "$T/hash-after"
cmp -s "$T/hash-before" "$T/hash-after" && echo "test users' passwords unchanged" || rollback "a test user's password hash changed"

sleep 20
tail -c +$((LOGPOS + 1)) /var/log/apache2/error.log > "$T/new.log"
fatals=$(grep -c "PHP Fatal" "$T/new.log")
echo "PHP Fatal in error.log since insert: $fatals"
[ "$fatals" = 0 ] || { grep "PHP Fatal" "$T/new.log" | head -3; rollback "PHP fatal errors after insert"; }

echo
echo "Done. Snippet $NEW_ID \"$NAME\" is active."
echo "To remove: sudo mysql wordpress -e \"UPDATE wp_snippets SET active=0 WHERE id=$NEW_ID\""
ROOT
