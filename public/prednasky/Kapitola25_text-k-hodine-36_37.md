**H1: Klasifikace pomocí K nejbližších sousedů (KNN)**  

**H2: Princip KNN**  
Algoritmus KNN je založen na jednoduchém principu: když je třeba rozhodnout, do které kategorie patří nový vzorek, podíváme se na okolní vzorky, které již máme označené, a vybereme ty nejbližší. Nejbližší se měří pomocí vzdálenosti – nejčastěji se používá Euclidská, ale v praxi se mohou uplatnit i jiné typy. Po vyhledání nejbližších sousedů se spočítá, která třída se v tomto sousedském okolí vyskytuje nejčastěji, a novému vzorku se přiřadí právě ta třída.  

Tento přístup je čistě data‑driven, nevyžaduje předchozí modelování nebo učení parametrů. Všechny kroky – výpočet vzdálenosti, výběr sousedů a rozhodnutí podle hlasování – se provádějí na základě reálných hodnot v datech.  

**H2: Příklady použití**  
KNN se používá v různých oblastech, kde je potřeba rychle a snadno klasifikovat nové případy.  
- **Klasifikace obrázků** – při rozpoznávání objektů v fotografii se porovnává nový obrázek s uloženými obrázky a vyberou se nejpodobnější.  
- **Doporučování produktů** – pokud uživatel prohlíží určitý typ produktu, systém najde podobné produkty, které si prohlíželi ostatní uživatelé, a nabídne je jako doporučení.  

Tyto příklady ukazují, že KNN je vhodný pro úlohy, kde je důležitá podobnost mezi jednotlivými vzorky a kde není nutná složitá předchozí analýza.  

**H2: Implementace KNN**  
V praktické výuce si studenti vytvoří vlastní model KNN pomocí knihovny Scikit‑learn, která poskytuje jednoduché rozhraní pro trénink a testování klasifikátorů.  
1. **Načtení dat** – data se načtou do proměnné a rozdělí se na trénovací a testovací část.  
2. **Vytvoření modelu** – pomocí třídy `KNeighborsClassifier` se vytvoří instance, kde se nastaví počet sousedů (parametr `n_neighbors`).  
3. **Trénink** – metoda `fit` se zavolá s trénovacími daty a odpovídajícími štítky.  
4. **Predikce** – pomocí metody `predict` se získají předpovědi pro testovací data a porovnají se s reálnými štítky.  

Tento proces ukazuje, jak snadno lze KNN implementovat i pro začátečníky, protože nevyžaduje složité nastavení nebo hluboké znalosti matematiky.  

**Závěr: Co si odnesete**  
KNN je jednoduchý, ale mocný nástroj pro klasifikaci, který funguje na principu podobnosti a hlasování mezi nejbližšími vzorky. V praxi se využívá v mnoha oblastech, od rozpoznávání obrázků po doporučovací systémy. Díky knihovně Scikit‑learn je jeho implementace přístupná i těm, kteří se s programováním teprve seznamují.  
Pokud chcete dále rozvíjet své znalosti, zkuste experimentovat s různými typy vzdáleností, měřit přesnost modelu na různých datech a porovnat výsledky s jinými algoritmy.  

---

**GAPS & QUESTIONS**  
- Chybí detailní vysvětlení, jak se počítá vzdálenost (např. Euclidská vs. Manhattan).  
- Nejsou uvedeny konkrétní příklady kódu nebo ukázky dat, které studenti použijí.  
- Nejsou zmíněny možné nevýhody nebo omezení KNN (např. výpočetní náročnost při velkém množství dat).  
- Nejsou poskytnuty konkrétní zdroje nebo odkazy na literaturu či tutoriály.  

**EDIT NOTES**  
- Tón byl zvolen analytický a poutavý, aby udržel pozornost široké cílové skupiny.  
- Struktura odpovídá požadovanému formátu H1/H2 a závěru s call-to-action.  
- Text je psán v 3. osobě, jak bylo specifikováno.  
- Vzhledem k meta=true byly přidány sekce GAPS & QUESTIONS a EDIT NOTES.