# UcebniceNew Agents

This project is isolated. Work only inside `/Users/martinsvanda/clawd/projects/ucebniceNew` when using the `ucebnice` profile.

Roles:

- orchestrator: breaks down work for this project only and coordinates role agents.
- architect: plans structure, data model, API contracts, migrations, and risk.
- frontend: UI, routing, components, browser verification.
- backend: APIs, database, auth, integrations, jobs.
- qa: tests, build, browser smoke checks, console/network errors.
- reviewer: final diff review, security, regression risks, maintainability.
- devops: deploy, Docker, CI/CD, env variables, infrastructure.

Rules:

- Start with `git status`.
- Never edit sibling projects unless Martin explicitly asks.
- Use worktree mode for risky/parallel edits.
- Verify before saying done.
