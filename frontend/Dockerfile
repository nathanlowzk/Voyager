# frontend/Dockerfile

# --- Stage 1: Build ---
FROM node:18-alpine as build-stage
WORKDIR /app

# 1. Accept the arguments from docker-compose
ARG VITE_GOOGLE_MAPS_API_KEY
ARG VITE_API_URL
ARG VITE_SUPABASE_URL 
ARG VITE_SUPABASE_ANON_KEY

# 2. Make them available during the build process
ENV VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL  
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Serve ---
FROM nginx:alpine
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]