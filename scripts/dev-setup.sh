#!/usr/bin/env bash
set -euo pipefail

# One-command local development setup.
#
#   npm run setup      # prepare .env, dependencies, database, seed data
#   make dev           # the same, then start the dev server
#
# Environment overrides:
#   SKIP_DB_CONTAINER=1  use an already running PostgreSQL instead of Compose
#   SKIP_SEED=1          apply migrations but do not seed course content

cd "$(dirname "$0")/.."

COMPOSE="${COMPOSE:-docker compose}"
DB_SERVICE=postgres

step() {
  echo ""
  echo "==> $1"
}

fail() {
  echo "Error: $1" >&2
  exit 1
}

step "Checking Node.js version"
node_version="$(node -v 2>/dev/null || true)"
[ -n "$node_version" ] || fail "Node.js is not installed. This project requires Node.js 22.12 or newer (but below 23)."
node_major="$(echo "${node_version#v}" | cut -d. -f1)"
node_minor="$(echo "${node_version#v}" | cut -d. -f2)"
if [ "$node_major" != "22" ] || [ "$node_minor" -lt 12 ]; then
  fail "Node.js ${node_version} is not supported. package.json requires >=22.12.0 <23 (try: nvm use 22)."
fi
echo "Node.js ${node_version} OK"

step "Preparing .env"
if [ -f .env ]; then
  echo ".env already exists, keeping it"
else
  cp .env.example .env
  echo "Created .env from .env.example"
fi

# The example file ships a placeholder instead of a real secret; NextAuth needs
# a usable value or every sign-in fails at runtime.
if grep -q '^NEXTAUTH_SECRET="generate-secret-with' .env; then
  secret="$(openssl rand -base64 32)"
  tmp_env="$(mktemp)"
  NEW_SECRET="$secret" awk '
    /^NEXTAUTH_SECRET=/ { print "NEXTAUTH_SECRET=\"" ENVIRON["NEW_SECRET"] "\""; next }
    { print }
  ' .env > "$tmp_env"
  mv "$tmp_env" .env
  echo "Generated NEXTAUTH_SECRET"
fi

step "Installing dependencies"
npm install

if [ "${SKIP_DB_CONTAINER:-0}" = "1" ]; then
  step "Skipping database container (SKIP_DB_CONTAINER=1)"
else
  step "Starting PostgreSQL"
  command -v docker >/dev/null 2>&1 || fail "Docker is not installed. Install Docker, or run with SKIP_DB_CONTAINER=1 and point DATABASE_URL at your own PostgreSQL."
  docker info >/dev/null 2>&1 || fail "The Docker daemon is not running. Start Docker Desktop and try again."
  $COMPOSE up -d "$DB_SERVICE"

  # migrate deploy fails outright if it connects before the server accepts
  # connections, so wait for readiness rather than racing it.
  for attempt in $(seq 1 30); do
    if $COMPOSE exec -T "$DB_SERVICE" pg_isready -q 2>/dev/null; then
      echo "PostgreSQL is ready"
      break
    fi
    if [ "$attempt" = "30" ]; then
      fail "PostgreSQL did not become ready in 60 seconds. Check: $COMPOSE logs $DB_SERVICE"
    fi
    sleep 2
  done
fi

step "Generating Prisma client"
npx prisma generate

step "Applying database migrations"
npx prisma migrate deploy

if [ "${SKIP_SEED:-0}" = "1" ]; then
  step "Skipping seed (SKIP_SEED=1)"
else
  step "Seeding course content"
  npm run db:seed
fi

echo ""
echo "Setup complete. Start the app with:"
echo ""
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000"
