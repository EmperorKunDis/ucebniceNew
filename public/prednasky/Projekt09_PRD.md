# Product Requirements Document (PRD)

## Projekt: AI Rozpoznávač gest "Kámen, Nůžky, Papír"

**Verze:** 1.0
**Datum:** 2025-10-26
**Autor:** Tým AI Kurz
**Status:** ✅ Approved for Development

---

## 📋 Executive Summary

Tento dokument definuje požadavky na interaktivní webovou aplikaci, která využívá strojové učení k rozpoznávání gest ruky v reálném čase. Aplikace slouží jako praktický vzdělávací projekt v rámci kapitoly 9 AI kurzu a demonstruje end-to-end proces od tréninku modelu po deployment funkční aplikace.

**Klíčové metriky úspěchu:**

- Aplikace dokáže rozpoznat gesta s přesností > 85%
- Čas od nahrání obrázku po zobrazení výsledku < 2 sekundy
- Student je schopen aplikaci vytvořit za < 2 hodiny
- Zero-installation pro koncové uživatele (web-based)

---

## 🎯 Problem Statement

### Současná situace

Studenti AI kurzů často trpí "tutorial hell" - rozumí teorii, ale nedokáží postavit funkční aplikaci od začátku do konce. Existující tutoriály buď:

- Vyžadují složitou instalaci (CUDA, TensorFlow local setup)
- Jsou příliš abstraktní (pouze Jupyter notebooky)
- Nebo jsou příliš komplexní pro začátečníky

### Opportunity

Vytvořit projekt, který:

1. **Minimalizuje friction** - použití no-code nástroje (Teachable Machine) pro trénink
2. **Maximalizuje wow efekt** - real-time rozpoznávání z webkamery
3. **Učí produkční myšlení** - ne jen notebook, ale deploynutelná aplikace

### Target Impact

- Student pochopí celý ML pipeline: data → trénink → inference → UI
- Student získá confidence: "Dokážu postavit AI aplikaci sám!"
- Student má hotový portfolio projekt k ukázce

---

## 👥 User Personas

### Persona 1: Student AI (primární)

**Jméno:** Petra, 28 let
**Pozadí:** Kariérní switcher, junior developer v e-commerce
**Cíle:**

- Naučit se praktické AI, ne jen teorii
- Mít projekty na portfolio pro přechod do AI role
- Rozumět end-to-end procesu ML aplikace

**Pain Points:**

- Frustrace z tutoriálů, které nekončí funkční aplikací
- Strach z ML math (ale chce vidět výsledky rychle)
- Omezený čas (večery po práci)

**Success Criteria:**

- Dokáže aplikaci vytvořit za jednou večer
- Může ji ukázat přátelům/rodině (wow effect)
- Rozumí, co dělá každá část kódu

### Persona 2: Učitel/Lektor (sekundární)

**Jméno:** Martin, 35 let
**Pozadí:** IT lektor na VOŠ
**Cíle:**

- Ukázat studentům praktickou AI bez složité infrastruktury
- Mít hands-on projekt na 90min workshop
- Studenti by měli odcházet s fungující aplikací

**Pain Points:**

- Omezený čas na lekcích
- Heterogenní úroveň studentů
- Technické problémy s instalacemi

**Success Criteria:**

- Celý projekt lze dokončit za 90 minut
- Minimální závislost na lokálním setupu
- Jasná, copy-paste-friendly dokumentace

---

## 🎨 User Stories & Use Cases

### Epic 1: Trénink Modelu

**US-1.1:** Jako student chci natrénovat model **bez psaní kódu**, abych se nejprve soustředil na koncepty, ne syntaxi.

- **Acceptance Criteria:**
  - Otevřu Teachable Machine v prohlížeči
  - Vytvořím 3 třídy (kámen, nůžky, papír)
  - Nahraji min. 30 fotek na třídu pomocí webkamery
  - Model se natrénuje během < 5 minut
  - Mohu otestovat model v preview okně

**US-1.2:** Jako student chci **vizuálně vidět**, jak model funguje, abych pochopil, co se během tréninku děje.

- **Acceptance Criteria:**
  - Teachable Machine zobrazuje progress bar během tréninku
  - Preview okno ukazuje real-time confidence scores
  - Vidím, kdy se model "plete" a učím se z toho

**US-1.3:** Jako student chci **exportovat model**, abych ho mohl použít ve vlastní aplikaci.

- **Acceptance Criteria:**
  - Získám unikátní URL s mým modelem
  - Model je hostován v cloudu (Teachable Machine)
  - URL funguje trvale (není časově omezená)

### Epic 2: Vytvoření Webové Aplikace

**US-2.1:** Jako student chci **jednoduché Python rozhraní**, které zobrazí mou AI v prohlížeči.

- **Acceptance Criteria:**
  - Napíši < 50 řádků Pythonu
  - Použiji knihovnu Gradio pro auto-generování UI
  - Aplikace běží na localhost během < 10 sekund

**US-2.2:** Jako uživatel aplikace chci **nahrát obrázek** a vidět, co AI rozpoznala.

