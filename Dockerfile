# Multi-stage production container for FINCORE™ Microbiz Credit Platform
FROM node:20-slim AS builder

# Install Python 3 for FINCORE Core Banking Engine
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-minimal \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm ci

# Copy application source code
COPY . .

# Build Vite frontend and server bundle
RUN npm run build

# Production runtime container
FROM node:20-slim AS runner

# Install Python 3 runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-minimal \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Copy built artifacts and necessary files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/fincore_python ./fincore_python
COPY --from=builder /app/fincore_app.py ./fincore_app.py

# Install only production dependencies
RUN npm ci --only=production

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/cbs/transactions', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["npm", "start"]
