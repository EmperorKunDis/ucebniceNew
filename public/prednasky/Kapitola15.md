# Programování s omezujícími podmínkami: Naučte AI pravidla a nechte ji kouzlit

Všechny problémy, které jsme dosud řešili (hledání cesty, bludiště), jsme řešili tak, že jsme AI dali přesný návod **KROK ZA KROKEM**.

- "Jdi rovně."
- "Když narazíš na zeď, zahni doprava."

Dnes si ukážeme úplně jiný, "magický" přístup. Místo toho, abychom AI říkali, _jak_ má problém vyřešit, jí jen řekneme, **jak vypadá správné řešení**. Definujeme pravidla (podmínky) a necháme počítač, ať si cestu najde sám.

Tomuto přístupu se říká **Programování s omezujícími podmínkami (Constraint Satisfaction)**.

---

## Imperativní vs. Deklarativní myšlení

Je to rozdíl jako mezi taxikářem a navigací.

1.  **Imperativní (Algoritmus):** Dáváte přesné instrukce. "Jeďte 500 metrů rovně, pak zahněte druhou doleva, pak na kruhovém objezdu třetí výjezd..." Pokud uděláte chybu v instrukcích, taxikář zabloudí.
2.  **Deklarativní (Podmínky):** Řeknete jen cíl a pravidla. "Chci se dostat na Václavské náměstí. Nechci jet po dálnici a chci se vyhnout zácpám." Je na řidiči (nebo AI), aby našel cestu, která tyto podmínky splňuje.

---

## Příklad: Svatební zasedací pořádek

Představte si, že plánujete svatbu pro 100 lidí. To je typický problém pro tento typ AI.
Místo abyste ručně přesouvali jmenovky, zadáte AI tato pravidla (omezení):

1.  **Podmínka 1:** U každého stolu může být max. 8 lidí.
2.  **Podmínka 2:** Nevěsta a ženich musí sedět u stolu č. 1.
3.  **Podmínka 3:** Strýc Karel NESMÍ sedět vedle Tety Jany (protože by se pohádali).
4.  **Podmínka 4:** Rodina ženicha a rodina nevěsty by měly být promíchané.

AI si tato pravidla vezme a začne zkoušet miliardy kombinací, dokud nenajde tu jednu (nebo ty tři), které splňují **všechna** pravidla najednou. Vy jste nemuseli hnout prstem, jen jste definovali, co chcete.

---

## Slavný hlavolam: 8 Dam

Klasickou ukázkou je šachový problém.

- **Úkol:** Umístěte 8 dam na šachovnici tak, aby se žádné dvě neohrožovaly.
- **Pravidla:**
  1.  Žádné dvě dámy ve stejném řádku.
  2.  Žádné dvě dámy ve stejném sloupci.
  3.  Žádné dvě dámy na stejné šikmé diagonále.

Kdybyste to dělali ručně, zblázníte se. Počítač, kterému dáte tato tři pravidla, najde všech 92 řešení za zlomek sekundy.

---

## Kde se to používá v praxi?

Tento "magický" přístup řídí svět kolem nás víc, než tušíte.

- **Rozvrhy ve školách:** Jak naplánovat hodiny tak, aby se učitelé nekryli, třídy byly volné a studenti neměli 10 hodin v kuse?
- **Logistika:** Jak naložit kamion balíky různých tvarů, aby se tam všechno vešlo a těžké věci nebyly nahoře?
- **Sudoku:** Sudoku není nic jiného než sada podmínek (čísla 1-9 v řádku, sloupci a čtverci).

---

## Shrnutí kapitoly

- Místo psaní postupu ("jak to udělat") definujeme **podmínky** ("co musí platit").
- Tento přístup je skvělý pro **plánování, rozvrhy a logistiku**.
- Šetří práci programátora – nemusí vymýšlet složitý algoritmus, stačí mu správně popsat pravidla.