- **Acceptance Criteria:**
  - Drag & drop pro upload obrázku
  - Zobrazí se predikce s confidence score
  - Celý proces trvá < 2 sekundy

**US-2.3:** Jako student chci **jasně rozumět kódu**, abych ho mohl upravit pro vlastní projekty.

- **Acceptance Criteria:**
  - Každá funkce má vysvětlující komentář
  - Použité knihovny jsou standard (TensorFlow, Gradio)
  - README vysvětluje, co dělá každá část

### Epic 3: Experimenty a Rozšíření

**US-3.1:** Jako student chci **experimentovat s modelem**, abych pochopil, co ovlivňuje přesnost.

- **Acceptance Criteria:**
  - Mohu přidat více trénovacích dat
  - Mohu změnit parametry modelu (epochs, learning rate)
  - Vidím, jak se mění přesnost

**US-3.2:** Jako pokročilý student chci **rozšířit aplikaci** o vlastní funkce.

- **Acceptance Criteria:**
  - Kód je modulární (lze snadno měnit části)
  - Dokumentace obsahuje "Extension Ideas"
  - Příklady: přidat více gest, použít video stream, atd.

---

## ⚙️ Functional Requirements

### FR-1: Model Training (Teachable Machine)

| ID     | Požadavek                    | Priorita | Acceptance Criteria          |
| ------ | ---------------------------- | -------- | ---------------------------- |
| FR-1.1 | Image classification projekt | P0       | 3 třídy: kámen, nůžky, papír |
| FR-1.2 | Data collection via webcam   | P0       | Min. 30 samples per class    |
| FR-1.3 | Cloud training               | P0       | Max. 5 min training time     |
| FR-1.4 | Model export                 | P0       | Sharable URL + model files   |
| FR-1.5 | Real-time preview            | P1       | Live webcam testing          |

### FR-2: Web Application (Gradio + Python)

| ID     | Požadavek              | Priorita | Acceptance Criteria              |
| ------ | ---------------------- | -------- | -------------------------------- |
| FR-2.1 | Model loading          | P0       | Load from Teachable Machine URL  |
| FR-2.2 | Image upload interface | P0       | Drag-and-drop + file picker      |
| FR-2.3 | Inference function     | P0       | Return class + confidence        |
| FR-2.4 | Results display        | P0       | Show prediction + % confidence   |
| FR-2.5 | Error handling         | P1       | Graceful fail for invalid images |
| FR-2.6 | Localhost deployment   | P0       | `python app.py` spustí server    |

### FR-3: Documentation & Pedagogy

| ID     | Požadavek             | Priorita | Acceptance Criteria     |
| ------ | --------------------- | -------- | ----------------------- |
| FR-3.1 | Step-by-step tutorial | P0       | Kapitola 9 markdown     |
| FR-3.2 | Code comments         | P0       | Každá funkce vysvětlena |
| FR-3.3 | PRD dokument          | P1       | Tento dokument          |
| FR-3.4 | Technical Spec        | P1       | Projekt09_TechSpec.md   |
| FR-3.5 | README                | P0       | Quick start guide       |

---

## 🚫 Non-Functional Requirements

### Performance

- **Latency:** Inference < 2s od uploadu obrázku
- **Model Size:** < 10 MB (pro rychlé načítání)
- **Throughput:** Min. 1 request/second (dostatečné pro demo)

### Usability

- **Learning Curve:** Student dokáže aplikaci vytvořit za < 2 hodiny
- **Documentation:** Každý krok má screenshot nebo code snippet
- **Error Messages:** Clear, actionable (ne jen Python tracebacks)

### Reliability

- **Uptime:** N/A (localhost aplikace)
- **Data Loss:** Model URL musí zůstat funkční 6+ měsíců

### Scalability

- **Není priorita** - jedná se o vzdělávací projekt, ne production systém
- Ale: Kód by měl být rozšiřitelný (modular design)

### Security

- **Minimal risk** - běží lokálně, nepracuje s citlivými daty
- **Note:** Model URL je public - nepoužívat pro proprietary data

### Compatibility

- **OS:** Windows, macOS, Linux (díky Pythonu)
- **Python:** >= 3.7
- **Browsers:** Chrome, Firefox, Safari (Gradio support)

---

## 🎨 User Experience Requirements

### UI/UX Principles

1. **Zero-confusion:** Každé okno má clear call-to-action
2. **Immediate feedback:** Inference probíhá live (progress indicator)
3. **Forgiving:** Chybné obrázky nepadnou, jen zobrazí error
4. **Delightful:** Confidence score vizualizovaná jako progress bar

### Key Screens/Flows

**Flow 1: Teachable Machine Training**

```
Start → Create Project → Add Classes →
→ Capture Images (webcam) → Train Model →
→ Test Preview → Export URL → DONE
```

**Flow 2: Gradio App Usage**

```
Start App → Upload Image → Wait (1-2s) →
→ See Prediction + Score → Try Another → DONE
```

### Accessibility

- **Not priority** pro MVP (vzdělávací kontext)
- Ale: Alt text pro obrázky, keyboard navigation v Gradio

---

