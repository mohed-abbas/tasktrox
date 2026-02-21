#!/usr/bin/env bash
# =============================================================
# VPS HEALTH MONITOR
# =============================================================
# Deployed to: /home/murx/shared/scripts/monitor.sh
#
# Checks disk space, container health, and memory usage.
# Logs warnings and can optionally send Discord webhook alerts.
#
# Usage:
#   ./monitor.sh               # Run once (for cron)
#   ./monitor.sh --verbose     # Print all stats
#
# Cron setup (every 5 minutes):
#   */5 * * * * /home/murx/shared/scripts/monitor.sh
#
# Discord alerts (optional):
#   Set DISCORD_WEBHOOK_URL in /home/murx/shared/.env.monitor

set -euo pipefail

# =============================================================
# CONFIGURATION
# =============================================================

SHARED_DIR="/home/murx/shared"
LOG_FILE="${SHARED_DIR}/logs/monitor.log"
VERBOSE="${1:-}"

DISK_WARN_THRESHOLD=80
DISK_CRIT_THRESHOLD=90
MEMORY_WARN_THRESHOLD=85

# Load Discord webhook (optional)
DISCORD_ENABLED=false
if [[ -f "${SHARED_DIR}/.env.monitor" ]]; then
  # shellcheck source=/dev/null
  source "${SHARED_DIR}/.env.monitor"
  if [[ -n "${DISCORD_WEBHOOK_URL:-}" ]]; then
    DISCORD_ENABLED=true
  fi
fi

# =============================================================
# HELPERS
# =============================================================

mkdir -p "$(dirname "$LOG_FILE")"

log() {
  echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1" >> "$LOG_FILE"
  if [[ "$VERBOSE" == "--verbose" ]]; then
    echo "$1"
  fi
}

alert() {
  local level="$1"
  local message="$2"
  log "${level}: ${message}"

  if [[ "$DISCORD_ENABLED" == "true" ]]; then
    local color
    case "$level" in
      CRITICAL) color=16711680 ;;  # Red
      WARNING)  color=16776960 ;;  # Yellow
      *)        color=65280 ;;     # Green
    esac

    curl -sf -H "Content-Type: application/json" \
      -d "{\"embeds\":[{\"title\":\"VPS Alert: ${level}\",\"description\":\"${message}\",\"color\":${color}}]}" \
      "$DISCORD_WEBHOOK_URL" > /dev/null 2>&1 || true
  fi
}

# =============================================================
# CHECK 1: DISK SPACE
# =============================================================

DISK_USAGE=$(df -h /home/murx | tail -1 | awk '{print $5}' | tr -d '%')
DISK_AVAIL=$(df -h /home/murx | tail -1 | awk '{print $4}')

if [[ "$DISK_USAGE" -ge "$DISK_CRIT_THRESHOLD" ]]; then
  alert "CRITICAL" "Disk usage at ${DISK_USAGE}% (${DISK_AVAIL} free)"
elif [[ "$DISK_USAGE" -ge "$DISK_WARN_THRESHOLD" ]]; then
  alert "WARNING" "Disk usage at ${DISK_USAGE}% (${DISK_AVAIL} free)"
else
  log "OK: Disk usage ${DISK_USAGE}% (${DISK_AVAIL} free)"
fi

# =============================================================
# CHECK 2: MEMORY USAGE
# =============================================================

MEMORY_USAGE=$(free | awk '/^Mem:/ {printf "%.0f", $3/$2 * 100}')
MEMORY_AVAIL=$(free -h | awk '/^Mem:/ {print $7}')

if [[ "$MEMORY_USAGE" -ge "$MEMORY_WARN_THRESHOLD" ]]; then
  alert "WARNING" "Memory usage at ${MEMORY_USAGE}% (${MEMORY_AVAIL} available)"
else
  log "OK: Memory usage ${MEMORY_USAGE}% (${MEMORY_AVAIL} available)"
fi

# =============================================================
# CHECK 3: CONTAINER HEALTH
# =============================================================

UNHEALTHY_CONTAINERS=""

for container in postgres redis nginx; do
  STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "not-found")
  RUNNING=$(docker inspect --format='{{.State.Running}}' "$container" 2>/dev/null || echo "false")

  if [[ "$RUNNING" != "true" ]]; then
    UNHEALTHY_CONTAINERS="${UNHEALTHY_CONTAINERS} ${container}(stopped)"
  elif [[ "$STATUS" != "healthy" && "$STATUS" != "" ]]; then
    UNHEALTHY_CONTAINERS="${UNHEALTHY_CONTAINERS} ${container}(${STATUS})"
  fi
done

# Check active app containers (read active slot)
ACTIVE_SLOT_FILE="/home/murx/apps/tasktrox/active-slot"
if [[ -f "$ACTIVE_SLOT_FILE" ]]; then
  ACTIVE_SLOT=$(cat "$ACTIVE_SLOT_FILE")
  for service in "tasktrox-frontend-${ACTIVE_SLOT}" "tasktrox-backend-${ACTIVE_SLOT}"; do
    STATUS=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "not-found")
    RUNNING=$(docker inspect --format='{{.State.Running}}' "$service" 2>/dev/null || echo "false")

    if [[ "$RUNNING" != "true" ]]; then
      UNHEALTHY_CONTAINERS="${UNHEALTHY_CONTAINERS} ${service}(stopped)"
    elif [[ "$STATUS" != "healthy" ]]; then
      UNHEALTHY_CONTAINERS="${UNHEALTHY_CONTAINERS} ${service}(${STATUS})"
    fi
  done
fi

if [[ -n "$UNHEALTHY_CONTAINERS" ]]; then
  alert "CRITICAL" "Unhealthy containers:${UNHEALTHY_CONTAINERS}"
else
  log "OK: All containers healthy"
fi

# =============================================================
# CHECK 4: SSL CERTIFICATE EXPIRY
# =============================================================

CERT_PATH="/home/murx/shared/certbot/conf/live/thecodeman.cloud/fullchain.pem"
if [[ -f "$CERT_PATH" ]]; then
  CERT_EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH" 2>/dev/null | cut -d= -f2)
  CERT_EPOCH=$(date -d "$CERT_EXPIRY" +%s 2>/dev/null || date -j -f "%b %d %T %Y %Z" "$CERT_EXPIRY" +%s 2>/dev/null || echo "0")
  NOW_EPOCH=$(date +%s)
  DAYS_LEFT=$(( (CERT_EPOCH - NOW_EPOCH) / 86400 ))

  if [[ "$DAYS_LEFT" -le 7 ]]; then
    alert "CRITICAL" "SSL certificate expires in ${DAYS_LEFT} days!"
  elif [[ "$DAYS_LEFT" -le 14 ]]; then
    alert "WARNING" "SSL certificate expires in ${DAYS_LEFT} days"
  else
    log "OK: SSL certificate valid for ${DAYS_LEFT} days"
  fi
else
  log "INFO: No SSL certificate found (not yet configured)"
fi
