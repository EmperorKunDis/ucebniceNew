# GitHub Secrets Setup Guide

GitHub Actions používá pro Ucebnice v2.0 pouze CI/security secrets a ruční VPS deploy přes protected environment `production`.

## Production environment secrets

Nastav v GitHub repository settings:

1. `Settings` -> `Environments` -> `production`
2. Zapni required reviewers.
3. Přidej environment secrets:

```text
VPS_HOST
VPS_USER
VPS_SSH_KEY
VPS_PORT
VPS_APP_DIR
PRODUCTION_HEALTH_URL
```

`VPS_PORT` může být prázdné, workflow potom použije port `22`.

## Repository secrets

Běžné PR/CI joby nemají potřebovat deploy secrets. Pokud se přidají další integrace, preferuj environment secrets a least-privilege oprávnění na úrovni jobu.

## Local hooks

Repo používá Husky:

- `pre-commit`: `lint-staged`
- `commit-msg`: Conventional Commits
- `pre-push`: rychlý lokální gate (`type-check`, `lint`, Jest v `--runInBand`)

Hooks jsou pomocná kontrola. Autoritativní gate je GitHub Actions CI.
