#!/usr/bin/env bash
# =============================================================
# TASKTROX — BLUE-GREEN DEPLOY SCRIPT
# =============================================================
# Deployed to: /home/murx/apps/tasktrox/scripts/deploy.sh
#
# Zero-downtime deployment using blue-green slot switching.
# Called by GitHub Actions via SSH after images are pushed to GHCR.
#
# Usage:  ./deploy.sh <image-tag> <ghcr-token>
# Example: ./deploy.sh abc1234 ghp_xxxx
#
# How it works:
#   1.  Acquires a deployment lock (prevents concurrent deploys)
#   2.  Reads which slot (blue/green) is currently active
#   3.  Skips if the same SHA is already deployed (idempotency)
#   4.  Pulls new images from GHCR
#   5a. Creates a pre-deploy database backup (safety net for migrations)
#   5b. Runs database migrations (one-off container)  [logged as 6/11]
#   7.  Starts the INACTIVE slot with new images
#   8.  Health-checks the new slot
#   9.  Switches nginx upstream to the new slot (graceful reload)
#  10.  Drains connections from the old slot, then stops it
#  11.  Writes state files (the "commit" of the deployment)
#
# Rollback:
#   Run this script with a previous SHA, or manually:
#     1. Overwrite tasktrox-upstream.conf to point to the old slot
#     2. docker exec nginx nginx -s reload
#
# Requires:
#   - GITHUB_USER env var set on the VPS
#   - External networks: proxy-net, data-net (created during VPS setup)
#   - Shared infra running: postgres, redis, nginx (docker-compose.infra.yml)

set -euo pipefail

# =============================================================
# ARGUMENTS
# =============================================================

IMAGE_TAG="${1:?Usage: deploy.sh <image-tag> <ghcr-token>}"
GHCR_TOKEN="${2:?Usage: deploy.sh <image-tag> <ghcr-token>}"

# =============================================================
# CONFIGURATION
# =============================================================

REGISTRY="ghcr.io"
GITHUB_USER="${GITHUB_USER:?Set GITHUB_USER environment variable}"
BACKEND_IMAGE="${REGISTRY}/${GITHUB_USER}/tasktrox-backend"
FRONTEND_IMAGE="${REGISTRY}/${GITHUB_USER}/tasktrox-frontend"

PROJECT_DIR="/home/murx/apps/tasktrox"
COMPOSE_FILE="${PROJECT_DIR}/docker-compose.yml"
NGINX_UPSTREAM="/home/murx/shared/nginx/conf.d/tasktrox-upstream.conf"
LOG_FILE="${PROJECT_DIR}/logs/deploy.log"

# State files — written LAST, only after everything succeeds
ACTIVE_SLOT_FILE="${PROJECT_DIR}/active-slot"
CURRENT_SHA_FILE="${PROJECT_DIR}/current-sha"
LOCK_DIR="${PROJECT_DIR}/deploy.lock"

# Tuning
HEALTH_MAX_ATTEMPTS=30   # 30 attempts x 2s = 60s max wait
HEALTH_INTERVAL=2        # seconds between health checks
DRAIN_SECONDS=30         # seconds to wait for connections to finish

# =============================================================
# LOGGING
# =============================================================

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1" | tee -a "$LOG_FILE"
}

# =============================================================
# STEP 1: ACQUIRE LOCK
# =============================================================
# mkdir is atomic on POSIX: exactly one concurrent call succeeds.
# trap ensures the lock is released on ANY exit (success, error, signal).

log "============================================"
log "DEPLOYMENT STARTING: ${IMAGE_TAG}"
log "============================================"

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  log "ERROR: Another deployment is in progress."
  log "Lock directory exists: $LOCK_DIR"
  log "If stale, remove manually: rmdir $LOCK_DIR"
  exit 1
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT
log "[1/11] Lock acquired."

# =============================================================
# STEP 2: READ CURRENT SLOT
# =============================================================
# Determine which slot is active so we deploy to the OTHER one.
# First deploy ever: no state file → deploy to blue.

