# Local Docker Testing Guide

Test your Docker image locally before deploying to Kubernetes.

## Quick Start

### 1. Configure Environment

Copy your existing `.env` file or create `.env.docker`:

```bash
cp .env .env.docker
# Edit .env.docker with your settings
```

**Important**: Update `DATABASE_URL` in `.env.docker`:

- For local PostgreSQL: `postgresql://user:password@host.docker.internal:5432/ucebnice`
- For remote DB (Neon, Supabase): Use the full connection string

### 2. Build the Image

```bash
make build
```

This builds the image with the current git version tag.

### 3. Run Locally

**Option A: Interactive mode** (see logs in terminal)

```bash
make docker-run
```

**Option B: Background mode**

```bash
make docker-run-detached

# View logs
make docker-logs

# Stop container
make docker-stop
```

**Option C: One command** (build + run)

```bash
make docker-test
```

### 4. Test the Application

Open your browser:

```
http://localhost:3000
```

Test health endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-10-30T12:00:00.000Z",
  "uptime": 123.456,
  "database": "connected"
}
```

## Detailed Commands

### Build Docker Image

```bash
# Build with default version (git describe)
make build

# Build with specific version
make build VERSION=v1.0.0
```

### Run Container

#### Method 1: Using Makefile (Recommended)

```bash
# Interactive (logs in terminal, Ctrl+C to stop)
make docker-run

# Background (detached)
make docker-run-detached
make docker-logs      # View logs
make docker-stop      # Stop container
```

#### Method 2: Using docker run directly

```bash
# Interactive
docker run --rm -it \
  --name ucebnice-test \
  -p 3000:3000 \
  --env-file .env.docker \
  harbor.example.com/ucebnice/ucebnice-app:latest

# Background
docker run -d \
  --name ucebnice-test \
  -p 3000:3000 \
  --env-file .env.docker \
  harbor.example.com/ucebnice/ucebnice-app:latest

# View logs
docker logs -f ucebnice-test

# Stop
docker stop ucebnice-test && docker rm ucebnice-test
```

#### Method 3: Using individual environment variables

```bash
docker run --rm -it \
  --name ucebnice-test \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e GOOGLE_CLIENT_ID="your-client-id" \
  -e GOOGLE_CLIENT_SECRET="your-client-secret" \
  harbor.example.com/ucebnice/ucebnice-app:latest
```

## Debugging

### Get Shell in Running Container

```bash
# Using Makefile
make docker-shell

# Or directly
docker exec -it ucebnice-test sh
```

Inside the container:

```bash
# Check environment variables
env | grep DATABASE

# Test database connection
npx prisma db pull

# View files
ls -la
cat package.json

# Check if server is running
ps aux
```

### View Logs

```bash
# Using Makefile
make docker-logs

# Or directly
docker logs -f ucebnice-test

# Last 100 lines
docker logs --tail 100 ucebnice-test
```

### Check Container Status

```bash
docker ps                    # List running containers
docker ps -a                 # List all containers
docker inspect ucebnice-test # Detailed container info
docker stats ucebnice-test   # Resource usage
```

### Run Prisma Migrations

```bash
# Get shell in container
make docker-shell

# Inside container:
npx prisma migrate deploy
npx prisma db seed  # If you want to seed data
```

## Troubleshooting

### Container Exits Immediately

Check logs:

```bash
docker logs ucebnice-test
```

Common causes:

- Missing environment variables
- Invalid DATABASE_URL
- Database not accessible

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**: Update DATABASE_URL in `.env.docker`:

For **local PostgreSQL**:

```bash
# Use host.docker.internal instead of localhost
DATABASE_URL="postgresql://user:password@host.docker.internal:5432/ucebnice"
```

For **remote PostgreSQL** (Neon, Supabase):

```bash
# Use the full connection string with SSL
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

### Port Already in Use

**Error**: `port is already allocated`

**Solution**:

```bash
# Check what's using port 3000
lsof -i :3000

# Kill the process or use different port
docker run -p 3001:3000 ...  # Map to different local port
```

### Image Not Found

**Error**: `Unable to find image`

**Solution**:

```bash
# Make sure you built the image first
make build

# Check if image exists
docker images | grep ucebnice
```

### Permission Denied

**Error**: `permission denied while trying to connect to the Docker daemon`

**Solution**:

```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or:
newgrp docker
```

## Testing Different Scenarios

### Test with Different Database

```bash
# Create different env file
cp .env.docker .env.docker.staging

# Edit .env.docker.staging with staging database URL

# Run with staging env
docker run --rm -it \
  --name ucebnice-test \
  -p 3000:3000 \
  --env-file .env.docker.staging \
  harbor.example.com/ucebnice/ucebnice-app:latest
```

### Test Production Build

The Docker image already uses production mode (`NODE_ENV=production`), so you're testing the same build that will run in Kubernetes.

### Test with Redis

If you have local Redis:

```bash
# Add to .env.docker
UPSTASH_REDIS_REST_URL=http://host.docker.internal:8080
UPSTASH_REDIS_REST_TOKEN=your-token
```

### Test Health Checks

The Dockerfile includes a healthcheck. Test it:

```bash
# Check health status
docker inspect ucebnice-test | grep -A 10 Health

# Manual health check
curl http://localhost:3000/api/health
```

## Performance Testing

### Check Resource Usage

```bash
docker stats ucebnice-test
```

### Limit Resources (like Kubernetes)

```bash
docker run --rm -it \
  --name ucebnice-test \
  -p 3000:3000 \
  --memory="1g" \
  --cpus="1.0" \
  --env-file .env.docker \
  harbor.example.com/ucebnice/ucebnice-app:latest
```

## Cleanup

```bash
# Stop and remove container
make docker-stop

# Or manually
docker stop ucebnice-test
docker rm ucebnice-test

# Remove images
make clean

# Or manually
docker rmi harbor.example.com/ucebnice/ucebnice-app:latest
```

## Next Steps

Once you've verified the image works locally:

1. **Push to Harbor**:

   ```bash
   # Login to Harbor
   docker login harbor.example.com

   # Push image
   make push
   ```

2. **Deploy to Kubernetes**:

   ```bash
   # Deploy to staging
   make deploy-staging

   # Deploy to production
   make deploy-production
   ```

## Common Testing Workflow

```bash
# 1. Make code changes
vim src/app/...

# 2. Build and test locally
make docker-test

# 3. Test in browser
# http://localhost:3000

# 4. If good, stop container
# Ctrl+C or make docker-stop

# 5. Push to registry
make push

# 6. Deploy to staging
make deploy-staging

# 7. Test staging
# https://staging.ucebnice.yourdomain.com

# 8. Deploy to production
make deploy-production
```

## Environment File Template

Create `.env.docker` with these variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host.docker.internal:5432/ucebnice

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here-use-openssl-rand-base64-32

# OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Redis (optional)
UPSTASH_REDIS_REST_URL=your-upstash-url
UPSTASH_REDIS_REST_TOKEN=your-upstash-token

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# App
NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
```

Generate NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```
