# ── Stage 1: Build React App ─────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

# Build args - REACT_APP_* harus di-pass saat build time
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# CI=false agar warning tidak dianggap error
ENV CI=false
RUN npm run build

# ── Stage 2: Serve dengan Nginx (ringan & cepat) ─────────────────
FROM nginx:alpine

# Hapus config nginx default
RUN rm -rf /usr/share/nginx/html/*

# Salin hasil build React ke nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Salin konfigurasi nginx custom (SPA support + static cache)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
