# HANDOFF — návod pro příštího agenta

> Aktualizováno: 2026-07-03. Repo: `github.com/EmperorKunDis/ucebniceNew`, aktivní větev `main`.
> Kontext: Učebnice 2.0 = Duolingo-style redesign (gamifikace: shop, questy, ligy, hearts, learning path, XP/level/streak).

## Co bylo právě uděláno

- `main` fast-forwardnut na `origin/main` (VPS Docker Compose migrace, odstranění argocd/helm/k8s, CI/security fixy, Prisma migrace `ai_review_observability`).
- Do `main` mergnuta větev `fix/duolingo-bugs-batch1` (merge commit `9a0622e`) — bugfixy gamifikace:
  - **dávka 1** (`12db24e`): shop UI (sjednocené výšky karet), odečet srdíčka za špatnou odpověď v kvízu, verifikační email po registraci, wired questy `CHAPTERS_COMPLETED` + `EXERCISES_PERFECT`.
  - **email** (`9920fdc`): odesílání přepnuto z Resend na **Postmark** (token + `EMAIL_FROM` na VPS v `.env`, dev-fallback = console.log).
  - **dávka 2** (`2c5059c`): Topbar/HUD čte XP/level/streak živě z `/api/user/stats` (refetch při změně route + focusu okna), ne ze stale NextAuth session.

## ⚠️ Nutno dořešit jako první (bezpečnost / regrese)

1. **Vypnutá auth kontrola** — `src/app/(main)/layout.tsx:6` má `// TODO: Re-enable auth check after testing`. Auth guard je zakomentovaný z testování. **Před produkcí znovu zapnout** a ověřit, že chráněné stránky přesměrují nepřihlášené.
2. **Ověřit email na VPS** — po přepnutí na Postmark reálně otestovat registrační/verifikační email (token `X-Postmark-Server-Token`, doména `ucebnice@praut.cz` musí být ověřená v Postmarku).

## Rozpracované / nedokončené (TODO markery v `src`, ~24)

- `src/app/api/progress/complete-chapter/route.ts:236-237` — questy pro `challenges` a `perfect scores` se předávají natvrdo jako `0`, netrackují se reálně. Napojit na skutečná data (souvisí s dávkou 1 questů).
- `src/app/api/leaderboard/route.ts:96` — `change: 'same'` natvrdo, netrackuje se změna pořadí v čase.
- Chybějící UI komponenty (dle `_AI.md`): `components/gamification/shop/`, `components/gamification/leagues/`, `components/learning/review/`, `components/social/friends/`, `/admin/analytics`.
- Ligy: chybí **cron job** na promotions/demotions na konci týdne (`src/app/api/leagues/_AI.md:117`).
- `src/app/(main)/settings/page.tsx:79` — uložení nastavení do API zatím neimplementováno.
- AI Tutor UI page (`src/app/(main)/ai-tutor/`) — TODO.

## Jak pokračovat (postup)

1. Pracuj v `/Users/martinsvanda/clawd/projects/ucebniceNew` (POZOR: `~/ucebnice_2-0-0` NENÍ git repo, kód je tady).
2. Novou práci dělej na feature větvi (`fix/...` nebo `feat/...`), ne přímo na `main`.
3. Před commitem: `npm run lint` + `npm test` (Jest). E2E/vitest jsou z Jestu vyloučené.
4. DB změny → Prisma migrace (`npx prisma migrate dev`), ne ruční SQL.
5. Deploy jde na VPS přes Docker Compose (`scripts/deploy-vps.sh`, `docker-compose.prod.yml`) — viz `docs/VPS_DOCKER_DEPLOYMENT.md`.
6. Po dokončení dávky aktualizuj tento HANDOFF.md (co hotovo / co zbývá).

## Užitečné soubory

- `AGENTS.md` — pravidla pro AI development.
- `docs/VPS_DOCKER_DEPLOYMENT.md` — deploy na VPS (92.242.187.42).
- `CLAUDE.md` — projektové instrukce.
