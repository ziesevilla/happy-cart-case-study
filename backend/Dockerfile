# Use the official PHP image with FPM
FROM php:8.4-fpm-alpine

# Install system dependencies (Alpine-based for a smaller image)
RUN apk update && apk add --no-cache \
    git \
    curl \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev

# Install required PHP extensions
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Get Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Adjust permissions for storage and bootstrap/cache (Crucial for Laravel)
RUN chown -R www-data:www-data /var/www/html

# Expose port 9000 for PHP-FPM
EXPOSE 9000

# Default command to start PHP-FPM
CMD ["php-fpm"]