**H1: Heuristiky a A* algoritmus**

*Trvání: 60 minut. V tomto přehledu se studenti seznámí s tím, jak jednoduché odhady mohou urychlit hledání nejkratší cesty, a pak se ponoří do praktického kódu, který tuto metodu realizuje.*

---

### H2: Co jsou heuristiky? (15 min)

Heuristika je jednoduchý odhad, který pomáhá vyhledávacím algoritmům rozhodnout, která cesta se jeví jako nejvhodnější. Představte si, že hledáte nejkratší cestu k cíli v labyrintu. Místo toho, abyste prozkoumali celý prostor, heuristika vám řekne, jak daleko je cíl od aktuální pozice. Čím přesnější odhad, tím méně cest musíte prozkoumat.

- **Účel**: snížit počet zkoumaných uzlů a tím zkrátit dobu potřebnou k nalezení řešení.
- **Jednoduchost**: heuristika je často založena na geometrických vlastnostech, např. „přímočará vzdálenost“ mezi dvěma body.
- **Příklad**: v mapě města můžete použít přímou čáru mezi dvěma místy (euclidovská vzdálenost) jako heuristiku pro odhad, jak daleko je cíl.

---

### H2: Úvod do A* algoritmu (15 min)

A* je vyhledávací algoritmus, který kombinuje skutečné náklady na cestu s heuristickým odhadem vzdálenosti k cíli. Jeho klíčová myšlenka spočívá ve vážení obou částí:

- **f(n) = g(n) + h(n)**
  - *g(n)* – náklady od počátečního bodu k uzlu *n*.
  - *h(n)* – heuristický odhad od uzlu *n* k cíli.
- Algoritmus vybírá uzel s nejnižší hodnotou *f(n)* a postupuje dále.

A* je „optimální“ (najde nejkratší cestu) pokud heuristika *h(n)* nikdy nepřesahuje skutečnou vzdálenost k cíli (tzv. *admissibilní*).

---

### H2: Praktický příklad (15 min)

**Scénář**: Najít nejkratší cestu mezi dvěma městy na mapě.

1. **Zadání**: Mapa je reprezentována jako graf, kde uzly jsou města a hrany jsou silnice s uvedenými délkami.
2. **Heuristika**: Použijeme přímou čáru mezi městy (euclidovská vzdálenost). Tato heuristika je jednoduchá a vždy podcení skutečnou vzdálenost, protože skutečná cesta musí obcházet silnice.
3. **Proces**:
   - Začínáme v počátečním městě.
   - Vypočítáme *f(n)* pro všechny sousední města.
   - Vybereme město s nejnižším *f(n)* a opakujeme postup, dokud nedosáhneme cílového města.
4. **Výsledek**: Vypočítaná nejkratší trasa, která je zároveň nejefektivnější z hlediska času potřebného k výpočtu.

---

### H2: Implementace A* algoritmu (15 min)

**Krok 1: Struktura dat**  
- **Prioritní fronta** (min-heap) pro uchovávání otevřených uzlů podle hodnoty *f(n)*.
- **Sada uzlů** pro rychlé ověření, zda uzel již byl zkontrolován (uzavřená sada).

**Krok 2: Algoritmus**  
```text
1. Přidej počáteční uzel do otevřené fronty s f = h(start).
2. Opakuj:
   a. Vyber uzel n s nejnižším f z otevřené fronty.
   b. Pokud je n cílový, skonči – cesta je nalezena.
   c. Přesuň n do uzavřené sady.
   d. Pro každý soused m:
      - Vypočítej g(m) = g(n) + délka(n, m).
      - Pokud m není v uzavřené sadě nebo g(m) je menší než předchozí g(m):
          * Aktualizuj g(m) a f(m) = g(m) + h(m).
          * Přidej m do otevřené fronty.
```

**Krok 3: Příklad kódu**  
- Studenti mohou použít Python s knihovnou `heapq` pro prioritní frontu.
- Pro získání reálných geografických dat lze využít otevřené API (např. OpenStreetMap) a převést je do grafu.

**Krok 4: Testování**  
- Spusťte algoritmus na několika mapách: jednoduché síťové mapy, městské silniční sítě a velké regionální mapy.
- Porovnejte počet prozkoumaných uzlů s čistým BFS (bez heuristiky) a sledujte zrychlení.

---

**Závěr: Co si odnesete a co dál?**

- **Shrnutí**: Heuristiky umožňují vyhledávacím algoritmům pracovat efektivněji, a A* je jedním z nejznámějších příkladů, jak kombinovat náklady s odhadem k dosažení optimálního řešení.
- **Výzva**: Zkuste si vytvořit vlastní heuristiku pro jiný typ problému (např. plánování úkolů, robotika) a porovnejte její dopad na rychlost hledání.
- **Další kroky**: Prohlédněte si další vyhledávací algoritmy (Dijkstra, Greedy Best-First Search) a zjistěte, kdy je vhodné je použít místo A*.

---

**GAPS & QUESTIONS:**

- Konkrétní typy heuristik a jejich vlastnosti (admissibilita, konzistence).
- Příklady kódu s reálnými geografickými daty (formáty, API).
- Detailní vysvětlení struktury prioritní fronty a implementace v konkrétním programovacím jazyce.
- Praktické ukázky s měřicími nástroji pro čas a počet uzlů.

**EDIT NOTES:**

- Tón: analytický a poutavý, aby byl text přístupný pro široké publikum.
- Rozdělení na čtyři 15‑minutové bloky odpovídá požadovanému délce přednášky 60 min.
- Vzhledem k absenci konkrétních zdrojů a detailů byly informace z INPUTu rozšířeny pouze o obecné vysvětlení a strukturu, bez přidání nových dat.