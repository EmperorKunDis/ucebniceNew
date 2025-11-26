# Zpětná propagace: Jak se neuronová síť učí ze svých chyb

Představte si, že síť je tým dělníků, kteří staví zeď. Na konci přijde mistr (ztrátová funkce) a řekne: "Zeď je o 10 cm křivá!"

**Zpětná propagace (Backpropagation)** je proces, kdy mistr jde od posledního dělníka (výstupní vrstva) k prvnímu (vstupní vrstva) a každému řekne, jak moc se _on_ podílel na celkové křivosti a jakým směrem má příště pohnout svou cihlou.

Je to geniální algoritmus pro spravedlivé rozdělení "viny" a nápravu chyb.

---

## Čtyři kroky učení: Cyklus zpětné vazby

Každý tréninkový cyklus v neuronové síti se skládá ze čtyř základních kroků:

### 1. Dopředný průchod (Forward Pass)

- Posíláme data síti a necháme ji udělat předpověď.
- Je to jako když postavíte zeď podle aktuálního plánu.

### 2. Výpočet ztráty (Loss Calculation)

- Porovnáme předpověď se správnou odpovědí.
- Změříme, jak moc se síť spletla.
- To je náš "mistr", který měří křivost zdi.

### 3. Zpětný průchod (Backward Pass)

- Zde se děje kouzlo!
- Vypočítáme pro každou váhu v síti, jak moc přispěla k celkové chybě.
- Je to jako když mistr řekne každému dělníkovi: "Tvá cihla je o 2 cm mimo. Posuň ji doleva."

### 4. Aktualizace vah (Weight Update)

- Nakonec všechny váhy v síti mírně upravíme tak, aby příští pokus byl lepší.
- Každá cihla se posune správným směrem.

Tento cyklus opakujeme tisíckrát a síť se postupně, krok za krokem, stává přesnější.

---

## Učící křivka: EKG naší sítě

Když síť trénujeme, sledujeme, jak se mění její chyba (ztráta) v čase.
Vytvoříme grafobraz zvaný **Učící křivka**.

- **Na začátku:** Chyba je vysoká (síť neumí nic, hádá jen náhodně).
- **Během tréninku:** Chyba klesá (síť se učí).
- **Na konci:** Chyba se ustálí na nízké hodnotě (síť je naučená).

Pokud chyba klesá plynule, je vše v pořádku.
Pokud kolísá nebo naopak neroste, něco je špatně (např. příliš vysoká rychlost učení).

---

## Shrnutí kapitoly

- **Backpropagation** rozpočítává chybu zpětně všem váhám v síti.
- Každý tréninkový krok má 4 fáze: Dopředu -> Změř chybu -> Dozadu -> Uprav.
- **Učící křivka** (graf ztráty) je naše okno do procesu učení.

---
