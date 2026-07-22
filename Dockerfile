# =============================================================================
# Stage 1: Build
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies first (better layer caching)
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# =============================================================================
# Stage 2: Production runtime
# =============================================================================
FROM node:20-alpine AS production

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
RUN npx prisma generate

COPY --from=builder /usr/src/app/dist ./dist

EXPOSE 3000

CMD ["node", "dist/src/main.js"]