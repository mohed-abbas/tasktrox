#!/usr/bin/env bash
# =============================================================
# SHARED DATABASE BACKUP SCRIPT
# =============================================================
# Deployed to: /home/murx/shared/scripts/backup.sh
#
# Backs up ALL databases from the shared PostgreSQL instance.
# Supports daily and weekly rotation + optional Cloudflare R2 upload.
#
# Usage:
#   ./backup.sh daily          # Daily backup (retained 7 days)
#   ./backup.sh weekly         # Weekly backup (retained 30 days)
#
# Cron setup (add via `crontab -e`):
#   0 3 * * * /home/murx/shared/scripts/backup.sh daily
#   0 4 * * 0 /home/murx/shared/scripts/backup.sh weekly
#
# R2 upload (optional):
#   Set R2_BUCKET, R2_ACCESS_KEY, R2_SECRET_KEY, R2_ENDPOINT
#   in /home/murx/shared/.env.backup — or skip R2 by leaving them unset.
#
# Requires:
#   - Shared postgres container running (docker-compose.infra.yml)
#   - POSTGRES_USER set in environment or /home/murx/shared/.env.infra

set -euo pipefail

# =============================================================
# ARGUMENTS
# =============================================================

BACKUP_TYPE="${1:?Usage: backup.sh <daily|weekly>}"

if [[ "$BACKUP_TYPE" != "daily" && "$BACKUP_TYPE" != "weekly" ]]; then
  echo "ERROR: Backup type must be 'daily' or 'weekly', got: $BACKUP_TYPE"
  exit 1
fi

# =============================================================
# CONFIGURATION
# =============================================================

SHARED_DIR="/home/murx/shared"
BACKUP_DIR="${SHARED_DIR}/backups/${BACKUP_TYPE}"
LOG_FILE="${SHARED_DIR}/logs/backup.log"
TIMESTAMP=$(date -u '+%Y-%m-%d_%H%M%S')
BACKUP_FILE="all-databases_${TIMESTAMP}.sql.gz"

# Retention (number of backups to keep)
DAILY_RETENTION=7
WEEKLY_RETENTION=4

# Load postgres credentials from infra env
if [[ -f "${SHARED_DIR}/.env.infra" ]]; then
  # shellcheck source=/dev/null
  source "${SHARED_DIR}/.env.infra"
fi
POSTGRES_USER="${POSTGRES_USER:?Set POSTGRES_USER in .env.infra}"

# Load R2 credentials (optional)
R2_ENABLED=false
if [[ -f "${SHARED_DIR}/.env.backup" ]]; then
  # shellcheck source=/dev/null
  source "${SHARED_DIR}/.env.backup"
  if [[ -n "${R2_BUCKET:-}" && -n "${R2_ACCESS_KEY:-}" && -n "${R2_SECRET_KEY:-}" && -n "${R2_ENDPOINT:-}" ]]; then
    R2_ENABLED=true
  fi
fi

# =============================================================
# LOGGING
# =============================================================

mkdir -p "$(dirname "$LOG_FILE")" "$BACKUP_DIR"

log() {
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1" | tee -a "$LOG_FILE"
}

# =============================================================
# STEP 1: CREATE BACKUP
# =============================================================

log "============================================"
log "BACKUP STARTING: ${BACKUP_TYPE} (${TIMESTAMP})"
log "============================================"

log "Dumping all databases..."
docker exec postgres pg_dumpall -U "$POSTGRES_USER" | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

BACKUP_SIZE=$(du -h "${BACKUP_DIR}/${BACKUP_FILE}" | cut -f1)
log "Backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"

# =============================================================
# STEP 2: ROTATE OLD BACKUPS
# =============================================================

if [[ "$BACKUP_TYPE" == "daily" ]]; then
  RETENTION=$DAILY_RETENTION
else
  RETENTION=$WEEKLY_RETENTION
fi

# List backups oldest first, delete everything beyond retention count
BACKUP_COUNT=$(find "$BACKUP_DIR" -name "all-databases_*.sql.gz" -type f | wc -l)

