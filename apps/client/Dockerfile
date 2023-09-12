# FROM node:20.0.0-alpine

# RUN apk add --no-cache libc6-compat

# WORKDIR /app

# COPY package*.json ./

# COPY dist/apps/client client

# RUN addgroup --system client && adduser --system -G client client
# RUN chown -R client:client .

# USER client

# EXPOSE 4200
# CMD ["serve", "-s", "client", "-p", "4200"]


# Build phase
FROM node:20.0.0-alpine AS build

WORKDIR /app

COPY package*.json ./
COPY dist/apps/client client

# Serve phase
FROM nginx:alpine

COPY --from=build /app/client /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
