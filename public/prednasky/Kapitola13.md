# Heuristiky a A\* algoritmus: Jak dát umělé inteligenci šestý smysl

V minulé kapitole jsme se naučili, jak BFS (Opatrný Průzkumník) a DFS (Odvážný Dobrodruh) prohledávají bludiště. BFS byl systematický a zaručeně našel nejkratší cestu, ale prohledal spoustu zbytečných chodeb. DFS byl rychlý a přímočarý, ale jeho cesta často nebyla nejlepší.

Co kdybychom mohli mít to nejlepší z obou světů? Co kdyby náš průzkumník měl **intuici** nebo **šestý smysl**, který by mu neustále napovídal, kterým směrem se cíl pravděpodobně nachází? Přesně to je principem **A\* (A-star) algoritmu**. Je to v podstatě BFS s kompasem. Je to jeden z nejchytřejších a nejpoužívanějších vyhledávacích algoritmů vůbec.

---

## Co je to heuristika? Informovaný odhad

**Heuristika** je "kvalifikovaný odhad" nebo "informovaná intuice". Je to pravidlo, které nám pomáhá rychle se rozhodnout, aniž bychom museli analyzovat všechny možnosti. V kontextu hledání cesty je heuristika odhadem vzdálenosti do cíle.

- **Příklad:** Hledáte cestu z Prahy do Brna. Vaše heuristika může být jednoduchá vzdušná čára na mapě. Víte, že skutečná cesta po dálnici bude delší, ale vzdušná čára vám dává dobrý odhad a směr.
- **Důležité pravidlo:** Pro A* musí být heuristika **optimistická** (tzv. *admisibilní\*). To znamená, že nikdy nesmí přecenit skutečnou vzdálenost. Vzdušná čára je vždy kratší nebo rovna skutečné cestě, takže je to skvělá heuristika.

---

## Úvod do A\* algoritmu: Kombinace reality a intuice

A\* je geniální v tom, že při rozhodování, který uzel prozkoumat jako další, kombinuje dvě hodnoty:

**`f(n) = g(n) + h(n)`**

- **`g(n)` = Skutečná cena cesty:** To je vzdálenost, kterou jsme **už ušli** od startu do aktuálního uzlu `n`. To je realita, žádný odhad.
- **`h(n)` = Heuristika:** To je náš **odhad** ceny z uzlu `n` do cíle. To je naše intuice.

A\* algoritmus vždy prozkoumá uzel s **nejnižší hodnotou `f(n)`**. Dává to smysl: vybere cestu, která se zdá být celkově nejkratší, když sečteme již ušlou vzdálenost a odhad toho, co ještě zbývá.

---

## Praktický projekt: A\* v akci při hledání cesty z bludiště

Pojďme si A\* naprogramovat. Naším úkolem bude najít nejkratší cestu v jednoduchém bludišti reprezentovaném mřížkou, kde jsou i překážky.

**Krok 1: Příprava prostředí a definice bludiště**

Budeme potřebovat `matplotlib` pro vizualizaci a `heapq` pro efektivní implementaci prioritní fronty (seznamu, ze kterého vždy vybíráme uzel s nejnižším skóre `f`).

```bash
pip install matplotlib
```

Naše bludiště bude mřížka, kde `0` je volná cesta a `1` je zeď.

```python
import heapq
import matplotlib.pyplot as plt

# Definice bludiště (0 = cesta, 1 = zeď)
bludiste = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0, 1, 0],
    [0, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

start = (0, 0)
cil = (6, 9)
```

**Krok 2: Implementace A\* algoritmu**

Následující kód obsahuje funkci pro heuristiku (Manhattanská vzdálenost) a samotný A\* algoritmus.

