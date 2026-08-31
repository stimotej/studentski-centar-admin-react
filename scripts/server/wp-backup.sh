#!/usr/bin/env bash
#
# Backup for the Studentski centar WordPress install on www20.
#
#   sudo bash wp-backup.sh db      # database only  (~1 min, ~80 MB)
#   sudo bash wp-backup.sh full    # database + files (~15 min, ~6 GB)
#
# Runs as root and uses MySQL socket authentication, so no database password
# is stored anywhere. Never deletes anything — prune old backups by hand.
#
# See docs/BACKUP-RESTORE.md in the studentski-centar-admin-react repo.

set -euo pipefail

MODE="${1:-db}"

WPROOT="/var/www/sc"
DBNAME="wordpress"
BACKUP_ROOT="/var/backups/sc"
CHARSET="utf8mb3"

# Content tables. Dumped a second time on their own so a bad content migration
# can be rolled back without touching users, sessions, or plugin settings.
CONTENT_TABLES="wp_posts wp_postmeta wp_terms wp_termmeta wp_term_relationships wp_term_taxonomy"

if [[ "$MODE" != "db" && "$MODE" != "full" ]]; then
  echo "Usage: sudo bash wp-backup.sh [db|full]" >&2
  exit 2
fi

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Must run as root (use sudo) — it needs socket auth and read access to $WPROOT." >&2
  exit 2
fi

STAMP="$(date +%Y-%m-%d_%H%M%S)"
DEST="$BACKUP_ROOT/${STAMP}_${MODE}"
mkdir -p "$DEST"

echo "Backing up to $DEST"
echo

DUMP_OPTS=(
  --single-transaction      # consistent snapshot without locking the live site
  --quick                   # stream rows rather than buffering them in RAM
  --hex-blob                # serialised WP data survives verbatim
  --routines --triggers --events
  --no-tablespaces
  --default-character-set="$CHARSET"
)

echo "[1] Full database ..."
mysqldump "${DUMP_OPTS[@]}" "$DBNAME" | gzip > "$DEST/database-full.sql.gz"

echo "[2] Content tables only ..."
# shellcheck disable=SC2086
mysqldump "${DUMP_OPTS[@]}" "$DBNAME" $CONTENT_TABLES \
  | gzip > "$DEST/database-content.sql.gz"

echo "[3] Code snippets (custom REST API lives here) ..."
mysqldump "${DUMP_OPTS[@]}" "$DBNAME" wp_snippets \
  | gzip > "$DEST/database-snippets.sql.gz"

if [[ "$MODE" == "full" ]]; then
  echo "[4] Files (this takes a while) ..."
  tar -czf "$DEST/files.tar.gz" \
    --exclude="wp-content/cache" \
    --exclude="wp-content/et-cache" \
    --exclude="wp-content/upgrade" \
    --exclude="wp-content/upgrade-temp-backup" \
    --exclude="wp-content/ai1wm-backups" \
    --exclude="wp-content/aiowps_backups" \
    -C "$(dirname "$WPROOT")" "$(basename "$WPROOT")"
fi

echo
echo "[5] Verifying archives ..."
FAILED=0
for archive in "$DEST"/*.gz; do
  if gzip -t "$archive" 2>/dev/null; then
    echo "    ok   $(basename "$archive")"
  else
    echo "    FAIL $(basename "$archive")"
    FAILED=1
  fi
done

# A truncated mysqldump still gunzips cleanly. The trailing marker is the only
# reliable proof the dump ran to completion.
for dump in "$DEST"/database-*.sql.gz; do
  if zcat "$dump" | tail -5 | grep -q "Dump completed"; then
    echo "    ok   $(basename "$dump") is complete"
  else
    echo "    FAIL $(basename "$dump") is TRUNCATED — do not trust it"
    FAILED=1
  fi
done

echo
echo "[6] Manifest ..."
{
  echo "taken_at:  $(date -Is)"
  echo "host:      $(hostname)"
  echo "mode:      $MODE"
  echo "wp_root:   $WPROOT"
  echo "database:  $DBNAME"
  echo "charset:   $CHARSET"
  echo "mysql:     $(mysql --version)"
  echo
  echo "posts:     $(mysql -N -B -e "SELECT COUNT(*) FROM $DBNAME.wp_posts;")"
  echo "postmeta:  $(mysql -N -B -e "SELECT COUNT(*) FROM $DBNAME.wp_postmeta;")"
  echo "snippets:  $(mysql -N -B -e "SELECT COUNT(*) FROM $DBNAME.wp_snippets;")"
  echo "users:     $(mysql -N -B -e "SELECT COUNT(*) FROM $DBNAME.wp_users;")"
  echo
  echo "files:"
  ls -lh "$DEST" | tail -n +2
  echo
  echo "sha256:"
  (cd "$DEST" && sha256sum ./*.gz)
} > "$DEST/MANIFEST.txt"

cat "$DEST/MANIFEST.txt"

# The script runs as root, so everything it writes is root-owned and a plain
# `rsync` from your Mac (which connects as your login user) cannot read it.
# Hand the backup to whoever invoked sudo. Mode stays 700 — still private.
if [[ -n "${SUDO_USER:-}" ]]; then
  chown -R "$SUDO_USER":"$(id -gn "$SUDO_USER")" "$DEST"
fi

echo
if [[ "$FAILED" -ne 0 ]]; then
  echo "!! ONE OR MORE ARCHIVES FAILED VERIFICATION — this backup is not usable."
  exit 1
fi

echo "Backup complete: $DEST"
echo
echo "Now copy it off this server. From your Mac:"
echo "  rsync -avP uviplay@www20:$DEST/ ~/sc-backups/${STAMP}_${MODE}/"
echo
df -h / | tail -1
