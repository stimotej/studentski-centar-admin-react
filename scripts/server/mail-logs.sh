#!/usr/bin/env bash
#
# Read-only: what WordPress has sent and what failed.
# Run as uviplay on www20:   bash ~/mail-logs.sh
#
#   1. WP Mail SMTP's error log (failed sends, with the SMTP server's answer)
#   2. The activity log's "email sent" entries: totals, by subject, by recipient
#      domain, and the turizam contact form over time
#   3. Contact form submissions in the Apache log and what WordPress answered
#   4. How snippet 178 (the contact form) builds and sends its email
#
# Changes nothing. Email addresses are masked (first two characters + domain).

sudo bash <<'ROOT'
q() { mysql -N -B --default-character-set=utf8mb4 wordpress -e "$1"; }
mask() { sed -E 's/([A-Za-z0-9._%+-]{2})[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+)/\1***@\2/g'; }

echo "== 1. WP Mail SMTP error log"
if [[ -n "$(q "SHOW TABLES LIKE 'wp_wpmailsmtp_debug_events'")" ]]; then
  echo "   entries: $(q "SELECT COUNT(*) FROM wp_wpmailsmtp_debug_events"), first: $(q "SELECT MIN(created_at) FROM wp_wpmailsmtp_debug_events"), last: $(q "SELECT MAX(created_at) FROM wp_wpmailsmtp_debug_events")"
  echo "   most common errors:"
  q "SELECT COUNT(*), LEFT(REPLACE(REPLACE(content, '\n', ' '), '\r', ''), 170) AS msg FROM wp_wpmailsmtp_debug_events GROUP BY msg ORDER BY COUNT(*) DESC LIMIT 12" | mask | sed 's/^/     /'
  echo "   latest 15:"
  q "SELECT created_at, event_type, LEFT(REPLACE(REPLACE(content, '\n', ' '), '\r', ''), 200) FROM wp_wpmailsmtp_debug_events ORDER BY id DESC LIMIT 15" | mask | sed 's/^/     /'
else
  echo "   (no wp_wpmailsmtp_debug_events table)"
fi
echo "   last error kept in options:"
q "SELECT option_name, LEFT(option_value, 300) FROM wp_options WHERE option_name IN ('wp_mail_smtp_debug','wp_mail_smtp_debug_events_db_version')" | mask | sed 's/^/     /'

echo
echo "== 2. Activity log: emails WordPress handed to the mail server (event 6061)"
range=$(q "SELECT CONCAT(FROM_UNIXTIME(MIN(created_on),'%Y-%m-%d'), ' .. ', FROM_UNIXTIME(MAX(created_on),'%Y-%m-%d')) FROM wp_wsal_occurrences")
echo "   activity log covers: $range"
echo "   sent emails: $(q "SELECT COUNT(*) FROM wp_wsal_occurrences WHERE alert_id=6061")"
echo "   by subject (top 20):"
q "SELECT COUNT(*), MAX(FROM_UNIXTIME(o.created_on,'%Y-%m-%d')), LEFT(m.value, 90)
   FROM wp_wsal_occurrences o JOIN wp_wsal_metadata m ON m.occurrence_id=o.id AND m.name='EmailSubject'
   WHERE o.alert_id=6061 GROUP BY m.value ORDER BY COUNT(*) DESC LIMIT 20" \
  | awk -F'\t' '{ printf "     %5s  last %s  %s\n", $1, $2, $3 }'
echo "   by recipient domain:"
q "SELECT COUNT(*), SUBSTRING_INDEX(m.value,'@',-1)
   FROM wp_wsal_occurrences o JOIN wp_wsal_metadata m ON m.occurrence_id=o.id AND m.name='EmailAddress'
   WHERE o.alert_id=6061 GROUP BY SUBSTRING_INDEX(m.value,'@',-1) ORDER BY COUNT(*) DESC LIMIT 12" \
  | awk -F'\t' '{ printf "     %5s  @%s\n", $1, $2 }'
echo "   emails to turizam@sczg.hr, per month:"
q "SELECT FROM_UNIXTIME(o.created_on,'%Y-%m'), COUNT(*)
   FROM wp_wsal_occurrences o JOIN wp_wsal_metadata m ON m.occurrence_id=o.id AND m.name='EmailAddress'
   WHERE o.alert_id=6061 AND m.value LIKE '%turizam@sczg.hr%' GROUP BY 1 ORDER BY 1" \
  | awk -F'\t' '{ printf "     %s  %s\n", $1, $2 }'
echo "   latest 10 emails to turizam@sczg.hr:"
q "SELECT FROM_UNIXTIME(o.created_on), LEFT(MAX(CASE WHEN m.name='EmailSubject' THEN m.value END), 80)
   FROM wp_wsal_occurrences o JOIN wp_wsal_metadata m ON m.occurrence_id=o.id
   WHERE o.alert_id=6061 AND o.id IN (SELECT occurrence_id FROM wp_wsal_metadata WHERE name='EmailAddress' AND value LIKE '%turizam@sczg.hr%')
   GROUP BY o.id ORDER BY o.created_on DESC LIMIT 10" | sed 's/^/     /'

echo
echo "== 3. Contact form submissions (Apache log, all retained days)"
zcat -f /var/log/apache2/access.log* | grep -E '"POST /wp-json/wp/v2/contact/(turizam|najam)/submit' \
  | awk '{ split($4, d, /[\[:]/); print d[2], $7, $9 }' | sort | uniq -c | sort -k2 | sed 's/^/   /' | tail -40
echo "   (count, day, route, HTTP status WordPress returned)"

echo
echo "== 4. Snippet 178 (contact form): how it sends"
q "SELECT CONCAT('active=', active, '  name=', name) FROM wp_snippets WHERE id=178" | sed 's/^/   /'
q "SELECT code FROM wp_snippets WHERE id=178" | sed 's/\\n/\n/g; s/\\t/    /g' \
  | grep -nE 'wp_mail|\$to|\$subject|headers|From:|Reply-To|return|WP_Error|sent' | head -25 | sed 's/^/   | /'

echo
echo "Done. Nothing was changed."
ROOT
