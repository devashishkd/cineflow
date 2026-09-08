# ─── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

WORKDIR /app

# Copy dependency files first for Docker layer caching
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy application source
COPY src/ ./src/

# ─── Runtime ──────────────────────────────────────────────────────────────────
# Use non-root user for security
RUN addgroup -S cineflow && adduser -S cineflow -G cineflow
USER cineflow

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

CMD ["node", "src/index.js"]
