# Formáty dat: V jakém jazyce si povídají počítače?

Když si chcete přečíst knihu, otevřete ji a čtete česky. Když si chce AI "přečíst" data, potřebuje je mít v určitém formátu. Stejně jako existují různé jazyky (čeština, angličtina), existují různé datové formáty. Každý se hodí na něco jiného.

Dnes si představíme "velkou čtyřku", se kterou se setkáte v 99 % případů.

---

## 1. CSV (Comma-Separated Values) – Jednoduchý seznam

Představte si nákupní seznam, kde jsou položky oddělené čárkou.
`Jablka, 5, Ovoce`
`Mléko, 1, Mléčné výrobky`

- **Co to je:** Nejjednodušší tabulka. Každý řádek je jeden záznam, sloupce jsou oddělené čárkou (nebo středníkem).
- **Výhoda:** Otevřete to v Excelu, v Poznámkovém bloku, přečte to každý program na světě. Je to "univerzální dárce krve" mezi daty.
- **Nevýhoda:** Neumí složité věci (např. seznam v seznamu).

## 2. JSON (JavaScript Object Notation) – Krabice v krabici

Představte si, že balíte věci na dovolenou. Máte velký kufr. V něm máte tašku s oblečením. V ní máte ponožky.
JSON funguje přesně takhle – je to hierarchický strom.

```json
{
  "jméno": "Jan Novák",
  "adresa": {
    "město": "Praha",
    "ulice": "Dlouhá"
  },
  "koníčky": ["fotbal", "čtení"]
}
```

- **Co to je:** Formát, který používají webové stránky a aplikace pro komunikaci.
- **Výhoda:** Umí popsat složité vztahy (člověk má adresu a ta adresa má město).
- **Nevýhoda:** Zabírá více místa než CSV.

## 3. XML (eXtensible Markup Language) – Přísný úředník

Vypadá podobně jako HTML kód webových stránek. Všechno musí být pečlivě zabaleno do značek.
`<jmeno>Jan Novák</jmeno>`

- **Co to je:** Starší, velmi robustní formát.
- **Výhoda:** Je extrémně přesný a bezpečný. Používají ho banky a úřady.
- **Nevýhoda:** Je "ukecaný". Spousta textu kolem samotných dat.

## 4. Parquet – Digitální archivář

Představte si knihovnu, kde nejsou knihy seřazené po jedné, ale jsou rozřezané a všechny stránky č. 1 jsou v jedné krabici, stránky č. 2 v druhé.
Zní to šíleně? Pro počítač je to geniální. Když chce přečíst jen "názvy knih" (stránka 1), sáhne do jedné krabice a nemusí listovat celou knihovnou.

- **Co to je:** Moderní formát pro "Big Data".
- **Výhoda:** Je extrémně rychlý a úsporný (komprimovaný).
- **Nevýhoda:** Nepřečtete ho očima, potřebujete speciální program.

---

## Shrnutí kapitoly

- **CSV** je jako Excel – jednoduchá tabulka pro lidi i stroje.
- **JSON** je jako hnízdo krabiček – skvělý pro web a aplikace.
- **XML** je jako úřední formulář – přísný a bezpečný.
- **Parquet** je jako komprimovaný archiv – super rychlý pro obří data.

---
