# Regrese: Jak se naučit předpovídat budoucnost z minulosti

Představte si, že jste učitel a na konci roku se snažíte odhadnout, jakou známku dostane student, který se na závěrečnou zkoušku učil 10 hodin.
Máte k dispozici data od ostatních studentů:

- Karel: 2 hodiny -> 40 bodů
- Jana: 5 hodin -> 70 bodů
- Petr: 8 hodin -> 90 bodů

Dokážete v těchto datech najít nějaký trend? A na jeho základě předpovědět výsledek pro nového studenta?
Přesně to je úkolem **regrese**.

---

## Co je to Regrese?

Regrese je křišťálová koule statistiky. Jejím cílem je najít matematický vztah mezi proměnnými a na jeho základě předpovídat **čísla** (spojité hodnoty).

- Kolik bude zítra stupňů?
- Kolik bude stát tento dům?
- Kolik zmrzliny prodám, když bude 30 °C?

Pozor na rozdíl:

- **Klasifikace** říká "Co to je?" (Pes/Kočka, Spam/Ham).
- **Regrese** říká "Kolik to bude?" (Cena, Teplota, Počet).

---

## Lineární regrese: Hledání pravítka

Nejjednodušším typem je **lineární regrese**. Představte si data jako body na papíře. Lineární regrese se snaží těmito body proložit **přímku** (jako byste na papír položili pravítko).

Hledáme takové pravítko, které je co nejblíže všem bodům zároveň.

- Když najdeme správnou přímku, můžeme pak snadno říct: "Pokud se budeš učit 10 hodin, tvoje známka bude ležet TADY na přímce."

### Rovnice přímky

Možná si pamatujete ze školy: `y = ax + b`.

- `y` je to, co předpovídáme (známka).
- `x` je to, co víme (hodiny učení).
- `a` (směrnice) říká, jak strmá je přímka. (Kolik bodů navíc dostanu za každou hodinu učení?)
- `b` (posun) říká, kde přímka začíná. (Kolik bodů dostanu, i když se nebudu učit vůbec?)

---

## Jak poznáme, že máme dobrý model?

AI nám nakreslí přímku. Ale jak víme, že je dobrá?
Používáme metriky chybovosti.

1.  **MSE (Mean Squared Error):** Průměrná chyba. Říká nám, jak moc se model v průměru "seknul". Pokud model předpověděl 80 bodů a student dostal 90, chyba je 10.
2.  **R² (R-kvadrát):** Číslo od 0 do 1 (nebo 0 % až 100 %). Říká, jak dobře model vysvětluje realitu.
    - R² = 100 %: Model je dokonalý, prochází všemi body.
    - R² = 0 %: Model je k ničemu, hádá náhodně.

---

## Shrnutí kapitoly

- **Regrese** předpovídá čísla (hodnoty).
- **Lineární regrese** prokládá daty přímku.
- Cílem je najít vztah mezi vstupem (hodiny studia) a výstupem (známka).
- Kvalitu modelu měříme pomocí **chyby** (jak moc se spletl).

---
