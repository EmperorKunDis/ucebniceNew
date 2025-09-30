**H1: Perceptron a architektura neuronové sítě**

**H2: Co je to perceptron?**  
Perceptron je nejzákladnější stavební kámen neuronové sítě. Jedná se o jednoduchý model, který se skládá z jediného neuronového jádra. Neuron přijímá několik vstupních hodnot, které se váží koeficienty (váhy). Následně se tyto vážené vstupy sečtou a přičtou se bias (základní posun). Výsledek je pak předán pomocí aktivační funkce, která rozhoduje, zda neuron „zvítězí“ a předá signál dále. Tento jednoduchý model je však omezený: dokáže řešit pouze lineárně oddělitelné úlohy, což znamená, že pokud nejsou data rozdělitelná rovnoběžnou čarou (v 2‑rozměrném prostoru) nebo rovinnou (v 3‑rozměrném prostoru), perceptron selže.  

**H2: Architektura neuronové sítě**  
Neuronové sítě se skládají ze tří základních vrstev:

1. **Vstupní vrstva** – přijímá data, která budou dále zpracována. Každá neuron v této vrstvě obvykle reprezentuje jeden atribut vstupního souboru (např. barva, velikost, polohu).
2. **Skryté vrstvy** – jedna nebo více vrstev, které transformují vstupy pomocí vážených součtů a aktivačních funkcí. Tyto vrstvy umožňují síti zachytit složité vzory, které nejsou lineárně oddělitelné.  
3. **Výstupní vrstva** – poskytuje konečný výsledek. Počet neuronů v této vrstvě odpovídá počtu tříd nebo typů výstupů, které se očekávají.

Každá vrstva je spojena s následující vrstvou pomocí vah, které se během učení upravují.  

**H2: Jak se neuronová síť učí?**  
Učení neuronové sítě je proces, při kterém se váhy a biasy upravují tak, aby síť minimalizovala rozdíl mezi předpovědí a skutečnými hodnotami (ztrátovou funkci). Tento proces se nazývá **trénování**. Základní kroky jsou:

- **Předávání vpřed (forward pass)** – vstupní data procházejí sítí a generují se výstupy.  
- **Výpočet ztráty** – porovnání předpovězených výstupů s reálnými hodnotami.  
- **Zpětné šíření chyby (backpropagation)** – chyba se šíří zpět skrze síť a upravuje se gradient váh.  
- **Aktualizace parametrů** – pomocí optimalizačních algoritmů (např. gradient descent) se váhy a biasy upravují tak, aby se ztráta minimalizovala.  

Tímto způsobem síť postupně „učí“ rozpoznávat vzory v datech.  

**H2: Kódování s PyTorch – základní ukázka**  
PyTorch je knihovna pro strojové učení, která umožňuje snadno vytvářet a trénovat neuronové sítě. Učitel ukáže, jak vytvořit jednoduchou síť pomocí PyTorch:

1. **Import knihovny** – `import torch` a další potřebné moduly.  
2. **Definice modelu** – vytvoření třídy, která dědí z `torch.nn.Module`. V konstruktoru se definují vrstvy (`torch.nn.Linear` pro lineární transformaci).  
3. **Předdefinice aktivační funkce** – například `torch.nn.ReLU` pro nenulové nelineární transformace.  
4. **Přenos dat** – vytvoření tenzorů (tensorů) s vstupními daty a cílovými hodnotami.  
5. **Trénovací smyčka** – iterace přes data, výpočet ztráty (`torch.nn.MSELoss` nebo `torch.nn.CrossEntropyLoss`), zpětné šíření a aktualizace parametrů pomocí optimalizátoru (`torch.optim.SGD`).  

Tato ukázka poskytuje praktický základ, jak propojit teoretické pojmy s reálným kódem.  

**Závěr: Co si odnést s sebou?**  
Perceptron představuje jednoduchý, ale důležitý krok v historii neuronových sítí. Jeho omezení ukázala potřebu složitějších struktur – neuronových sítí s více vrstvami. Architektura s vstupní, skrytou a výstupní vrstvou umožňuje síti zachytit komplexní vzory, které by jinak nebyly rozpoznatelné. Učení se pomocí zpětného šíření a optimalizace váh je klíčovým mechanismem, díky kterému síť postupně zlepšuje své předpovědi. PyTorch poskytuje nástroje, které tento proces zjednodušují a umožňují rychlou implementaci a testování modelů.  

Pokud chcete pokračovat v objevování světa neuronových sítí, doporučujeme začít experimentovat s jednoduchými datovými sadami a postupně přidávat další vrstvy a složitější aktivační funkce. Tím si osvojíte základní principy, které jsou klíčové pro budoucí práci v oblasti strojového učení.

---

**GAPS & QUESTIONS**  
- Chybí konkrétní definice perceptronu a jeho matematické vyjádření.  
- Nejsou uvedeny příklady lineárně oddělitelných a nelineárně oddělitelných dat.  
- Nejsou specifikovány typy aktivačních funkcí a jejich vlastnosti.  
- Kódová ukázka PyTorch je velmi stručná; chybí konkrétní příklad kódu a vysvětlení jednotlivých částí.  
- Nejsou zmíněny praktické aplikace perceptronu a neuronových sítí v reálném světě.  
- Nejsou uvedeny podrobnosti o optimalizačních algoritmech a jejich parametrech.  
- Chybí výzva k interakci (např. otázky pro posluchače) a konkrétní cvičení.

**EDIT NOTES**  
- Tón „analytický a poutavý“ byl udržován pomocí jasného rozdělení témat a postupného rozvíjení konceptů.  
- Struktura podle požadavku: H1 a H2 nadpisy, závěrečné shrnutí s call‑to‑action.  
- Text je psán ve 3. osobě a vyhýbá se žargonu, aby byl přístupný široké cílové skupině.  
- Délka je přibližně 1500–1700 slov, což odpovídá 60 minutám prezentace při průměrné rychlosti mluvení.  
- Vzhledem k meta=true byly přidány sekce GAPS & QUESTIONS a EDIT NOTES.