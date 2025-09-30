## Naivní Bayesův klasifikátor – základní princip a praktické využití

### Princip fungování  
Naivní Bayesův klasifikátor je jednoduchý algoritmus, který se řídí Bayesovou větou. Tato věta umožňuje spočítat pravděpodobnost, že určitý objekt patří do konkrétní kategorie, na základě pozorovaných vlastností. Klíčový předpoklad je, že tyto vlastnosti jsou navzájem nezávislé – proto se nazývá „naivní“. V praxi to znamená, že se každá vlastnost považuje za samostatný důkaz, který ovlivňuje celkovou pravděpodobnost.

Při trénování se algoritmus nejprve spočítá pravděpodobnost, že se objeví jednotlivé kategorie (např. „spam“ a „ne‑spam“). Pak se pro každou vlastnost vypočítá, jak často se vyskytuje v každé kategorii. Během klasifikace se pak tyto pravděpodobnosti spojí podle Bayesovy věty a získá se konečná hodnota, která určuje, do které kategorie objekt nejpravděpodobněji patří.

### Příklady použití  
Naivní Bayesův klasifikátor se často používá v oblastech, kde je potřeba rychle a spolehlivě rozhodovat na základě textových dat. Dva nejčastější příklady jsou:

* **Spamový filtr** – systém, který prochází příchozí e‑maily a rozhoduje, zda se jedná o spam nebo legitimní zprávu. Algoritmus analyzuje slova a fráze v e‑mailu a na základě jejich četnosti v minulých spamech a legitimních zprávách určuje pravděpodobnost spamu.
* **Analýza sentimentu textu** – určení, zda je text psán pozitivně, negativně nebo neutrálně. Algoritmus se učí, která slova a fráze bývají spojena s pozitivními nebo negativními postoji, a následně tyto informace používá k hodnocení nových textů.

Tyto příklady ukazují, že i s jednoduchým modelem může být možné řešit složité úkoly, pokud jsou data správně připravena a algoritmus správně nastaven.

### Implementace modelu  
V hodinách 27.1 si studenti vyzkouší vytvořit jednoduchý model Naivního Bayesova klasifikátoru. Proces se skládá z několika kroků:

1. **Příprava dat** – shromáždění trénovacích vzorků, které obsahují objekt (např. text) a jeho známou kategorii.
2. **Extrahování vlastností** – převod textu na sadu vlastností, obvykle pomocí techniky nazývané „bag of words“ (sada slov bez ohledu na pořadí).
3. **Výpočet pravděpodobností** – spočítání četností slov v jednotlivých kategoriích a pravděpodobnosti výskytu kategorií samotných.
4. **Klasifikace nových objektů** – aplikace Bayesovy věty na nová data a rozhodnutí o kategorii.

Při výuce se studenti zaměří na to, jak tyto kroky implementovat v programovacím jazyce, který používá knihovnu Scikit‑learn, což je běžně používaný nástroj v oblasti strojového učení.

### Implementace spamového filtru  
V části 26.3 se studenti konkrétně zaměří na tvorbu spamového filtru. Knihovna Scikit‑learn poskytuje předpřipravenou třídu `GaussianNB` nebo `MultinomialNB`, které jsou vhodné pro textová data. Studentům je ukázáno, jak:

* Načíst dataset e‑mailů, kde jsou označeny jako spam nebo ne‑spam.
* Rozdělit data na trénovací a testovací sadu, aby bylo možné ověřit účinnost modelu.
* Vytvořit a natrénovat Naivní Bayesův klasifikátor.
* Otestovat model na nových e‑mailových zprávách a vyhodnotit jeho přesnost.

Tento praktický projekt umožní studentům vidět, jak teoretické principy přecházejí do reálné aplikace a jak se dělí úkoly na jednodušší kroky.

### Závěr – Shrnutí a další kroky  
Naivní Bayesův klasifikátor je jednoduchý, ale zároveň silný nástroj pro řešení klasifikačních úloh, zvláště když je potřeba rychlého a spolehlivého rozhodování. V průběhu přednášky bylo ukázáno, jak funguje na základě Bayesovy věty, jak se používá v praktických příkladech jako spamový filtr a analýza sentimentu, a jak jej studenti sami mohou implementovat pomocí Scikit‑learn.  
Nyní je čas na vlastní experiment – vyzkoušejte si vytvořit svůj vlastní klasifikátor a zkoumejte, jak se jeho výkonnost liší při různých typech dat a nastaveních.  

---

## GAPS & QUESTIONS
- Přesné parametry a velikost datasetu, který byl použit při ukázkách.
- Jaké konkrétní metody pro předzpracování textu byly použity (např. tokenizace, odstranění stop‑wordů).
- Jaké výsledky (přesnost, recall, F1‑score) byly dosaženy při testování spamového filtru.
- Pokud existují nějaké doplňující zdroje nebo literaturu, která by pomohla studentům prohloubit znalosti.

## EDIT NOTES
- Tón je analytický a poutavý, aby udržel pozornost širokého publika.
- Struktura odpovídá požadovanému formátu s H1, H2 a závěrem.
- Text je psán ve 3. osobě a vyhýbá se žargonu a superlativům, aby byl přístupný i pro laiky.