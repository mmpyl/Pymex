FROM php:8.2-apache

# Install system dependencies
RUN sed -i 's|http://deb.debian.org|https://deb.debian.org|g' /etc/apt/sources.list.d/debian.sources \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        libpq-dev \
        libzip-dev \
        zip \
        unzip \
        git \
        curl \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && a2enmod rewrite \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy source code
COPY . .

# Set proper permissions for Apache
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Configure Apache to serve from public directory
RUN echo "DocumentRoot /var/www/html/public" > /etc/apache2/sites-available/000-default.conf && \
    echo "<Directory /var/www/html/public>" >> /etc/apache2/sites-available/000-default.conf && \
    echo "    Options Indexes FollowSymLinks" >> /etc/apache2/sites-available/000-default.conf && \
    echo "    AllowOverride All" >> /etc/apache2/sites-available/000-default.conf && \
    echo "    Require all granted" >> /etc/apache2/sites-available/000-default.conf && \
    echo "</Directory>" >> /etc/apache2/sites-available/000-default.conf

# Composer install (if composer.json exists, else skip)
RUN if [ -f composer.json ]; then composer install --no-dev --optimize-autoloader; fi || echo "No composer.json found"

EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost/ || exit 1
