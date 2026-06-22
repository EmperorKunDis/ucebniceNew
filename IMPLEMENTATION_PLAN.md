# Implementační plán - Nové funkce

## ✅ DOKONČENO

### 1. Diamantové odměny 💎

- **10 💎** za dokončení kapitoly (`/api/progress/complete-chapter`)
- **50 💎** za zodpovězení otázek (`/api/progress/complete-questions`)
- **100 💎** za AI-schválený projekt (`/api/projects/submit`)

### 2. AI kontrola projektů (Gemini)

- `src/lib/gemini.ts` - integrace s Gemini API
- Automatické hodnocení 0-100
- Zpětná vazba: silné stránky + návrhy zlepšení
- Schváleno = score >= 70%

### 3. Náhodné 3 otázky z 10

- `/api/questions/random?chapterId=XX`
- Náhodný výběr 3 otázek z 10 pro každou kapitolu

### 4. Milestone testy (10, 20, 30)

- `/api/milestone-test` - GET pro otázky, POST pro odevzdání
- `src/app/(main)/milestone-test/[milestone]/page.tsx` - UI
- 20 otázek + kombinovaný projekt
- 200 💎 za úspěch

### 5. Finální test (po 40 kapitolách)

- `/api/final-test` - GET pro otázky, POST pro odevzdání
- `src/app/(main)/final-test/page.tsx` - UI
- 10 logických otázek + 3 projekty na výběr
- 500 💎 + certifikát za úspěch

### 6. Email verifikace

- `src/lib/email.ts` - Resend integration (free tier 100/day)
- `/api/auth/verify` - GET ověření tokenu, POST odeslání
- `src/app/verify-email/page.tsx` - UI stránka
- `src/hooks/useEmailVerification.ts` - React hook
- `src/components/ui/VerificationBadge.tsx` - Badge komponenta
- Neověření = přístup jen ke 3 kapitolám
- Badge "Neověřeno" na profilu

### 7. Google OAuth

- `docs/GOOGLE_OAUTH_SETUP.md` - kompletní návod
- Připraveno v NextAuth konfiguraci

### 8. Certifikát generátor

- `src/lib/certificate-generator.ts` - PDF generátor
- `src/assets/certificate/` - pozadí + layout.json
- `/api/certificate` - GET eligibility, POST generování
- `/api/certificate/[code]` - stažení PDF
- `src/app/(main)/certificate/page.tsx` - UI
- `src/app/verify-certificate/[code]/page.tsx` - veřejné ověření

### 9. Pokročilé kapitoly (41-50) - LLM kurz

- `prisma/seed-advanced-chapters.ts` - seed data
- `content/advanced-chapters/README.md` - specifikace
- DB modely: AdvancedChapter, AdvancedChapterCompletion, AdvancedProjectSubmission

**Pořadí kapitol:**

1. Prompt Engineering Fundamentals
2. Embeddings a Vektorové Databáze
3. RAG (Retrieval-Augmented Generation)
4. Fine-tuning Modelů
5. Agenti a Tool-Use
6. Multi-modal LLM
7. LLM v Produkci
8. Evaluace a Benchmarking
9. Safety a Alignment
10. Vlastní AI Asistent od A do Z

---

## ENV proměnné k nastavení

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Gemini AI
GEMINI_API_KEY=AIzaSy...

# Email (Resend)
RESEND_API_KEY=re_...
EMAIL_FROM=Učebnice AI <noreply@yourdomain.com>
```

---

## Soubory vytvořené/upravené

### Nové API endpointy:

- `/api/progress/complete-questions/route.ts`
- `/api/questions/random/route.ts`
- `/api/milestone-test/route.ts`
- `/api/final-test/route.ts`
- `/api/auth/verify/route.ts`
- `/api/certificate/route.ts`
- `/api/certificate/[code]/route.ts`

### Nové stránky:

- `/src/app/(main)/milestone-test/[milestone]/page.tsx`
- `/src/app/(main)/final-test/page.tsx`
- `/src/app/(main)/certificate/page.tsx`
- `/src/app/verify-email/page.tsx`
- `/src/app/verify-certificate/[code]/page.tsx`

### Nové knihovny:

- `/src/lib/gemini.ts` - Gemini AI
- `/src/lib/email.ts` - Email service
- `/src/lib/certificate-generator.ts` - PDF generátor

### Nové komponenty:

- `/src/components/ui/card.tsx`
- `/src/components/ui/VerificationBadge.tsx`

### Nové hooks:

- `/src/hooks/useEmailVerification.ts`

### Upravené soubory:

- `/src/app/api/progress/complete-chapter/route.ts` - přidány gemy
- `/src/app/api/projects/submit/route.ts` - AI review
- `/src/app/(main)/profile/page.tsx` - verification badge
- `/src/components/layout/Sidebar.tsx` - certifikát link
- `/prisma/schema.prisma` - nové modely
- `/.env.example` - nové proměnné

---

## Co potřebuje Martin dodat:

1. **Google OAuth credentials** (viz docs/GOOGLE_OAUTH_SETUP.md)
2. **Gemini API key** (https://makersuite.google.com/app/apikey)
3. **Resend API key** (https://resend.com) - volitelné
4. **Obsah 10 LLM kapitol** (NotebookLM podcasty + Colab notebooky)

---

## Statistiky

- **Nové API endpointy:** 7
- **Nové stránky:** 5
- **Nové knihovny:** 3
- **Nové komponenty:** 2
- **Nové DB modely:** 7
- **TypeScript chyby:** 0 ✅
