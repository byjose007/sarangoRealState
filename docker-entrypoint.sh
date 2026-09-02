#!/bin/sh
set -e

# Run Prisma database migrations if DATABASE_URL is available
if [ -n "$DATABASE_URL" ]; then
  echo "Applying database migrations..."
  ./node_modules/.bin/prisma migrate deploy || node ./node_modules/prisma/build/index.js migrate deploy || true
fi

exec "$@"
