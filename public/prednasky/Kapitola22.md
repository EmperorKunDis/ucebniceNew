# Zpracování dat: Kuchařka pro přípravu dokonalých "surovin" pro AI

Představte si, že jste šéfkuchař a právě vám dorazila bedna se zeleninou na přípravu slavnostní večeře. Jsou v ní krásné mrkve, ale i pár nahnilých. Některé brambory jsou obří, jiné zase maličké. A pár kousků zeleniny vůbec nepoznáváte.

Co uděláte? Určitě nezačnete hned vařit.
Nejprve si suroviny **připravíte**: vyhodíte shnilé kusy, oloupete brambory, nakrájíte vše na stejnou velikost.

Přesně totéž musíme udělat s daty, než je "naservírujeme" našemu AI modelu. Tomuto procesu se říká **čištění a předzpracování dat**.

---

## Pravidlo č. 1: Odpadky dovnitř, odpadky ven

V datové vědě platí zlaté pravidlo: **"Garbage in, garbage out"**.
Můžete mít ten nejlepší a nejdražší AI model na světě (super hrnec), ale pokud ho "nakrmíte" špinavými daty (shnilou mrkví), výsledek bude vždy jen odpad.

---

## Co všechno musíme uklidit?

### 1. Chybějící data (Děravé kapsy)

Máte tabulku o 1000 lidech, ale u 50 z nich chybí věk. Co s tím?

- **Smazat je?** Škoda, přijdeme o data.
- **Doplnit průměr?** To je rozumné. Pokud je průměrný věk ostatních 35 let, doplníme 35.
- **Doplnit nulu?** Nebezpečné! Počítač si bude myslet, že tam jsou novorozenci.

### 2. Duplikáty (Dvojité vidění)

Někdy se stane, že se stejný člověk v databázi objeví dvakrát. Pokud to neopravíme, AI si bude myslet, že tento typ člověka je důležitější než ostatní. Musíme duplikáty najít a smazat.

### 3. Odlehlé hodnoty (Outliers)

Představte si, že počítáte průměrný plat v hospodě. Sedí tam 10 dělníků. Průměr je 30 000 Kč.
Najednou vejde miliardář. Průměrný plat v hospodě rázem stoupne na 100 milionů Kč.
Je to pravda? Matematicky ano. Statisticky je to nesmysl, který zkresluje realitu. Miliardář je **odlehlá hodnota**, kterou musíme z dat vyřadit, aby nám nezničila model.

### 4. Normalizace (Sjednocení měřítek)

Máme údaje o domech:

- Plocha: 100 m²
- Počet pokojů: 3

Pro AI jsou to jen čísla. Vidí "100" a "3". Řekne si: "Aha, plocha je 33x důležitější než pokoje, protože je to větší číslo!"
To je samozřejmě hloupost. Proto musíme data **normalizovat** – převést je na stejné měřítko (např. všechna čísla "zmáčknout" do rozsahu 0 až 1).

- Plocha 100 m² -> 0.5
- Pokoje 3 -> 0.5
  Teď mají pro AI stejnou váhu.

---

## Shrnutí kapitoly

- Čištění dat zabere datovým vědcům **80 % času**. (Samotné trénování AI je jen třešnička na dortu).
- Musíme řešit **chybějící hodnoty**, **duplikáty** a **odlehlé hodnoty**.
- **Normalizace** zajišťuje, aby se AI nenechala zmást velikostí čísel.

---
