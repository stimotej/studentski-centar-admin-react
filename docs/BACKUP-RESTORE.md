# WordPress backup and restore — sczg.unizg.hr

Your way out. Written against the real server as surveyed on 2026-08-14.

**If something has already gone wrong, skip to [Restore](#restore).**

---

## The server

| | |
|---|---|
| Host | `www20`, Ubuntu 22.04, SSH as `uviplay` |
| WordPress root | `/var/www/sc` (6.3 GB) |
| Database | MySQL 8.0.46, db `wordpress`, prefix `wp_`, **charset `utf8mb3_unicode_ci`** |
| DB size | 406 MB (186 MB of it is `wp_wsal` audit log) |
| uploads | 5.7 GB · plugins 349 MB · themes 88 MB |
| Web | Apache 2.4.52 + PHP 8.1, vhost `sc.conf` |
| Frontends | PM2: `sczg` ×4, `teatar-td`, `turizam`, `eventi`, `catering`, `zaposlenici` |
| Disk free | 49 GB of 96 GB |

**`sudo mysql` works without a password** (MySQL socket auth as root). No database
password is stored in any script here, and you never need to type one.

### What lives where

Restoring one half without the other does not give you a working site.

| Where | What's in it |
|---|---|
| **Database** | Every post, page, obavijest, event, job, product, menu · all `sadrzaj`/`kontakt`/`image_groups` meta · categories · users and roles · plugin settings · **the 104 rows of `wp_snippets`, which are your `sc/v1` REST endpoints and custom meta registration** |
| **Filesystem** | The actual images and PDFs in `wp-content/uploads` · plugin and theme code · `wp-config.php` · `.htaccess` |

The custom API is **PHP stored in a database table**, not files. A files-only
backup restores a site with no custom endpoints. This is the single most
important thing to understand about this install.

---

## Install the script

One time:

```bash
# on your Mac, from the repo
scp scripts/server/wp-backup.sh uviplay@www20:~/

# on the server
sudo mkdir -p /var/backups/sc
sudo chown uviplay:uviplay /var/backups/sc && sudo chmod 700 /var/backups/sc
```

The directory is owned by your login user, not root, so `rsync` can read it
when you pull backups to your Mac. The script runs as root but hands each
finished backup back to whoever invoked `sudo`. Mode `700` keeps it private.

---

## Backup

Two modes, for two different purposes.

### Fast — database only

**~1 minute, ~80 MB.** This is the one you run constantly. Run it **before every
translation section**, and before any bulk write.

```bash
sudo bash ~/wp-backup.sh db
```

It never locks the site (`--single-transaction`), so it is safe during the day.

### Full — database and files

**~15 minutes, ~6 GB.** Run once now as your baseline, then monthly, and before
anything that touches plugins, themes, or uploads.

```bash
sudo bash ~/wp-backup.sh full
```

Cache directories are excluded — they regenerate.

### What you get

```
/var/backups/sc/2026-08-14_143000_db/
├── database-full.sql.gz       everything
├── database-content.sql.gz    posts, postmeta, terms — the surgical restore
├── database-snippets.sql.gz   wp_snippets alone
├── files.tar.gz               (full mode only)
└── MANIFEST.txt               row counts, sizes, sha256
```

The script verifies each archive and **fails loudly if a dump is truncated**. A
truncated `.sql.gz` still decompresses cleanly, so the trailing `Dump completed`
marker is the only real proof — that check is why you can trust the output.

### Get it off the server

A backup on the same disk as the thing it protects is not a backup. From your Mac:

```bash
mkdir -p ~/sc-backups
rsync -avP uviplay@www20:/var/backups/sc/2026-08-14_143000_db/ \
           ~/sc-backups/2026-08-14_143000_db/
```

If rsync fails with `change_dir ... Permission denied (13)`, the backup is
root-owned — an older run, or the directory was created as root. Fix it once:

```bash
sudo chown -R uviplay:uviplay /var/backups/sc
```

Keep the last 2–3 on the server, everything else on your Mac or in cloud storage.
**The script never deletes anything.** Prune by hand when disk gets tight:

```bash
sudo ls -la /var/backups/sc          # look first
sudo rm -rf /var/backups/sc/2026-01-*  # then remove named directories
```

---

## Verify a backup before you trust it

Do this on any backup you might actually restore from — especially your first.

```bash
cd /var/backups/sc/<timestamp>

# 1. archives are intact
gzip -t *.gz && echo "archives OK"

# 2. dumps ran to completion
zcat database-full.sql.gz | tail -3 | grep "Dump completed"

# 3. the tables you care about are present
zcat database-full.sql.gz | grep -c "^CREATE TABLE"

# 4. Croatian diacritics survived — the classic failure mode
zcat database-content.sql.gz | grep -o "Lašćina" | head -1
zcat database-content.sql.gz | grep -o "Stjepan Radić" | head -1

# 5. the custom API is in there
zcat database-snippets.sql.gz | grep -c "INSERT INTO"
```

Running these on your Mac instead of the server? Use `gzcat` in place of
`zcat` — macOS ships a different `zcat` that does not always read `.gz`.

Step 4 is the one that matters most. If those words come back as `LaÅ¡Äina`,
the charset is wrong and **that backup will corrupt every Croatian page on
restore**. Stop and fix the dump before relying on it.

---

## Restore

> Every restore below **overwrites live data**. Take a fresh backup first, even
> if things are already broken — it is your only way back to the current state,
> broken or not.
>
> ```bash
> sudo bash ~/wp-backup.sh db
> ```

Pick the smallest hammer that fixes your problem.

### A0. One single post — zero blast radius

**Use when:** one post got mangled — a translation wrote to the wrong field, a
title got overwritten, meta went missing. **This is the most likely thing you
will need during the i18n work.**

Nothing outside that one post is touched. No other post reverts, nobody is
logged out, and editors can keep working while you do it.

It works by loading the backup into a scratch database and copying one post
across:

```bash
cd /var/backups/sc/<good-timestamp>
POST_ID=58004        # <-- the post to restore

# 1. load the backup beside the live database
sudo mysql -e "DROP DATABASE IF EXISTS wp_restore;
               CREATE DATABASE wp_restore CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci;"
zcat database-content.sql.gz | sudo mysql --default-character-set=utf8mb3 wp_restore

# 2. check you are about to restore what you think you are
sudo mysql --default-character-set=utf8mb3 -e "
  SELECT ID, post_title, post_status, post_modified
    FROM wp_restore.wp_posts WHERE ID=$POST_ID;"

# 3. copy the post row and its meta across
sudo mysql --default-character-set=utf8mb3 -e "
  DELETE FROM wordpress.wp_posts    WHERE ID=$POST_ID;
  INSERT INTO wordpress.wp_posts    SELECT * FROM wp_restore.wp_posts WHERE ID=$POST_ID;
  DELETE FROM wordpress.wp_postmeta WHERE post_id=$POST_ID;
  INSERT INTO wordpress.wp_postmeta (post_id, meta_key, meta_value)
    SELECT post_id, meta_key, meta_value
      FROM wp_restore.wp_postmeta WHERE post_id=$POST_ID;"

# 4. clean up the scratch database
sudo mysql -e "DROP DATABASE wp_restore;"
```

Step 2 is not optional — it is your chance to notice you have the wrong
timestamp before you overwrite anything.

The meta rows are re-inserted **without** their original `meta_id` so MySQL
assigns fresh ones. Reusing the old ids risks colliding with rows created since
the backup was taken.

If the post's **categories** also need restoring:

```bash
sudo mysql --default-character-set=utf8mb3 -e "
  DELETE FROM wordpress.wp_term_relationships WHERE object_id=$POST_ID;
  INSERT INTO wordpress.wp_term_relationships
    SELECT * FROM wp_restore.wp_term_relationships WHERE object_id=$POST_ID;"
```

Then [clear the caches](#after-any-restore).

### A. Surgical — content only

**Use when:** a translation run wrote to the wrong field, a bulk script did
something unexpected, a post got mangled. This is the expected failure mode for
the i18n project.

Replaces `wp_posts`, `wp_postmeta`, and the term tables **in their entirety**.
Leaves users, sessions, plugin settings, and snippets untouched — nobody is
logged out.

> **Blast radius:** every post reverts to the backup's state, not just the one
> you care about. Any edit made by anyone between the backup and this restore is
> lost. Take a fresh `db` backup immediately beforehand, and prefer
> [A0](#a0-one-single-post--zero-blast-radius) when only one post is affected.

```bash
cd /var/backups/sc/<good-timestamp>
zcat database-content.sql.gz | sudo mysql --default-character-set=utf8mb3 wordpress
```

Then [clear the caches](#after-any-restore).

### B. Snippets only

**Use when:** the custom API broke — `/wp-json/sc/v1/...` 404s, or the admin
reports missing meta fields after a snippet edit.

```bash
cd /var/backups/sc/<good-timestamp>
zcat database-snippets.sql.gz | sudo mysql --default-character-set=utf8mb3 wordpress
```

### C. Full database

**Use when:** widespread damage, a bad plugin update, or you don't know what
broke. Logs everyone out and reverts plugin settings to the backup's state.

```bash
cd /var/backups/sc/<good-timestamp>
zcat database-full.sql.gz | sudo mysql --default-character-set=utf8mb3 wordpress
```

If the database itself is corrupt rather than merely wrong, recreate it first:

```bash
sudo mysql -e "DROP DATABASE wordpress; CREATE DATABASE wordpress CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci;"
zcat database-full.sql.gz | sudo mysql --default-character-set=utf8mb3 wordpress
```

### D. Files

**Use when:** uploads were deleted, or a plugin/theme update broke the site.
The i18n project does not touch files, so you are unlikely to need this.

Restore beside the live directory and swap, so you can change your mind:

```bash
cd /var/backups/sc/<good-timestamp>
sudo mkdir -p /var/www/sc-restore
sudo tar -xzf files.tar.gz -C /var/www/sc-restore

sudo mv /var/www/sc /var/www/sc-broken-$(date +%F)
sudo mv /var/www/sc-restore/sc /var/www/sc
sudo chown -R www-data:www-data /var/www/sc
```

Delete `sc-broken-*` only once the site is confirmed working.

To pull back **one deleted file** without touching anything else:

```bash
sudo tar -xzf files.tar.gz -C /tmp sc/wp-content/uploads/2025/06/photo.jpg
sudo cp /tmp/sc/wp-content/uploads/2025/06/photo.jpg \
        /var/www/sc/wp-content/uploads/2025/06/
sudo chown www-data:www-data /var/www/sc/wp-content/uploads/2025/06/photo.jpg
```

---

## After any restore

WordPress and four Next.js frontends all cache. Skipping this makes a successful
restore look like it failed.

```bash
# 1. WP Super Cache
sudo rm -rf /var/www/sc/wp-content/cache/*
sudo rm -rf /var/www/sc/wp-content/et-cache/*

# 2. Apache
sudo systemctl reload apache2

# 3. Frontends — they hold their own render cache
pm2 restart sczg teatar-td turizam eventi catering zaposlenici

# 4. Confirm the API is alive and the snippets loaded
curl -s https://www.sczg.unizg.hr/wp-json/ | grep -o '"sc\\/v1"'
curl -s "https://www.sczg.unizg.hr/wp-json/wp/v2/posts?per_page=1" | head -c 300
```

Then check by eye, in this order:

- [ ] `https://www.sczg.unizg.hr` loads
- [ ] A dormitory page shows correct Croatian diacritics — **`SD Lašćina`, not `LaÅ¡Äina`**
- [ ] Images load (proves uploads and the database agree)
- [ ] The admin at `/zaposlenici` logs in and lists posts
- [ ] `curl` above shows `sc/v1` in the namespace list

And from the repo on your Mac, the objective check:

```bash
npm run wp:snapshot -- post-restore
npm run wp:diff -- wp-snapshots/<baseline> wp-snapshots/<post-restore>
```

---

## Rehearse it — before you need it

A restore you have never performed is a hope, not a plan. Do this once, this
week, while nothing is wrong. It takes fifteen minutes.

1. `sudo bash ~/wp-backup.sh db`
2. Verify it using [the checks above](#verify-a-backup-before-you-trust-it).
3. Pick a genuinely disposable post — `58004 bokbobkobk` looks like test
   content, **but confirm before touching it**.
4. In the admin, change its title to `RESTORE DRILL` and save.
5. Confirm the change is live on the site.
6. Run **Restore A** (content only) from the backup in step 1.
7. Clear caches, then confirm the title is back to its original value.
8. Log into the admin — you should still be logged in, proving A left sessions alone.

If step 7 works, you have a real way out. Note the date in
[docs/i18n/HANDOFF.md](i18n/HANDOFF.md).

---

## Automate the daily dump

Once you've rehearsed, make it routine. `sudo crontab -e`:

```cron
# database backup nightly at 03:15
15 3 * * * /usr/bin/bash /home/uviplay/wp-backup.sh db >> /var/log/wp-backup.log 2>&1

# full backup, first Sunday of the month at 02:00
0 2 1-7 * 0 /usr/bin/bash /home/uviplay/wp-backup.sh full >> /var/log/wp-backup.log 2>&1
```

Then set a monthly reminder to actually read `/var/log/wp-backup.log` and rsync
to your Mac. Silent backup failure is the normal way backups die.

---

## Known gaps

Things this procedure does **not** cover, so you know the edges:

- **Off-site copies are manual.** Nothing automatically leaves the server. If
  the machine is lost, you have only what you last rsynced.
- **The Next.js frontends** are not backed up here — they live in git, which is
  their backup. But `pm2 save` and the contents of `/etc/apache2/sites-enabled/`
  are not in either. Worth capturing separately.
- **The `wp_wsal` audit log** is 46% of the dump. Harmless, just bulky. It can
  be truncated from the WordPress admin if the dump ever gets unwieldy.
- **No host-level VM snapshot has been confirmed.** Ask whoever runs the
  hypervisor whether one exists — it would be a valuable fourth line of defense
  that you don't maintain.
