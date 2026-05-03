FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (fallback for repos without lockfile)
RUN npm install --legacy-peer-deps

# Build (if applicable)
COPY . .
RUN npm run build || echo "No build step"

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy package files and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --legacy-peer-deps --omit=dev --omit=optional --no-audit --no-fund && npm cache clean --force

COPY --from=builder --chown=nextjs:nodejs /app .

USER nextjs

EXPOSE 3000

# Healthcheck endpoint assumed at /health
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
