# Algoritmy pro hledání: Jak se AI orientuje v bludišti možností

Představte si, že stojíte na začátku velkého bludiště a vaším úkolem je najít poklad ukrytý v jeho srdci. Jak budete postupovat? Máte dvě hlavní strategie.

1.  **Strategie Opatrného Průzkumníka (BFS):** Nejprve prozkoumáte všechny chodby, které jsou přímo na dosah. Pak se vrátíte a systematicky prozkoumáte všechny chodby, které jsou o krok dál. Postupujete vrstvu po vrstvě, jako když se vlna šíří po vodní hladině.
2.  **Strategie Odvážného Dobrodruha (DFS):** Vyberete si jednu chodbu a jdete, dokud nenarazíte na slepý konec. Teprve pak se vrátíte k poslední křižovatce a zkusíte jinou, neprozkoumanou cestu. Vrháte se do hloubky s nadějí, že trefíte správnou cestu.

Gratuluji, právě jste objevili dva základní algoritmy, které AI používá k řešení obrovského množství problémů: **Prohledávání do šířky (BFS)** a **Prohledávání do hloubky (DFS)**.

---

## Prohledávání do šířky (BFS): Opatrný Průzkumník

BFS (Breadth-First Search) postupuje jako **kruhy na vodě**, když do ní hodíte kámen.

- **Cíl:** Najít cíl co nejdříve (s nejmenším počtem kroků).
- **Jak to dělá:**
  1.  Podívám se na všechny sousedy startu (vzdálenost 1).
  2.  Pokud tam není cíl, podívám se na sousedy sousedů (vzdálenost 2).
  3.  A tak dále.
- **Výhoda:** Zaručeně najde **nejkratší cestu**.
- **Nevýhoda:** Musí si pamatovat spoustu věcí najednou (všechny rozdělané cesty).
- **Použití:** Navigace (nejkratší cesta), sociální sítě (přátelé přátel).

---

## Prohledávání do hloubky (DFS): Odvážný Dobrodruh

DFS (Depth-First Search) je jako **nit v labyrintu**.

- **Cíl:** Dostat se na konec jedné cesty co nejrychleji.
- **Jak to dělá:**
  1.  Vyberu si jednu cestu a jdu po ní, dokud to jde.
  2.  Narazil jsem na zeď? Vrátím se o krok zpět (backtracking) a zkusím jinou odbočku.
- **Výhoda:** Je paměťově nenáročný (pamatuje si jen aktuální cestu).
- **Nevýhoda:** Může najít cestu, která je zbytečně dlouhá a klikatá. Může zabloudit v nekonečné větvi.
- **Použití:** Řešení hlavolamů (Sudoku), prohledávání webu.

---

## Srovnání: Kdo vyhraje?

Představte si, že hledáte klíče v domě.

- **BFS:** Prohledáte nejdřív celou předsíň. Pak celý obývák. Pak celou kuchyň. (Systematické, ale pomalé).
- **DFS:** Vběhnete do kuchyně, otevřete šuplík, podíváte se do hrnku, pod stůl... (Rychlé, pokud máte štěstí, ale můžete skončit ve sklepě, zatímco klíče jsou v předsíni).

---

## Shrnutí kapitoly

- **Graf** je mapa bodů (uzlů) a spojnic (hran).
- **BFS (Do šířky)** hledá po vrstvách. Najde nejkratší cestu, ale žere paměť.
- **DFS (Do hloubky)** jde rovnou za nosem. Je rychlý a úsporný, ale nemusí najít nejlepší cestu.
- Volba algoritmu závisí na tom, co je pro nás důležitější: mít jistotu nejkratší cesty (BFS), nebo šetřit paměť (DFS).
