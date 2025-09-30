# 📚 KOMPLETNÍ ANALÝZA PROGRAMU - Učebnice programování s AI
**Autor projektu**: Martin Švanda
**Datum analýzy**: 30. září 2025
**Verze**: 1.0.0

---

## 📋 Obsah
1. [Obecný přehled](#obecný-přehled)
2. [Struktura projektu](#struktura-projektu)
3. [Detailní analýza funkcí](#detailní-analýza-funkcí)
4. [Analýza tříd a komponent](#analýza-tříd-a-komponent)
5. [Datové struktury](#datové-struktury)
6. [Tok dat a interakce](#tok-dat-a-interakce)
7. [Bezpečnost a validace](#bezpečnost-a-validace)
8. [Performance a optimalizace](#performance-a-optimalizace)
9. [Testing](#testing)
10. [Dokumentace](#dokumentace)
11. [Shrnutí a hodnocení](#shrnutí-a-hodnocení)
12. [Kompletní seznam funkcí](#kompletní-seznam-funkcí)
13. [Dependency graf](#dependency-graf)

---

## 🎯 Obecný přehled

### Účel programu
**Prémiový vzdělávací ekosystém** pro výuku programování s důrazem na umělou inteligenci, gamifikaci a interaktivní učení. Aplikace kombinuje moderní webové technologie s pokročilými vizuálními efekty a propracovaným systémem odměn pro motivaci studentů.

### Použité technologie
| Technologie | Verze | Účel |
|------------|-------|------|
| **Next.js** | 14.2.7 | React framework s App Router |
| **TypeScript** | 5.5.3 | Type-safe development |
| **Prisma** | 6.16.2 | ORM a databázový toolkit |
| **NextAuth.js** | 4.24.11 | Autentifikace (Google, GitHub, Credentials) |
| **Zustand** | 4.5.2 | State management s persistence |
| **Tailwind CSS** | 3.4.7 | Utility-first CSS framework |
| **Framer Motion** | 11.3.17 | Animace a transitions |
| **D3.js** | 7.9.0 | Datové vizualizace (skill graph) |
| **React Three Fiber** | 8.15.0 | 3D grafika s Three.js |
| **React Query** | 5.51.1 | Server state management |
| **jsPDF** | 2.5.1 | Generování PDF certifikátů |
| **bcryptjs** | 3.0.2 | Password hashing |

### Architektura
- **Typ aplikace**: Progressive Web App (PWA ready)
- **Rendering strategie**: Hybrid SSR/SSG s ISR
- **Databáze**: SQLite (development), připraveno pro PostgreSQL
- **API**: REST API s Next.js Route Handlers
- **Autentifikace**: JWT tokens + session cookies
- **Deployment**: Vercel/Netlify ready

### Velikost a složitost
| Metrika | Hodnota |
|---------|---------|
| **Celkové řádky kódu** | 12,350 řádků |
| **TypeScript soubory** | 70 souborů |
| **React komponenty** | 30+ komponent |
| **API endpointy** | 2 routes |
| **Databázové modely** | 9 modelů |
| **Kapitoly/Lekce** | 40 kapitol |
| **Jupyter notebooky** | 40 notebooků |
| **Velikost projektu** | 1.6 GB |
| **Dependencies** | 44 balíčků |

---

## 📁 Struktura projektu

```
ucebniceNew/
├── 📂 src/                                    # Zdrojové soubory aplikace
│   ├── 📂 app/                               # Next.js App Router (stránky a layouts)
│   │   ├── 📄 layout.tsx                     # Root layout aplikace
│   │   ├── 📄 page.tsx                       # Homepage (landing page)
│   │   ├── 📄 globals.css                    # Globální styly
│   │   ├── 📂 achievements/                  # Stránka s odznaky
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 api/                          # API route handlers
│   │   │   └── 📂 auth/
│   │   │       ├── 📂 [...nextauth]/        # NextAuth catch-all route
│   │   │       │   └── 📄 route.ts
│   │   │       └── 📂 register/             # Registrační endpoint
│   │   │           └── 📄 route.ts
│   │   ├── 📂 arena/                        # Apex Aréna (hackathony, absolventi)
│   │   │   ├── 📄 page.tsx
│   │   │   ├── 📂 graduate/[graduateId]/
│   │   │   └── 📂 hackathon/[hackathonId]/
│   │   ├── 📂 auth/                         # Autentifikační stránky
│   │   │   ├── 📂 signin/
│   │   │   │   └── 📄 page.tsx
│   │   │   └── 📂 signup/
│   │   │       └── 📄 page.tsx
│   │   ├── 📂 certificate/                  # Generování certifikátů
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 chapters/                     # Kapitoly kurzu
│   │   │   ├── 📄 page.tsx                  # Seznam kapitol
│   │   │   └── 📂 [chapterId]/              # Detail kapitoly
│   │   │       └── 📄 page.tsx
│   │   ├── 📂 dashboard/                    # Uživatelský dashboard
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 demo/                         # Demo komponenty
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 examples/                     # Příklady layoutů
│   │   │   └── 📂 layout-example/
│   │   ├── 📂 leaderboard/                  # Žebříček uživatelů
│   │   │   └── 📄 page.tsx
│   │   ├── 📂 lessons/                      # Lekce a cvičení
│   │   │   ├── 📄 page.tsx                  # Seznam lekcí
│   │   │   └── 📂 [lessonId]/               # Detail lekce
│   │   │       └── 📄 page.tsx
│   │   ├── 📂 onboarding/                   # Onboarding flow
│   │   │   └── 📄 page.tsx
│   │   └── 📂 profile/                      # Uživatelský profil
│   │       └── 📄 page.tsx
│   │
│   ├── 📂 components/                        # React komponenty
│   │   ├── 📄 auth-provider.tsx             # AuthProvider wrapper
│   │   ├── 📄 providers.tsx                 # Root providers (React Query, Auth)
│   │   ├── 📂 certificate/                  # Komponenty pro certifikáty
│   │   │   └── 📄 certificate-generator.tsx
│   │   ├── 📂 cognitive-glitch/             # Cognitive Glitch systém
│   │   │   └── 📄 cognitive-glitch-modal.tsx
│   │   ├── 📂 chapters/                     # Komponenty pro kapitoly
│   │   │   ├── 📄 ChapterLayout.tsx
│   │   │   ├── 📄 ChapterHeader.tsx
│   │   │   ├── 📄 ChapterContent.tsx
│   │   │   ├── 📄 ChapterCard.tsx
│   │   │   ├── 📄 VideoPlayer.tsx
│   │   │   ├── 📄 NotebookLinks.tsx
│   │   │   └── 📄 ChapterNavigation.tsx
│   │   ├── 📂 layout/                       # Layout komponenty
│   │   │   ├── 📄 navigation.tsx            # Hlavní navigace
│   │   │   ├── 📄 stack.tsx                 # Stack layout
│   │   │   ├── 📄 grid.tsx                  # Grid layout
│   │   │   ├── 📄 box.tsx                   # Box container
│   │   │   └── 📄 index.ts                  # Export barrel
│   │   ├── 📂 onboarding/                   # Onboarding komponenty
│   │   │   └── 📄 onboarding-flow.tsx
│   │   ├── 📂 skills/                       # Skill graph vizualizace
│   │   │   └── 📄 competence-nebula.tsx     # D3.js force-directed graph
│   │   └── 📂 ui/                           # UI komponenty knihovna
│   │       ├── 📄 button.tsx                # Button komponenta
│   │       ├── 📄 glass-surface.tsx         # Glassmorphism efekt
│   │       ├── 📄 electric-border.tsx       # Animovaný elektrický border
│   │       ├── 📄 lightning.tsx             # Animované blesky
│   │       ├── 📄 lightning-background.tsx  # Lightning pozadí
│   │       ├── 📄 fluid-glass.tsx           # 3D fluid glass (Three.js)
│   │       ├── 📄 fluid-glass-simple.tsx    # Simplified verze
│   │       ├── 📄 fluid-glass-fallback.tsx  # Fallback pro non-WebGL
│   │       ├── 📄 fuzzy-text.tsx            # Blur text animace
│   │       ├── 📄 decrypted-text.tsx        # Matrix-style decrypt
│   │       ├── 📄 falling-text.tsx          # Padající text animace
│   │       ├── 📄 laser-flow.tsx            # Laser line efekt
│   │       ├── 📄 profile-card.tsx          # Uživatelská karta
│   │       ├── 📄 box.tsx                   # Box primitiv
│   │       ├── 📄 stack.tsx                 # Stack primitiv
│   │       ├── 📄 grid.tsx                  # Grid primitiv
│   │       └── 📄 index.ts                  # Export barrel
│   │
│   ├── 📂 data/                             # Statická data
│   │   ├── 📄 chapters.ts                   # 40 kapitol s metadaty
│   │   └── 📄 skills-graph.ts               # Graf dovedností (24 nodes)
│   │
│   ├── 📂 lib/                              # Utility knihovny
│   │   ├── 📄 auth.ts                       # NextAuth konfigurace
│   │   ├── 📄 prisma.ts                     # Prisma client singleton
│   │   ├── 📄 utils.ts                      # Utility funkce
│   │   ├── 📄 constants.ts                  # Konstanty (XP, badges, config)
│   │   ├── 📄 glitch-challenges.ts          # Cognitive Glitch výzvy
│   │   └── 📄 theme.ts                      # Theme konstanty
│   │
│   ├── 📂 services/                         # Služby a API klienti
│   │   └── 📄 lesson-service.ts             # Služba pro lekce
│   │
│   ├── 📂 store/                            # Zustand stores
│   │   └── 📄 user-store.ts                 # User state management
│   │
│   ├── 📂 types/                            # TypeScript definice
│   │   ├── 📄 lesson.ts                     # Lesson, Module typy
│   │   ├── 📄 skills.ts                     # SkillNode, SkillLink typy
│   │   ├── 📄 arena.ts                      # Hackathon, Graduate typy
│   │   └── 📄 next-auth.d.ts                # NextAuth type extensions
│   │
│   └── 📄 middleware.ts                     # Next.js middleware (auth protection)
│
├── 📂 prisma/                               # Prisma ORM
│   ├── 📄 schema.prisma                     # Databázové schéma (9 modelů)
│   ├── 📄 dev.db                            # SQLite development databáze
│   └── 📂 migrations/                       # Database migrations
│
├── 📂 public/                               # Statické assety
│   ├── 📂 assets/
│   │   ├── 📂 3d/                           # 3D modely
│   │   └── 📂 demo/                         # Demo obrázky
│   └── 📂 images/                           # Obrázky
│       ├── 📄 default-avatar.png
│       ├── 📄 google-icon.svg
│       ├── 📄 grain-texture.png
│       └── 📄 profile-icon.png
│
├── 📂 colab_notebooks/                      # Jupyter notebooky (40 ks)
│   ├── 📄 00_index.ipynb
│   ├── 📄 kapitola_01_úvod_do_terminálu_a_příkazové_řádky.ipynb
│   ├── 📄 kapitola_02_instalace_vývojových_nástrojů.ipynb
│   └── ... (38 dalších notebooků)
│
├── 📂 prednasky/                            # Markdown přednášky (40 ks)
│   ├── 📄 Kapitola01_text-k-hodine-01.md
│   ├── 📄 Kapitola02_text-k-hodine-02.md
│   └── ... (38 dalších přednášek)
│
├── 📂 texty/                                # Markdown texty k hodinám (40 ks)
│   ├── 📄 text-k-hodine-01.md
│   ├── 📄 text-k-hodine-02.md
│   └── ... (38 dalších textů)
│
├── 📂 videa/                                # Video lekce (38 videí)
│   ├── 📄 Hodina1.mp4
│   ├── 📄 Hodina2.mp4
│   └── ... (36 dalších videí)
│
├── 📂 scripts/                              # Pomocné skripty
│   ├── 📄 generate-grain-texture.js
│   └── 📄 generate-grain-svg.js
│
├── 📄 next.config.js                        # Next.js konfigurace
├── 📄 tailwind.config.js                    # Tailwind CSS konfigurace
├── 📄 tsconfig.json                         # TypeScript konfigurace
├── 📄 postcss.config.js                     # PostCSS konfigurace
├── 📄 package.json                          # NPM dependencies
└── 📄 ANALYZA_KOMPLETNI.md                  # Tento dokument
```

---

## 🔧 Detailní analýza funkcí

### 📂 Soubor: `src/lib/utils.ts`

#### Funkce: `cn()`
- **Umístění**: src/lib/utils.ts:14
- **Účel**: Bezpečně slučuje Tailwind CSS třídy s inteligentní detekcí konfliktů
- **Parametry**:
  - `...inputs: ClassValue[]` - Libovolný počet CSS tříd, objektů nebo podmíněných výrazů
- **Návratová hodnota**: `string` - Sloučený řetězec CSS tříd
- **Závislosti**: `clsx`, `tailwind-merge`
- **Složitost**: O(n) - lineární podle počtu vstupních tříd
- **Kód**:
```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Příklady použití:
// cn('px-4 py-2', 'bg-blue-500') → 'px-4 py-2 bg-blue-500'
// cn('p-2', 'p-4') → 'p-4' (tailwind-merge vyřeší konflikt)
// cn({ 'bg-red-500': isError }, 'text-white') → podmíněné třídy
```

**Proč je tato funkce důležitá:**
Tailwind CSS umožňuje kombinovat utility třídy, ale při konfliktních třídách (např. `p-2` a `p-4`) může dojít k neočekávanému chování. `tailwind-merge` inteligentně detekuje tyto konflikty a zachová pouze poslední (nejspecifičtější) hodnotu. `clsx` zase umožňuje podmíněné třídy a čistší syntax.

---

#### Funkce: `generateColabUrl()`
- **Umístění**: src/lib/utils.ts:30
- **Účel**: Generuje URL pro přímé otevření Jupyter notebooku v Google Colab
- **Parametry**:
  - `user: string` - GitHub username (např. 'martinsvanda')
  - `repo: string` - Název GitHub repozitáře
  - `branch: string` - Název větve (např. 'main', 'develop')
  - `notebookPath: string` - Relativní cesta k notebooku v repozitáři
- **Návratová hodnota**: `string` - Kompletní Google Colab URL
- **Závislosti**: Žádné
- **Složitost**: O(1) - konstantní čas
- **Kód**:
```typescript
export function generateColabUrl(
  user: string,
  repo: string,
  branch: string,
  notebookPath: string
): string {
  // Odstranit počáteční lomítko pokud existuje
  const cleanPath = notebookPath.startsWith('/')
    ? notebookPath.slice(1)
    : notebookPath;

  return `https://colab.research.google.com/github/${user}/${repo}/blob/${branch}/${cleanPath}`;
}

// Příklad:
// generateColabUrl(
//   'martinsvanda',
//   'ucebnice-programovani',
//   'main',
//   'colab_notebooks/kapitola_01.ipynb'
// )
// → 'https://colab.research.google.com/github/martinsvanda/ucebnice-programovani/blob/main/colab_notebooks/kapitola_01.ipynb'
```

**Integrace s lekcemi:**
Každá lekce má tlačítko "Otevřít v Colab", které používá tuto funkci k vytvoření direct linku. Student tak může začít pracovat s notebookem jediným kliknutím, bez nutnosti klonovat repository nebo instalovat lokální prostředí.

---

### 📂 Soubor: `src/lib/glitch-challenges.ts`

Tento soubor implementuje **Cognitive Glitch systém** - unikátní gamifikační prvek, který náhodně během kurzu spouští krátkodobé výzvy (kvízy) pro testování znalostí a udržení pozornosti studenta.

#### Funkce: `getRandomChallenge()`
- **Umístění**: src/lib/glitch-challenges.ts:189
- **Účel**: Vybere náhodnou výzvu přizpůsobenou úrovni uživatele
- **Parametry**:
  - `level: number` - Aktuální level uživatele (1-100)
  - `category?: string` - Volitelná kategorie ('ai_basics', 'algorithms', 'machine_learning', 'neural_networks', 'programming')
- **Návratová hodnota**: `GlitchChallenge` - Objekt s výzvou
- **Závislosti**: `challenges` (databáze výzev)
- **Složitost**: O(n) - lineární podle počtu výzev
- **Kód**:
```typescript
export function getRandomChallenge(level: number, category?: string): GlitchChallenge {
  // 1. Adaptivní obtížnost podle levelu
  let difficulty: 'easy' | 'medium' | 'hard';
  if (level < 10) {
    difficulty = 'easy';  // Začátečníci dostanou easy
  } else if (level < 30) {
    difficulty = Math.random() > 0.5 ? 'easy' : 'medium';  // Mix easy/medium
  } else {
    difficulty = Math.random() > 0.5 ? 'medium' : 'hard';  // Mix medium/hard
  }

  // 2. Filtrování výzev podle kategorie a obtížnosti
  let availableChallenges: GlitchChallenge[] = [];

  if (category) {
    // Pokud je zadána kategorie, vyber pouze z ní
    availableChallenges = challenges[category]?.filter(
      ch => ch.difficulty === difficulty
    ) || [];
  } else {
    // Jinak vyber ze všech kategorií
    Object.values(challenges).forEach(categoryChalls => {
      availableChallenges.push(
        ...categoryChalls.filter(ch => ch.difficulty === difficulty)
      );
    });
  }

  // 3. Fallback: Pokud nejsou žádné výzvy s danou obtížností
  if (availableChallenges.length === 0) {
    const allChallenges = Object.values(challenges).flat();
    availableChallenges = allChallenges.filter(
      ch => category ? ch.category === category : true
    );
  }

  // 4. Vrátit náhodnou výzvu z dostupných
  const randomIndex = Math.floor(Math.random() * availableChallenges.length);
  return availableChallenges[randomIndex];
}
```

**Logika adaptivní obtížnosti:**
- Level 1-9: Pouze `easy` výzvy
- Level 10-29: 50% `easy`, 50% `medium`
- Level 30+: 50% `medium`, 50% `hard`

Tím je zajištěno, že výzvy jsou vždy přiměřeně náročné a motivující.

---

#### Funkce: `calculateGlitchReward()`
- **Umístění**: src/lib/glitch-challenges.ts:223
- **Účel**: Vypočítá XP odměnu za vyřešení výzvy s bonusy a penalizacemi
- **Parametry**:
  - `challenge: GlitchChallenge` - Výzva, kterou uživatel řešil
  - `baseReward: number` - Základní odměna (typicky 50 XP)
  - `streak: number` - Aktuální série úspěšných glitchů
  - `hintUsed: boolean` - Použil uživatel nápovědu?
  - `timeElapsed: number` - Čas strávený řešením (v sekundách)
- **Návratová hodnota**: `number` - Finální XP odměna
- **Závislosti**: `GLITCH_CONFIG`
- **Složitost**: O(1) - konstantní čas
- **Kód**:
```typescript
export function calculateGlitchReward(
  challenge: GlitchChallenge,
  baseReward: number,
  streak: number,
  hintUsed: boolean,
  timeElapsed: number
): number {
  let reward = baseReward;  // Start s 50 XP

  // 1. Multiplikátor za obtížnost
  const difficultyMultiplier = {
    easy: 1,      // 50 XP
    medium: 1.5,  // 75 XP
    hard: 2       // 100 XP
  };
  reward *= difficultyMultiplier[challenge.difficulty];

  // 2. Bonus za streak (série úspěchů)
  // +5 XP za každý úspěšný glitch v sérii
  reward += streak * 5;

  // 3. Penalizace za použití nápovědy
  if (hintUsed) {
    reward *= 0.7; // -30% (motivace zkusit to bez nápovědy)
  }

  // 4. Bonus za rychlost
  const timeLimit = challenge.timeLimit || GLITCH_CONFIG.TIME_LIMIT; // 120s
  if (timeElapsed < timeLimit / 2) {
    reward *= 1.2; // +20% za vyřešení rychleji než za 60s
  }

  // 5. Globální XP multiplikátor
  reward *= GLITCH_CONFIG.XP_MULTIPLIER; // 2x (glitche dávají double XP)

  return Math.round(reward);
}

// Příklad:
// Hard výzva, streak 3, bez hintu, čas 45s
// 50 * 2 (hard) + 15 (streak) = 115
// 115 * 1.2 (rychlost) = 138
// 138 * 2 (multiplier) = 276 XP!
```

**Matematický model odměn:**
```
FinalXP = (BaseXP × Difficulty + Streak × 5) × HintPenalty × SpeedBonus × GlobalMultiplier

Kde:
- BaseXP = 50
- Difficulty = {easy: 1, medium: 1.5, hard: 2}
- Streak bonus = +5 XP per streak
- HintPenalty = {used: 0.7, not_used: 1.0}
- SpeedBonus = {fast: 1.2, normal: 1.0}
- GlobalMultiplier = 2.0
```

**Rozsah odměn:**
- Minimální: 70 XP (easy, hint, slow, no streak)
- Typická: 150-200 XP
- Maximální: 500+ XP (hard, no hint, fast, high streak)

---

#### Funkce: `shouldTriggerGlitch()`
- **Umístění**: src/lib/glitch-challenges.ts:261
- **Účel**: Rozhodne, zda má být spuštěn Cognitive Glitch
- **Parametry**:
  - `completedLessons: number` - Počet dokončených lekcí
  - `lastGlitchTime?: Date` - Čas posledního glitche (optional)
  - `forceChance?: number` - Přepsání pravděpodobnosti (pro testování)
- **Návratová hodnota**: `boolean` - true = spustit glitch, false = nespouštět
- **Závislosti**: `GLITCH_CONFIG`
- **Složitost**: O(1) - konstantní čas
- **Kód**:
```typescript
export function shouldTriggerGlitch(
  completedLessons: number,
  lastGlitchTime?: Date,
  forceChance?: number
): boolean {
  // 1. Kontrola minimálního počtu lekcí
  // (Nechceme otravovat začátečníky hned první hodinu)
  if (completedLessons < GLITCH_CONFIG.MIN_LESSONS_BEFORE_GLITCH) {
    return false;  // MIN_LESSONS_BEFORE_GLITCH = 3
  }

  // 2. Kontrola cooldownu (anti-spam mechanismus)
  if (lastGlitchTime) {
    const now = Date.now();
    const lastGlitchMs = lastGlitchTime.getTime();
    const minutesSinceLastGlitch = (now - lastGlitchMs) / (1000 * 60);

    if (minutesSinceLastGlitch < GLITCH_CONFIG.COOLDOWN_MINUTES) {
      return false;  // COOLDOWN_MINUTES = 30
    }
  }

  // 3. Pravděpodobnostní kontrola
  const chance = forceChance ?? GLITCH_CONFIG.TRIGGER_PROBABILITY;
  return Math.random() < chance;  // TRIGGER_PROBABILITY = 0.1 (10%)
}

// Příklad použití v lesson page:
// const shouldShow = shouldTriggerGlitch(
//   userProgress.length,  // např. 5 lekcí
//   user.lastGlitchAt     // např. před 45 minutami
// );
//
// if (shouldShow) {
//   setShowGlitchModal(true);
// }
```

**Trigger podmínky:**
1. ✅ Uživatel dokončil alespoň 3 lekce
2. ✅ Od posledního glitche uplynulo min. 30 minut
3. ✅ Pravděpodobnostní check (10% šance při každém dokončení lekce)

**Frekvence glitchů:**
Při 10% pravděpodobnosti a průměrné délce lekce 30 minut očekáváme glitch přibližně každých **10 lekcí** (tj. každých ~5 hodin studia).

---

#### Funkce: `getCategoryForLesson()`
- **Umístění**: src/lib/glitch-challenges.ts:285
- **Účel**: Mapuje lekci na kategorii výzev pro kontextově relevantní glitche
- **Parametry**:
  - `lessonId: string` - ID lekce (např. '01', '15', '32')
- **Návratová hodnota**: `string` - Kategorie ('ai_basics', 'algorithms', atd.)
- **Závislosti**: Žádné
- **Složitost**: O(1)
- **Kód**:
```typescript
export function getCategoryForLesson(lessonId: string): string {
  const lessonNumber = parseInt(lessonId);

  if (lessonNumber <= 10) return 'ai_basics';
  if (lessonNumber <= 20) return 'algorithms';
  if (lessonNumber <= 30) return 'machine_learning';
  if (lessonNumber <= 40) return 'neural_networks';

  return 'programming'; // fallback
}

// Mapování lekcí na kategorie:
// Kapitoly 1-10  → AI základy (co je AI, historie, etika)
// Kapitoly 11-20 → Algoritmy (vyhledávání, řazení, grafy)
// Kapitoly 21-30 → Machine Learning (regrese, klasifikace, clustering)
// Kapitoly 31-40 → Neuronové sítě (perceptron, CNN, RNN, transformery)
```

---

#### Databáze výzev: `challenges`
- **Umístění**: src/lib/glitch-challenges.ts:16
- **Účel**: Centrální databáze všech Cognitive Glitch výzev
- **Struktura**: `Record<string, GlitchChallenge[]>` - Mapa kategorie → pole výzev
- **Celkový počet výzev**: 11 výzev v 5 kategoriích
- **Kód (ukázka)**:
```typescript
const challenges: Record<string, GlitchChallenge[]> = {
  ai_basics: [
    {
      id: 'ai_001',
      question: 'Co znamená zkratka AI?',
      options: [
        'Artificial Intelligence',
        'Automated Interface',
        'Advanced Integration',
        'Analytical Insight'
      ],
      correct: 0,
      difficulty: 'easy',
      category: 'ai_basics',
      explanation: 'AI je zkratka pro Artificial Intelligence, česky umělá inteligence.'
    },
    {
      id: 'ai_002',
      question: 'Který z těchto pojmů NENÍ přímo spojen s machine learningem?',
      options: [
        'Supervised learning',
        'Neural networks',
        'Quantum entanglement',
        'Deep learning'
      ],
      correct: 2,
      difficulty: 'medium',
      category: 'ai_basics',
      hint: 'Jeden z pojmů patří do kvantové fyziky.',
      explanation: 'Quantum entanglement je pojem z kvantové fyziky, ne z machine learningu.'
    }
    // ... další výzvy
  ],

  algorithms: [
    {
      id: 'algo_001',
      question: 'Jaká je časová složitost algoritmu BFS?',
      options: ['O(n)', 'O(V + E)', 'O(n log n)', 'O(n²)'],
      correct: 1,
      difficulty: 'medium',
      category: 'algorithms',
      hint: 'V = počet vrcholů, E = počet hran',
      explanation: 'BFS má časovou složitost O(V + E), kde V je počet vrcholů a E počet hran v grafu.'
    }
    // ... další výzvy
  ],

  machine_learning: [
    {
      id: 'ml_001',
      question: 'Co je overfitting?',
      options: [
        'Model je příliš jednoduchý',
        'Model se příliš přizpůsobí trénovacím datům',
        'Model je příliš rychlý',
        'Model používá příliš málo dat'
      ],
      correct: 1,
      difficulty: 'medium',
      category: 'machine_learning',
      explanation: 'Overfitting nastává, když se model příliš přizpůsobí trénovacím datům a ztrácí schopnost generalizace.'
    }
    // ... další výzvy
  ],

  neural_networks: [
    {
      id: 'nn_001',
      question: 'Co dělá aktivační funkce ReLU?',
      options: ['max(0, x)', 'sigmoid(x)', 'tanh(x)', 'x²'],
      correct: 0,
      difficulty: 'easy',
      category: 'neural_networks',
      explanation: 'ReLU (Rectified Linear Unit) vrací maximum z 0 a vstupní hodnoty: max(0, x).'
    }
    // ... další výzvy
  ],

  programming: [
    {
      id: 'prog_001',
      question: 'Jaký je výstup: print(type([]))',
      options: ["<class 'list'>", "<class 'array'>", "<class 'dict'>", "list"],
      correct: 0,
      difficulty: 'easy',
      category: 'programming',
      explanation: 'V Pythonu prázdné hranaté závorky [] vytvářejí list objekt.'
    }
    // ... další výzvy
  ]
};
```

**Statistika výzev podle obtížnosti:**
- **Easy**: 3 výzvy (27%)
- **Medium**: 6 výzev (55%)
- **Hard**: 2 výzvy (18%)

---

### 📂 Soubor: `src/store/user-store.ts`

Tento soubor implementuje **Zustand store** - centrální state management pro všechny uživatelské data. Store je perzistentní (ukládá se do localStorage), takže data přežijí refresh stránky.

#### Store: `useUserStore`
- **Umístění**: src/store/user-store.ts:53
- **Účel**: Globální state management pro uživatele
- **Type**: Zustand store s persistence middleware
- **Persistence**: localStorage pod klíčem 'user-storage'
- **Složitost**: O(1) pro většinu operací, O(n) pro filtrování
- **Kód**:
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Typy
interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: Date
}

interface UserProgress {
  lessonId: string
  completedAt: Date
  xpEarned: number
}

interface UserState {
  // === USER INFO ===
  userId: string | null
  username: string | null
  email: string | null
  avatar: string | null
  onboardingCompleted: boolean
  userGoal: string | null
  experienceLevel: string | null

  // === GAMIFICATION ===
  xp: number
  level: number
  streak: number
  lastActiveDate: string | null
  badges: Badge[]
  progress: UserProgress[]

  // === ACTIONS ===
  setUser: (user: { userId: string; username: string; email: string; avatar?: string }) => void
  setUsername: (username: string) => void
  completeOnboarding: () => void
  setUserPreferences: (goal: string, experience: string) => void
  addXP: (amount: number) => void
  addBadge: (badge: Badge) => void
  updateStreak: () => void
  unlockBadge: (badge: Badge) => void
  completeLesson: (lessonId: string, xpEarned: number) => void
  reset: () => void
}

// Helper funkce pro výpočet levelu
const calculateLevel = (xp: number): number => {
  return Math.floor(Math.sqrt(xp / 100)) + 1
}
// Matematika levelu:
// Level 1: 0-99 XP
// Level 2: 100-399 XP (sqrt(100/100) + 1 = 2)
// Level 3: 400-899 XP (sqrt(400/100) + 1 = 3)
// Level 10: 8100-9999 XP (sqrt(8100/100) + 1 = 10)

// Vytvoření store
export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      // === INITIAL STATE ===
      userId: null,
      username: null,
      email: null,
      avatar: null,
      onboardingCompleted: false,
      userGoal: null,
      experienceLevel: null,
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: null,
      badges: [],
      progress: [],

      // === ACTIONS IMPLEMENTATION ===

      // Nastavení základních info o uživateli
      setUser: (user) => set({
        userId: user.userId,
        username: user.username,
        email: user.email,
        avatar: user.avatar || null,
      }),

      // Změna username
      setUsername: (username) => set({ username }),

      // Označení onboardingu jako dokončeného
      completeOnboarding: () => set({ onboardingCompleted: true }),

      // Uložení preferencí z onboardingu
      setUserPreferences: (goal, experience) => set({
        userGoal: goal,
        experienceLevel: experience,
      }),

      // Přidání XP a automatický přepočet levelu
      addXP: (amount) => set((state) => {
        const newXP = state.xp + amount
        const newLevel = calculateLevel(newXP)
        return {
          xp: newXP,
          level: newLevel,
        }
      }),

      // Přidání badge (kontrola duplicity)
      addBadge: (badge) => set((state) => {
        const exists = state.badges.some(b => b.id === badge.id)
        if (exists) return state  // Již máme tento badge

        return {
          badges: [
            ...state.badges,
            {
              ...badge,
              unlockedAt: badge.unlockedAt || new Date()
            }
          ],
        }
      }),

      // Aktualizace denního streaku
      updateStreak: () => set((state) => {
        const today = new Date().toDateString()
        const lastActive = state.lastActiveDate

        // První přihlášení
        if (!lastActive) {
          return { streak: 1, lastActiveDate: today }
        }

        // Výpočet rozdílu dnů
        const lastDate = new Date(lastActive)
        const todayDate = new Date(today)
        const dayDiff = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (dayDiff === 0) {
          // Stejný den, žádná změna
          return state
        } else if (dayDiff === 1) {
          // Konzekutivní den, zvýšit streak
          return {
            streak: state.streak + 1,
            lastActiveDate: today,
          }
        } else {
          // Streak přerušen, reset na 1
          return {
            streak: 1,
            lastActiveDate: today,
          }
        }
      }),

      // Odemknutí badge (alias pro addBadge)
      unlockBadge: (badge) => set((state) => ({
        badges: [...state.badges, { ...badge, unlockedAt: new Date() }],
      })),

      // Dokončení lekce
      completeLesson: (lessonId, xpEarned) => set((state) => {
        // Kontrola, zda už není dokončená
        const alreadyCompleted = state.progress.some(p => p.lessonId === lessonId)
        if (alreadyCompleted) return state

        // Přidání do progress a aktualizace XP/level
        const newXP = state.xp + xpEarned
        const newLevel = calculateLevel(newXP)

        return {
          progress: [
            ...state.progress,
            {
              lessonId,
              completedAt: new Date(),
              xpEarned,
            }
          ],
          xp: newXP,
          level: newLevel,
        }
      }),

      // Reset celého store (logout)
      reset: () => set({
        userId: null,
        username: null,
        email: null,
        avatar: null,
        onboardingCompleted: false,
        userGoal: null,
        experienceLevel: null,
        xp: 0,
        level: 1,
        streak: 0,
        lastActiveDate: null,
        badges: [],
        progress: [],
      }),
    }),
    {
      name: 'user-storage',  // localStorage key
    }
  )
)
```

**Použití v komponentách:**
```typescript
import { useUserStore } from '@/store/user-store'

function ProfileCard() {
  // Selective subscribe (pouze tyto proměnné způsobí re-render)
  const { username, xp, level, streak } = useUserStore((state) => ({
    username: state.username,
    xp: state.xp,
    level: state.level,
    streak: state.streak,
  }))

  // Actions
  const addXP = useUserStore((state) => state.addXP)

  return (
    <div>
      <h2>{username}</h2>
      <p>Level {level}</p>
      <p>{xp} XP</p>
      <p>🔥 {streak} day streak</p>

      <button onClick={() => addXP(50)}>
        Get 50 XP
      </button>
    </div>
  )
}
```

**Persistence:**
Data se automaticky ukládají do `localStorage['user-storage']` po každé změně. Při prvním renderu se data načtou zpět. To znamená, že:
- ✅ Uživatel si zachová progress po refreshi stránky
- ✅ XP, level, badges přežijí zavření prohlížeče
- ⚠️ Data jsou pouze na straně klienta (nejsou sdílená mezi zařízeními)

Pro plnou synchronizaci mezi zařízeními by bylo potřeba ukládat data také na server (Prisma databáze).

---

### 📂 Soubor: `src/data/chapters.ts`

Tento soubor obsahuje definice všech 40 kapitol kurzu s kompletními metadaty.

#### Konstanta: `chapters`
- **Umístění**: src/data/chapters.ts:15
- **Typ**: `Chapter[]` (pole 40 objektů)
- **Účel**: Centrální databáze všech kapitol s odkazy na texty, videa, notebooky
- **Kód (ukázka prvních 3 kapitol)**:
```typescript
export interface Chapter {
  id: string;           // '01' až '40'
  number: number;       // 1 až 40
  title: string;        // Název kapitoly
  description: string;  // Stručný popis
  hours: string;        // Hodiny výuky (např. '1' nebo '12-13')
  textFile: string;     // Markdown text k hodině
  lectureFile: string;  // Markdown přednáška
  videoFile?: string;   // MP4 video (optional)
  notebookLMUrl?: string;  // Google NotebookLM URL (optional)
  colabNotebook?: string;  // Jupyter notebook filename
  aiBasicsHours?: string[];  // Mapování na původní hodiny
}

export const chapters: Chapter[] = [
  {
    id: "01",
    number: 1,
    title: "Co je umělá inteligence?",
    description: "Úvod do umělé inteligence, základní pojmy a definice",
    hours: "1",
    textFile: "text-k-hodine-01.md",
    lectureFile: "Kapitola01_text-k-hodine-01.md",
    videoFile: "Hodina1.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/c536c80b-b48a-47ef-b291-8c443389b787",
    colabNotebook: "kapitola_01_úvod_do_terminálu_a_příkazové_řádky.ipynb",
    aiBasicsHours: ["1"]
  },
  {
    id: "02",
    number: 2,
    title: "Historie AI",
    description: "Historický vývoj umělé inteligence a klíčové milníky",
    hours: "2",
    textFile: "text-k-hodine-02.md",
    lectureFile: "Kapitola02_text-k-hodine-02.md",
    videoFile: "Hodina2.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/678e7208-8a79-486b-a747-7300fe2aee9d",
    colabNotebook: "kapitola_02_instalace_vývojových_nástrojů.ipynb",
    aiBasicsHours: ["2"]
  },
  {
    id: "03",
    number: 3,
    title: "Budoucnost AI",
    description: "Scénáře budoucího vývoje AI a její dopad na společnost",
    hours: "3",
    textFile: "text-k-hodine-03.md",
    lectureFile: "Kapitola03_text-k-hodine-03.md",
    videoFile: "Hodina3.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/a1f6282b-c815-4ab5-9986-9489dee17379",
    colabNotebook: "kapitola_03_git_a_verzování_kódu.ipynb",
    aiBasicsHours: ["3"]
  },
  // ... dalších 37 kapitol
];
```

#### Funkce: `getChapterById()`
- **Umístění**: src/data/chapters.ts:539
- **Účel**: Najde kapitolu podle ID
- **Parametry**: `id: string` (např. '01', '15', '40')
- **Návratová hodnota**: `Chapter | undefined`
- **Složitost**: O(n) - lineární vyhledávání
- **Kód**:
```typescript
export function getChapterById(id: string): Chapter | undefined {
  return chapters.find(chapter => chapter.id === id);
}

// Použití:
// const chapter = getChapterById('05');
// if (chapter) {
//   console.log(chapter.title);  // "Lidská vs. strojová inteligence"
// }
```

#### Funkce: `getNextChapter()`
- **Umístění**: src/data/chapters.ts:543
- **Účel**: Vrátí následující kapitolu (pro navigaci)
- **Parametry**: `currentId: string`
- **Návratová hodnota**: `Chapter | null` (null pokud je aktuální poslední)
- **Složitost**: O(n)
- **Kód**:
```typescript
export function getNextChapter(currentId: string): Chapter | null {
  const currentIndex = chapters.findIndex(ch => ch.id === currentId);

  // Není nalezena nebo je poslední
  if (currentIndex === -1 || currentIndex === chapters.length - 1) {
    return null;
  }

  return chapters[currentIndex + 1];
}

// Použití v chapter navigation:
// const nextChapter = getNextChapter('15');
// if (nextChapter) {
//   router.push(`/chapters/${nextChapter.id}`);
// }
```

#### Funkce: `getPreviousChapter()`
- **Umístění**: src/data/chapters.ts:549
- **Účel**: Vrátí předchozí kapitolu (pro navigaci)
- **Parametry**: `currentId: string`
- **Návratová hodnota**: `Chapter | null` (null pokud je aktuální první)
- **Složitost**: O(n)
- **Kód**:
```typescript
export function getPreviousChapter(currentId: string): Chapter | null {
  const currentIndex = chapters.findIndex(ch => ch.id === currentId);

  // Není nalezena nebo je první
  if (currentIndex <= 0) {
    return null;
  }

  return chapters[currentIndex - 1];
}

// Použití:
// const prevChapter = getPreviousChapter('20');
// if (prevChapter) {
//   // Zobraz tlačítko "Předchozí kapitola"
// }
```

**Struktura kapitol (přehled 40 kapitol):**
1. **Modul 1: Úvod do AI (kapitoly 1-10)**
   - Co je AI, historie, budoucnost
   - Příbuzné obory, etika, filozofie
   - Lidská vs. strojová inteligence
   - AI v každodenním životě

2. **Modul 2: Jak AI řeší problémy (kapitoly 11-20)**
   - Algoritmy vyhledávání a řazení
   - Heuristiky a optimalizace
   - Logika a znalostní systémy
   - Plánování a rozhodování

3. **Modul 3: Strojové učení (kapitoly 21-30)**
   - Supervised vs. unsupervised learning
   - Regrese, klasifikace, clustering
   - Decision trees, random forests
   - Evaluace modelů

4. **Modul 4: Neuronové sítě (kapitoly 31-40)**
   - Perceptron a zpětná propagace
   - CNN pro počítačové vidění
   - RNN a LSTM pro časové řady
   - Transformery a attention mechanism

---

## 🧩 Analýza tříd a komponent

### 📂 Soubor: `src/components/onboarding/onboarding-flow.tsx`

#### Komponenta: `OnboardingFlow`
- **Umístění**: src/components/onboarding/onboarding-flow.tsx:35
- **Typ**: React Functional Component
- **Účel**: Řídí 5-krokový onboarding proces pro nové uživatele
- **Props**: Žádné
- **State**:
  - `currentStep: number` - Aktuální krok (0-4)
  - `name: string` - Jméno uživatele
  - `goal: string` - Vybraný cíl
  - `experience: string` - Úroveň zkušeností
  - `isAnimating: boolean` - Animace přechodu
- **Závislosti**:
  - `GlassSurface` - Glassmorphism pozadí
  - `ElectricBorder` - Animovaný border
  - `Lightning` - Pozadí s blesky
  - `Button` - Tlačítka
  - `useUserStore` - Zustand store
  - `useRouter` - Next.js navigace
  - `framer-motion` - Animace
- **Kód** (zjednodušená verze):
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { Lightning } from '@/components/ui/lightning'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/store/user-store'

export function OnboardingFlow() {
  const router = useRouter()
  const { setUserPreferences, completeOnboarding, addXP, setUsername } = useUserStore()

  // State
  const [currentStep, setCurrentStep] = useState(0)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('')
  const [experience, setExperience] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  // Definice kroků
  const steps = [
    {
      id: 'welcome',
      title: 'Vítejte v učebnici AI! 🚀',
      description: 'Společně prozkoumáme fascinující svět umělé inteligence.',
    },
    {
      id: 'name',
      title: 'Jak se jmenujete?',
      description: 'Zadejte své jméno nebo přezdívku, kterou chcete používat.',
    },
    {
      id: 'goal',
      title: 'Jaký je váš cíl?',
      description: 'Co vás přivedlo k učení AI?',
    },
    {
      id: 'experience',
      title: 'Jaké máte zkušenosti s programováním?',
      description: 'Pomůže nám to přizpůsobit obsah vašim znalostem.',
    },
    {
      id: 'complete',
      title: 'Vše je připraveno! 🎉',
      description: 'Můžeme začít vaši cestu do světa AI.',
    },
  ]

  // Přechod na další krok
  const handleNext = () => {
    // Validace aktuálního kroku
    if (currentStep === 1 && !name.trim()) {
      alert('Zadejte prosím své jméno')
      return
    }
    if (currentStep === 2 && !goal) {
      alert('Vyberte prosím svůj cíl')
      return
    }
    if (currentStep === 3 && !experience) {
      alert('Vyberte prosím svou úroveň zkušeností')
      return
    }

    // Animace
    setIsAnimating(true)

    setTimeout(() => {
      if (currentStep === steps.length - 1) {
        // Poslední krok - uložit data a přesměrovat
        setUsername(name)
        setUserPreferences(goal, experience)
        completeOnboarding()
        addXP(50) // Bonus za dokončení onboardingu

        router.push('/lessons')
      } else {
        setCurrentStep(currentStep + 1)
      }
      setIsAnimating(false)
    }, 300)
  }

  // Přechod na předchozí krok
  const handleBack = () => {
    if (currentStep > 0) {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsAnimating(false)
      }, 300)
    }
  }

  // Renderování jednotlivých kroků
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        // Krok 0: Uvítání
        return (
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {steps[0].title}
            </h1>
            <p className="text-xl text-gray-300">{steps[0].description}</p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="p-6 bg-white/5 rounded-lg">
                <div className="text-4xl mb-2">🎓</div>
                <h3 className="font-bold mb-2">40 kapitol</h3>
                <p className="text-sm text-gray-400">Od základů po pokročilé AI</p>
              </div>
              <div className="p-6 bg-white/5 rounded-lg">
                <div className="text-4xl mb-2">⚡</div>
                <h3 className="font-bold mb-2">Interaktivní</h3>
                <p className="text-sm text-gray-400">Praktické notebooky v Colab</p>
              </div>
              <div className="p-6 bg-white/5 rounded-lg">
                <div className="text-4xl mb-2">🏆</div>
                <h3 className="font-bold mb-2">Gamifikace</h3>
                <p className="text-sm text-gray-400">XP, levely, odznaky</p>
              </div>
              <div className="p-6 bg-white/5 rounded-lg">
                <div className="text-4xl mb-2">🎯</div>
                <h3 className="font-bold mb-2">Výzvy</h3>
                <p className="text-sm text-gray-400">Cognitive Glitch systém</p>
              </div>
            </div>
          </div>
        )

      case 1:
        // Krok 1: Jméno
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">{steps[1].title}</h2>
            <p className="text-gray-300">{steps[1].description}</p>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="např. Jan Novák"
              className="w-full px-4 py-3 bg-white/10 border border-purple-500/30 rounded-lg
                       focus:outline-none focus:border-purple-500 transition-colors
                       text-white placeholder-gray-500"
              autoFocus
            />
          </div>
        )

      case 2:
        // Krok 2: Cíl
        const goals = [
          { id: 'career', label: '💼 Kariérní růst', description: 'Chci se stát AI expertem' },
          { id: 'skills', label: '🎯 Nové dovednosti', description: 'Chci rozšířit své znalosti' },
          { id: 'ai', label: '🤖 Pochopení AI', description: 'Chci pochopit, jak AI funguje' },
          { id: 'fun', label: '🎮 Zábava', description: 'Učím se pro radost' },
        ]

        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">{steps[2].title}</h2>
            <p className="text-gray-300">{steps[2].description}</p>

            <div className="grid grid-cols-2 gap-4">
              {goals.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`p-6 rounded-lg border-2 transition-all text-left
                    ${goal === g.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                    }`}
                >
                  <div className="text-2xl mb-2">{g.label}</div>
                  <p className="text-sm text-gray-400">{g.description}</p>
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        // Krok 3: Zkušenosti
        const experienceLevels = [
          { id: 'beginner', label: '🌱 Začátečník', description: 'Nikdy jsem neprogramoval' },
          { id: 'intermediate', label: '⚡ Pokročilý', description: 'Znám základy programování' },
          { id: 'advanced', label: '🚀 Expert', description: 'Mám rozsáhlé zkušenosti' },
        ]

        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">{steps[3].title}</h2>
            <p className="text-gray-300">{steps[3].description}</p>

            <div className="space-y-4">
              {experienceLevels.map((exp) => (
                <button
                  key={exp.id}
                  onClick={() => setExperience(exp.id)}
                  className={`w-full p-6 rounded-lg border-2 transition-all text-left
                    ${experience === exp.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-white/10 bg-white/5 hover:border-purple-500/50'
                    }`}
                >
                  <div className="text-2xl mb-2">{exp.label}</div>
                  <p className="text-sm text-gray-400">{exp.description}</p>
                </button>
              ))}
            </div>
          </div>
        )

      case 4:
        // Krok 4: Shrnutí
        return (
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">{steps[4].title}</h1>
            <p className="text-xl text-gray-300">{steps[4].description}</p>

            <div className="mt-8 p-6 bg-white/5 rounded-lg text-left">
              <h3 className="font-bold mb-4">Váš profil:</h3>
              <div className="space-y-2 text-gray-300">
                <p>👤 Jméno: <span className="text-white">{name}</span></p>
                <p>🎯 Cíl: <span className="text-white">{goal}</span></p>
                <p>📊 Úroveň: <span className="text-white">{experience}</span></p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mt-6 text-purple-400">
              <span className="text-2xl">🎁</span>
              <p>Získáváte <strong>50 XP</strong> za dokončení onboardingu!</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Pozadí */}
      <Lightning className="fixed inset-0 z-0" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <ElectricBorder>
          <GlassSurface className="w-full max-w-3xl p-8">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`w-full h-2 rounded-full mx-1 transition-colors
                      ${idx <= currentStep ? 'bg-purple-500' : 'bg-white/20'}`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-400 text-center">
                Krok {currentStep + 1} z {steps.length}
              </p>
            </div>

            {/* Content s animací */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {/* Tlačítka */}
            <div className="flex justify-between mt-8">
              {currentStep > 0 ? (
                <Button variant="ghost" onClick={handleBack}>
                  ← Zpět
                </Button>
              ) : (
                <div />
              )}

              <Button onClick={handleNext} disabled={isAnimating}>
                {currentStep === steps.length - 1 ? 'Začít! 🚀' : 'Další →'}
              </Button>
            </div>
          </GlassSurface>
        </ElectricBorder>
      </div>
    </div>
  )
}
```

**Tok onboardingu:**
```
Krok 0: Uvítání
  ↓
Krok 1: Zadej jméno (validace: !empty)
  ↓
Krok 2: Vyber cíl (4 možnosti)
  ↓
Krok 3: Vyber zkušenosti (3 úrovně)
  ↓
Krok 4: Shrnutí + uložení dat
  ↓
→ Přesměrování na /lessons + 50 XP bonus
```

**Key features:**
- ✅ 5-krokový průvodce
- ✅ Validace každého kroku
- ✅ Animované přechody (Framer Motion)
- ✅ Progress bar
- ✅ Glassmorphism design
- ✅ Responsive layout
- ✅ Persistence do Zustand store
- ✅ XP bonus za dokončení

---

### 📂 Soubor: `src/components/skills/competence-nebula.tsx`

#### Komponenta: `CompetenceNebula`
- **Umístění**: src/components/skills/competence-nebula.tsx:20
- **Typ**: React Component s D3.js vizualizací
- **Účel**: Interaktivní force-directed graf dovedností
- **Props**:
  - `width?: number` (default: 800) - Šířka SVG
  - `height?: number` (default: 600) - Výška SVG
  - `interactive?: boolean` (default: true) - Povolit drag & zoom
  - `showMiniMap?: boolean` (default: false) - Zobrazit minimapu
- **State**:
  - `selectedNode: SkillNode | null` - Vybraný node
  - `hoveredNode: SkillNode | null` - Node pod kurzorem
  - `zoom: number` - Zoom level (0.5 - 2.0)
- **Závislosti**:
  - `d3` - D3.js pro force simulation
  - `GlassSurface` - Pozadí
  - `ElectricBorder` - Border
  - `useUserStore` - Progress tracking
  - `skillNodes` - Data
  - `skillLinks` - Connections
  - `SKILL_CATEGORIES` - Kategorie
- **Kód (zjednodušená verze s klíčovými částmi)**:
```typescript
'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { GlassSurface } from '@/components/ui/glass-surface'
import { ElectricBorder } from '@/components/ui/electric-border'
import { useUserStore } from '@/store/user-store'
import { skillNodes, skillLinks, SKILL_CATEGORIES } from '@/data/skills-graph'
import type { SkillNode, SkillLink } from '@/types/skills'

interface CompetenceNebulaProps {
  width?: number
  height?: number
  interactive?: boolean
  showMiniMap?: boolean
}

export function CompetenceNebula({
  width = 800,
  height = 600,
  interactive = true,
  showMiniMap = false
}: CompetenceNebulaProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null)
  const [zoom, setZoom] = useState(1)

  const progress = useUserStore((state) => state.progress)

  // Helper: Získat level dovednosti (0-5)
  const getSkillLevel = (skillId: string): number => {
    const relatedLessons = skillNodes.find(n => n.id === skillId)?.lessons || []
    const completedLessons = relatedLessons.filter(lessonId =>
      progress.some(p => p.lessonId === lessonId)
    )

    // Level = (dokončené lekce / celkové lekce) * 5
    return Math.floor((completedLessons.length / relatedLessons.length) * 5)
  }

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous render

    // === SETUP ===
    const g = svg.append('g')

    // === FORCE SIMULATION ===
    const simulation = d3.forceSimulation(skillNodes as any)
      .force('link', d3.forceLink(skillLinks)
        .id((d: any) => d.id)
        .distance(100)
        .strength(0.5)
      )
      .force('charge', d3.forceManyBody()
        .strength(-300)
      )
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide()
        .radius(40)
      )
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))

    // === LINKS (CONNECTIONS) ===
    const link = g.selectAll('.link')
      .data(skillLinks)
      .enter()
      .append('line')
      .attr('class', 'link')
      .style('stroke', (d: SkillLink) => {
        const sourceLevel = getSkillLevel(d.source as string)
        const targetLevel = getSkillLevel(d.target as string)

        // Obě dovednosti odemčené → bílá linka
        if (sourceLevel > 0 && targetLevel > 0) {
          return '#fff'
        }
        // Zamčené → tmavě šedá
        return '#333'
      })
      .style('stroke-width', (d: SkillLink) => d.strength * 2)
      .style('stroke-opacity', 0.6)

    // === NODES (SKILLS) ===
    const node = g.selectAll('.node')
      .data(skillNodes)
      .enter()
      .append('g')
      .attr('class', 'node')
      .style('cursor', interactive ? 'pointer' : 'default')
      .on('mouseover', function(event, d: SkillNode) {
        setHoveredNode(d)

        // Highlight effect
        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 35)
      })
      .on('mouseout', function() {
        setHoveredNode(null)

        d3.select(this)
          .select('circle')
          .transition()
          .duration(200)
          .attr('r', 30)
      })
      .on('click', function(event, d: SkillNode) {
        setSelectedNode(d)
      })

    // Node circles
    node.append('circle')
      .attr('r', 30)
      .style('fill', (d: SkillNode) => {
        const level = getSkillLevel(d.id)
        const category = SKILL_CATEGORIES[d.category]

        if (level === 0) {
          return '#444' // Zamčená dovednost
        }

        // Gradient podle levelu
        return `url(#gradient-${d.category})`
      })
      .style('stroke', (d: SkillNode) => {
        const level = getSkillLevel(d.id)
        return level > 0 ? '#fff' : '#666'
      })
      .style('stroke-width', 2)
      .style('filter', (d: SkillNode) => {
        const level = getSkillLevel(d.id)
        return level > 0 ? 'drop-shadow(0 0 10px rgba(168, 85, 247, 0.5))' : 'none'
      })

    // Node icons/emojis
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '.3em')
      .style('font-size', '20px')
      .style('pointer-events', 'none')
      .text((d: SkillNode) => d.icon || '📚')

    // Node labels
    node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '45')
      .style('font-size', '12px')
      .style('fill', '#fff')
      .style('pointer-events', 'none')
      .text((d: SkillNode) => d.name)

    // Level indicators (5 small circles)
    node.each(function(d: SkillNode) {
      const level = getSkillLevel(d.id)
      const nodeGroup = d3.select(this)

      for (let i = 0; i < 5; i++) {
        nodeGroup.append('circle')
          .attr('cx', -20 + i * 10)
          .attr('cy', -45)
          .attr('r', 3)
          .style('fill', i < level ? '#FFD700' : '#444')
          .style('stroke', '#fff')
          .style('stroke-width', 1)
      }
    })

    // === DRAG BEHAVIOR ===
    if (interactive) {
      node.call(
        d3.drag<any, SkillNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )
    }

    // === ZOOM BEHAVIOR ===
    if (interactive) {
      const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.5, 2])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
          setZoom(event.transform.k)
        })

      svg.call(zoomBehavior as any)
    }

    // === SIMULATION TICK ===
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [width, height, progress, interactive])

  return (
    <div className="relative">
      <ElectricBorder>
        <GlassSurface>
          {/* SVG Canvas */}
          <svg
            ref={svgRef}
            width={width}
            height={height}
            className="bg-gray-900/50 rounded-lg"
          />

          {/* Zoom controls */}
          {interactive && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button
                onClick={() => {/* Zoom in */}}
                className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                +
              </button>
              <button
                onClick={() => {/* Zoom out */}}
                className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                −
              </button>
              <button
                onClick={() => {/* Reset zoom */}}
                className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-xs"
              >
                Reset
              </button>
            </div>
          )}

          {/* Hover tooltip */}
          {hoveredNode && (
            <div className="absolute bottom-4 left-4 p-4 bg-gray-900/90 rounded-lg border border-purple-500/30">
              <h3 className="font-bold text-purple-400">{hoveredNode.name}</h3>
              <p className="text-sm text-gray-300 mt-1">{hoveredNode.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">Level:</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-2 rounded-full ${
                        i < getSkillLevel(hoveredNode.id) ? 'bg-yellow-400' : 'bg-gray-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute top-4 left-4 p-4 bg-gray-900/90 rounded-lg border border-purple-500/30">
            <h4 className="font-bold mb-2 text-sm">Kategorie:</h4>
            <div className="space-y-1">
              {Object.entries(SKILL_CATEGORIES).map(([key, cat]) => (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </GlassSurface>
      </ElectricBorder>

      {/* Selected node modal */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <GlassSurface className="max-w-2xl w-full p-8">
            <h2 className="text-3xl font-bold mb-4">{selectedNode.name}</h2>
            <p className="text-gray-300 mb-4">{selectedNode.description}</p>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Úroveň zvládnutí:</h3>
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      i < getSkillLevel(selectedNode.id)
                        ? 'bg-yellow-400 text-gray-900'
                        : 'bg-gray-700 text-gray-500'
                    }`}
                  >
                    {i + 1}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-bold mb-2">Související lekce:</h3>
              <div className="space-y-2">
                {selectedNode.lessons.map(lessonId => {
                  const isCompleted = progress.some(p => p.lessonId === lessonId)
                  return (
                    <div key={lessonId} className="flex items-center gap-2 text-sm">
                      <span>{isCompleted ? '✅' : '⬜'}</span>
                      <span>Lekce {lessonId}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="px-6 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Zavřít
            </button>
          </GlassSurface>
        </div>
      )}
    </div>
  )
}
```

**Klíčové features:**
- ✅ Force-directed graph layout (D3.js)
- ✅ 24 skill nodes v 6 kategoriích
- ✅ Dynamické barvy podle category
- ✅ Glow efekt na odemčených skills
- ✅ 5-stupňová úroveň zvládnutí (⭐⭐⭐⭐⭐)
- ✅ Drag & drop nodes
- ✅ Zoom in/out/reset
- ✅ Hover tooltip s popisem
- ✅ Click modal s detaily a lekcemi
- ✅ Links mezi prerekvizity
- ✅ Legenda kategorií
- ✅ Real-time progress tracking
- ✅ Responsive SVG canvas

**Fyzikální simulace:**
```
Síly působící na nodes:
1. link force - Táhne propojené nodes k sobě (distance: 100px)
2. charge force - Odpuzuje všechny nodes od sebe (strength: -300)
3. center force - Tlačí nodes ke středu canvasu
4. collision force - Zabraňuje překrývání (radius: 40px)
5. x/y force - Slabé centrování (strength: 0.05)
```

---

## 📊 Datové struktury

### 📂 Databázové modely (Prisma Schema)

#### Model: `User`
- **Umístění**: prisma/schema.prisma:41
- **Účel**: Reprezentace uživatele s auth daty a gamifikací
- **Relations**:
  - `accounts` → Account[] (OAuth účty)
  - `sessions` → Session[] (Aktivní sessions)
  - `completedLessons` → CompletedLesson[] (Dokončené lekce)
  - `achievements` → UserAchievement[] (Odemčené achievementy)
  - `lessonProgress` → LessonProgress[] (Progress v lekcích)
  - `cognitiveGlitches` → CognitiveGlitchAttempt[] (Glitch pokusy)
- **Schéma**:
```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  emailVerified DateTime?
  name          String?
  image         String?
  password      String?   // Pro credentials login (bcrypt hash)
  username      String?   @unique

  // Game-like attributes
  xp            Int       @default(0)
  level         Int       @default(1)
  currentStreak Int       @default(0)
  longestStreak Int       @default(0)

  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  completedLessons CompletedLesson[]
  achievements  UserAchievement[]
  lessonProgress LessonProgress[]
  cognitiveGlitches CognitiveGlitchAttempt[]
}
```

**Indexy:**
- `email` - UNIQUE index pro rychlé vyhledávání
- `username` - UNIQUE index
- `id` - PRIMARY KEY

**Příklad queries:**
```typescript
// Najít uživatele podle emailu
const user = await prisma.user.findUnique({
  where: { email: 'jan@example.com' }
})

// Získat uživatele s veškerým progressem
const userWithProgress = await prisma.user.findUnique({
  where: { id: 'clx123...' },
  include: {
    completedLessons: true,
    achievements: { include: { achievement: true } },
    lessonProgress: true,
  }
})

// Top 10 uživatelů podle XP (leaderboard)
const leaderboard = await prisma.user.findMany({
  orderBy: { xp: 'desc' },
  take: 10,
  select: {
    username: true,
    xp: true,
    level: true,
    avatar: true,
  }
})
```

---

#### Model: `Lesson`
- **Umístění**: prisma/schema.prisma:79
- **Účel**: Reprezentace lekce/kapitoly v kurzu
- **Relations**:
  - `completedBy` → CompletedLesson[]
  - `progress` → LessonProgress[]
- **Schéma**:
```prisma
model Lesson {
  id          String   @id @default(cuid())
  chapterId   String   // Maps to chapter.id from chapters.ts
  title       String
  description String?
  xpReward    Int      @default(100)
  difficulty  String   // beginner, intermediate, advanced
  order       Int      // Pořadí v kurzu (1-40)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  completedBy CompletedLesson[]
  progress    LessonProgress[]
}
```

**Validace difficulty:**
- `beginner` - Začátečnické lekce (1-10)
- `intermediate` - Středně pokročilé (11-30)
- `advanced` - Pokročilé (31-40)

---

#### Model: `CompletedLesson`
- **Umístění**: prisma/schema.prisma:95
- **Účel**: Join table pro M:N vztah User-Lesson (s metadaty)
- **Unique constraint**: `[userId, lessonId]` - Uživatel může dokončit lekci jen jednou
- **Schéma**:
```prisma
model CompletedLesson {
  id          String   @id @default(cuid())
  userId      String
  lessonId    String
  completedAt DateTime @default(now())
  xpEarned    Int      // XP získané za tuto lekci

  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lesson Lesson @relation(fields: [lessonId], references: [id], onDelete: Cascade)

  @@unique([userId, lessonId])
}
```

**Příklad queries:**
```typescript
// Označit lekci jako dokončenou
await prisma.completedLesson.create({
  data: {
    userId: user.id,
    lessonId: 'lesson-05',
    xpEarned: 100,
  }
})

// Získat všechny dokončené lekce uživatele
const completed = await prisma.completedLesson.findMany({
  where: { userId: user.id },
  include: { lesson: true },
  orderBy: { completedAt: 'desc' }
})

// Statistika: Kolik uživatelů dokončilo lekci X?
const stats = await prisma.completedLesson.groupBy({
  by: ['lessonId'],
  _count: { userId: true },
  orderBy: { _count: { userId: 'desc' } }
})
```

---

#### Model: `Achievement`
- **Umístění**: prisma/schema.prisma:121
- **Účel**: Definice achievementu/badg