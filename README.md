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
- **CI/CD**: GitHub Actions, Vercel

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

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ucebnice"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"

# Sentry (optional)
SENTRY_DSN="your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"
```

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

**Deployment** (`.github/workflows/deploy.yml`):

- Automatický deploy na Vercel při push do main
- PR preview deployments

### Pre-commit Hooks

- ESLint auto-fix
- Prettier formatting
- Type checking (manuálně)

## Deployment na Vercel

1. **Připojte GitHub repozitář** k Vercel
2. **Nastavte environment variables**:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `SENTRY_DSN` (optional)

3. **Deploy**:

```bash
# Automaticky při push do main
git push origin main

# Nebo manuálně
npx vercel --prod
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
