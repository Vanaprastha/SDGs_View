# Tahap 1: Build Stage
# Gunakan image Node.js LTS sebagai base image untuk build
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json dan pnpm-lock.yaml (jika ada)
COPY package.json ./

# Install dependencies
RUN npm install

# Copy sisa kode aplikasi
COPY .env.local ./.env.local
COPY . .

# Build aplikasi Next.js

# Pastikan semua variabel lingkungan yang dibutuhkan untuk build sudah tersedia
RUN npm run build

# Tahap 2: Production Stage
# Gunakan image Node.js yang lebih kecil untuk production
FROM node:22-alpine AS runner

# Set environment variables
ENV NODE_ENV production
# Next.js secara default berjalan di port 3000
ENV PORT 3000

# Set working directory
WORKDIR /app

# Copy dari build stage
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env.local ./.env.local

# Expose port
EXPOSE 3000

# Command untuk menjalankan aplikasi Next.js
CMD ["npm", "start"]
