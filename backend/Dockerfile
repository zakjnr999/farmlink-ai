# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies (including dev) for build + prisma generate.
COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# ---- Production dependencies stage ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate

# ---- Runtime stage ----
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Run as the non-root node user.
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --chown=node:node prisma ./prisma
COPY --chown=node:node package.json ./

USER node
EXPOSE 4000

# Apply migrations then start the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
