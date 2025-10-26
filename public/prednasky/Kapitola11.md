# Prostor stavů: Jak pro umělou inteligenci nakreslit mapu k řešení problému

Představte si, že jste v akčním filmu a musíte zneškodnit bombu. Máte dvě nádoby, jednu na 4 litry a druhou na 3 litry, a žádné další odměrky. K deaktivaci časovače potřebujete odměřit **přesně 2 litry** vody. Jak to uděláte? Zkoušet to náhodně by vedlo k výbuchu. Potřebujete mapu. Mapu všech možných kroků a jejich výsledků.

Vítejte ve světě **stavových prostorů** – elegantního konceptu, který umožňuje AI převést jakýkoliv problém, od hlavolamů po plánování cesty, na přehlednou mapu, ve které pak může najít cestu k cíli. Dnes si takovou mapu nejen nakreslíme, ale i naprogramujeme.

---

## Anatomie problému: Stavy, operátory a cíl

Abychom mohli problém proměnit v mapu, musíme definovat tři klíčové věci. Použijeme k tomu náš problém s nádobami:

1.  **Stav (State):** Je to jednoduchý "snímek" situace v daném okamžiku. V našem případě je stav určen množstvím vody ve dvou nádobách. Můžeme ho zapsat jako dvojici čísel `(voda_v_4l_nádobě, voda_v_3l_nádobě)`.
    - _Počáteční stav:_ Začínáme s prázdnými nádobami, takže náš start je `(0, 0)`.
    - _Cílový stav:_ Chceme odměřit 2 litry. Nezáleží na tom, ve které nádobě. Takže naším cílem je jakýkoliv stav, kde je dvojka, např. `(2, y)` nebo `(x, 2)`.

2.  **Operátory (Operators):** To jsou povolené akce, které nás mohou přesunout z jednoho stavu do druhého. Jsou to pravidla naší hry. Co můžeme s nádobami dělat?
    - **Naplnit:** Naplnit 4l nádobu, naplnit 3l nádobu.
    - **Vylít:** Vylít 4l nádobu, vylít 3l nádobu.
    - **Přélít:** Přélít vodu z 4l do 3l, dokud se 3l nenaplní nebo 4l nevyprázdní.
    - **Přélít:** Přélít vodu z 3l do 4l, dokud se 4l nenaplní nebo 3l nevyprázdní.

3.  **Prostor stavů (State Space):** Toto je celá naše mapa. Je to soubor všech stavů, kterých můžeme z počátečního stavu dosáhnout pomocí našich operátorů. Naší úlohou je v této mapě najít cestu z `(0, 0)` do stavu, kde je `2`.

---

## Praktický projekt: Vizualizace mapy problému s nádobami

Dost bylo teorie. Pojďme si celou mapu (stavový prostor) pro náš problém naprogramovat a vizualizovat pomocí Pythonu a knihovny `networkx`. Uvidíte, jak se z abstraktních pravidel rodí konkrétní řešení.

**Krok 1: Příprava prostředí**

V terminálu si nainstalujeme potřebné knihovny:

```bash
pip install networkx matplotlib
```

**Krok 2: Píšeme kód pro prozkoumání a vizualizaci**

Vytvořte si Python soubor (např. `mapa_problemu.py`) a vložte do něj tento kód. Je okomentovaný, aby bylo jasné, co která část dělá.