if [[ -f "$ACTIVE_SLOT_FILE" ]]; then
  CURRENT_SLOT=$(cat "$ACTIVE_SLOT_FILE")
else
  CURRENT_SLOT="none"
fi

if [[ "$CURRENT_SLOT" == "blue" ]]; then
  NEW_SLOT="green"
elif [[ "$CURRENT_SLOT" == "green" ]]; then
  NEW_SLOT="blue"
else
  NEW_SLOT="blue"
fi

log "[2/11] Current slot: ${CURRENT_SLOT} → deploying to: ${NEW_SLOT}"

# =============================================================
# STEP 3: IDEMPOTENCY CHECK
# =============================================================
# If the SHA being deployed matches what's already running,
# skip the entire deploy. Prevents unnecessary container churn.

if [[ -f "$CURRENT_SHA_FILE" ]]; then
  DEPLOYED_SHA=$(cat "$CURRENT_SHA_FILE")
  if [[ "$DEPLOYED_SHA" == "$IMAGE_TAG" ]]; then
    log "SHA ${IMAGE_TAG} is already deployed. Nothing to do."
    exit 0
  fi
  log "[3/11] Current SHA: ${DEPLOYED_SHA} → new SHA: ${IMAGE_TAG}"
else
  log "[3/11] No previous deployment found (first deploy)."
fi

# =============================================================
# STEP 4: PULL NEW IMAGES
# =============================================================
# Pull BEFORE starting containers. If pull fails (bad tag, network
# error), nothing has changed. Old containers still serve traffic.

log "[4/11] Authenticating with GHCR..."
echo "$GHCR_TOKEN" | docker login "$REGISTRY" -u "$GITHUB_USER" --password-stdin 2>&1 | tee -a "$LOG_FILE"

log "[4/11] Pulling images (tag: ${IMAGE_TAG})..."
docker pull "${BACKEND_IMAGE}:${IMAGE_TAG}" 2>&1 | tee -a "$LOG_FILE"
docker pull "${FRONTEND_IMAGE}:${IMAGE_TAG}" 2>&1 | tee -a "$LOG_FILE"
log "Images pulled successfully."

# =============================================================
# STEP 5a: PRE-DEPLOY DATABASE BACKUP
# =============================================================
# Snapshot the project database BEFORE running migrations.
# If a migration goes wrong, this backup is the recovery point.
# Keeps only the 3 most recent pre-deploy backups.

PRE_DEPLOY_DIR="${PROJECT_DIR}/backups/pre-deploy"
mkdir -p "$PRE_DEPLOY_DIR"

log "[5/11] Creating pre-deploy database backup..."
BACKUP_TIMESTAMP=$(date -u '+%Y-%m-%d_%H%M%S')
BACKUP_FILE="tasktrox_pre-deploy_${BACKUP_TIMESTAMP}.sql.gz"

if docker exec postgres pg_dump -U "${POSTGRES_USER:-dbadmin}" tasktrox_prod | gzip > "${PRE_DEPLOY_DIR}/${BACKUP_FILE}" 2>&1; then
  BACKUP_SIZE=$(du -h "${PRE_DEPLOY_DIR}/${BACKUP_FILE}" | cut -f1)
  log "Pre-deploy backup created: ${BACKUP_FILE} (${BACKUP_SIZE})"
else
  log "WARNING: Pre-deploy backup failed — continuing deployment."
fi

# Rotate: keep only the 3 most recent pre-deploy backups
PRE_DEPLOY_COUNT=$(find "$PRE_DEPLOY_DIR" -name "tasktrox_pre-deploy_*.sql.gz" -type f | wc -l)
if [[ "$PRE_DEPLOY_COUNT" -gt 3 ]]; then
  find "$PRE_DEPLOY_DIR" -name "tasktrox_pre-deploy_*.sql.gz" -type f -printf '%T@ %p\n' \
    | sort -n \
    | head -n "$((PRE_DEPLOY_COUNT - 3))" \
    | cut -d' ' -f2- \
    | while read -r old_backup; do
        rm -f "$old_backup"
      done
  log "Rotated pre-deploy backups (kept 3 most recent)."
