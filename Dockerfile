# syntax=docker/dockerfile:1

FROM node:20-slim AS deps
WORKDIR /app
# better-sqlite3 and sharp compile/install native bindings on install.
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# Where the persistent volume should be mounted — see README.
ENV DATA_DIR=/app/.data

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/package.json ./package.json
# Standalone output only bundles what the Next server itself traces, which
# misses tsx (used to run the seed script) and can miss native addons like
# better-sqlite3. Overlaying the full node_modules trades some image size
# for reliability here.
COPY --from=deps /app/node_modules ./node_modules

RUN mkdir -p /app/.data

EXPOSE 3000
# Seeding is idempotent (safe to run on every boot) and guarantees the admin
# login exists even on a brand-new volume.
CMD ["sh", "-c", "node_modules/.bin/tsx scripts/seed.ts && node server.js"]
