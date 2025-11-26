# Úvod do strojového učení: Tři trenéři pro vaši umělou inteligenci

Vítejte v posilovně pro umělou inteligenci! Až dosud jsme se učili jednotlivé cviky. Dnes se podíváme na tři základní "tréninkové styly", kterými se AI učí a sílí.

Představte si je jako tři různé typy trenérů, z nichž každý má úplně jinou metodu:

1.  **Trenér s kartičkami (Učení s učitelem):** Ukazuje vám stovky kartiček. Na jedné je obrázek psa a on řekne: "Toto je pes". Na další je kočka a řekne: "Toto je kočka". Vaším úkolem je naučit se pravidla, abyste příště poznali zvíře sami.
2.  **Trenér-organizátor (Učení bez učitele):** Vysype před vás na stůl hromadu různých míčů – fotbalové, basketbalové, tenisáky, golfové – a řekne jen: "Roztřiď to do skupin, které dávají smysl." Neví, co je co, ale očekává, že najdete podobnosti a rozdíly.
3.  **Trenér "Pokus-Omyl" (Učení posilováním):** Postaví vás na hřiště, dá vám míč a řekne: "Zkus dát gól. Za každý gól dostaneš bod. Když mineš, bod ti seberu." Neřekne vám, jak máte kopat, jen vás odměňuje a trestá za výsledky.

---

## 1. Učení s učitelem (Supervised Learning)

Toto je nejběžnější typ. Máme data, kde už známe správné odpovědi (říkáme jim "štítky").

- **Cíl:** Naučit se předpovídat odpovědi pro nová, neznámá data.
- **Příklad:** Odhad ceny domu.
  - Ukážeme AI 1000 prodaných domů (velikost, lokalita) a jejich cenu.
  - AI se naučí vztah: "Větší dům = vyšší cena".
  - Když jí pak ukážeme nový dům, odhadne jeho cenu.

## 2. Učení bez učitele (Unsupervised Learning)

Zde nemáme žádné správné odpovědi. Máme jen hromadu dat a chceme v nich najít řád.

- **Cíl:** Najít skryté skupiny nebo strukturu.
- **Příklad:** Zákazníci v supermarketu.
  - AI neví, kdo je kdo. Ale vidí, že jedna skupina kupuje pleny a pivo (mladí otcové?) a jiná skupina kupuje víno a sýry.
  - Sama rozdělí zákazníky do "klastrů", na které pak můžeme cílit reklamu.

## 3. Učení posilováním (Reinforcement Learning)

Tento typ je nejpodobnější výcviku psa nebo hraní her.

- **Cíl:** Naučit se strategii, jak získat co nejvíce bodů (odměn).
- **Příklad:** Robotický vysavač.
  - Vysaje smetí -> Dostane "pamlsek" (+1 bod).
  - Narazí do zdi -> Dostane "vyhubováno" (-10 bodů).
  - Postupně se naučí vysávat tak, aby maximalizoval body a minimalizoval nárazy.

---

## Shrnutí kapitoly

- **Učení s učitelem:** Máme data i odpovědi. (Klasifikace obrázků, předpověď cen).
- **Učení bez učitele:** Máme jen data, hledáme strukturu. (Třídění zákazníků).
- **Učení posilováním:** Učíme se metodou pokus-omyl pomocí odměn a trestů. (Hry, robotika).

---
