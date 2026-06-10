# UcebniceNew Discord namespace

Channels:

- `ucebnice-chat` - `1505464821758431312`
- `ucebnice-dev` - `1505464825034051706`
- `ucebnice-ops` - `1505464828334968862`
- `ucebnice-status` - `1505464831413588068`

Hermes project-bot routing:

- Profile: `ucebnice`
- Discord bot: `ucebnice-bot`
- Project root: `/Users/martinsvanda/clawd/projects/ucebniceNew`
- Runtime repo: `/Users/martinsvanda/hermes/repos/ucebnice`
- Shared plan: `/Users/martinsvanda/hermes/plans/ucebnice/plan.md`
- Agent workspaces: `/Users/martinsvanda/hermes/agents/ucebnice/<role>/workspace`

Behavior:

- `chat` and `ops` are free-response channels for the project bot.
- `dev` and `status` require mention or clear actionable context.
- Internal roles are Hermes roles inside this profile, not separate Discord bot accounts.
- Do not merge, deploy, restart production, force-push, delete data, or expose secrets without explicit approval.
