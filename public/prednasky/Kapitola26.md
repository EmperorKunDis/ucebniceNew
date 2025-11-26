# Vlastní model: Jak vytrénovat učně

V předchozích lekcích jsme si připravili data (suroviny). Teď přichází to hlavní: **Trénink modelu**.
Představte si, že jste mistr řemesla a přijali jste nového učně (AI). Váš cíl je naučit ho, aby svou práci dělal stejně dobře jako vy.

Tento proces má tři fáze:

1.  **Trénink (Učení):** Ukazujete učni příklady.
2.  **Testování (Zkouška):** Necháte ho pracovat samostatně na nových úkolech.
3.  **Vyhodnocení (Známkování):** Změříte, jak dobře si vedl.

---

## 1. Trénink: Ukazování příkladů

Učeň (model) na začátku nic neumí. Jeho mozek je prázdný (nebo plný náhodných čísel).
Vy mu začnete ukazovat data:

- "Podívej, tohle je fotka psa."
- "Tohle je fotka kočky."
- "Tohle je fotka psa."

Model se snaží najít pravidla (vzory), podle kterých pozná psa od kočky.

- **Důležité:** Data rozdělíme na dvě hromádky.
  - **Trénovací sada (80 %):** Učebnice, ze které se učí.
  - **Testovací sada (20 %):** Otázky k závěrečné zkoušce. Model je během učení NESMÍ vidět! Kdyby je viděl, jen by se je naučil nazpaměť a u zkoušky by podváděl.

---

## 2. Vyhodnocení: Jak měřit úspěch?

Když učeň složí zkoušku (otestujeme ho na testovací sadě), musíme ho oznámkovat. Ale jak? Jedna známka nestačí.

### Přesnost (Accuracy) – Zrádná kamarádka

To je prosté procento správných odpovědí.

- "Z 100 fotek jsi poznal 90 správně. Máš přesnost 90 %."
  Zní to skvěle, že? Ale pozor!

**Příklad zrádnosti:**
Představte si, že hledáte vzácnou nemoc, kterou má jen 1 člověk ze 100.
Váš "hloupý" model řekne u VŠECH lidí: "Je zdravý."

- U 99 lidí se trefil.
- U 1 nemocného se spletl.
- Jeho přesnost je **99 %**!
  Ale jako doktor je k ničemu, protože nenašel toho jediného nemocného.

### F1-skóre – Přísný soudce

Proto máme F1-skóre. To je chytřejší metrika, která kombinuje dvě věci:

1.  **Precision (Přesnost):** Když řekneš "Je to nemoc", jak často máš pravdu?
2.  **Recall (Citlivost):** Kolik procent všech skutečně nemocných jsi odhalil?

Pokud model jen tupě hádá "Všichni jsou zdraví", jeho F1-skóre bude velmi nízké, i když Accuracy je vysoká. F1-skóre nám řekne pravdu o kvalitě modelu.

---

## Shrnutí kapitoly

- **Tréninková data** jsou na učení, **Testovací data** na ověření (model je nesmí vidět předem).
- **Accuracy (Přesnost)** je dobrá metrika, pokud jsou třídy vyvážené (50 koček, 50 psů).
- Pokud hledáme jehlu v kupce sena (vzácné jevy), Accuracy lže. Musíme použít **F1-skóre**.

---
