# Učebnice programování AI

Interaktivní webová aplikace pro výuku programování s využitím AI, gamifikace a moderních webových technologií.

## Technologie

- **Framework**: Next.js 14 (App Router)
- **Databáze**: PostgreSQL + Prisma ORM
- **Autentizace**: NextAuth.js
- **UI**: React 18, Tailwind CSS, Radix UI
- **3D**: Three.js, React Three Fiber
- **State Management**: Zustand, TanStack Query
- **Testování**: Jest, Testing Library, Playwright
- **Error Tracking**: Sentry
- **Rate Limiting**: Upstash Redis
- **CI/CD**: GitHub Actions, VPS Docker Compose

## Prerekvizity

- Node.js 20+
- PostgreSQL databáze
- npm nebo yarn

## Instalace

1. **Klonování repozitáře**

```bash
git clone <repository-url>
cd ucebniceNew
```

2. **Instalace závislostí**

```bash
npm install
```

3. **Konfigurace prostředí**

Vytvořte `.env` soubor na základě `.env.example`:

Lokální `docker-compose.yml` mapuje PostgreSQL na `localhost:5433`, proto výchozí
`DATABASE_URL` v `.env.example` používá port 5433.

Povinné proměnné pro lokální běh:

```env
DATABASE_URL="postgresql://ucebnice_user:changeme123@localhost:5433/ucebnice_db"
NEXTAUTH_SECRET="generate-secret-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Volitelné integrace:

- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` - rate limiting
- `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` - monitoring a release tracking
- `VIDEO_FILES_DIR` - absolutní cesta k runtime videím, default je `data/videa`
- `GEMINI_API_KEY`, `GEMINI_REVIEW_MODEL` - kontrola projektů
- `OPENAI_API_KEY`, `AI_TUTOR_MODEL` - AI Tutor

4. **Inicializace databáze**

```bash
npx prisma generate
npx prisma migrate dev
```

5. **Spuštění dev serveru**

```bash
npm run dev
```

Aplikace poběží na `http://localhost:3000`

## NPM Skripty

### Development

- `npm run dev` - Spustí development server
- `npm run build` - Vytvoří production build
- `npm start` - Spustí production server

### Code Quality

- `npm run lint` - Spustí ESLint
- `npm run lint:fix` - Opraví ESLint chyby
- `npm run format` - Naformátuje kód pomocí Prettier
- `npm run format:check` - Zkontroluje formátování
- `npm run type-check` - Zkontroluje TypeScript typy

### Testování

- `npm test` - Spustí Jest unit testy
- `npm run test:watch` - Spustí testy v watch módu
- `npm run test:coverage` - Spustí testy s coverage reportem
- `npm run test:e2e` - Spustí Playwright E2E testy
- `npm run test:e2e:ui` - Spustí E2E testy s UI
- `npm run test:e2e:debug` - Spustí E2E testy v debug módu
- `npm run test:e2e:report` - Zobrazí E2E test report

### Analýza

- `npm run analyze` - Analyzuje bundle size
- `npm run validate:content` - Ověří metadata kapitol, přednášky a video soubory

## Architektura

```
src/
├── app/                  # Next.js App Router
│   ├── api/             # API Routes
│   ├── auth/            # Autentizace
│   ├── chapters/        # Kapitoly
│   ├── profile/         # Uživatelský profil
│   └── certificate/     # Certifikáty
├── components/          # React komponenty
│   ├── achievements/    # Achievementy
│   ├── auth/           # Autentizační formuláře
│   ├── certificate/    # Generování certifikátů
│   ├── chapters/       # Kapitoly a videa
│   ├── gamification/   # Gamifikační prvky
│   ├── providers.tsx   # App providers
│   └── ui/             # UI komponenty
├── lib/                # Utility funkce
│   ├── api-middleware.ts  # API middleware
│   ├── rate-limit.ts     # Rate limiting
│   └── prisma.ts         # Prisma client
└── hooks/              # Custom React hooks
```

