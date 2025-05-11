# Dockerfile for NestJS application (servico-notificacao)

# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock if you use yarn)
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate

# Copy application source code
COPY . . 

# Build the application
RUN npm run build

# Stage 2: Production environment
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy package.json and package-lock.json for production dependencies
COPY --from=builder /usr/src/app/package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Copy Prisma schema and client (generated in builder stage)
COPY --from=builder /usr/src/app/prisma ./prisma
# The Prisma client is in node_modules, which is copied from builder if it was generated there
COPY --from=builder /usr/src/app/node_modules ./node_modules


# Expose port (NestJS default is 3000, but we use 3001 for this service)
EXPOSE 3001

# Command to run the application
CMD [ "node", "dist/main.js" ]

