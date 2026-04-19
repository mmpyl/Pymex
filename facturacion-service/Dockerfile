FROM composer:2.7 AS vendor
WORKDIR /app

COPY composer.json ./


COPY composer.json composer.lock* ./



COPY composer.json ./

COPY composer.json composer.lock* ./



RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

FROM php:8.2-cli
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libzip-dev libpq-dev unzip \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*








COPY --from=vendor /app/vendor ./vendor
COPY . .

EXPOSE 9000

CMD ["php", "-S", "0.0.0.0:9000", "-t", "public"]






COPY . .
COPY --from=vendor /app/vendor ./vendor

EXPOSE 9000

CMD ["php", "-S", "0.0.0.0:9000", "-t", "public"]