if [[ "$BACKUP_COUNT" -gt "$RETENTION" ]]; then
  DELETE_COUNT=$((BACKUP_COUNT - RETENTION))
  log "Rotating: keeping ${RETENTION}, deleting ${DELETE_COUNT} old backups..."

  find "$BACKUP_DIR" -name "all-databases_*.sql.gz" -type f -printf '%T@ %p\n' \
    | sort -n \
    | head -n "$DELETE_COUNT" \
    | cut -d' ' -f2- \
    | while read -r old_backup; do
        log "  Deleting: $(basename "$old_backup")"
        rm -f "$old_backup"
      done
else
  log "Rotation: ${BACKUP_COUNT}/${RETENTION} backups — no cleanup needed."
fi

# =============================================================
# STEP 3: UPLOAD TO R2 (OPTIONAL)
# =============================================================

if [[ "$R2_ENABLED" == "true" ]]; then
  log "Uploading to Cloudflare R2 (bucket: ${R2_BUCKET})..."

  # Use aws CLI with S3-compatible endpoint for R2
  AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY" \
  AWS_SECRET_ACCESS_KEY="$R2_SECRET_KEY" \
  aws s3 cp \
    "${BACKUP_DIR}/${BACKUP_FILE}" \
    "s3://${R2_BUCKET}/backups/${BACKUP_TYPE}/${BACKUP_FILE}" \
    --endpoint-url "$R2_ENDPOINT" \
    2>&1 | tee -a "$LOG_FILE"

  # Clean up old R2 backups (keep 30 days for daily, 90 days for weekly)
  if [[ "$BACKUP_TYPE" == "daily" ]]; then
    R2_RETENTION_DAYS=30
  else
    R2_RETENTION_DAYS=90
  fi

  CUTOFF_DATE=$(date -u -d "${R2_RETENTION_DAYS} days ago" '+%Y-%m-%d' 2>/dev/null || \
                date -u -v-${R2_RETENTION_DAYS}d '+%Y-%m-%d')

  log "Cleaning R2 backups older than ${R2_RETENTION_DAYS} days (before ${CUTOFF_DATE})..."
  AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY" \
  AWS_SECRET_ACCESS_KEY="$R2_SECRET_KEY" \
  aws s3 ls \
    "s3://${R2_BUCKET}/backups/${BACKUP_TYPE}/" \
    --endpoint-url "$R2_ENDPOINT" 2>/dev/null \
    | while read -r line; do
        file_date=$(echo "$line" | awk '{print $1}')
        file_name=$(echo "$line" | awk '{print $4}')
        if [[ -n "$file_name" && "$file_date" < "$CUTOFF_DATE" ]]; then
          log "  R2 deleting: ${file_name}"
          AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY" \
          AWS_SECRET_ACCESS_KEY="$R2_SECRET_KEY" \
          aws s3 rm \
            "s3://${R2_BUCKET}/backups/${BACKUP_TYPE}/${file_name}" \
            --endpoint-url "$R2_ENDPOINT" 2>&1 | tee -a "$LOG_FILE"
        fi
      done

  log "R2 upload complete."
else
  log "R2 upload skipped (credentials not configured)."
fi

# =============================================================
# STEP 4: DISK SPACE CHECK
# =============================================================

DISK_USAGE=$(df -h /home/murx | tail -1 | awk '{print $5}' | tr -d '%')
if [[ "$DISK_USAGE" -ge 90 ]]; then
  log "WARNING: Disk usage at ${DISK_USAGE}% — consider cleaning up!"
elif [[ "$DISK_USAGE" -ge 80 ]]; then
  log "NOTICE: Disk usage at ${DISK_USAGE}%"
fi

log "============================================"
log "BACKUP COMPLETE: ${BACKUP_TYPE}"
log "  File: ${BACKUP_FILE}"
log "  Size: ${BACKUP_SIZE}"
log "  R2:   ${R2_ENABLED}"
log "  Disk: ${DISK_USAGE}%"
log "============================================"