fi

# =============================================================
# STEP 5b: RUN DATABASE MIGRATIONS
# =============================================================
# Migrations run as a one-off container using the NEW image.
# Old backend keeps serving traffic during this step.
# If migrations fail, we abort without touching anything.

log "[6/11] Running database migrations..."
export IMAGE_TAG

set +e
docker compose -f "$COMPOSE_FILE" run --rm --no-deps \
  "tasktrox-backend-${NEW_SLOT}" \
  npx prisma migrate deploy 2>&1 | tee -a "$LOG_FILE"
MIGRATION_EXIT=$?
set -e

if [[ $MIGRATION_EXIT -ne 0 ]]; then
  log "ERROR: Migration failed (exit code: $MIGRATION_EXIT)."
  log "Old containers are still running. No changes made."
  log "DEPLOYMENT ABORTED."
  exit 1
fi
log "Migrations completed successfully."

# =============================================================
# STEP 7: START NEW SLOT CONTAINERS
# =============================================================
# Start the new slot. Old slot keeps running. Both coexist on
# the same Docker networks with different container names.

log "[7/11] Starting ${NEW_SLOT} slot containers..."
docker compose -f "$COMPOSE_FILE" up -d --no-deps \
  "tasktrox-frontend-${NEW_SLOT}" "tasktrox-backend-${NEW_SLOT}" 2>&1 | tee -a "$LOG_FILE"

# =============================================================
# STEP 8: HEALTH CHECK LOOP
# =============================================================
# Poll Docker's built-in HEALTHCHECK status until both containers
# report "healthy". The script runs on the host, not inside Docker,
# so we use `docker inspect` rather than curling internal DNS.

log "[8/11] Health-checking ${NEW_SLOT} slot..."
HEALTHY=false

for attempt in $(seq 1 "$HEALTH_MAX_ATTEMPTS"); do
  sleep "$HEALTH_INTERVAL"

  BACKEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' \
    "tasktrox-backend-${NEW_SLOT}" 2>/dev/null || echo "unknown")

  FRONTEND_HEALTH=$(docker inspect --format='{{.State.Health.Status}}' \
    "tasktrox-frontend-${NEW_SLOT}" 2>/dev/null || echo "unknown")

  if [[ "$BACKEND_HEALTH" == "healthy" && "$FRONTEND_HEALTH" == "healthy" ]]; then
    HEALTHY=true
    log "Health check PASSED (attempt ${attempt}/${HEALTH_MAX_ATTEMPTS})"
    break
  fi

  log "  Attempt ${attempt}/${HEALTH_MAX_ATTEMPTS}: backend=${BACKEND_HEALTH} frontend=${FRONTEND_HEALTH}"
done

if [[ "$HEALTHY" != "true" ]]; then
  log "ERROR: Health checks failed after ${HEALTH_MAX_ATTEMPTS} attempts."
  log "Stopping failed ${NEW_SLOT} containers..."
  docker compose -f "$COMPOSE_FILE" stop \
    "tasktrox-frontend-${NEW_SLOT}" "tasktrox-backend-${NEW_SLOT}" 2>&1 | tee -a "$LOG_FILE"
  docker compose -f "$COMPOSE_FILE" rm -f \
    "tasktrox-frontend-${NEW_SLOT}" "tasktrox-backend-${NEW_SLOT}" 2>&1 | tee -a "$LOG_FILE"
  log "Old ${CURRENT_SLOT} slot is still active. No traffic was switched."
  log "DEPLOYMENT ABORTED."
  exit 1
fi

# =============================================================
# STEP 9: SWITCH NGINX UPSTREAM
# =============================================================
# Overwrite the upstream conf to point at the new slot.
# Validate with nginx -t, then graceful reload.
#
# nginx -s reload: new workers use new config, old workers
# finish current requests. Zero dropped connections.
#
# Nginx lives in the shared infra compose, so we use
# `docker exec nginx` (not docker compose exec).

log "[9/11] Switching nginx to ${NEW_SLOT} slot..."

