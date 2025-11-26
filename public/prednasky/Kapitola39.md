# Generativní AI: Staňte se "zaříkávačem" jazykových modelů

Dosud jsme se učili AI, která _analyzuje_ a _předpovídá_.

- Rozpoznávala obrázky.
- Odhalovala spam.
- Hledala trendy.

Dnes se podíváme na mnohem fascinující typ AI: **Generativní AI**.
Je to umělá inteligence, která **tvoří**.

- Píše básně.
- Maluje obrazy.
- Skládá hudbu.
- Programuje kód.

---

## Co je to LLM? Geniální předpovídač slov

**LLM (Large Language Model)** = Velký jazykový model.
Příklady: GPT, Llama, Claude.

Jak funguje? Jeho úkol je překvapivě jednoduchý:

> Na základě sekvence slov, kterou dostal, předpovídá **další nejpravděpodobnější slovo**.

### Příklad

Když mu řeknete: "Hlavní město Francie je..."

- Model "viděl" miliardy textů.
- Ví, že nejpravděpodobnější slovo je "**Paříž**".

Pak vezme novou větu "Hlavní město Francie je Paříž" a hádá **další** slovo.
Opakováním tohoto kroku dokáže generovat celé souvislé texty.

---

## Umění promptu: Kvalitní otázka = kvalitní odpověď

Klíčem k LLM je **prompt** – instrukce, kterou mu dáme.

### Špatný prompt

"Napiš něco o psech."

- Výsledek: Obecný, nudný, nepoužitelný.

### Dobrý prompt

"Vžij se do role zkušeného kynologa. Napiš krátký odstavec (100 slov) pro začínajícího majitele štěněte labradora. Zaměř se na tři nejdůležitější tipy pro první týden doma. Styl: přátelský, ale autoritativní."

- Výsledek: Konkrétní, cílený, užitečný.

---

## Techniky promptingu

### 1. Přiřazení role

"Chovej se jako..."

- Expert na marketing.
- Pirát.
- Shakespeare.

### 2. Poskytnutí kontextu

Dejte modelu všechny potřebné informace.

### 3. Specifikace formátu

- "Odpověz ve formě tabulky."
- "Napiš 5 bodů."
- "Výstupem bude JSON objekt."

### 4. Příklady (Few-shot prompting)

Ukažte mu 1-2 příklady, jak má odpověď vypadat.

---

## Shrnutí kapitoly

- **Generativní AI** tvoří nový obsah (text, obrázky, hudbu).
- **LLM** předpovídá další slovo na základě kontextu.
- **Prompt** je instrukce pro AI - čím lepší, tím lepší výsledek.
- **Prompt Engineering** je nová forma gramotnosti v 21. století.

---
