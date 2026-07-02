# Production Hardening Plan — GitHub Issues #16–#27

> Cíl: uzavřít všech 10 auditních issues technicky čistě, s minimem rizika regresí,
> v pořadí, kde každá fáze staví na předchozí. Každá fáze = 1 PR, každý PR má testy
> a musí projít CI.
>
> Rozhodnutí uživatele (scope): #24 = stavový model bez admin UI · #18 = minimální
> sjednocení + fix děr · #26/#17 = nedodělky doimplementovat · #25 = přísné CI gates.

## Zjištěný reálný stav (co audit skutečně našel)

Klíčové odchylky od popisu v issues:

- **Média (#19) jsou v pořádku** — všech 38 videí a 40 přednášek fyzicky existuje; kapitoly
  09/10 jsou bez videa záměrně (whitelist ve `validate-content.ts`). "38/40" je záměr, ne chyba.
  Jediný reálný nedostatek: `colabNotebook` (.ipynb) reference nemají fyzické soubory a validátor
  je nekontroluje.
- **Auth infrastruktura existuje ale je roztříštěná** — 3 překrývající se abstrakce
  (`admin-auth.ts`, `auth-helpers.ts`, `rbac.ts`), z toho 2 mrtvé. ~40 rout dělá ruční
  `getServerSession`. Dvě reálné díry: `hackathons/register` (zápis PII bez auth, mass-assignment
  přes email) a `teams/[id]` GET (čtení bez auth).
- **Error/validation helpery už existují** (`api-responses.ts`, `validation-schemas.ts`) — problém
  je, že je používá jen ~19 z 74 rout; zbytek má ad-hoc `NextResponse.json`. Existuje i **duplicitní**
  `validations.ts`.
- **Fake data v produkci**: graduate detail renderuje natvrdo "Jan Novák" (ignoruje route param,
  přitom reálné API existuje); settings save je `setTimeout` no-op; notif badge je natvrdo `3`;
  profil streak kalendář je věčné "načítá se".
- **Testy**: 10 souborů, ale kritické write-path routy (complete-chapter, shop/purchase,
  quests/claim route, admin guardy) nemají žádné testy. Jeden test běží pod Vitest, který nemá
  config → **neběží nikde**.
- **CI**: coverage threshold je vypnutý (`--coverageThreshold='{}'` + `continue-on-error`),
  **E2E se v CI nespouští vůbec**, CodeQL a dependency-review neblokují.

---

## Fáze 0 — Příprava (0.5 dne)

**Cíl:** čistá základna a sdílené konvence, ze kterých těží všechny další fáze.

- [ ] Vytvořit branch `hardening/main` a dílčí branche per fáze.
- [ ] Sepsat 1-stránkový `docs/API_CONVENTIONS.md`: povinné použití `validateAPIRequest`
      + `@/lib/api-responses` helperů + auth guardu; success envelope tvar; kód-review checklist.
- [ ] Reprodukovat baseline: `npm run type-check && npm run lint && npm test && npm run build`
      a `npm audit` — uložit výstup jako "před".

---

## Fáze 1 — Auth sjednocení + oprava děr (#18) · High

**Strategie:** minimální, low-risk. NEmigrujeme na plný RBAC. Standardizujeme na
`admin-auth.ts::requireAdmin` pro admin a přidáme jeden sdílený `requireUser()` pro authed routy.

### 1.1 Opravit 2 reálné bezpečnostní díry (P0)
- [ ] **`src/app/api/hackathons/register/route.ts`** — přidat rate-limit (`applyRateLimit`) a zabránit
      slepému přepsání existující registrace přes `upsert` na `hackathonId_email`. Buď vyžadovat
      přihlášení a vázat registraci na `session.user.id`, nebo u anonymní registrace zakázat `update`
      větev (jen `create`, duplicitní email → 409). Rozhodnout dle produktu — default: **create-only + rate-limit**.
- [ ] **`src/app/api/teams/[id]/route.ts` GET** — doplnit `requireUser()` (PUT/DELETE už chráněné).
      Pokud mají být týmy veřejné, explicitně zdokumentovat a nechat; jinak přidat guard.

### 1.2 Standardizovat admin routy
- [ ] Přepsat 5 rout s inline check na `requireAdmin()`:
      `admin/quests/route.ts`, `admin/shop/route.ts`, `admin/shop/stats/route.ts`,
      `admin/leagues/route.ts`, `admin/leagues/stats/route.ts`.
- [ ] Sjednotit sémantiku admina: rozhodnout `isAdmin` vs `role==='ADMIN'`. `analytics/dashboard`
      akceptuje oba, admin routy jen `isAdmin`. Sjednotit v `admin-auth.ts::requireAdmin` na
      `isAdmin || role==='ADMIN'` a upravit `analytics/dashboard` na tentýž helper.

### 1.3 Zavést jeden authed-helper a nasadit ho postupně
- [ ] Do `src/lib/auth-helpers.ts` ponechat/ujasnit `requireUser()` vracející `{ userId }` nebo 401
      response (jednotný tvar přes `unauthorized()` z `api-responses`).
- [ ] Smazat mrtvý kód: nepoužívané exporty v `rbac.ts` a duplicitní `requireAdmin` v `auth-helpers.ts`
      (kolize jmen). Ověřit grepem, že nic neimportuje.
- [ ] Nasadit `requireUser()` do routů postupně (v rámci Fáze 2, ať se nemixuje diff).

### 1.4 Drobnosti
- [ ] `admin/users/[id]` PUT — zabránit self-demotion / odebrání posledního admina (guard + test).

**Testy:** integrační 401/403 pro reprezentativní admin routu + pro obě opravené díry.
**Hotovo když:** žádná mutační/citlivá routa není bez auth; admin routy používají jeden helper.

---

## Fáze 2 — Validace requestů + error formáty (#16, #23) · High/Medium

**Strategie:** vše na `validateAPIRequest` + `@/lib/api-responses`. Jeden zdroj pravdy pro schémata.

### 2.1 P0 bug fixy
- [ ] **`src/app/api/user/profile-image/route.ts:138`** — únik `error.message` klientovi → `serverError()`.
      Odstranit i debug `console.log` (řádky 23,33,64,78,91,99).
- [ ] **`src/app/api/admin/users/[id]/route.ts`** — privilegovaná pole (`xp,level,isAdmin,…`) bez Zod →
      přidat striktní schéma + `notFound`/`serverError`.

### 2.2 Doplnit Zod tam, kde chybí (manual → validateAPIRequest)
Přidat schémata do `src/lib/validation-schemas.ts` a nasadit:
`shop/purchase`, `exercises/[id]/answer`, `review/answer`, `friends/request`, `analytics/event`,
`ai-tutor/chat`, `admin/achievements`, `admin/chapters` (POST), `admin/chapters/[id]` (PUT),
`user/hearts`, `user/hearts/refill`.

### 2.3 Konsolidace validačních utilit
- [ ] Migrovat `auth/register/route.ts` z `validations.ts::validateRequestBody` na
      `validateAPIRequest` + `signupSchema` v `validation-schemas.ts`.
- [ ] Přesunout inline schémata (`progress/complete-questions`, `final-test`, `milestone-test`,
      `questions/random`) do `validation-schemas.ts`.
- [ ] **Smazat `src/lib/validations.ts`** (duplicitní `completeChapterSchema`, `signupSchema` …) —
      jeden zdroj pravdy.

### 2.4 Jednotné error odpovědi napříč ~68 routami
- [ ] Nahradit všechny ad-hoc `NextResponse.json({ error: 'Internal server error' }, {status:500})`
      za `serverError()`; 400/401/403/404 za `badRequest/unauthorized/forbidden/notFound`.
- [ ] Sjednotit string split `'Internal error'` vs `'Internal server error'`.
- [ ] Prioritně routy s částečnou adopcí: `admin/hackathons`(+[id]), `projects/submit`, `teams/*`,
      `user/graduate-profile`, `progress/complete-chapter`, `chapters/progress`, `tests/submit`,
      `onboarding/complete`, `hackathons/register`. Pak ~45 GET/list rout.
- [ ] 404-masking: u mutačních rout přidat explicitní `findUnique → notFound()` před `update`
      (aby Prisma P2025 nekončil jako 500).

**Testy:** pro reprezentativní routy testy invalid body → 400 `VALIDATION_FAILED`, missing → 404, ok → 200.
**Hotovo když:** grep na `Internal server error`/ruční 500 v `api/**` je prázdný mimo helper; `validations.ts` smazán.

---

## Fáze 3 — Project submit stavový model (#24) · High

**Strategie (dle rozhodnutí):** explicitní stavy + re-review + oddělení submitted/approved. **Bez** admin UI.

- [ ] **Prisma migrace:** přidat enum `SubmissionStatus { PENDING_REVIEW, APPROVED, REJECTED, RESUBMITTED }`
      na `ProjectSubmission` (+ default, index). Zachovat zpětnou kompatibilitu existujících záznamů
      (data migration: dosavadní approved→APPROVED, ostatní→PENDING_REVIEW/REJECTED dle `approved`).
- [ ] **`src/app/api/projects/submit/route.ts`:**
      - Oddělit `submittedProject` (odevzdáno) od `approved` (schváleno) v `chapterCompletion`/progress.
      - Re-review existující submission: při novém submitu na stejnou kapitolu nastavit `RESUBMITTED`,
        spustit review znovu, XP/hvězdu udělit jen při `APPROVED` (fallback z už opravené `gemini.ts`
        → `PENDING_REVIEW`, nikdy auto-approve).
      - Idempotence XP: XP za projekt udělit jen jednou (guard na přechod do APPROVED).
- [ ] **UI stav v lekci:** zobrazit stav submission (čeká na kontrolu / schváleno / zamítnuto /
      znovu odevzdáno) v `ChapterContent`/submit komponentě.
- [ ] (Volitelný fallback bez admin UI) při `PENDING_REVIEW` po výpadku AI umožnit re-submit; jasná
      hláška uživateli.

**Testy:** odevzdání → PENDING při výpadku AI (žádné XP); approved → XP jednou; re-submit → RESUBMITTED;
progress odráží submitted vs approved. Pokrýt všechny přechody stavů.
**Hotovo když:** student nikdy nedostane XP bez APPROVED; stav je vždy jednoznačný.

---

## Fáze 4 — Odstranit fake data a dev zbytky (#17, #26) · Medium

**Strategie (dle rozhodnutí):** nedodělky doimplementovat, mrtvý kód smazat.

### 4.1 Fake data → reálná (#26)
- [ ] **Graduate detail** `src/app/arena/graduate/[graduateId]/page.tsx` — smazat `mockGraduate`
      (ř. 26-91), napojit na existující `GET /api/graduates/[id]`, odkomentovat práci s `params`.
- [ ] **Settings persistence** `src/app/(main)/settings/page.tsx` — vytvořit `PATCH /api/user/settings`
      (nebo rozšířit `/api/user`) s Zod validací; nahradit `setTimeout` stub (ř. 79-80); napojit
      "Změnit heslo" (nový `POST /api/user/password` s ověřením starého hesla + bcrypt).
- [ ] **Notif badge** `src/components/layout/Topbar.tsx:23` — nahradit `useState(3)` reálným
      unread count z `/api/notifications`.
- [ ] **Profil streak kalendář** `src/app/(main)/profile/page.tsx:184-197` — napojit na existující
      `/api/user/streak-history` místo věčného "načítá se".
- [ ] Backend TODO živící UI čísla: challenge/perfect-score (`complete-chapter/route.ts:236-237`),
      leaderboard rank-change (`leaderboard/route.ts:96`) — dopočítat nebo skrýt (ne konstantní 0/'same').

### 4.2 Dev zbytky (#17)
- [ ] Smazat mrtvé nerutovatelné soubory: `src/app/profile/page_old.tsx`, `page_original.tsx`,
      posoudit orphan `src/app/profile/layout.tsx` + složku.
- [ ] Smazat dev-only route `src/app/examples/layout-example/`.
- [ ] **`/demo`** — doimplementovat jako reálnou stránku (opravit rozbité hrefy `/lessons`, nahradit
      statický Python sample) NEBO odstranit `src/app/demo/` + homepage link `src/app/page.tsx:71`.
      Default: opravit, protože je linkovaná z homepage.
- [ ] Smazat `old_deprecated/` (zvlášť `dev.db.backup` — DB dump nepatří do repa).
- [ ] Hromadně smazat 35 `_AI.md` + stray `.aiDoc` souborů; přidat `_AI.md`/`.aiDoc` do `.gitignore`.
- [ ] Posoudit `/api-docs` — zda má být v produkci veřejné (za dev flag / admin).
- [ ] Odstranit debug `console.log` (`profile-image`, `admin/hackathons/[id]:165`).

**Testy:** graduate detail načte data dle id; settings PATCH persistuje; password change ověří staré heslo.
**Hotovo když:** žádná produkční stránka nepředstírá funkci, kterou nemá; žádné dev zbytky v routách.

---

## Fáze 5 — Navigace + obsah kapitol (#27, #19) · Medium

### 5.1 Navigace (#27)
- [ ] `src/app/chapters/[chapterId]/page.tsx:6` — nahradit hard-coded `{ length: 40 }` za
      `chapters.map(c => ({ chapterId: c.id }))` (routy vždy odvozené z dat).
- [ ] `src/app/chapters/page.tsx:89,97,105,113` — nahradit hard-coded `slice()` moduly za
      data-odvozené seskupení.
- [ ] Přidat `src/app/chapters/not-found.tsx` (branded 404); volitelně normalizovat nepadované id
      (`/chapters/1` → `/chapters/01`).
- [ ] Sjednotit label na listing kartě: `chapter.number` místo `chapter.id`
      (`chapters/page.tsx:212,233`).

### 5.2 Obsah/média (#19)
- [ ] Rozhodnout `colabNotebook`: buď doplnit `.ipynb` soubory + rozšířit `validate-content.ts` o kontrolu
      existence, NEBO odstranit pole. (Video/přednášky jsou OK — nechat, zdokumentovat záměr 09/10.)
- [ ] Odstranit mrtvý `PATHS.texts`/`public/texty` koncept nebo redundantní `textFile` (= `lectureFile`).
- [ ] Přidat test nad strukturou kapitol (rozšíření `validate-content.ts` do jest testu).

**Testy:** test že každé `chapter.id` má route; next/prev boundaries; 404 pro neexistující id.
**Hotovo když:** magické konstanty `40` nahrazeny; navigace odvozená z dat; validátor pokrývá i colab (dle rozhodnutí).

---

## Fáze 6 — Produkční testovací sada (#20) · High

**Strategie:** reuse zavedeného mock patternu (`next/server` + `next-auth` + `@/lib/prisma` +
`$transaction` callback). Přidat `jest.mock('@/lib/admin-auth')` pro admin guardy.

Prioritní testy (nejvyšší dopad × největší mezera):
- [ ] `POST /api/progress/complete-chapter` — XP/gems/hvězdy/streak/quest increment/idempotence/401.
- [ ] `POST /api/shop/purchase` — nedostatek gemů, deducted v txn, duplicita, neaktivní/neexistující item, 401.
- [ ] `POST /api/quests/claim` (route handler) — 401, nedokončeno, už claimnuto, success payload.
- [ ] Admin guard (`admin/chapters/[id]` a spol.) — 401/403 pro ne-admina, success toggle.
- [ ] `POST /api/auth/register` — duplicitní email/username, slabé heslo, bcrypt, name moderation.
- [ ] `POST /api/projects/submit` — approval/manual-review path, persistence, 401 (navazuje na Fázi 3).
- [ ] `GET /api/certificate` (+ `[code]`) — eligibility, issuance, public verify, 401.
- [ ] Progress endpointy (`chapters/progress`, `chapters/all-progress`) — agregace + 401.
- [ ] **E2E smoke** (Playwright, už existuje kostra): login → otevřít kapitolu → dokončit část →
      submit projektu; admin smoke pro shop/quests toggle.
- [ ] Opravit Vitest sirotka `src/lib/__tests__/gamification.test.ts` — buď přidat vitest config+script,
      nebo přepsat na Jest (doporučeno: přepsat na Jest, jeden runner).

**Hotovo když:** každý kritický workflow má aspoň jeden happy-path + jeden failure/401 test; E2E smoke zelený.

---

## Fáze 7 — Zpřísnit CI gates (#25) · Medium

**Strategie (dle rozhodnutí):** přísné.

- [ ] **Coverage threshold vynutit** — odstranit `--coverageThreshold='{}'` a `continue-on-error`
      na coverage kroku v `ci.yml`; primární `npm test` spustit s `--coverage`. Threshold zvednout
      postupně (start 30 % je v jest.config, cílit realisticky ~50 % na kritické moduly).
- [ ] **E2E do CI** — přidat Playwright job (aspoň smoke) jako blokující (na PR/main).
- [ ] **CodeQL + dependency-review** — odstranit `continue-on-error`, ať blokují.
- [ ] **npm audit** — upgradovat zranitelné závislosti na critical/high; kde není fix, zdokumentovat
      výjimku. Otestovat `npm run build` + testy po bumpech (riziko breaking changes).
- [ ] **Build log** — odstranit neošetřené "Dynamic server usage" chyby (přidat `dynamic`/`revalidate`
      export nebo správně cachovat).
- [ ] Vyřešit dvojí runner — smazat Vitest cestu (viz Fáze 6) nebo ji zapojit do CI.
- [ ] `deploy-vps.yml` — navázat deploy na úspěšný CI (required check), ne jen manuální dispatch.

**Hotovo když:** PR blokují install/type-check/lint/unit(+coverage)/build/E2E-smoke/audit(high)+CodeQL;
build log bez neošetřených warningů.

---

## Doporučené pořadí a závislosti

```
F0 příprava
  └─ F1 auth (#18) ─────────────┐
       └─ F2 validace+errory (#16,#23)  ← používá auth helper
            ├─ F3 project submit (#24)  ← používá validaci+errory+auth
            └─ F4 fake data/zbytky (#17,#26)  ← nové API endpointy dědí konvence
       F5 navigace/obsah (#27,#19)  ← nezávislé, může běžet paralelně
  F6 testy (#20)  ← po standardizaci rout (F1-F4), jinak se testy přepisují
  F7 CI (#25)  ← poslední, zamkne kvalitu (potřebuje zelené testy z F6)
```

**Proč toto pořadí:** standardizace auth/validace/errorů (F1-F2) musí předcházet psaní testů (F6),
jinak bychom testy psali proti nestabilnímu API a přepisovali je. CI gates (F7) jdou poslední, aby
neblokovaly práci na F1-F6, ale zamkly výsledný stav.

## Odhad rozsahu (orientační)

| Fáze | Issue | Náročnost |
|------|-------|-----------|
| F1 | #18 | S–M |
| F2 | #16, #23 | M–L (hodně rout, ale mechanické) |
| F3 | #24 | M (migrace + logika + testy) |
| F4 | #17, #26 | M (2 nové API + úklid) |
| F5 | #27, #19 | S |
| F6 | #20 | M–L |
| F7 | #25 | S–M (+ riziko dep bumpů) |

## Průřezové zásady

- Každý PR: `type-check` + `lint` + `test` + `build` zeleně před merge.
- Každá změna chování API má test (happy + failure).
- Prisma migrace vždy s data-migration pro existující data a otestovaná na kopii.
- Žádný `console.log` s citlivými daty; chyby logovat server-side, klientovi jen generický `serverError()`.
- Commity odkazují issue (`fix(auth): … (#18)`).
