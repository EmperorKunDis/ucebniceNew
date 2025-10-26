# Algoritmy pro hledání: Jak se AI orientuje v bludišti možností

Představte si, že stojíte na začátku velkého bludiště a vaším úkolem je najít poklad ukrytý v jeho srdci. Jak budete postupovat? Máte dvě hlavní strategie.

1.  **Strategie Opatrného Průzkumníka:** Nejprve prozkoumáte všechny chodby, které jsou přímo na dosah. Pak se vrátíte a systematicky prozkoumáte všechny chodby, které jsou o krok dál. Postupujete vrstvu po vrstvě, jako když se vlna šíří po vodní hladině.
2.  **Strategie Odvážného Dobrodruha:** Vyberete si jednu chodbu a jdete, dokud nenarazíte na slepý konec. Teprve pak se vrátíte k poslední křižovatce a zkusíte jinou, neprozkoumanou cestu. Vrháte se do hloubky s nadějí, že trefíte správnou cestu.

Gratuluji, právě jste objevili dva základní algoritmy, které AI používá k řešení obrovského množství problémů: **Prohledávání do šířky (BFS)** a **Prohledávání do hloubky (DFS)**. Dnes se je nejen naučíme, ale i vizualizujeme, abychom viděli, jak "přemýšlí".

---

## Naše bludiště: Reprezentace problému jako graf

Než začneme hledat, musíme si naše bludiště nějak zapsat. V informatice se pro to skvěle hodí datová struktura zvaná **graf**. Graf je jednoduše soubor bodů (říkáme jim **uzly**) a spojnic mezi nimi (těm říkáme **hrany**).

Naše bludiště si představíme jako 7 místností (A-G) propojených chodbami. V Pythonu to zapíšeme jako slovník, kde klíč je název místnosti a hodnota je seznam místností, do kterých se z ní dá přímo dostat.

```python
# Definice našeho bludiště jako grafu
# Klíč je uzel (místnost), hodnota je seznam sousedů (propojené místnosti)
bludiste = {
    'A': ['B', 'C'],
    'B': ['A', 'D', 'E'],
    'C': ['A', 'F'],
    'D': ['B'],
    'E': ['B', 'F'],
    'F': ['C', 'E', 'G'],
    'G': ['F']  # G je náš cíl - poklad!
}

start_uzel = 'A'
cil_uzel = 'G'
```

---

## Prohledávání do šířky (BFS): Opatrný Průzkumník

BFS chce najít **nejkratší možnou cestu**. Postupuje systematicky, vrstvu po vrstvě. K tomu potřebuje "paměť" na uzly, které má navštívit – a to ve správném pořadí. Používá datovou strukturu zvanou **fronta (queue)**, která funguje přesně jako fronta v obchodě: "kdo dřív přijde, ten dřív mele".

**Princip:**

1.  Vlož počáteční uzel do fronty.
2.  Dokud není fronta prázdná:
    a. Vyjmi první uzel z fronty.
    b. Pokud to je cíl, máš hotovo!
    c. Pokud ne, přidej všechny jeho dosud nenavštívené sousedy na konec fronty.

---

## Prohledávání do hloubky (DFS): Odvážný Dobrodruh

DFS se snaží co nejrychleji dostat na konec jedné cesty. Nezajímá ho, jestli je nejkratší. Prostě jde. K tomu používá **zásobník (stack)**, který funguje jako komínek talířů: "poslední, co položíš nahoru, bereš jako první".

**Princip:**

1.  Vlož počáteční uzel na vrchol zásobníku.
2.  Dokud není zásobník prázdný:
    a. Vyjmi uzel z vrcholu zásobníku.
    b. Pokud to je cíl, máš hotovo!
    c. Pokud ne, přidej všechny jeho dosud nenavštívené sousedy na vrchol zásobníku.

---

## Praktický projekt: Vizualizace hledání cesty v bludišti

Pojďme se podívat, jak oba algoritmy prozkoumají naše bludiště. Napíšeme si kód, který nejen najde cestu, ale i vizualizuje postup obou algoritmů krok za krokem.

**Krok 1: Příprava prostředí**

```bash
pip install networkx matplotlib
```

**Krok 2: Kód pro hledání a vizualizaci**

Tento kód definuje oba algoritmy a funkci pro vizualizaci jejich postupu.