## 📊 Success Metrics & KPIs

### Learning Outcomes (qualitative)

- **Student confidence:** Exit survey: "Cítím, že dokážu postavit AI aplikaci" (target: 80%+ agree)
- **Comprehension:** Quiz: "Vysvětli rozdíl mezi tréninkem a inferencí" (target: 70%+ correct)

### Technical Metrics (quantitative)

- **Model Accuracy:** > 85% na testovacích datech
- **Completion Rate:** > 75% studentů dokončí celý projekt
- **Time to Complete:** Median 90-120 minut

### Engagement Metrics

- **Portfolio usage:** Kolik studentů si aplikaci uloží do GitHub? (track via GitHub stars)
- **Extension rate:** Kolik studentů upraví kód pro vlastní projekt? (anecdotal)

---

## 🗓️ Timeline & Milestones

### Phase 1: Content Creation (Week 1)

- ✅ Kapitola 9 markdown (tutorial)
- ✅ PRD dokument
- ⏳ Technical Spec
- ⏳ README

### Phase 2: Testing (Week 2)

- Beta test s 5 studenty
- Sběr feedback
- Iterace na dokumentaci

### Phase 3: Launch (Week 3)

- Publish kapitola 9 v kurzu
- Monitor completion rates
- Hotfix kritických bugů

### Phase 4: Iterate (ongoing)

- Quarterly review student feedback
- Update dependencies (TensorFlow, Gradio versions)
- Add advanced extensions

---

## ⚠️ Risks & Mitigations

### Risk 1: Teachable Machine změna API

**Likelihood:** Low
**Impact:** Critical
**Mitigation:**

- Dokumentovat current version (2025)
- Mít backup: alternativní trénink s Keras (v appendixu)

### Risk 2: Studenti nemají Python nainstalovaný

**Likelihood:** Medium
**Impact:** Medium
**Mitigation:**

- Link na Python instalaci v Prerequisites
- Google Colab alternativa (celá aplikace v notebooku)

### Risk 3: Model má nízkou přesnost (< 70%)

**Likelihood:** Medium
**Impact:** Low (stále učební moment)
**Mitigation:**

- Tutorial zdůrazňuje "více a rozmanitějších dat = lepší model"
- Section: "Debugging špatného modelu"

### Risk 4: Gradio není kompatibilní s novou verzí Pythonu

**Likelihood:** Low
**Impact:** Medium
**Mitigation:**

- Requirements.txt s pinned versions
- Quarterly dependency update

---

## 🔄 Future Roadmap

### V1.1 (Kapitola 10 bonus)

- Real-time webcam stream (ne jen upload)
- Deployment na Hugging Face Spaces

### V2.0 (Pokročilá kapitola)

- Custom model training (not Teachable Machine)
- PyTorch implementace od nuly

### V3.0 (Capstone projekt)

- Multi-class rozpoznávání (celá abeceda znakovacího jazyka)
- Mobile app (TensorFlow Lite)

---

## 📚 Dependencies & Assumptions

### Technické Závislosti

- **Teachable Machine:** Free, cloud-based (Google)
- **Python 3.7+:** Student má nainstalováno
- **Internet:** Pro download knihoven a přístup k modelu

### Pedagogické Předpoklady

- Student prošel kapitoly 1-8 (základy AI)
- Student má základní znalost terminál/command line
- Student má webkameru (pro data collection)

### Obchodní Předpoklady

- Kurz je zdarma/open-source (no licensing issues)
- Teachable Machine zůstane free tier dostupný

---

## ✅ Acceptance Criteria (Overall)

Projekt je považován za **úspěšný**, pokud:

1. ✅ **Funkční:** Student vytvoří app, která funguje s > 85% accuracy
2. ✅ **Kompletní:** Existuje PRD, TechSpec, README a tutorial
3. ✅ **Testovaný:** Min. 5 beta testerů úspěšně dokončilo
4. ✅ **Dokumentovaný:** Každý krok má clear instrukce
5. ✅ **Rozšiřitelný:** Kód je připraven na studenty-hackers

---

## 📞 Stakeholders & Approvers

| Role          | Jméno         | Odpovědnost        | Status      |
| ------------- | ------------- | ------------------ | ----------- |
| Product Owner | Martin Švanda | Finální approval   | ✅ Approved |
| Tech Lead     | Claude AI     | Technický design   | ✅ Approved |
| Pedagog       | Martin Švanda | Didaktická kvalita | ✅ Approved |
| Beta Tester   | TBD           | User testing       | ⏳ Pending  |

---

## 📝 Change Log

| Verze | Datum      | Změny       | Autor     |
| ----- | ---------- | ----------- | --------- |
| 1.0   | 2025-10-26 | Initial PRD | Claude AI |

---

## 🔗 Related Documents

- **Technical Specification:** `Projekt09_TechSpec.md`
- **Developer README:** `Projekt09_README.md`
- **Tutorial:** `Kapitola09.md`
- **Troubleshooting:** `Troubleshooting_Guide.md`

---

**Konec dokumentu**

_Tento dokument je živý - bude aktualizován na základě student feedback a technických změn._
