# VPS Docker Compose Deployment

Ucebnice v2.0 deployuje produkci přes VPS a Docker Compose. Starý registry/cluster/GitOps směr není součástí aktivního provozního modelu.

## Runtime

Služby:

- `app` - Next.js standalone image z lokálního `Dockerfile`.
- `postgres` - PostgreSQL 16 s persistentním volume `postgres_data`.
- `caddy` - produkční reverse proxy a automatické TLS v `docker-compose.prod.yml`.
- `media_data` - persistentní volume mountované do `/data/videa`.

Video endpoint používá `VIDEO_FILES_DIR`; v Compose je nastavený na `/data/videa`.

## Required VPS files

Na VPS v aplikačním adresáři udržuj:

- checkout repozitáře,
- `.env` s produkčními hodnotami,
- persistentní Docker volumes,
- DNS A/AAAA záznam pro `DOMAIN` na VPS.

Minimální `.env`:

```env
DOMAIN=ucebnice.example.com
ACME_EMAIL=admin@example.com
POSTGRES_USER=ucebnice_user
POSTGRES_PASSWORD=replace-with-strong-password
POSTGRES_DB=ucebnice_db
NEXTAUTH_URL=https://ucebnice.example.com
NEXTAUTH_SECRET=replace-with-random-secret
VIDEO_FILES_DIR=/data/videa
```

## Commands

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec app npx prisma migrate deploy
curl -fsS https://ucebnice.example.com/api/health
```

## Automated deploy

GitHub Actions workflow `deploy-vps.yml` spouští `scripts/deploy-vps.sh` přes SSH. Workflow je ruční (`workflow_dispatch`) a používá GitHub environment `production`, kde má být nastavené approval pravidlo.

Vyžadované secrets v environmentu `production`:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `VPS_PORT` (volitelné, default `22`)
- `VPS_APP_DIR`
- `PRODUCTION_HEALTH_URL`

Deploy skript:

1. provede `git fetch`, checkout a fast-forward pull,
2. postaví app image,
3. spustí Compose stack,
4. aplikuje `prisma migrate deploy`,
5. ověří `/api/health`,
6. při selhání se vrátí na poslední known-good commit uložený v `.last-good-release`.

## Safety

- Produkční deploy, migrace a restore spouštěj jen po explicitním schválení.
- Secrets patří do `.env` na VPS nebo do GitHub environment secrets, nikdy do repa.
- Lokální hooks pomáhají, ale autoritativní gate je GitHub Actions CI.
