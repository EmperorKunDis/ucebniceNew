# Naivní Bayesův klasifikátor: Jak AI pozná spam podle "pytle slov"

V minulé kapitole jsme se naučili Bayesovu větu. Dnes ji použijeme k vyřešení problému, který trápí nás všechny: **SPAM**.

Představíme si algoritmus zvaný **Naivní Bayesův klasifikátor**. Je to dříč, který třídí vaše emaily, recenze na internetu nebo zprávy.

---

## Proč "Naivní"?

Tento algoritmus má jeden základní předpoklad, který je geniálně jednoduchý, až dětsky naivní.
Předpokládá, že **na pořadí slov nezáleží**.

Představte si větu: _"Pes kousl pošťáka."_
A větu: _"Pošťák kousl psa."_

Pro nás je to obrovský rozdíl. Pro Naivního Bayese je to totéž. Vidí jen seznam slov: `{pes, kousl, pošťák}`.
Tomuto přístupu se říká **Bag of Words (Pytel slov)**. Jako byste rozstříhali dopis na jednotlivá slova a hodili je do pytle.

Je to "hloupé"? Ano. Funguje to? Překvapivě skvěle! Pro poznání spamu totiž obvykle nepotřebujete znát gramatiku. Stačí vědět, že se tam vyskytují slova jako "VÝHRA", "ZDARMA" a "KLIKNĚTE".

---

## Jak to funguje: Hlasování slov

Představte si, že každé slovo v emailu má právo hlasovat.

1.  Přijde email: _"Ahoj, získejte výhru zdarma zítra!"_
2.  Algoritmus se podívá na každé slovo zvlášť a zeptá se své databáze (kterou si vytvořil tréninkem):
    - **"Ahoj":** Časté v normálních emailech. -> Hlasuje pro **HAM** (OK pošta).
    - **"Získejte":** Časté v reklamách. -> Hlasuje pro **SPAM**.
    - **"Výhru":** Velmi časté ve spamu. -> Silný hlas pro **SPAM**.
    - **"Zdarma":** Extrémně časté ve spamu. -> Velmi silný hlas pro **SPAM**.
    - **"Zítra":** Neutrální. -> Zdržuje se hlasování.

3.  **Sečtení hlasů:**
    - HAM: 1 hlas.
    - SPAM: 3 silné hlasy.
    - **Verdikt:** SPAM.

Algoritmus používá Bayesovu větu k tomu, aby přesně spočítal pravděpodobnost. Výsledkem není jen "Spam", ale "Spam na 98.5 %".

---

## Kde se to používá?

Tento jednoduchý princip "pytle slov" pohání spoustu věcí:

1.  **Spam filtry:** (Gmail, Outlook).
2.  **Analýza sentimentu:** Je tato recenze na film pozitivní nebo negativní? (Slova jako "skvělý", "úžasný" hlasují pro pozitivní. "Nuda", "odpad" pro negativní).
3.  **Třídění zpráv:** Je to článek o sportu ("fotbal", "gól") nebo o politice ("volby", "zákon")?

---

## Shrnutí kapitoly

- **Naivní Bayes** je klasifikátor založený na pravděpodobnosti.
- Je "naivní", protože ignoruje slovosled a kontext (model **Bag of Words**).
- Funguje na principu "hlasování" jednotlivých slov.
- Je extrémně rychlý a efektivní pro práci s textem.
