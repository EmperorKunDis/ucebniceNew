# Ucebnice Helm Chart

Helm chart for deploying the Učebnice programming learning platform to Kubernetes.

## Quick Start

### Prerequisites

- Kubernetes 1.24+
- Helm 3.8+
- Harbor registry credentials
- PostgreSQL database (external or in-cluster)
- Upstash Redis account

### Installation

```bash
# Create namespace
kubectl create namespace ucebnice

# Create secrets
kubectl create secret docker-registry harbor-registry-secret \
  --docker-server=harbor.example.com \
  --docker-username=<username> \
  --docker-password=<password> \
  --namespace=ucebnice

kubectl create secret generic ucebnice-secret \
  --from-literal=DATABASE_URL="postgresql://..." \
  --from-literal=NEXTAUTH_SECRET="$(openssl rand -base64 32)" \
  --from-literal=GOOGLE_CLIENT_ID="..." \
  --from-literal=GOOGLE_CLIENT_SECRET="..." \
  --from-literal=UPSTASH_REDIS_REST_URL="..." \
  --from-literal=UPSTASH_REDIS_REST_TOKEN="..." \
  --namespace=ucebnice

# Install chart
helm install ucebnice . -n ucebnice
```

### Upgrade

```bash
helm upgrade ucebnice . -n ucebnice
```

### Uninstall

```bash
helm uninstall ucebnice -n ucebnice
```

## Configuration

See `values.yaml` for all configuration options.

### Key Configuration Parameters

| Parameter                   | Description             | Default                                    |
| --------------------------- | ----------------------- | ------------------------------------------ |
| `replicaCount`              | Number of replicas      | `2`                                        |
| `image.repository`          | Docker image repository | `harbor.example.com/ucebnice/ucebnice-app` |
| `image.tag`                 | Image tag               | Chart appVersion                           |
| `ingress.enabled`           | Enable ingress          | `true`                                     |
| `ingress.hosts[0].host`     | Ingress hostname        | `ucebnice.example.com`                     |
| `autoscaling.enabled`       | Enable HPA              | `true`                                     |
| `autoscaling.minReplicas`   | Minimum replicas        | `2`                                        |
| `autoscaling.maxReplicas`   | Maximum replicas        | `10`                                       |
| `resources.requests.memory` | Memory request          | `512Mi`                                    |
| `resources.limits.memory`   | Memory limit            | `1Gi`                                      |
| `prisma.runMigrations`      | Run Prisma migrations   | `true`                                     |

### Example: Override Values

Create a `custom-values.yaml`:

```yaml
image:
  repository: harbor.yourdomain.com/ucebnice/app
  tag: v1.0.0

ingress:
  hosts:
    - host: ucebnice.yourdomain.com
      paths:
        - path: /
          pathType: Prefix

resources:
  limits:
    cpu: 2000m
    memory: 2Gi
  requests:
    cpu: 500m
    memory: 1Gi
```

Install with custom values:

```bash
helm install ucebnice . -f custom-values.yaml -n ucebnice
```

## Features

- **Auto-scaling**: Horizontal Pod Autoscaler for dynamic scaling
- **High Availability**: Multiple replicas with pod anti-affinity
- **Zero Downtime**: Rolling updates with health checks
- **Security**: Non-root containers, security contexts, network policies
- **Monitoring**: Readiness and liveness probes
- **TLS**: Automatic certificate management with cert-manager
- **Database Migrations**: Automatic Prisma migrations on deployment

## Architecture

```
┌─────────────────────────────────────┐
│         Ingress (Nginx)             │
│     ucebnice.example.com            │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│          Service                    │
│        (ClusterIP)                  │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│       Deployment                    │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ Pod  │ │ Pod  │ │ Pod  │        │
│  │      │ │      │ │      │   ...  │
│  └──────┘ └──────┘ └──────┘        │
│   (2-10 replicas via HPA)          │
└─────────────────────────────────────┘
```

## Troubleshooting

### Check Pod Status

```bash
kubectl -n ucebnice get pods
kubectl -n ucebnice describe pod <pod-name>
kubectl -n ucebnice logs <pod-name>
```

### Check Migration Status

```bash
kubectl -n ucebnice logs <pod-name> -c prisma-migrate
```

### Test Deployment

```bash
helm install ucebnice . --dry-run --debug -n ucebnice
```

### Common Issues

**ImagePullBackOff**: Check Harbor credentials

```bash
kubectl -n ucebnice get secret harbor-registry-secret
```

**CrashLoopBackOff**: Check environment variables and database connectivity

```bash
kubectl -n ucebnice logs <pod-name>
```

**Migration Failures**: Run migrations manually

```bash
kubectl -n ucebnice exec -it <pod-name> -- npx prisma migrate deploy
```

## Documentation

- [Full Deployment Guide](../../KUBERNETES_DEPLOYMENT.md)
- [Values Documentation](values.yaml)
- [Application Repository](https://github.com/your-org/ucebnice)
