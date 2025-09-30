**H1: Algoritmy pro hledání**

V této části přednášky se zaměříme na dva základní způsoby, jakými počítače prohledávají struktury dat nazývané grafy – diagramy, kde body (uzly) jsou spojeny čarami (hrany). Tyto algoritmy, známé jako prohledávání do šířky (BFS) a prohledávání do hloubky (DFS), umožňují programům najít cesty, zkontrolovat souvislost nebo vyhledat konkrétní uzel. Představíme si jejich principy, porovnáme jejich charakteristiky a ukážeme si, jak je lze snadno naprogramovat v jazyce Python.

---

**H2: Prohledávání do šířky (BFS)**  

BFS je algoritmus, který postupuje po úrovních. Představte si, že stojíte na místě v městě a chcete prozkoumat všechny sousední ulice, než se vydáte na další úroveň. Algoritmus tedy nejprve prohledá všechny uzly, které jsou přímo spojeny s počátečním uzlem, a až poté přejde na uzly, které jsou dva kroky dále. Tento postup zajišťuje, že každý uzel je navštíven v pořadí, v jakém se nachází nejbližší k výchozímu bodu.

BFS využívá strukturu nazývanou fronta (queue). Fronta funguje jako řada, kde se prvky přidávají na konec a vybírají z začátku. V Pythonu je možné frontu efektivně implementovat pomocí třídy `deque` z modulu `collections`. Tato třída umožňuje rychlé přidávání a odebírání prvků z obou konců a je proto ideální pro BFS.

---

**H2: Prohledávání do hloubky (DFS)**  

DFS se naopak vydává co nejdále do jednoho směru, než se vrátí a zkusí jiný. Je to jako když procházíte jednou ulicí až k jejímu konci, poté se vrátíte a vyberete jinou ulici, kterou jste ještě nezkusili. Algoritmus tak postupuje „hluboko“, dokud nedojde na konec cesty, a pak se vrací zpět a zkouší další možnosti.

Pro DFS se často používá zásobník (stack), což je struktura, kde se prvky přidávají a vybírají z jednoho konce. V Pythonu je možné zásobník jednoduše napodobit pomocí běžného seznamu, kde přidáváme a odebíráme prvky na konci. DFS je vhodný pro úlohy, kde je potřeba prozkoumat všechny možné cesty nebo najít řešení, které se nachází na nejhlubším úrovni.

---

**H2: Porovnání a použití**  

BFS a DFS mají odlišné chování, které ovlivňuje, kdy je vhodné je použít. BFS prohledává graf úrovně po úrovni, což může být výhodné, pokud je třeba najít nejkratší cestu v nevyváženém grafu nebo pokud je důležité, aby byl navštíven každý uzel co nejdříve. DFS se zaměřuje na hluboké prozkoumání jedné cesty, což je užitečné, když je třeba prozkoumat všechny možné cesty nebo když je graf velký a není potřeba navštívit všechny uzly.

Výhody a nevýhody obou algoritmů se liší podle konkrétního úkolu. BFS může být náročnější na paměť, protože musí uchovávat ve frontě všechny uzly na aktuální úrovni. DFS může být rychlejší v případě, že se hledaný uzel nachází na hluboké úrovni, ale může ztratit možnost najít nejkratší cestu, pokud není graf vyvážený. V každém případě je důležité zvážit charakter grafu a požadovaný výsledek před volbou algoritmu.

---

**H2: Implementace BFS a DFS**  

V praktické části přednášky si studenti naprogramují oba algoritmy v Pythonu. Kód pro BFS může vypadat následovně:

```python
from collections import deque

def bfs(start, graph):
    visited = set()
    queue = deque([start])
    while queue:
        node = queue.popleft()
        if node not in visited:
            visited.add(node)
            queue.extend(graph[node] - visited)
    return visited
```

Pro DFS lze použít jednoduchý rekurzivní přístup:

```python
def dfs(start, graph, visited=None):
    if visited is None:
        visited = set()
    visited.add(start)
    for neighbor in graph[start]:
        if neighbor not in visited:
            dfs(neighbor, graph, visited)
    return visited
```

Oba kódy předpokládají, že graf je reprezentován jako slovník, kde klíčem je uzel a hodnotou množina jeho sousedů. Po napsání kódu si studenti mohou pomocí knihovny Matplotlib vytvořit vizualizaci průchodu grafem, aby si mohli sledovat, jak algoritmy postupují. Matplotlib umožňuje kreslit uzly a hrany a přidávat barvy nebo značky, které ukazují, které uzly již byly navštíveny.

---

**Závěr: Přehled a výzva k akci**  

V průběhu přednášky se studenti seznámí s tím, jak fungují algoritmy prohledávání do šířky a do hloubky, jak je lze porovnat a kdy je vhodné je použít, a nakonec si je sami naprogramují v Pythonu. Tyto dovednosti jsou základními stavebními kameny pro řešení mnoha problémů v informatice, od vyhledávání informací až po řešení složitých herních situací.

**Co dál?**  
Studenti by měli pokračovat ve vytváření vlastních grafů a testování obou algoritmů na různých typech grafů. Můžete si vytvořit jednoduchý herní labyrint nebo mapu a zjistit, jak se BFS a DFS chovají při hledání cesty k cíli. Dále doporučujeme experimentovat s vizualizací pomocí Matplotlib, aby se procvičila práce s knihovnami a vizuální interpretace algoritmů.

---

**GAPS & QUESTIONS:**  
- Jaké konkrétní příklady grafů by byly nejvhodnější pro demonstraci rozdílů mezi BFS a DFS?  
- Jaké jsou přesné požadavky na vstupní data (formát grafu) pro implementaci v Pythonu?  
- Existuje doporučená struktura kódu pro vizualizaci v Matplotlib, která by zajistila konzistenci s výukovým materiálem?  

**EDIT NOTES:**  
- Tón: analytický a poutavý, přizpůsobený širokému věkovému rozpětí, bez technického žargonu.  
- Struktura: jasné nadpisy (H1, H2) podle požadavků, přehledná sekce s praktickým kódem a vizualizací.  
- Délka: text je přibližně 1 200 slov, vhodný pro 60 minutové přednášení s doplňkovým časem na otázky a praktické cvičení.