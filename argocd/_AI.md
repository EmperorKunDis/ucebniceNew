# argocd/ - AI Context

## 🎯 PURPOSE
Kubernetes deployment configuration using ArgoCD GitOps. Contains Helm values, sealed secrets, and ArgoCD application manifests for staging and production environments.

## 📦 EXPORTS
No code exports. Contains YAML configuration files for:
- ArgoCD Application definitions
- Helm values overrides
- Sealed secrets

## 🔗 DEPENDENCIES
- Kubernetes cluster with ArgoCD
- Sealed Secrets controller
- Harbor container registry (harbor.praut.cz)
- Helm charts from `helm/` directory

## 🏗️ PATTERNS

### Environment Values
```yaml
# values-staging.yaml
replicaCount: 1
resources:
  limits:
    memory: 512Mi
  
# values-production.yaml  
replicaCount: 2
resources:
  limits:
    memory: 1Gi
```

### Sealed Secrets
Secrets are encrypted using kubeseal and stored safely in git:
```yaml
# ucebnice-sealed-secret.yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: ucebnice-secrets
spec:
  encryptedData:
    DATABASE_URL: AgBy8i...
```

## ⚠️ GOTCHAS

1. **Never commit plain secrets**: Only sealed secrets in this directory
2. **Harbor registry**: Uses private registry at harbor.praut.cz
3. **Two environments**: staging (ucebnice-staging) and production (ucebnice-production)
4. **Image tags**: Updated automatically by CI/CD pipeline
5. **PVC for videos**: Production uses persistent volume for video storage

## 📁 STRUCTURE
```
argocd/
├── application.yaml           # ArgoCD Application manifest
├── values-staging.yaml        # Staging Helm values
├── values-production.yaml     # Production Helm values
├── ucebnice-sealed-secret.yaml # App secrets (sealed)
├── harbor-registry-sealed-secret.yaml # Registry auth
└── postgres-sealed-secret.yaml # DB credentials
```

## 🔄 RELATED
- `helm/` - Helm chart templates
- `Makefile` - Deployment commands
- `.github/workflows/` - CI/CD pipeline
- `scripts/kubernetes/` - K8s helper scripts

---
<!-- META: For AI agents -->
<!-- TRAVERSE: no -->
<!-- DEPTH: all -->
<!-- CRITICAL: values-production.yaml -->
