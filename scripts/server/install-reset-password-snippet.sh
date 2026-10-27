#!/usr/bin/env bash
#
# Replaces the code of snippet 128 ("User reset password REST API route") with
# docs/reset-password-wordpress-snippet.php.
# Run as uviplay on www20:   bash ~/install-reset-password-snippet.sh
# (copy the snippet next to it first: scp docs/reset-password-wordpress-snippet.php www20:~/)
#
# Backs up the current code, lints the new one, and restores the original
# automatically if any check fails. The checks send no email: the only reset
# request goes to an account that does not exist. The new email is rendered to
# an HTML preview file instead.

sudo bash <<'ROOT'
set -u
ID=128
SRC=/home/uviplay/reset-password-wordpress-snippet.php
SITE=https://www.sczg.unizg.hr
B=/home/uviplay/app-backups/$(date +%Y-%m-%d_%H%M%S)_snippet-128
q() { mysql --connect-timeout=5 --default-character-set=utf8mb4 wordpress "$@"; }
hex() { python3 -I -c 'import sys; print(open(sys.argv[1], "rb").read().hex())' "$1"; }
# Exact stored bytes: read as HEX, because mysql adds a newline to printed values.
code_of() { q -N -e "SELECT HEX(code) FROM wp_snippets WHERE id=$ID" | python3 -I -c 'import sys; sys.stdout.buffer.write(bytes.fromhex(sys.stdin.read().strip()))'; }
same_as() { [ "$(q -N -e "SELECT SHA2(code,256) FROM wp_snippets WHERE id=$ID")" = "$(sha256sum < "$1" | cut -d' ' -f1)" ]; }
mkdir -p "$B"

echo "== Guards"
[[ -f "$SRC" ]] || { echo "missing $SRC; nothing changed"; exit 1; }
code_of > "$B/snippet-$ID-original.php"
grep -q "my_custom_api_reset_password_callback" "$B/snippet-$ID-original.php" || { echo "snippet $ID is not the reset-password route; nothing changed"; exit 1; }
q -N -e "SELECT active, scope, modified FROM wp_snippets WHERE id=$ID" > "$B/snippet-$ID-meta.txt"
MOD=$(q -N -e "SELECT modified FROM wp_snippets WHERE id=$ID")
php -l "$SRC" | grep -q "No syntax errors" || { echo "new code does not lint; nothing changed"; exit 1; }
tail -n +2 "$SRC" > "$B/snippet-$ID-new.php"      # Code Snippets stores the code without the opening <?php
LOGPOS=$(stat -c %s /var/log/apache2/error.log)
echo "ok: original backed up to $B, new code lints"

restore() {
  echo "!! $1 -> restoring original code"
  q -e "UPDATE wp_snippets SET code = CONVERT(UNHEX('$(hex "$B/snippet-$ID-original.php")') USING utf8mb4), modified = '$MOD' WHERE id = $ID"
  same_as "$B/snippet-$ID-original.php" && echo "restored." || echo "!! RESTORE MISMATCH: original is in $B"
  chown -R uviplay:uviplay "$B"
  exit 1
}

echo
echo "== Update"
q -e "UPDATE wp_snippets SET code = CONVERT(UNHEX('$(hex "$B/snippet-$ID-new.php")') USING utf8mb4), modified = UTC_TIMESTAMP() WHERE id = $ID"
same_as "$B/snippet-$ID-new.php" || restore "stored code differs from the new file"
echo "snippet $ID updated (active=$(q -N -e "SELECT active FROM wp_snippets WHERE id=$ID"))"

echo
echo "== Checks"
ok() { for i in 1 2 3; do [ "$(curl -s -o /dev/null -m 30 -w '%{http_code}' "$1")" = 200 ] && return 0; sleep 3; done; return 1; }
ok "$SITE/wp-json/" && ok "$SITE/wp-login.php" && ok "$SITE/" && echo "WordPress and site answer 200" || restore "site not answering 200"
curl -s -m 30 "$SITE/wp-json/wp/v2" | python3 -I -c '
import json, sys
r = json.load(sys.stdin)["routes"].get("/wp/v2/reset-password")
args = r["endpoints"][0]["args"] if r else {}
print("route args:", ", ".join(sorted(args)))
sys.exit(0 if "from" in args and "user_login" in args else 1)' || restore "route missing or still the old version"
body=$(curl -s -m 30 -X POST -H 'Content-Type: application/json' \
  -d "{\"user_login\":\"nobody-$(date +%s)@example.invalid\",\"from\":\"turizam\"}" "$SITE/wp-json/wp/v2/reset-password")
echo "$body" | python3 -I -c 'import json, sys; sys.exit(0 if json.load(sys.stdin).get("message", "").startswith("Ako račun postoji") else 1)' \
  && echo "unknown account: neutral answer, no email" || restore "unexpected answer: $body"

PREVIEW_TMP=$(sudo -u www-data mktemp /tmp/sc-email-preview.XXXXXX)   # www-data cannot write into $B
sudo -u www-data PREVIEW="$PREVIEW_TMP" php -d display_errors=stderr -r '
  $_SERVER["HTTP_HOST"] = "www.sczg.unizg.hr"; $_SERVER["REQUEST_URI"] = "/"; $_SERVER["SERVER_NAME"] = "www.sczg.unizg.hr";
  define("WP_USE_THEMES", false);
  require "/var/www/sc/wp-load.php";
  $ok = function_exists("sc_reset_password_email_html") && has_action("after_password_reset");
  if (function_exists("sc_reset_password_email_html")) {
    file_put_contents(getenv("PREVIEW"), sc_reset_password_email_html("ivana.horvat",
      network_site_url("wp-login.php?action=rp&key=PRIMJER&login=ivana.horvat", "login")));
  }
  echo $ok ? "email builder and after-reset redirect loaded\n" : "missing functions\n";
  exit($ok ? 0 : 1);
' 2>&1 | grep -vE "^PHP (Deprecated|Notice|Warning)|^(Deprecated|Notice|Warning):" | sed 's/^/    /'
[ "${PIPESTATUS[0]}" = 0 ] || restore "in-WordPress check failed"
mv "$PREVIEW_TMP" "$B/email-preview.html"

sleep 15
fatals=$(tail -c +$((LOGPOS + 1)) /var/log/apache2/error.log | grep -c "PHP Fatal")
echo "PHP Fatal in error.log since update: $fatals"
[ "$fatals" = 0 ] || restore "PHP fatal errors after update"

chown -R uviplay:uviplay "$B"
echo
echo "Done. Snippet $ID updated. Original code: $B/snippet-$ID-original.php"
echo "Email preview (not sent): $B/email-preview.html"
ROOT
