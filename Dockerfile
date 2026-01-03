# Dockerfile for Simplistic Tetris
# Multi-stage build and deployment

# Stage 1: Build
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /tetris

# Copy the dependency files (Docker cache optimization)
COPY package.json package-lock.json ./

# Install the dependencies (npm ci installe toutes les dépendances par défaut)
RUN npm ci && \
    npm cache clean --force

# Copy the rest of the source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:1.27-alpine AS production

# Create a non-root user and directories in one layer
# Install curl for healthcheck (lighter than wget)
RUN addgroup -g 1001 -S nginx-user && \
    adduser -S -D -H -u 1001 -h /var/cache/nginx -s /sbin/nologin -G nginx-user -g nginx nginx-user && \
    mkdir -p /var/run/nginx /var/cache/nginx/client_temp /var/cache/nginx/proxy_temp /var/cache/nginx/fastcgi_temp /var/cache/nginx/uwsgi_temp /var/cache/nginx/scgi_temp && \
    apk add --no-cache curl

# Copy the built files from the builder stage
COPY --from=builder /tetris/dist /usr/share/nginx/html

# Copy nginx configuration files
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Change the permissions in one layer
RUN chown -R nginx-user:nginx-user /usr/share/nginx/html /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /var/run/nginx

# Switch to the non-root user
USER nginx-user

# Expose the port 80
EXPOSE 80

# Healthcheck (using curl, lighter than wget)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]