cat > "$NGINX_UPSTREAM" <<EOF
# ===========================================
# TASKTROX — UPSTREAM TARGETS
# ===========================================
# THIS FILE IS MANAGED BY deploy.sh — DO NOT EDIT MANUALLY.
#
# Active slot: ${NEW_SLOT}
# SHA: ${IMAGE_TAG}
# Switched: $(date -u '+%Y-%m-%dT%H:%M:%SZ')

upstream tasktrox_frontend {
    server tasktrox-frontend-${NEW_SLOT}:3000;
}

upstream tasktrox_backend {
    server tasktrox-backend-${NEW_SLOT}:4000;
}
EOF

# Validate nginx config before applying
if ! docker exec nginx nginx -t 2>&1 | tee -a "$LOG_FILE"; then
  log "ERROR: nginx config validation failed!"
  log "Restoring previous upstream config..."

  if [[ "$CURRENT_SLOT" != "none" ]]; then
    cat > "$NGINX_UPSTREAM" <<EOF
upstream tasktrox_frontend {
    server tasktrox-frontend-${CURRENT_SLOT}:3000;
}

upstream tasktrox_backend {
    server tasktrox-backend-${CURRENT_SLOT}:4000;
}
EOF
  fi

  log "Stopping failed ${NEW_SLOT} containers..."
  docker compose -f "$COMPOSE_FILE" stop \
    "tasktrox-frontend-${NEW_SLOT}" "tasktrox-backend-${NEW_SLOT}" 2>&1 | tee -a "$LOG_FILE"
  docker compose -f "$COMPOSE_FILE" rm -f \
    "tasktrox-frontend-${NEW_SLOT}" "tasktrox-backend-${NEW_SLOT}" 2>&1 | tee -a "$LOG_FILE"
  log "Old ${CURRENT_SLOT} slot restored. DEPLOYMENT ABORTED."
  exit 1
fi

# Apply the new config (graceful reload — zero dropped connections)
docker exec nginx nginx -s reload 2>&1 | tee -a "$LOG_FILE"
log "nginx reloaded. Traffic now flowing to ${NEW_SLOT}."

# =============================================================
# STEP 10: DRAIN AND STOP OLD SLOT
# =============================================================
# Wait for existing connections to finish, then stop old slot.
# During drain:
#   - No NEW connections go to old slot (nginx routes to new)
#   - Existing connections finish naturally
#   - Socket.io clients reconnect and land on the new slot
#
# After draining, docker stop sends SIGTERM (graceful shutdown).

if [[ "$CURRENT_SLOT" != "none" ]]; then
  log "[10/11] Draining connections from ${CURRENT_SLOT} slot (${DRAIN_SECONDS}s)..."
  sleep "$DRAIN_SECONDS"

  log "Stopping ${CURRENT_SLOT} slot containers..."
  docker compose -f "$COMPOSE_FILE" stop \
    "tasktrox-frontend-${CURRENT_SLOT}" "tasktrox-backend-${CURRENT_SLOT}" 2>&1 | tee -a "$LOG_FILE"

  # Remove stopped containers to free resources
  docker compose -f "$COMPOSE_FILE" rm -f \
    "tasktrox-frontend-${CURRENT_SLOT}" "tasktrox-backend-${CURRENT_SLOT}" 2>&1 | tee -a "$LOG_FILE"
else
  log "[10/11] First deploy — no old slot to drain."
fi

# =============================================================
# STEP 11: WRITE STATE FILES
# =============================================================
# State files are written LAST, only after everything succeeds.
# This is the "commit" of our deployment transaction.

echo "$NEW_SLOT" > "$ACTIVE_SLOT_FILE"
echo "$IMAGE_TAG" > "$CURRENT_SHA_FILE"

log "[11/11] State updated: slot=${NEW_SLOT}, sha=${IMAGE_TAG}"

# Cleanup old images to free disk space
docker image prune -f 2>&1 | tee -a "$LOG_FILE"

log "============================================"
log "DEPLOYMENT SUCCESSFUL"
log "  Active slot: ${NEW_SLOT}"
log "  Image tag:   ${IMAGE_TAG}"
log "============================================"
