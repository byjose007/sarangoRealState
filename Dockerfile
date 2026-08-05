# syntax=docker/dockerfile:1

FROM node:24-slim AS deps
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:24-slim AS builder
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:24-slim AS runner
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* \
  && groupadd -g 1001 nodejs && useradd -u 1001 -g nodejs -m nextjs

ENV NODE_ENV=production
ENV PORT=3000

# next.config.mjs has output: 'standalone' — this folder is a self-contained
# server bundle with only the node_modules actually needed at runtime.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Prisma 7 has no native query-engine binary — the generated client under
# src/generated/prisma is plain TS/JS and ships inside the standalone bundle
# above like any other app module. `prisma migrate deploy` (which does need
# the schema-engine binary + the `prisma` CLI) runs from the `builder` stage
# as a separate one-off container — see the `migrate` service in compose.

RUN mkdir -p /app/uploads && chown nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
