# Contributing to Učebnice programování AI

Děkujeme za váš zájem přispět do projektu! Tento dokument obsahuje pokyny pro přispěvatele.

## 📋 Obsah

- [Code of Conduct](#code-of-conduct)
- [Jak začít](#jak-začít)
- [Vývojový proces](#vývojový-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Dokumentace](#dokumentace)

## Code of Conduct

Buďte profesionální a respektující. Vítáme příspěvky od všech bez ohledu na zkušenosti.

## Jak začít

### 1. Fork & Clone

```bash
# Fork repository na GitHubu
# Pak clone your fork
git clone https://github.com/your-username/ucebniceNew.git
cd ucebniceNew
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Copy .env.example to .env a vyplňte hodnoty
cp .env.example .env
```

### 4. Start Development Server

```bash
npm run dev
```

Aplikace poběží na `http://localhost:3000`

## Vývojový proces

### Branches

- `main` - produkční branch (pouze přes PR)
- `develop` - development branch (optional)
- `feature/feature-name` - nové funkce
- `fix/bug-name` - opravy bugů
- `docs/documentation-topic` - dokumentace

### Git Workflow

1. **Vytvořte novou branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Proveďte změny**
   - Pište čistý, čitelný kód
   - Dodržujte coding standards
   - Přidávejte testy

3. **Commit changes**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

4. **Push to your fork**

   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Otevřete PR na GitHubu
   - Vyplňte PR template
   - Počkejte na review

## Coding Standards

### TypeScript

- **Strict mode**: Používáme TypeScript strict mode
- **Type safety**: Vyhýbejte se `any`, používejte explicitní typy
- **Interfaces**: Preferujte interfaces před types pro objekty

```typescript
// ✅ Good
interface UserProps {
  name: string
  email: string
  age: number
}

// ❌ Avoid
type UserProps = {
  name: any
  email: any
}
```

### React Components

- **Functional components**: Používejte pouze functional components
- **Hooks**: Používejte React hooks (useState, useEffect, etc.)
- **Memo**: Použijte React.memo pro často renderované komponenty
- **Props types**: Vždy definujte prop types

```typescript
// ✅ Good
interface ButtonProps {
  variant: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

export const Button = memo(({ variant, onClick, children }: ButtonProps) => {
  return <button onClick={onClick}>{children}</button>
})
```

### File Organization

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # UI primitives (Button, Input, etc.)
│   ├── chapters/       # Chapter-related components
│   └── gamification/   # Gamification components
├── lib/                # Utility functions
├── hooks/              # Custom React hooks
└── data/               # Static data
```

### Naming Conventions

- **Components**: PascalCase (`ChapterCard.tsx`)
- **Utilities**: camelCase (`calculateLevel.ts`)
- **Constants**: UPPER_SNAKE_CASE (`XP_PER_CHAPTER`)
- **CSS classes**: kebab-case nebo Tailwind classes

### Code Style

Používáme **Prettier** a **ESLint**. Pre-commit hook automaticky formátuje kód.

```bash
# Manuální formatting
npm run format

# Lint check
npm run lint

# Type check
npm run type-check
```

## Commit Messages

Používáme **Conventional Commits** formát:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: Nová funkce
- `fix`: Oprava bugu
- `docs`: Dokumentace
- `style`: Code style změny (formatting, bez změny logiky)
- `refactor`: Refactoring kódu
- `test`: Přidání nebo úprava testů
- `chore`: Maintenance úkoly (dependencies, build, atd.)
- `perf`: Performance improvement

### Examples

```bash
# Nová funkce
git commit -m "feat(chapters): add video player controls"

# Oprava bugu
git commit -m "fix(auth): resolve session timeout issue"

# Dokumentace
git commit -m "docs(readme): update installation instructions"

# Refactoring
git commit -m "refactor(gamification): extract XP calculation to utility"
```

## Pull Request Process

### Před vytvořením PR

1. **Aktualizujte svou branch**

   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Ujistěte se, že všechny testy prochází**

   ```bash
   npm run test
   npm run test:e2e
   ```

3. **Type check**

   ```bash
   npm run type-check
   ```

4. **Lint check**

   ```bash
   npm run lint
   ```

5. **Build check**
   ```bash
   npm run build
   ```

### PR Template

```markdown
## Description

Stručný popis změn

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests pass locally
```

### Code Review

- PR musí projít code review od maintainerů
- Buďte otevření k feedback
- Odpovídejte na komentáře promptně
- Proveďte požadované změny

## Testing Requirements

### Unit Tests (Jest)

Píšeme testy pro:

- Utility funkce
- React komponenty
- Custom hooks

```typescript
// Example test
describe('calculateLevel', () => {
  it('should return level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1)
  })

  it('should return level 2 for 100 XP', () => {
    expect(calculateLevel(100)).toBe(2)
  })
})
```

**Minimum coverage**: 30% (target: 80%)

### E2E Tests (Playwright)

Píšeme E2E testy pro:

- Kritické user flows (registrace, login)
- Chapter completion
- Achievement unlock
- Mobile responsive

```typescript
// Example E2E test
test('user can complete a chapter', async ({ page }) => {
  await page.goto('/chapters/intro')
  await page.click('button:has-text("Dokončit")')
  await expect(page.locator('.success-message')).toBeVisible()
})
```

### Spuštění testů

```bash
# Unit tests
npm test

# Unit tests with coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui
```

## Dokumentace

### Code Comments

- Přidávejte komentáře pro **komplexní logiku**
- Používejte **JSDoc** pro public funkce
- Komentáře v **češtině** nebo **angličtině**

```typescript
/**
 * Calculates user level based on total XP using quadratic growth formula
 * @param xp - Total experience points
 * @returns Calculated level (minimum 1)
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}
```

### API Documentation

Pro API endpointy používáme **Swagger/OpenAPI**:

```typescript
/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: Get user statistics
 *     responses:
 *       200:
 *         description: Success
 */
export async function GET() {
  // ...
}
```

### Component Documentation

Pro UI komponenty používáme **Storybook**:

```typescript
// Button.stories.tsx
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Click me',
  },
}
```

## Questions?

Pokud máte jakékoliv otázky:

1. Zkontrolujte [README.md](./README.md)
2. Podívejte se na [existující issues](https://github.com/martinsvanda/ucebniceNew/issues)
3. Vytvořte nový issue s labelem `question`

## License

Přispíváním do tohoto projektu souhlasíte s licencí projektu.

---

**Autor**: Martin Svanda
**Projekt**: Učebnice programování AI
