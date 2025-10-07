# Design System Analysis & Unification Plan

## 📊 Současný stav

### Analýza existujících stránek

#### ✅ Konzistentní stránky (používají design system)

1. **Homepage** (`/`)
   - ✅ PageLayout
   - ✅ GlassSurface
   - ✅ ElectricBorder
   - ✅ Stack/Grid/Box layout
   - ✅ Gradient text
   - ✅ Motion animace

2. **Chapters** (`/chapters`)
   - ✅ PageLayout
   - ✅ GlassSurface
   - ✅ ElectricBorder
   - ✅ Stack/Grid/Box layout
   - ✅ Module-based structure
   - ✅ Progress bars
   - ✅ Motion animace

#### ❌ Nekonzistentní stránky (potřebují úpravu)

3. **Profile** (`/profile`)
   - ❌ Vlastní layout (ne PageLayout)
   - ✅ Backdrop blur efekt
   - ✅ Grid system
   - ⚠️ Jiný navigation pattern
   - ✅ Card design podobný GlassSurface

4. **Dashboard** - není vidět v analýze
5. **Achievements** - není vidět v analýze
6. **Arena** - není vidět v analýze
7. **Auth pages** (signin/signup) - není vidět v analýze
8. **Certificate** - není vidět v analýze
9. **Leaderboard** - není vidět v analýze

---

## 🎨 Definovaný Design System

### 1. Grafický Look (ze sekce Kapitoly)

#### Barvy

```css
/* Primary Colors */
--purple-400: #c084fc --purple-500: #a855f7 --purple-600: #9333ea --pink-400: #f472b6
  --pink-500: #ec4899 --pink-600: #db2777 /* Backgrounds */ --gray-900: #111827 --gray-800: #1f2937
  --gray-700: #374151 /* Transparent overlays */ --glass-bg: bg-white/5 (rgba(255, 255, 255, 0.05))
  --glass-border: border-white/10;
```

#### UI Komponenty

- **GlassSurface**: Skleněný efekt s backdrop-blur
- **ElectricBorder**: Animovaný elektrický border
- **Gradient text**: `bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`
- **Progress bars**: Gradient purple to pink
- **Buttons**: Gradient background, rounded-lg
- **Icons**: Lucide React, barevné (purple-400, pink-400, blue-400)

#### Efekty

- **Motion animations**: framer-motion fade-in, scale, slide
- **Hover effects**: scale-105, brightness increase
- **Transitions**: duration-200, duration-500
- **Blur**: backdrop-blur-xl, backdrop-blur-sm

### 2. Layout Pattern (ze sekce Profil)

#### Container Structure

```tsx
<div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
  {/* Navigation Bar */}
  <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
    <div className="max-w-7xl mx-auto px-4 py-4">{/* Nav content */}</div>
  </div>

  {/* Main Content */}
  <div className="max-w-4xl mx-auto px-4 py-12">
    <div className="space-y-8">{/* Content sections */}</div>
  </div>
</div>
```

#### Key Layout Principles

1. **Centrovaný container**: `max-w-4xl mx-auto` nebo `max-w-7xl mx-auto`
2. **Vertical spacing**: `space-y-8` mezi sekcemi
3. **Horizontal padding**: `px-4` (responsive)
4. **Vertical padding**: `py-12` (main), `py-4` (nav)
5. **Grid system**: `grid grid-cols-X gap-4`
6. **Relative/Absolute pattern**: Dvouvrstvý design pro depth

### 3. Komponenty Design System

#### Card Pattern (Kombinace z obou)

```tsx
{
  /* Pattern 1: ElectricBorder + GlassSurface */
}
;<ElectricBorder className="rounded-lg">
  <GlassSurface className="p-8">{/* Content */}</GlassSurface>
</ElectricBorder>

{
  /* Pattern 2: Relative/Absolute (z profilu) */
}
;<div className="relative">
  <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10" />
  <div className="relative p-8">{/* Content */}</div>
</div>
```

#### Navigation Bar

```tsx
<div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="flex justify-between items-center">
      <Link
        href="/"
        className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
      >
        Učebnice AI
      </Link>
      <div className="flex gap-6">{/* Navigation links */}</div>
    </div>
  </div>
</div>
```

#### Stats Card

```tsx
<div className="relative">
  <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10" />
  <div className="relative p-6 text-center">
    <Icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-sm text-gray-400">{label}</div>
  </div>
</div>
```

#### Section Header

```tsx
<motion.h2
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="text-4xl font-bold text-center mb-12"
>
  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
    Heading Text
  </span>
</motion.h2>
```

---

## 🔄 Unification Plan

### Fáze 1: Vytvořit jednotné komponenty

1. **UnifiedPageLayout** - Kombinace PageLayout s navigation pattern z profilu
2. **StatCard** - Reusable stat card component
3. **SectionHeader** - Standardizovaný header pro sekce
4. **ContentContainer** - Wrapper s max-width a padding

### Fáze 2: Upravit nekonzistentní stránky

#### Profile Page

