#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/ucebnice}"
RELEASE_REF="${RELEASE_REF:-main}"
HEALTH_URL="${HEALTH_URL:?HEALTH_URL is required, for example https://ucebnice.example.com/api/health}"
COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"
LAST_GOOD_FILE=".last-good-release"

cd "$APP_DIR"

current_ref="$(git rev-parse --short HEAD || true)"
previous_ref=""
if [ -f "$LAST_GOOD_FILE" ]; then
  previous_ref="$(cat "$LAST_GOOD_FILE")"
fi

rollback() {
  if [ -z "$previous_ref" ]; then
    echo "Deploy failed and no previous release is recorded."
    exit 1
  fi

  echo "Deploy failed. Rolling back to ${previous_ref}."
  git checkout "$previous_ref"
  $COMPOSE up -d --build
  $COMPOSE exec -T app npx prisma migrate deploy
  exit 1
}

trap rollback ERR

git fetch --prune origin
git checkout "$RELEASE_REF"
git pull --ff-only origin "$RELEASE_REF"

new_ref="$(git rev-parse --short HEAD)"
echo "Deploying ${new_ref} from ${RELEASE_REF}"

$COMPOSE build app
$COMPOSE up -d
$COMPOSE exec -T app npx prisma migrate deploy

for attempt in $(seq 1 30); do
  status="$(curl -fsS -o /dev/null -w '%{http_code}' "$HEALTH_URL" || true)"
  if [ "$status" = "200" ]; then
    echo "$new_ref" > "$LAST_GOOD_FILE"
    echo "Deploy successful: ${new_ref}"
    trap - ERR
    exit 0
  fi

  echo "Health check attempt ${attempt}/30 returned ${status:-no response}; waiting..."
  sleep 5
done

false
