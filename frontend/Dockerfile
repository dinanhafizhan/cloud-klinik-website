# ── Stage 1: Build React App ─────────────────────────────────────
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .

# CI=false agar warning tidak dianggap error
ENV CI=false
RUN npm run build

# ── Stage 2: Serve dengan Nginx (ringan & cepat) ─────────────────
FROM nginx:alpine

# Hapus config nginx default
RUN rm -rf /usr/share/nginx/html/*

# Salin hasil build React ke nginx
COPY --from=builder /app/build /usr/share/nginx/html

# Config nginx agar React Router bisa bekerja (SPA support)
RUN printf 'server {\n    listen 3000;\n    root /usr/share/nginx/html;\n    index index.html;\n    location / {\n        try_files \ \/ /index.html;\n    }\n}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
