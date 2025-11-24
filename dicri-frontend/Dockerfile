# Etapa 1: build de producción
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm ci

# Copiar el código y construir
COPY . .
RUN npm run build

# Etapa 2: servidor estático con Nginx
FROM nginx:1.27-alpine AS production

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