## Funkce

### Autentizace

- Registrace a přihlášení
- Session management (NextAuth.js)
- Zabezpečené API routes

### Kapitoly a obsah

- Video lekce
- Interaktivní cvičení
- Sledování progressu
- Markdown obsah

### Gamifikace

- XP systém
- Level system
- Achievementy
- Streaky
- Žebříčky

### 3D Vizualizace

- Three.js scény
- Interaktivní fyzikální simulace
- React Three Fiber komponenty

### Certifikáty

- Automatické generování po dokončení kurzu
- Export do PDF
- Unikátní ID

## Testování

### Unit Testy (Jest)

```bash
npm test
```

Testy pokrývají:

- React komponenty
- API middleware
- Utility funkce
- Rate limiting

### E2E Testy (Playwright)

```bash
npm run test:e2e
```

Testy pokrývají:

- Autentizační flow
- Dokončování kapitol
- Získávání achievementů
- Mobile responsive
- 24 testů celkem

## Bezpečnost

### Rate Limiting

- Upstash Redis
- Ochrana API endpointů
- Konfigurovatelné limity

### CSP Headers

- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options

### Error Handling

- Sentry error tracking
- Error boundaries
- API error handling

## Performance

### Optimalizace

- React.memo na často renderovaných komponentách
- Dynamic imports (51% redukce bundle size na /certificate)
- Next.js Image optimization
- Bundle analysis

### Bundle Size

- /certificate: 153 kB (optimalizováno z 314 kB)
- Automatická analýza přes GitHub Actions

## CI/CD

### GitHub Actions Workflow

**CI Pipeline** (`.github/workflows/ci.yml`):

- Lint & Type Check
- Unit Tests (s Codecov)
- E2E Tests
- Build Check

**Deployment** (`.github/workflows/deploy-vps.yml`):

- Ruční deploy na VPS přes Docker Compose
- SSH spuštění `scripts/deploy-vps.sh`
- Health check `/api/health` a rollback na poslední known-good commit

### Pre-commit Hooks

- ESLint auto-fix
- Prettier formatting
- Type checking (manuálně)

## Deployment na VPS

Produkční směr je VPS + Docker Compose + Caddy. Detailní postup a checklist jsou v
[`docs/VPS_DOCKER_DEPLOYMENT.md`](docs/VPS_DOCKER_DEPLOYMENT.md).

Minimální produkční `.env` na VPS:

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

Před deployem ověřte:

```bash
npm run validate:content
docker compose -f docker-compose.yml -f docker-compose.prod.yml config
```

## Troubleshooting

### Build chyby

**Prisma client chyby**:

```bash
npx prisma generate
```

**Type chyby**:

```bash
npm run type-check
```

**Cache problémy**:

```bash
rm -rf .next
npm run build
```

### Database problémy

**Reset databáze**:

```bash
npx prisma migrate reset
```

**Zobrazit data**:

```bash
npx prisma studio
```

### Test chyby

**E2E testy selhávají**:

```bash
# Ujistěte se, že dev server běží
npm run dev

# V jiném terminálu
npm run test:e2e
```

**Database cleanup pro testy**:

```bash
# E2E testy automaticky čistí test data
# Pro manuální cleanup použijte Prisma Studio
```

## Vývoj

### Přidání nové kapitoly

1. Vytvořte Prisma migraci s novým chapter
2. Přidejte video obsah
3. Vytvořte komponentu pro kapitolu
4. Aktualizujte routing

### Přidání nového achievementu

1. Přidejte achievement do databáze
2. Implementujte unlock logiku v API
3. Přidejte UI v profilu

### Code Style

- **ESLint**: Next.js doporučená konfigurace
- **Prettier**: Single quotes, no semicolons, 100 char width
- **TypeScript**: Strict mode
- Pre-commit hooks zajišťují konzistenci

## Autor

Martin Svanda

## Licence

Private project
