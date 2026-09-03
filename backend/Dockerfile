# Production Dockerfile for MindWise AI Express Backend
FROM node:20-alpine AS builder

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy source code and build config
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript to dist/
RUN npm run build

# ----------------------------------------------------
# Production Runner Image
# ----------------------------------------------------
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm ci --omit=dev

# Generate Prisma Client for runtime
RUN npx prisma generate

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose backend port
EXPOSE 5000

# Run prisma db push to apply any schema updates, then start express server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && node dist/server.js"]