- [x] Použít UnifiedPageLayout místo custom layoutu
- [x] Zachovat grid structure
- [x] Aplikovat GlassSurface/ElectricBorder pattern
- [x] Přidat motion animace

#### Auth Pages (signin/signup)

- [ ] Použít UnifiedPageLayout
- [ ] GlassSurface pro form container
- [ ] ElectricBorder na buttons
- [ ] Motion animace pro vstup

#### Dashboard

- [ ] Použít UnifiedPageLayout
- [ ] Grid layout pro widgets
- [ ] StatCard komponenty
- [ ] GlassSurface pattern

#### Achievements

- [ ] Použít UnifiedPageLayout
- [ ] Grid pro achievement cards
- [ ] ElectricBorder na hover
- [ ] Motion animace

#### Arena

- [ ] Použít UnifiedPageLayout
- [ ] GlassSurface pro cards
- [ ] Gradient headings
- [ ] Grid layout

#### Certificate

- [ ] Použít UnifiedPageLayout
- [ ] GlassSurface pro certificate preview
- [ ] ElectricBorder buttons

#### Leaderboard

- [ ] Použít UnifiedPageLayout
- [ ] GlassSurface pro table/list
- [ ] StatCard pro top users
- [ ] Motion animace

---

## 📦 Nové komponenty k vytvoření

### 1. UnifiedPageLayout

```tsx
interface UnifiedPageLayoutProps {
  children: React.ReactNode
  maxWidth?: '4xl' | '7xl'
  showNav?: boolean
  className?: string
}
```

**Features:**

- Navigation bar (optional)
- Gradient background
- Centrovaný container
- Responsive padding
- Space-y-8 pro content

### 2. StatCard

```tsx
interface StatCardProps {
  icon: React.ReactNode
  value: string | number
  label: string
  iconColor?: string
}
```

**Features:**

- Relative/absolute pattern
- Glass effect
- Hover animation
- Centered content

### 3. SectionHeader

```tsx
interface SectionHeaderProps {
  children: React.ReactNode
  subtitle?: string
  align?: 'left' | 'center'
  className?: string
}
```

**Features:**

- Gradient text
- Motion animation
- Optional subtitle
- Flexible alignment

### 4. ContentContainer

```tsx
interface ContentContainerProps {
  children: React.ReactNode
  spacing?: 'sm' | 'md' | 'lg'
  maxWidth?: '4xl' | '5xl' | '6xl' | '7xl'
}
```

**Features:**

- Max-width control
- Horizontal padding
- Vertical spacing
- Responsive

---

## 🎯 Design Tokens

### Spacing Scale

```ts
spacing = {
  xs: '0.5rem', // 8px
  sm: '1rem', // 16px
  md: '1.5rem', // 24px
  lg: '2rem', // 32px
  xl: '3rem', // 48px
  '2xl': '4rem', // 64px
}
```

### Border Radius

```ts
borderRadius = {
  sm: '0.5rem', // 8px
  md: '0.75rem', // 12px
  lg: '1rem', // 16px
  xl: '1.5rem', // 24px
  '2xl': '2rem', // 32px
}
```

### Animation Duration

```ts
duration = {
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
}
```

### Container Widths

```ts
maxWidth = {
  '4xl': '56rem', // 896px
  '5xl': '64rem', // 1024px
  '6xl': '72rem', // 1152px
  '7xl': '80rem', // 1280px
}
```

---

## ✅ Checklist aplikace

### Komponenty

- [x] GlassSurface vytvořena
- [x] ElectricBorder vytvořena
- [x] Button component sjednocena
- [x] Stack/Grid/Box layout
- [ ] UnifiedPageLayout
- [ ] StatCard
- [ ] SectionHeader
- [ ] ContentContainer

### Stránky

- [x] Homepage - již sjednocena
- [x] Chapters - již sjednocena
- [ ] Profile - potřebuje úpravu
- [ ] Dashboard
- [ ] Achievements
- [ ] Arena
- [ ] Auth pages
- [ ] Certificate
- [ ] Leaderboard

### Theme

- [x] Barvy definovány
- [x] Gradienty standardizovány
- [x] Spacing scale
- [x] Typography scale
- [ ] Dark mode variants

---

## 🚀 Implementační postup

1. **Vytvořit UnifiedPageLayout komponenty** ✅ DALŠÍ KROK
2. **Vytvořit StatCard komponentu**
3. **Vytvořit SectionHeader komponentu**
4. **Upravit Profile page**
5. **Upravit Auth pages**
6. **Upravit Dashboard**
7. **Upravit Achievements**
8. **Upravit Arena**
9. **Upravit Certificate**
10. **Upravit Leaderboard**
11. **Final audit všech stránek**
12. **Documentation update**

---

**Cíl:** Všechny stránky budou mít:

- ✅ Jednotný grafický look (glass, electric, gradienty)
- ✅ Konzistentní layout (centrovaný container, spacing)
- ✅ Motion animace
- ✅ Responsive design
- ✅ Dark theme
- ✅ Reusable komponenty
