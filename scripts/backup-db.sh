#!/usr/bin/env bash
# Dumps the `db` container's Postgres database to a gzipped, timestamped
# file under ./backups, then deletes local dumps older than RETENTION_DAYS.
#
# Usage:
#   ./scripts/backup-db.sh
#
# Cron (daily at 02:00, from the project root on the VPS):
#   0 2 * * * cd /opt/vestra && ./scripts/backup-db.sh >> /var/log/vestra-backup.log 2>&1
#
# This only protects against DB-container/disk loss on the same host — copy
# BACKUP_DIR to off-server storage too (rsync/rclone to S3, Backblaze,
# another host, etc). A backup that lives on the machine it backs up is not
# a backup against that machine dying.
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

: "${POSTGRES_USER:=vestra}"
: "${POSTGRES_DB:=vestra}"
: "${BACKUP_DIR:=./backups}"
: "${RETENTION_DAYS:=14}"

mkdir -p "$BACKUP_DIR"

timestamp=$(date +%Y-%m-%d_%H%M%S)
out_file="$BACKUP_DIR/vestra_${timestamp}.sql.gz"
tmp_file="${out_file}.tmp"

echo "[backup-db] Dumping '$POSTGRES_DB' -> $out_file"
docker compose exec -T db pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --clean --if-exists | gzip > "$tmp_file"
mv "$tmp_file" "$out_file"

size=$(du -h "$out_file" | cut -f1)
echo "[backup-db] Wrote $out_file ($size)"

echo "[backup-db] Pruning dumps older than ${RETENTION_DAYS} days"
find "$BACKUP_DIR" -name 'vestra_*.sql.gz' -mtime "+${RETENTION_DAYS}" -print -delete
