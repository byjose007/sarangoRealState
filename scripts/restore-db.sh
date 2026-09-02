#!/usr/bin/env bash
# Restores a gzipped dump produced by backup-db.sh into the `db` container.
# DESTRUCTIVE: drops and recreates every object in the target database.
#
# Usage:
#   ./scripts/restore-db.sh ./backups/vestra_2026-08-06_020000.sql.gz
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

: "${POSTGRES_USER:=vestra}"
: "${POSTGRES_DB:=vestra}"

file="${1:-}"
if [[ -z "$file" || ! -f "$file" ]]; then
  echo "Usage: $0 <path-to-dump.sql.gz>" >&2
  exit 1
fi

echo "This will DROP and recreate every object in database '$POSTGRES_DB'."
read -r -p "Type the database name to confirm: " confirm
if [[ "$confirm" != "$POSTGRES_DB" ]]; then
  echo "Aborted — input did not match '$POSTGRES_DB'." >&2
  exit 1
fi

echo "[restore-db] Restoring $file -> $POSTGRES_DB"
gunzip -c "$file" | docker compose exec -T db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1
echo "[restore-db] Done."
