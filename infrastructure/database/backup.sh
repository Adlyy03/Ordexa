#!/usr/bin/env bash
# ==============================================================================
# Ordexa Automated Database Backup & AES-256 Encryption Script
# Uploads encrypted PostgreSQL snapshots to Cloudflare R2 / S3
# ==============================================================================

set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/tmp/ordexa_backups"
DB_NAME="${DB_DATABASE:-ordexa}"
DB_USER="${DB_USERNAME:-ordexa}"
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"

BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"
ENCRYPTED_FILE="${BACKUP_FILE}.enc"
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-ordexa_master_secret_key_change_in_prod}"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Starting Ordexa PostgreSQL backup..."

# 1. Export pg_dump compressed with gzip
PGPASSWORD="${DB_PASSWORD:-ordexa_secret_2026}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean --if-exists --no-owner --no-privileges | gzip -9 > "${BACKUP_FILE}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Database dump completed. Size: $(du -h "${BACKUP_FILE}" | cut -f1)"

# 2. Encrypt with OpenSSL AES-256-CBC
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 100000 \
  -in "${BACKUP_FILE}" \
  -out "${ENCRYPTED_FILE}" \
  -k "${ENCRYPTION_KEY}"

rm -f "${BACKUP_FILE}"
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Encryption completed. Output: ${ENCRYPTED_FILE}"

# 3. Upload to Cloudflare R2 / S3 if AWS CLI / rclone is configured
if command -v aws >/dev/null 2>&1 && [ -n "${R2_BUCKET_NAME:-}" ]; then
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Uploading to Cloudflare R2 bucket: ${R2_BUCKET_NAME}..."
  aws s3 cp "${ENCRYPTED_FILE}" "s3://${R2_BUCKET_NAME}/database-backups/$(basename "${ENCRYPTED_FILE}")" \
    --endpoint-url "${R2_ENDPOINT_URL}"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Upload successfully finished."
  rm -f "${ENCRYPTED_FILE}"
else
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Local encrypted backup saved at ${ENCRYPTED_FILE} (R2 upload skipped: no credentials)."
fi

# 4. Retention: Delete backups older than 14 days
find "${BACKUP_DIR}" -type f -name "*.enc" -mtime +14 -delete
echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Backup routine finished successfully."
