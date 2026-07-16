# Multi-stage build for Next.js application
FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files first (these change less frequently)
COPY package.json package-lock.json ./

# Install dependencies (this layer caches well)
RUN npm ci

# Copy Prisma files AFTER npm ci (only invalidates cache when schema changes)
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Generate Prisma Client (provide placeholder DATABASE_URL for build time)
ENV DATABASE_URL="postgresql://placeholder:placeholder@placeholder:5432/placeholder"
RUN if [ ! -d "node_modules/.prisma" ]; then \
      npx prisma generate; \
    fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Only build if .next doesn't exist (when not provided by CI)
RUN if [ ! -d ".next" ]; then \
      echo "Building Next.js application..."; \
      npm run build; \
    else \
      echo "Using pre-built .next from CI"; \
    fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/data ./data
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Runtime media is mounted by Docker Compose. Keep the directory present for
# local smoke checks and for deployments that mount an empty volume first.
RUN mkdir -p /data/videa

# Set correct permissions
RUN chown -R nextjs:nodejs /app /data

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV VIDEO_FILES_DIR="/data/videa"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
