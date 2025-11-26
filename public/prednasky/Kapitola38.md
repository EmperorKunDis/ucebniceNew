# Vysvětlitelná AI (XAI): Jak se podívat do "černé skříňky"

Představte si lékaře, který vám oznámí: "Máte vážnou nemoc, protože to řekl můj počítač. Nevím proč, prostě to řekl."

Důvěřovali byste mu? Pravděpodobně **ne**.

Stejné je to s umělou inteligencí. Abychom jí mohli důvěřovat, potřebujeme jejím rozhodnutím **rozumět**.

Vítejte ve světě **Vysvětlitelné AI (Explainable AI, XAI)**.

---

## Proč potřebujeme vysvětlitelnost?

### 1. Důvěra

Uživatelé (lékaři, soudci, bankéři) musí modelu důvěřovat, aby se na něj mohli spolehnout.

### 2. Odhalování chyb

Pokud model dělá chyby nebo je nespravedlivý, XAI nám pomůže zjistit **proč**.

- Možná se příliš spoléhá na pohlaví nebo rasu.

### 3. Zlepšování modelu

Když víme, které faktory model považuje za důležité, můžeme lépe připravit data.

### 4. Regulace a právo

V mnoha odvětvích (bankovnictví) existuje **"právo na vysvětlení"**.

- Proč mi banka zamítla úvěr?
- Model musí být schopen to vysvětlit.

---

## Globální vs. Lokální vysvětlení

### Globální vysvětlení

"Co je pro model nejdůležitější **celkově**?"

- Napříč všemi predikcemi.
- Např.: "Model považuje věk a pohlaví za nejdůležitější faktory."

### Lokální vysvětlení

"Proč zrovna **TENTO** člověk dostal tuto předpověď?"

- Pro konkrétní případ.
- Např.: "Pan Novák dostal zamítnutí úvěru, protože má nízký příjem (vliv -30 bodů) a krátkou historii zaměstnání (vliv -15 bodů)."

---

## SHAP: Teorie her pro AI

**SHAP (SHapley Additive exPlanations)** je jedna z nejpopulárnějších metod XAI.

Princip je založen na **teorii her**.

- Pro každou predikci spočítá "**příspěvek**" každého vstupního údaje.
- Řekne nám, které faktory "tlačily" predikci nahoru a které dolů.

### Příklad: Přežití na Titanicu

- **Základní hodnota (base):** Průměrná šance na přežití (např. 38 %).
- **Faktor pohlaví (žena):** +50 % (tlačí nahoru).
- **Faktor věk (50 let):** -10 % (tlačí dolů).
- **Faktor třída (1. třída):** +20 % (tlačí nahoru).
- **Finální predikce:** 98 % šance na přežití.

---

## Shrnutí kapitoly

- **XAI (Explainable AI)** otevírá "černou skříňku" modelu.
- Potřebujeme ji pro **důvěru**, **odhalování chyb** a **regulaci**.
- **Globální vysvětlení:** Co je důležité celkově?
- **Lokální vysvětlení:** Proč tato konkrétní předpověď?
- **SHAP** počítá příspěvek jednotlivých faktorů k rozhodnutí.

---