```python
import networkx as nx
import matplotlib.pyplot as plt
from collections import deque
import time

# Naše bludiště z úvodu
bludiste = {
    'A': ['B', 'C'], 'B': ['A', 'D', 'E'], 'C': ['A', 'F'],
    'D': ['B'], 'E': ['B', 'F'], 'F': ['C', 'E', 'G'], 'G': ['F']
}
start_uzel = 'A'
cil_uzel = 'G'

# Vytvoření grafu pro vizualizaci
G = nx.Graph(bludiste)
pos = nx.spring_layout(G, seed=42)

def vizualizuj_krok(navstivene, aktualni_uzel, titulek):
    """Funkce pro vykreslení jednoho kroku prohledávání."""
    plt.clf()
    colors = []
    for node in G.nodes():
        if node == aktualni_uzel:
            colors.append('red')  # Aktuálně zpracovávaný uzel
        elif node in navstivene:
            colors.append('skyblue') # Již navštívené uzly
        else:
            colors.append('lightgray') # Nenavštívené uzly

    nx.draw(G, pos, with_labels=True, node_size=2000, node_color=colors, font_size=12, font_weight='bold')
    plt.title(titulek, size=15)
    plt.pause(0.5)

def bfs(graph, start, goal):
    """Prohledávání do šířky (BFS)."""
    print("\n--- Spouštím BFS (Opatrný Průzkumník) ---")
    plt.figure(figsize=(8, 6))
    navstivene = set()
    fronta = deque([[start]]) # Fronta nyní ukládá celé cesty

    while fronta:
        cesta = fronta.popleft()
        uzel = cesta[-1]

        if uzel not in navstivene:
            navstivene.add(uzel)
            vizualizuj_krok(navstivene, uzel, f"BFS prozkoumává: {uzel}")

            if uzel == goal:
                print(f"BFS našlo cestu: {' -> '.join(cesta)}")
                plt.show()
                return cesta

            for soused in graph.get(uzel, []):
                if soused not in navstivene:
                    nova_cesta = list(cesta)
                    nova_cesta.append(soused)
                    fronta.append(nova_cesta)
    plt.show()
    return None

def dfs(graph, start, goal):
    """Prohledávání do hloubky (DFS)."""
    print("\n--- Spouštím DFS (Odvážný Dobrodruh) ---")
    plt.figure(figsize=(8, 6))
    navstivene = set()
    zasobnik = [[start]] # Zásobník nyní ukládá celé cesty

    while zasobnik:
        cesta = zasobnik.pop()
        uzel = cesta[-1]

        if uzel not in navstivene:
            navstivene.add(uzel)
            vizualizuj_krok(navstivene, uzel, f"DFS prozkoumává: {uzel}")

            if uzel == goal:
                print(f"DFS našlo cestu: {' -> '.join(cesta)}")
                plt.show()
                return cesta

            for soused in reversed(graph.get(uzel, [])): # reversed pro intuitivnější pořadí
                if soused not in navstivene:
                    nova_cesta = list(cesta)
                    nova_cesta.append(soused)
                    zasobnik.append(nova_cesta)
    plt.show()
    return None

# Spuštění a vizualizace obou algoritmů
bfs(bludiste, start_uzel, cil_uzel)
dfs(bludiste, start_uzel, cil_uzel)
```

**Krok 3: Spuštění a pozorování**

Spusťte skript. Otevřou se vám dvě okna s grafy, jedno po druhém. Sledujte, jak se postupně zabarvují uzly.

- **U BFS uvidíte**, jak se prozkoumávání šíří od uzlu 'A' symetricky, vrstvu po vrstvě. Najde cestu `A -> C -> F -> G`, která je nejkratší (3 kroky).
- **U DFS uvidíte**, jak se algoritmus nejprve "zavrtá" jedním směrem, např. `A -> B -> D`, narazí na slepý konec, vrátí se a zkusí `A -> B -> E -> F -> G`. Cestu najde, ale nemusí být nejkratší.

---

## Závěr: Správný nástroj pro správný úkol

Dnes jste na vlastní oči viděli zásadní rozdíl mezi dvěma pilíři prohledávacích algoritmů.

- **BFS (do šířky)** je skvělý, když potřebujete najít **nejkratší cestu**. Používají ho sociální sítě k nalezení "přátel přátel" nebo mapové služby k nalezení nejbližší kavárny. Jeho nevýhodou je, že může být náročný na paměť u obrovských grafů.
- **DFS (do hloubky)** je ideální, když potřebujete **prozkoumat všechny možnosti** nebo jen najít _nějaké_ řešení, a nezáleží na délce cesty. Používá se při řešení hlavolamů (jako je bludiště), v umělé inteligenci pro hry nebo při prohledávání souborového systému.

**Vaše výzva:** Zkuste si v kódu upravit naše `bludiste`. Přidejte nové místnosti a chodby. Změňte start a cíl. Sledujte, jak se změní chování obou algoritmů. Pochopení těchto dvou strategií vám otevírá dveře k řešení obrovské škály problémů.
