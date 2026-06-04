# --- Build stage: React mit Vite bauen ---
FROM node:22 AS build
WORKDIR /app

# Nur package.json zuerst kopieren -> Docker-Layer-Caching für npm install
COPY package*.json ./
RUN npm install

# Restlichen Quellcode kopieren und Production-Bundle bauen
COPY . .
RUN npm run build

# --- Serve stage: statische Files mit nginx ausliefern ---
FROM nginx:alpine
# Die gebauten Files aus dem Build-Stage in das nginx-Webroot kopieren
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
