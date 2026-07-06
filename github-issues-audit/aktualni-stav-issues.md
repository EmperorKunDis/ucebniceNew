# Aktualni stav GitHub issues

Repo: `EmperorKunDis/ucebniceNew`
Datum kontroly: 2026-07-03
Zdroj: otevrene GitHub issues #16-#27 po aktualizaci

## Souhrn

- Stale aktualni: #16, #17, #18, #20, #23, #24, #26
- Castecne vyresene, scope zmenen na zbyvajici praci: #19, #25, #27
- Zavrene: zadne z kontrolovanych issues
- Labels, assignees, milestones: nemeneno

## #16 - Sjednotit validaci requestu napric API endpointy

Aktualni stav: stale aktualni.

Co se zmenilo proti staremu issue:

- Issue uz netvrdi jen obecny auditni problem.
- Doplneno, ze projekt ma Zod schemata a `validateAPIRequest`, ale nepouziva je vsude.
- Doplneno konkretni mereni: 16 vyskytu `request.json()` v `src/app/api`.

Zbyva:

- Prevest mutacni endpointy na jednotny validacni helper.
- Doplnit chybejici Zod schemas.
- Sjednotit invalid JSON, missing fields a wrong types.

Konkretni soubory:

- `src/lib/validation-schemas.ts`
- `src/app/api/shop/purchase/route.ts`
- `src/app/api/friends/request/route.ts`
- `src/app/api/progress/complete-questions/route.ts`
- `src/app/api/user/hearts/route.ts`
- `src/app/api/ai-tutor/chat/route.ts`
- `src/app/api/admin/chapters/route.ts`
- `src/app/api/admin/achievements/route.ts`

## #17 - Odstranit mock/demo stranky a vyvojove zbytky z produkcniho UI

Aktualni stav: stale aktualni.

Co se zmenilo proti staremu issue:

- Issue je prepsane z obecneho seznamu na aktualni stav konkretne nalezenych souboru.
- Zdurazneno, ze problem je v produkcni routovane app strukture a legacy obsahu.

Zbyva:

- Rozhodnout, ktere demo/example routy maji byt dostupne v produkci.
- Odstranit nebo izolovat legacy soubory.
- Zkontrolovat produkcni navigaci/sitemap.

Konkretni soubory:

- `src/app/profile/page_old.tsx`
- `src/app/profile/page_original.tsx`
- `src/app/demo/page.tsx`
- `src/app/examples/layout-example/page.tsx`
- `src/components/shared/_AI.md`
- `src/app/api/analytics/_AI.md`
- `.aiDoc`
- `old_deprecated/`

## #18 - Audit auth a autorizace pro vsechny admin a interni API routy

Aktualni stav: stale aktualni.

Co se zmenilo proti staremu issue:

- Issue uz rozlisuje, ze routy jsou vetsinou chranene, ale ne jednotnym patternem.
- Doplneny konkretni priklady `requireAdmin` vs. rucni `getServerSession` + role check.

Zbyva:

- Vytvorit auth matrix pro vsechny `src/app/api/**/route.ts`.
- Sjednotit admin routy na jeden helper/pattern.
- Dopsat 401/403 testy.
- Dolozit owner/team checks u citlivych user/internal endpointu.

Konkretni soubory:

- `src/lib/admin-auth.ts`
- `src/app/api/admin/chapters/route.ts`
- `src/app/api/admin/quests/route.ts`
- `src/app/api/admin/shop/route.ts`
- `src/app/api/admin/shop/stats/route.ts`
- `src/app/api/admin/leagues/route.ts`
- `src/app/api/admin/leagues/stats/route.ts`

## #19 - Rozhodnout a dorovnat media kapitol ucebnice po content validaci

Aktualni stav: castecne vyresene.

Co se zmenilo proti staremu issue:

- Puvodni technicky blocker "chybi media / 38 z 40 videi" uz neni presny.
- Content validation prochazi: 40 kapitol, 38 nakonfigurovanych videi, 0 warningu.
- Kapitoly `09` a `10` jsou explicitne povolene jako bez videa.
- Title byl zmenen na rozhodnuti a dorovnani medii po validaci.

Zbyva:

- Produktove potvrdit, zda `09` a `10` opravdu nemaji mit video.
- Pokud je absence videa zamerna, zkontrolovat UI/copy.
- Pokud neni zamerna, doplnit soubory a metadata.
- Zjevne vhodny dalsi krok je browser smoke pres vsechny kapitoly.

Konkretni soubory:

- `scripts/validate-content.ts`
- `data/videa/`
- `src/data/chapters.ts`

## #20 - Doplnit produkcni testovaci sadu pro kriticke workflow

Aktualni stav: stale aktualni, ale puvodni dukaz byl zastaraly.

Co se zmenilo proti staremu issue:

- Testy uz nejsou 3 suites / 50 tests.
- Aktualni overeni: 9 Jest suites, 64 tests.
- Existuji E2E specs pro auth, achievements, quests, chapter completion a mobile responsiveness.
- Issue je zuzeno na chybejici kriticke API/admin workflow.

Zbyva:

- API testy pro `/api/projects/submit`, `/api/shop/purchase`, quests claim a certificate flow.
- Admin 401/403 a klicove mutace.
- Rozhodnout, ktery Playwright smoke set ma byt CI gate.

Konkretni soubory:

- `src/__tests__/`
- `e2e/auth.spec.ts`
- `e2e/chapter-completion.spec.ts`
- `e2e/quests.spec.ts`
- `e2e/achievements.spec.ts`
- `e2e/mobile-responsive.spec.ts`

## #23 - Sjednotit API error response formaty a status kody

Aktualni stav: stale aktualni.

