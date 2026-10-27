#!/usr/bin/env bash
#
# Lifts a Limit Login Attempts Reloaded lockout for one IP address, and lists
# staff accounts whose email is not @sczg.hr (read-only; Exchange only delivers
# to @sczg.hr, so those accounts never receive password emails).
#
# Run as uviplay on www20:   bash ~/unlock-login.sh <ip>
#
# Only that IP's entries are removed from the lockout, retry and retry-expiry
# lists. The three options are backed up first; nothing else is changed.

IP="${1:-}"
[[ "$IP" =~ ^[0-9a-fA-F:.]+$ ]] || { echo "Usage: bash ~/unlock-login.sh <ip>"; exit 2; }
sudo -v || exit 1

B=/home/uviplay/app-backups/$(date +%Y-%m-%d_%H%M%S)_login-lockout
mkdir -p "$B" && chmod 700 "$B"

echo "== 1. Lockout for $IP"
sudo -u www-data UNLOCK_IP="$IP" BACKUP_DIR="$B" php -d display_errors=stderr -r '
  $_SERVER["HTTP_HOST"] = "www.sczg.unizg.hr"; $_SERVER["REQUEST_URI"] = "/"; $_SERVER["SERVER_NAME"] = "www.sczg.unizg.hr";
  define("WP_USE_THEMES", false);
  require "/var/www/sc/wp-load.php";
  $ip = getenv("UNLOCK_IP"); $dir = getenv("BACKUP_DIR");
  $app = get_option("limit_login_active_app", "local");
  echo "   limiter mode: $app\n";
  if ($app !== "local") echo "   !! cloud mode: lockouts may also be held by the cloud service\n";
  $names = array("limit_login_lockouts", "limit_login_retries", "limit_login_retries_valid");
  $backup = array();
  foreach ($names as $n) { $backup[$n] = get_option($n); }
  file_put_contents("$dir/options.json", json_encode($backup, JSON_PRETTY_PRINT));
  $changed = 0;
  foreach ($names as $n) {
    $v = get_option($n);
    if (!is_array($v) || !array_key_exists($ip, $v)) { echo "   $n: no entry for $ip\n"; continue; }
    $info = is_numeric($v[$ip]) && $v[$ip] > 1000000000 ? "until " . gmdate("Y-m-d H:i", (int)$v[$ip]) . " UTC" : "value " . json_encode($v[$ip]);
    unset($v[$ip]);
    update_option($n, $v);
    echo "   $n: removed entry for $ip ($info)\n";
    $changed++;
  }
  $still = get_option("limit_login_lockouts");
  echo "   now locked out: " . ((is_array($still) && isset($still[$ip]) && time() < $still[$ip]) ? "YES" : "no") . "\n";
  echo $changed ? "   unlocked.\n" : "   nothing to remove: $ip was not locked out by this plugin.\n";
' 2>&1 | grep -vE "^PHP (Deprecated|Notice|Warning)|^(Deprecated|Notice|Warning):"
echo "   backup of the three options: $B/options.json"
sudo chown -R uviplay:uviplay "$B"

echo
echo "== 2. Staff accounts whose email is not @sczg.hr (read-only)"
sudo mysql -N -B wordpress -e "
  SELECT u.ID, u.user_login,
         CONCAT(LEFT(u.user_email,2),'***@',SUBSTRING_INDEX(u.user_email,'@',-1)),
         m.meta_value
  FROM wp_users u JOIN wp_usermeta m ON m.user_id=u.ID AND m.meta_key='wp_capabilities'
  WHERE u.user_email NOT LIKE '%@sczg.hr' AND m.meta_value NOT IN ('a:0:{}', '')
  ORDER BY u.ID" \
| php -r '
  $n = 0;
  while (($l = fgets(STDIN)) !== false) {
    [$id, $login, $mail, $caps] = explode("\t", rtrim($l, "\n"));
    $r = @unserialize($caps); $roles = is_array($r) ? implode(",", array_keys(array_filter($r))) : "";
    if ($roles === "" ) continue;
    printf("   %-5s %-26s %-30s %s\n", $id, $login, $mail, $roles); $n++;
  }
  echo $n ? "   $n account(s) cannot receive password emails.\n" : "   none: every account with a role uses @sczg.hr.\n";
'

echo
echo "Done."
