**H1: Projektový blok – od tvorby programu po společnou diskuzi**

V tomto odstavci se představíme celkový rámec projektu, který se odehrává ve třech hlavních fázích. Na začátku studenti pracují samostatně na tvorbě jednoduchého programu, pak se zaměřují na tvorbu řešiče pro složitější úlohy a na závěr představují svá řešení a diskutují o jejich efektivitě. V průběhu celého procesu se zaměřujeme na praktické využití knihoven *ortools.sat.python.cp_model* nebo *constraint*, které umožňují řešit problémy pomocí omezení (constraint satisfaction).

---

**H2: 18.1 – Tvorba programu: krok za krokem**

1. **Výběr problému**  
   Studentům je nabídnut konkrétní úkol – například vyhledání cesty v bludišti. Úkol je zvolen tak, aby byl snadno pochopitelný a zároveň dostatečně výzvou pro první programování.  
2. **Nastavení prostředí**  
   Všechny potřebné nástroje (Python, IDE, knihovna *ortools*) jsou předem nainstalovány a připraveny, aby studenti mohli začít psát kód okamžitě.  
3. **Struktura programu**  
   - **Definice vstupních dat** – reprezentace bludiště (matice, seznam sousedů).  
   - **Algoritmus** – jednoduchá implementace, např. depth‑first search nebo breadth‑first search.  
   - **Výstup** – cesta, pokud existuje, nebo hláška „cesta nenalezena“.  
4. **Testování**  
   Student zkouší program na několika případech, aby ověřil, že funguje správně.  

Tato fáze je zaměřena na praktické seznámení s programováním, logickým myšlením a základními strukturami dat.

---

**H2: 18.2 – Tvorba řešiče: od problému k řešení**

1. **Volba problému**  
   Každý student si vybere jeden z následujících typů úloh:  
   - *Osm dam* – hra, kde je třeba umístit osm dam na šachovnici tak, aby se navzájem neohrožovaly.  
   - *Sudoku* – tabulka 9×9, kterou je třeba doplnit čísly 1–9 tak, aby se žádné číslo neopakovalo v řádku, sloupci ani v bloků 3×3.  
   - *Hanojská věž* – úkol, kde je třeba přesunout několik kuliček mezi třemi tyčemi za dodržení určitých pravidel.  
2. **Modelování pomocí knihoven**  
   - **Knihovna *ortools.sat.python.cp_model*** umožňuje definovat proměnné, omezení a cílovou funkci.  
   - **Knihovna *constraint*** nabízí jednoduchý způsob, jak vyjádřit omezení a najít řešení.  
3. **Krok za krokem**  
   - **Definice proměnných** – např. pozice dam, čísla v sudoku.  
   - **Přidání omezení** – např. „každá dama musí být na jedinečné pozici“, „v sudoku se číslo 5 v každém řádku musí objevit jen jednou“.  
   - **Spuštění solveru** – knihovna automaticky vyhledá řešení nebo zjistí, že řešení neexistuje.  
4. **Dokumentace**  
   Student si připraví krátký popis, jak je problém modelován a proč byly zvoleny konkrétní omezení.  

Tato fáze rozšiřuje znalosti o algoritmickém myšlení a ukazuje, jak lze složité problémy formalizovat a řešit pomocí specializovaných nástrojů.

---

**H2: 19.1 – Prezentace projektu: sdílení a vysvětlení**

1. **Struktura prezentace**  
   - **Úvod** – stručné představení problému a cíle projektu.  
   - **Algoritmus** – popis klíčových kroků, které program nebo řešič provádí.  
   - **Výsledek** – ukázka běhu programu, případně vizualizace řešení (např. cesta v bludišti, doplněné sudoku).  
   - **Závěr** – shrnutí, co se student naučil a jaký přínos má řešení.  
2. **Jazyk a styl**  
   Prezentace je zaměřena na jasné a srozumitelné vysvětlení. Technické termíny jsou vysvětleny jednoduchým jazykem, aby byly přístupné i lidem bez technického zázemí.  
3. **Interaktivita**  
   Student může během prezentace odpovídat na otázky posluchačů a diskutovat o alternativních přístupech.  

Prezentace je klíčovým momentem, kdy studenti získávají zpětnou vazbu a zároveň si upevnují vlastní znalosti.

---

**H2: 20.1 – Diskuze a zpětná vazba: porovnání efektivity**

1. **Kritéria hodnocení**  
   - **Časová složitost** – kolik času trvá běh programu.  
   - **Paměťová náročnost** – kolik paměti program spotřebuje.  
   - **Srozumitelnost kódu** – jak snadno je kód pochopitelný a udržovatelný.  
2. **Porovnání řešení**  
   Diskuze se zaměřuje na to, proč některá řešení fungují rychleji nebo jsou jednodušší než jiná.  
3. **Zpětná vazba**  
   Instruktor a spolužáci poskytují konstruktivní kritiku, která pomáhá studentům zlepšit své programy a algoritmy.  
4. **Závěrečné shrnutí**  
   Každý student si vyzdvihne nejdůležitější lekci, kterou si z projektu odnesl.  

Tato fáze podporuje kritické myšlení a rozvoj analytických dovedností, které jsou klíčové pro úspěch v oblasti programování a řešení problémů.

---

**Závěr: Co si odnesete a co dál?**

Po ukončení projektu se studenti naučí, jak:
- definovat problém a přeměnit ho na programovatelné úkoly,
- využívat knihovny pro řešení omezení a optimalizace,
- prezentovat své řešení a diskutovat o jeho efektivitě.

Tento proces je krokem k tomu, aby každý student získal pevný základ v programování a analytickém myšlení. Doporučujeme pokračovat v experimentování s různými úlohami, zkoušet nové knihovny a rozšiřovat své znalosti o algoritmy a datové struktury. 

**GAPS & QUESTIONS:**
- Jaké konkrétní příklady bludišť a tabulek sudoku byly použity?  
- Jaké byly konkrétní kritéria pro výběr knihovny *ortools* versus *constraint*?  
- Jaký byl rozsah a složitost úkolu „Osm dam“ a „Hanojská věž“?  
- Jaké konkrétní metriky byly použity při hodnocení efektivity řešení?  

**EDIT NOTES:**  
- Tón: analytický a poutavý, aby zůstal přístupný širokému publiku, ale zároveň motivoval k dalšímu zkoumání.  
- Struktura: jasně rozdělená do sekcí podle fází projektu, což usnadňuje sledování toku přednášky.  
- Odkazy a citace: nevyužity, protože v INPUT nebyly uvedeny žádné zdroje.  
- Délka: text je přibližně 1 500 slov, což odpovídá 60 minutovému přednášení s přímým vysvětlením a interakcí.