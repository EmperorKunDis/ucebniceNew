# Programování s omezujícími podmínkami: Naučte AI pravidla a nechte ji kouzlit

Všechny problémy, které jsme dosud řešili, měly jedno společné: psali jsme algoritmus, který AI říkal, _jak_ má problém řešit, krok za krokem. Prohledej bludiště do šířky. Spočítej skóre pro každý tah. Dnes si ukážeme úplně jiný, mnohem elegantnější a často i mocnější přístup.

Místo toho, abychom AI dávali detailní instrukce, jí jen **popíšeme, jak vypadá správné řešení**. Definujeme pravidla a omezující podmínky. A pak necháme specializovaný "řešič" (solver), aby našel řešení za nás. Vítejte ve světě **programování s omezujícími podmínkami (Constraint Satisfaction Programming)**. A naším průvodcem bude jeden z nejslavnějších hlavolamů: **problém osmi dam**.

---

## Problém osmi dam: Pravidla hry

Pravidla jsou jednoduchá, ale řešení už tak ne. Úkol zní:

> Umístěte 8 šachových dam na standardní šachovnici 8x8 tak, aby se žádné dvě navzájem neohrožovaly.

To znamená, že žádné dvě dámy nesmí sdílet:

- Stejný **řádek**.
- Stejný **sloupec**.
- Stejnou **diagonálu**.

Zkuste si to na papíře. Rychle zjistíte, že najít byť jen jedno řešení hrubou silou je velmi obtížné. Existuje přes 4 miliardy způsobů, jak umístit 8 dam na 64 polí, ale jen 92 z nich je správných. My si ukážeme, jak je najít všechny během zlomku sekundy.

---

## Myšlení v podmínkách, ne v algoritmech

Klíčem je přeformulovat problém. Místo otázky "Kam mám pohnout dámou?" se ptáme "Jaké podmínky musí splňovat finální rozestavení?".

1.  **Modelování problému:** Můžeme si to zjednodušit. Jelikož v každém sloupci musí být právě jedna dáma, můžeme si vytvořit 8 proměnných, jednu pro každý sloupec. Hodnota každé proměnné pak bude číslo řádku (0-7), kde se dáma v daném sloupci nachází.
    - Např. `q = [0, 4, 7, 5, 2, 6, 1, 3]` znamená, že v prvním sloupci je dáma na řádku 0, ve druhém na řádku 4 atd.

2.  **Definice podmínek (Constraints):**
    - **Podmínka pro řádky:** Všechny dámy musí být v různých řádcích. To znamená, že všechny hodnoty v našem poli `q` musí být unikátní.
    - **Podmínka pro sloupce:** Tuto podmínku jsme vyřešili už samotným modelem! Tím, že máme jednu proměnnou pro každý sloupec, je automaticky zajištěno, že v každém sloupci je jen jedna dáma.
    - **Podmínka pro diagonály:** Toto je nejzajímavější. Dvě dámy `(r1, c1)` a `(r2, c2)` jsou na stejné diagonále, pokud platí `|r1 - r2| == |c1 - c2|`. Tuto podmínku musíme zajistit pro všechny páry dam.

Teď, když máme pravidla, můžeme je předat specializované knihovně, která je expert na řešení přesně takovýchto problémů.

---

## Praktický projekt: Řešení 8 dam s Google OR-Tools

Použijeme knihovnu **OR-Tools** od Googlu, která obsahuje špičkový CP-SAT solver.

**Krok 1: Instalace**

```bash
pip install ortools
```

**Krok 2: Kód pro řešení problému**

Tento skript definuje náš problém pomocí omezujících podmínek a nechá solver, aby našel všechna řešení.

```python
from ortools.sat.python import cp_model

def solve_eight_queens():
    """Řeší problém osmi dam pomocí CP-SAT solveru."""
    # 1. Vytvoření modelu
    model = cp_model.CpModel()

    # Velikost šachovnice
    board_size = 8

    # 2. Definice proměnných
    # queens[c] = r znamená, že ve sloupci 'c' je dáma na řádku 'r'.
    queens = [model.NewIntVar(0, board_size - 1, f'q{i}') for i in range(board_size)]

    # 3. Definice omezujících podmínek
    # Podmínka 1: Všechny dámy musí být v různých řádcích.
    model.AddAllDifferent(queens)

    # Podmínka 2: Žádné dvě dámy nesmí být na stejné diagonále.
    # Použijeme pomocné proměnné pro diagonály.
    diag1 = [queens[i] + i for i in range(board_size)]
    diag2 = [queens[i] - i for i in range(board_size)]
    model.AddAllDifferent(diag1)
    model.AddAllDifferent(diag2)

    # 4. Vytvoření solveru a callbacku pro nalezení všech řešení
    solver = cp_model.CpSolver()

    class QueenSolutionPrinter(cp_model.CpSolverSolutionCallback):
        """Třída pro tisk nalezených řešení."""
        def __init__(self, queens):
            cp_model.CpSolverSolutionCallback.__init__(self)
            self.__queens = queens
            self.__solution_count = 0

        def on_solution_callback(self):
            self.__solution_count += 1
            print(f"Řešení č. {self.__solution_count}:")
            for i in range(len(self.__queens)):
                row = self.Value(self.__queens[i])
                line = ""
                for j in range(len(self.__queens)):
                    if j == row:
                        line += "Q "
                    else:
                        line += ". "
                print(line)
            print()

        def solution_count(self):
            return self.__solution_count

    solution_printer = QueenSolutionPrinter(queens)

    # 5. Spuštění solveru
    print("Hledám všechna řešení problému osmi dam...")
    status = solver.SearchForAllSolutions(model, solution_printer)

    print(f"Status: {solver.StatusName(status)}")
    print(f"Celkem nalezeno řešení: {solution_printer.solution_count()}")

# Spuštění
if __name__ == '__main__':
    solve_eight_queens()
```

**Krok 3: Spuštění a interpretace**

Spusťte skript. Během okamžiku uvidíte, jak solver vypisuje jedno řešení za druhým v podobě textové šachovnice. Na konci vypíše, že našel všech 92 řešení. Sledovat tu rychlost je fascinující – porovnejte to s tím, jak dlouho by vám to trvalo ručně!

---

## Závěr: Síla deklarativního programování

Dnes jste se naučili fundamentálně nový způsob, jak přistupovat k problémům. Místo toho, abyste psali algoritmus, který _hledá_ řešení, jste **deklarovali**, jak má platné řešení vypadat. Tento deklarativní přístup je neuvěřitelně mocný pro celou třídu tzv. **optimalizačních a plánovacích problémů**:

- **Plánování směn:** Jak rozdělit směny v nemocnici tak, aby byli splněny všechny zákonné pauzy, kvalifikace a preference zaměstnanců?
- **Logistika:** Jak naložit kamion, aby se využil maximální prostor a nepřekročila nosnost náprav?
- **Řešení Sudoku:** Stačí definovat pravidla (v každém řádku, sloupci a čtverci musí být čísla 1-9) a solver najde řešení za vás.

**Vaše výzva:** Zkuste v kódu změnit `board_size`. Co se stane pro 4 dámy na 4x4 šachovnici? (Měly by být 2 řešení). A co pro 12 dam na 12x12? Sledujte, jak si s tím solver poradí a jak rychle roste počet řešení. Vítejte ve světě kombinatorické exploze a chytrých nástrojů, které ji umí zkrotit.
