# UcebniceNew

Project profile: `ucebnice`
Current workspace root: `/Users/admin/ucebniceNew`
Hermes canonical project root: `/Users/martinsvanda/clawd/projects/ucebniceNew`
Remote: https://github.com/EmperorKunDis/ucebniceNew.git

This repository is an isolated Hermes project. Use the `ucebnice` profile/alias for development here.

## Required context

Load these files before non-trivial work:

- `_AI_INDEX.md` - AI navigation index and architecture map.
- `.hermes/agents.md` - Hermes project roles and isolation rules.
- `.hermes/discord.md` - Discord namespace and project-bot routing.
- `CLAUDE.md` - Existing project guidance and command reference.

When changing a specific area, also read the nearest `_AI.md` files on the path to the target. Important entry points include:

- `src/_AI.md`
- `src/app/_AI.md`
- `src/app/api/_AI.md`
- `src/components/_AI.md`
- `src/lib/_AI.md`
- `prisma/_AI.md`
- `scripts/_AI.md`

## Core rules

- Communicate with Martin in Czech unless he asks otherwise.
- Run `git status --short --branch` before edits.
- Never overwrite unrelated user changes.
- Inspect first, edit second, verify third.
- Use `rg`/`rg --files` for searches when available.
- Keep changes scoped to the requested task; avoid unrelated refactors.
- Ask before deploy, public posting, destructive migration, deleting data, production database operations, restarts, or force-push.
- Never commit secrets, `.env` files, tokens, private keys, or sensitive database dumps.
- Do not edit sibling projects or parent workspaces unless Martin explicitly asks.
- Do not treat generated build outputs as source changes.

## Hermes project isolation

This repo is an independent project. Use Hermes profile `ucebnice` with cwd `/Users/martinsvanda/clawd/projects/ucebniceNew`. Do not treat `/Users/martinsvanda/clawd/projects` as the coding workspace for this repo.

Project agent definitions: `.hermes/agents.md`
Discord namespace plan: `.hermes/discord.md`

## Stack and commands

This is a Next.js 14 / React 18 / TypeScript application with Prisma 7, PostgreSQL, NextAuth, Tailwind CSS, Jest, Playwright, Storybook, Sentry, and v2.0 VPS Docker Compose deployment assets.

Use the project scripts from `package.json`:

- Dev server: `npm run dev`
- Production build: `npm run build`
- Type check: `npm run type-check`
- Lint: `npm run lint`
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Format check: `npm run format:check`
- Storybook: `npm run storybook`
- Local Docker Compose: `make up`
- Production Compose config check: `make compose-config-prod`

Default verification after code changes:

- Run `npm run type-check` for TypeScript changes.
- Run `npm run lint` when touching source code.
- Run targeted `npm test` or `npm run test:e2e` for behavior changes.
- For UI changes, verify the affected route/component in a browser or Playwright when feasible.
- For documentation-only or Codex config changes, `git diff --check` is sufficient.

## Package manager and lockfiles

The repository currently contains both `package-lock.json` and `pnpm-lock.yaml`. Do not install dependencies or update lockfiles casually. If a task requires dependency changes, identify the intended package manager from the task context; if unclear, ask Martin before changing lockfiles.

## Database and deployment safety

- Prisma schema and migrations live under `prisma/`.
- Migration scripts live under `scripts/migration/`.
- Production operations are exposed through `Makefile`, Docker Compose, and `scripts/deploy-vps.sh`.
- Never run production deploys, production migrations, production restores, secret generation, restarts, or destructive database commands without explicit approval.
- Runtime secrets belong in VPS `.env` files or GitHub environment secrets, never in the repository.

## Codex project configuration

Project-scoped Codex settings live in `.codex/`.

- `.codex/config.toml` contains safe project defaults only.
- `.codex/rules/default.rules` documents command approval rules for operations that may need to run outside the sandbox.
- Do not put personal credentials, provider settings, auth tokens, telemetry keys, or machine-local secrets in `.codex/`.
