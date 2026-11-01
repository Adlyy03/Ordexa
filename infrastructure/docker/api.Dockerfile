FROM php:8.3-cli-bookworm

# Official PHP extension installer (downloads precompiled .deb binaries on Debian)
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/

RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    git \
    curl \
    unzip \
 && install-php-extensions \
    pdo_pgsql \
    pcntl \
    bcmath \
    zip \
    redis \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# Install composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