Co se zmenilo proti staremu issue:

- Doplneno, ze helpery uz existuji v `src/lib/api-responses.ts`.
- Problem je ted presneji popsany jako nekonzistentni adopce helperu.
- Issue obsahuje konkretni endpointy s primym `NextResponse.json({ error: ... })`.

Zbyva:

- Definovat finalni API error contract.
- Prevest endpointy na helpery.
- Sjednotit 400/401/403/404/500.
- Doplnit endpoint-level tests.

Konkretni soubory:

- `src/lib/api-responses.ts`
- `src/app/api/questions/random/route.ts`
- `src/app/api/projects/submit/route.ts`
- `src/app/api/shop/purchase/route.ts`
- `src/app/api/admin/chapters/route.ts`
- `src/app/api/admin/users/[id]/route.ts`
- `src/app/api/ai-tutor/chat/route.ts`

## #24 - Dopracovat project submit re-review a rucni kontrolu

Aktualni stav: stale aktualni.

Co se zmenilo proti staremu issue:

- Puvodni nejvetsi riziko Gemini fallbacku je vyresene.
- Fallback uz vraci `approved: false`, `score: 0`, `manualReviewRequired: true`.
- Issue je aktualizovane na zbyvajici workflow: explicitni stavy, re-review a manual review.

Zbyva:

- Zavest stavovy model submission.
- Dopracovat re-review existujici submission.
- Oddelit `submitted` od `approved`.
- Navrhnout admin/teacher manual review flow.
- Pridat testy pro approved, rejected/manual review, provider failure a resubmission.

Konkretni soubory:

- `src/lib/gemini.ts`
- `src/app/api/projects/submit/route.ts`
- `prisma/schema.prisma`

## #25 - Dodat zbyvajici CI/release gates pro produkcni kvalitu

Aktualni stav: castecne vyresene.

Co se zmenilo proti staremu issue:

- Puvodni tvrzeni, ze chybi zakladni gates pro lint/typecheck/test/build/audit, uz neni presne.
- CI uz ma format, type-check, lint, content validation, Jest, build a Docker Compose config validation.
- Security workflow uz ma `npm audit --audit-level=high`.
- Issue je zuzeno na required checks, E2E smoke a `continue-on-error` politiku.

Zbyva:

- Nastavit/dolozit GitHub required checks.
- Pridat minimalni Playwright E2E smoke jako CI/release gate, nebo zdokumentovat proc ne.
- Rozhodnout, ktere security kroky maji blokovat PR.
- Vyresit nebo zdokumentovat low/moderate audit findings.

Konkretni soubory:

- `.github/workflows/ci.yml`
- `.github/workflows/security.yml`
- `e2e/`

## #26 - Odstranit mock/fake data a rozbite produkcni interakce z uzivatelskych stranek

Aktualni stav: stale aktualni.

Co se zmenilo proti staremu issue:

- Issue uz rozlisuje, ze cast graduates listu jde z DB.
- Pridane konkretni stale aktualni problemy: mock graduate detail, hardcoded notification count, settings bez persistence, spatny payload notifikaci.
- Title byl zpresnen na mock/fake data a rozbite produkcni interakce.

Zbyva:

- Nahradit mock graduate detail realnym fetchem nebo stranku skryt.
- Napojit topbar unread count, nebo odstranit badge.
- Implementovat persistence settings, nebo UI oznacit/schovat jako nehotove.
- Opravit payload `ids` vs `notificationIds`.
- Pridat test pro mark-as-read.

Konkretni soubory:

- `src/app/api/graduates/route.ts`
- `src/app/arena/graduate/[graduateId]/page.tsx`
- `src/components/layout/Topbar.tsx`
- `src/app/(main)/settings/page.tsx`
- `src/app/(main)/notifications/page.tsx`
- `src/lib/validation-schemas.ts`

## #27 - Doplnit browser smoke audit navigace a odkazu mezi kapitolami

Aktualni stav: castecne vyresene.

Co se zmenilo proti staremu issue:

- Puvodni riziko spatne struktury kapitol je snizene content validation skriptem.
- Route fallback existuje pres `generateStaticParams` a `notFound()`.
- Issue je zuzeno na browser smoke test realneho UI.

Zbyva:

- Playwright/browser smoke pro `/chapters` a reprezentativni `/chapters/[chapterId]`.
- Otestovat previous/next tlacitka vcetne prvni a posledni kapitoly.
- Otestovat zamykani dalsi kapitoly podle progress state.
- Overit, ze nazev a obsah detailu odpovida seznamu.

Konkretni soubory:

- `scripts/validate-content.ts`
- `src/app/chapters/[chapterId]/page.tsx`
- `src/components/chapters/ChapterNavigation.tsx`
- `src/app/chapters/page.tsx`
- `src/data/chapters.ts`

## Overeni uvedene v issues

Do vsech issues bylo zapsano:

- `npm run validate:content` proslo.
- `npm test -- --runInBand --ci` proslo: 9 suites, 64 tests.
- `npm audit --audit-level=high` proslo; low/moderate zranitelnosti zustavaji mimo high gate.

## Stav Claude v tomto prostredi

Lehka neinvazivni kontrola po pozadavku:

- `which claude` vratilo: `claude not found`
- `claude --version` vratilo: `command not found: claude`
- Pokus o kontrolu procesu pres `ps aux | rg -i "claude|anthropic"` sandbox nepovolil: `operation not permitted: ps`

Z toho jde rict jen toto: v aktualnim shell PATH neni dostupny prikaz `claude`. Stav pripadne bezici aplikace/procesu Claude se z tohoto sandboxu nepodarilo overit bez sirsiho pristupu.
