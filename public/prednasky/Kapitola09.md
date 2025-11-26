# Váš první AI projekt: Jak naučit počítač vidět

Dost bylo teorie! V předchozích kapitolách jsme si povídali o tom, co AI je a jak funguje. V této kapitole si vysvětlíme proces, jak se taková AI staví, krok za krokem. Nebudeme psát kód, ale projdeme si logiku, kterou používají inženýři v Google nebo Tesla.

Naším cílem je pochopit, jak vytvořit systém, který pozná, jestli ukazujete **kámen**, **nůžky**, nebo **papír**.

---

## Část 1: Trénink "mozku" (Model)

Každá AI potřebuje mozek – model, který se učí z dat. Proces tvorby modelu má tři fáze:

### Fáze 1: Sběr dat (Krmení)

AI neví, jak vypadá "kámen". Musíme jí to ukázat.

- **Co děláme:** Vyfotíme 100 fotek ruky sevřené v pěst.
- **Důležité:** Musíme hýbat rukou! Měnit úhel, vzdálenost, světlo. Pokud vyfotíme 100 stejných fotek, AI se nic nenaučí (bude jen "papouškovat").
- **Štítkování (Labeling):** Každé fotce dáme nálepku "KÁMEN". To samé uděláme pro "NŮŽKY" a "PAPÍR".

### Fáze 2: Trénink (Učení)

Teď necháme počítač "šprtat".

- Počítač si prohlíží fotky a hledá společné rysy.
- "Aha, když jsou prsty takhle u sebe, je to KÁMEN. Když jsou dva nahoře, jsou to NŮŽKY."
- Tento proces může trvat minuty (u jednoduchých úkolů) nebo týdny (u ChatGPT).

### Fáze 3: Testování (Zkouška)

Než model pustíme do světa, musíme ho vyzkoušet.

- Ukážeme mu fotku, kterou **nikdy předtím neviděl**.
- Pokud řekne "Kámen", dostane jedničku. Pokud řekne "Nůžky", musíme zpátky do školy (nasbírat lepší data nebo déle trénovat).

---

## Část 2: Tělo aplikace (Rozhraní)

Mít chytrý mozek nestačí. Potřebujeme tělo – aplikaci, přes kterou s AI komunikujeme.

1.  **Vstup (Oči):** Webkamera nebo nahrání fotky.
2.  **Zpracování:** Obrázek se pošle do "mozku" (modelu).
3.  **Výstup (Ústa):** Aplikace nám napíše výsledek: "Vidím KÁMEN na 98 %."

---

## Nástroje pro začátečníky: Teachable Machine

Existují nástroje, které tento proces umožňují bez programování. Jedním z nich je **Teachable Machine** od Google.

- Funguje přímo v prohlížeči.
- Umožňuje nahrát fotky webkamerou.
- Jedním tlačítkem natrénuje model.
- Okamžitě ukáže výsledek.

Je to skvělý způsob, jak si "osahat", jak citlivá je AI na kvalitu dat. Zkuste třeba natrénovat model na rozpoznávání vašeho obličeje a obličeje vašeho psa. Co se stane, když si nasadíte brýle? Pozná vás stále?

---

## Shrnutí kapitoly

- Tvorba AI má tři kroky: **Sběr dat**, **Trénink**, **Testování**.
- **Kvalita dat** je klíčová. "Garbage in, garbage out" (Odpad dovnitř, odpad ven).
- Model potřebuje vidět **rozmanité příklady**, aby se naučil obecná pravidla, ne jen memoroval konkrétní fotky.
- Nástroje jako **Teachable Machine** zpřístupňují AI každému.
