#!/bin/sh
set -e

UPLOADS_DIR="${UPLOADS_DIR:-/app/uploads}"

# Running as root on container start: make sure the uploads directory exists
# and is owned by the app user. This is required when a persistent volume is
# mounted at that path — the mount comes up owned by root, and the non-root
# `nextjs` process could not otherwise write uploaded images/documents to it.
if [ "$(id -u)" = "0" ]; then
  mkdir -p "$UPLOADS_DIR"
  chown -R nextjs:nodejs "$UPLOADS_DIR" 2>/dev/null || true
fi

# Run Prisma database migrations if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
  echo "Applying database migrations..."
  ./node_modules/.bin/prisma migrate deploy || node ./node_modules/prisma/build/index.js migrate deploy || true
fi

# Drop privileges to the unprivileged app user for the server process itself.
if [ "$(id -u)" = "0" ]; then
  exec setpriv --reuid=nextjs --regid=nodejs --init-groups "$@"
fi

exec "$@"