```python
import networkx as nx
import matplotlib.pyplot as plt

def solve_water_jug_problem():
    """
    Prozkoumá stavový prostor problému s nádobami a vizualizuje ho.
    """
    # Kapacity nádob
    capacity_x, capacity_y = 4, 3

    # Cílové množství vody
    goal_amount = 2

    # Fronta pro prohledávání do šířky (BFS) a navštívené stavy
    queue = [((0, 0), [])]  # (stav, cesta k němu)
    visited = set()

    # Graf pro vizualizaci
    G = nx.DiGraph()

    solution_path = None

    while queue:
        (current_state, path) = queue.pop(0)
        x, y = current_state

        # Pokud jsme tento stav už navštívili, přeskočíme ho
        if current_state in visited:
            continue

        visited.add(current_state)
        new_path = path + [current_state]

        # Přidáme uzel do grafu
        G.add_node(str(current_state))
        if path:
            G.add_edge(str(path[-1]), str(current_state))

        # Našli jsme řešení?
        if x == goal_amount or y == goal_amount:
            if solution_path is None: # Uložíme jen první nalezené řešení
                solution_path = new_path
                print(f"Řešení nalezeno! Cesta: {solution_path}")

        # Aplikujeme všechny možné operátory
        # 1. Naplnit X
        next_states = [((capacity_x, y), "Naplnit X")]
        # 2. Naplnit Y
        next_states.append(((x, capacity_y), "Naplnit Y"))
        # 3. Vylít X
        next_states.append(((0, y), "Vylít X"))
        # 4. Vylít Y
        next_states.append(((x, 0), "Vylít Y"))
        # 5. Přelít z X do Y
        pour_amount = min(x, capacity_y - y)
        next_states.append(((x - pour_amount, y + pour_amount), "Přelít X->Y"))
        # 6. Přelít z Y do X
        pour_amount = min(y, capacity_x - x)
        next_states.append(((x + pour_amount, y - pour_amount), "Přelít Y->X"))

        for next_s, _ in next_states:
            if next_s not in visited:
                queue.append((next_s, new_path))

    # Vizualizace grafu
    plt.figure(figsize=(14, 10))
    pos = nx.spring_layout(G, seed=42)

    # Obarvení uzlů
    node_colors = []
    for node in G.nodes():
        state = eval(node)
        if state == (0, 0):
            node_colors.append('green') # Start
        elif state[0] == goal_amount or state[1] == goal_amount:
            node_colors.append('red') # Cíl
        else:
            node_colors.append('skyblue')

    # Obarvení cesty k řešení
    edge_colors = ['red' if (str(solution_path[i]), str(solution_path[i+1])) in G.edges() else 'black' for i in range(len(solution_path)-1)]

    nx.draw(G, pos, with_labels=True, node_size=2000, node_color=node_colors, font_size=10, font_weight='bold')

    # Zvýraznění cesty
    path_edges = list(zip(solution_path, solution_path[1:]))
    path_edges_str = [(str(u), str(v)) for u, v in path_edges]
    nx.draw_networkx_edges(G, pos, edgelist=path_edges_str, width=2.5, edge_color='red')

    plt.title("Mapa (stavový prostor) problému s nádobami", size=15)
    plt.show()

# Spuštění
if __name__ == "__main__":
    solve_water_jug_problem()
```

**Krok 3: Spuštění a interpretace výsledků**

Spusťte Python skript. V terminálu se vám vypíše cesta k řešení, například:
`Řešení nalezeno! Cesta: [(0, 0), (0, 3), (3, 0), (3, 3), (4, 2)]`

Zároveň se vám zobrazí graf – kompletní mapa problému!

- **Zelený uzel** je náš start `(0, 0)`.
- **Modré uzly** jsou všechny dosažitelné stavy.
- **Červené uzly** jsou cílové stavy (kde je 2 litry).
- **Červená cesta** ukazuje nejkratší sekvenci kroků k prvnímu nalezenému řešení.

---

## Závěr: Od problému k mapě

Dnes jste udělali obrovský myšlenkový skok. Naučili jste se, jak vzít zdánlivě chaotický problém a strukturovat ho do podoby mapy (grafu), které rozumí počítač. Tento princip – definování stavů, operátorů a cílů – je absolutním základem pro tisíce AI aplikací, od plánování cesty robota ve skladu, přes logistiku a optimalizaci, až po nalezení vítězné strategie v deskových hrách.

**Vaše výzva:** Zkuste si vzít jiný jednoduchý hlavolam (třeba Hanojské věže pro 3 disky nebo problém 8 královen) a jen na papír si načrtnout jeho počáteční stav, cílový stav a možné operátory. Právě jste udělali první krok k tomu, abyste přemýšleli jako architekt umělé inteligence.