```python
def heuristika(a, b):
    """Manhattanská vzdálenost - náš 'šestý smysl'."""
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def a_star_search(bludiste, start, cil):
    """A* algoritmus pro nalezení nejkratší cesty."""
    sousedi = [(0, 1), (0, -1), (1, 0), (-1, 0)] # 4-směrné prohledávání

    uzavrena_sada = set()
    kandidati = []
    heapq.heappush(kandidati, (0, start)) # (f_skore, uzel)

    g_skore = {start: 0}
    f_skore = {start: heuristika(start, cil)}

    cesta_odkud = {}

    while kandidati:
        # Získáme uzel s nejnižším f_skore
        aktualni = heapq.heappop(kandidati)[1]

        if aktualni == cil:
            # Rekonstrukce cesty
            finalni_cesta = []
            while aktualni in cesta_odkud:
                finalni_cesta.append(aktualni)
                aktualni = cesta_odkud[aktualni]
            finalni_cesta.append(start)
            return finalni_cesta[::-1] # Obrátíme cestu

        uzavrena_sada.add(aktualni)

        for i, j in sousedi:
            soused = aktualni[0] + i, aktualni[1] + j

            # Kontrola hranic a zdí
            if 0 <= soused[0] < len(bludiste) and 0 <= soused[1] < len(bludiste[0]):
                if bludiste[soused[0]][soused[1]] == 1:
                    continue
            else:
                continue

            predpokladane_g_skore = g_skore[aktualni] + 1

            if soused in uzavrena_sada and predpokladane_g_skore >= g_skore.get(soused, float('inf')):
                continue

            if predpokladane_g_skore < g_skore.get(soused, float('inf')):
                cesta_odkud[soused] = aktualni
                g_skore[soused] = predpokladane_g_skore
                f_skore[soused] = predpokladane_g_skore + heuristika(soused, cil)
                heapq.heappush(kandidati, (f_skore[soused], soused))

    return None # Cesta nenalezena

def vizualizuj_bludiste_s_cestou(bludiste, cesta):
    """Vykreslí bludiště a nalezenou cestu."""
    fig, ax = plt.subplots()
    ax.imshow(bludiste, cmap=plt.cm.binary)

    if cesta:
        cesta_x, cesta_y = zip(*cesta)
        ax.plot(cesta_y, cesta_x, color='red', linewidth=2, marker='o')

    ax.plot(start[1], start[0], 'go', markersize=10) # Start (zeleně)
    ax.plot(cil[1], cil[0], 'bo', markersize=10) # Cíl (modře)

    ax.set_xticks(range(len(bludiste[0])))
    ax.set_yticks(range(len(bludiste)))
    ax.grid(True, which='both', color='black', linewidth=1)
    plt.title("A* našel cestu bludištěm!")
    plt.show()

# Spuštění algoritmu a vizualizace
cesta = a_star_search(bludiste, start, cil)
if cesta:
    print(f"Nalezena cesta: {cesta}")
    vizualizuj_bludiste_s_cestou(bludiste, cesta)
else:
    print("Cesta nenalezena.")

```

**Krok 3: Spuštění a interpretace**

Spusťte kód. V terminálu uvidíte přesnou sekvenci políček tvořících nejkratší cestu. Zároveň se zobrazí okno s vizualizací vašeho bludiště, kde bude červenou čarou vykreslena optimální trasa, kterou A\* našel. Všimněte si, jak se cesta chytře vyhýbá zdem a jde přímo k cíli.

---

## Závěr: Chytřejší hledání, ne těžší práce

Dnes jste si do svého arzenálu přidali jeden z nejdůležitějších algoritmů v AI. A\* je všude:

- **Ve hrách:** Nepřátelé hledají nejkratší cestu k vám.
- **V robotice:** Robot ve skladu plánuje optimální trasu pro vyzvednutí zboží.
- **V logistice:** Plánování tras pro doručovací služby.
- **V mapových aplikacích:** I když používají složitější varianty, základní princip A\* je stále přítomen.

Kouzlo A\* je v jeho efektivitě. Místo slepého prohledávání používá "šestý smysl" (heuristiku), aby se zaměřil na nejslibnější cesty. Pracuje chytřeji, ne tvrději.

**Vaše výzva:** Zkuste v kódu změnit `bludiste`. Vytvořte složitější labyrint, přesuňte start a cíl. Sledujte, jak si A\* vždy najde tu nejlepší cestu. Můžete také zkusit změnit heuristiku a sledovat, jak to ovlivní rychlost a správnost řešení.
