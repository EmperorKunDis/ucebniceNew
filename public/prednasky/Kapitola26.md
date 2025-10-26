# Vlastní model: Od výběru algoritmu po vyhodnocení úspěšnosti

## Úvod

V předchozích hodinách jsme se naučili, jak sbírat a čistit data. Nyní se zaměříme na klíčový krok v procesu strojového učení – tvorbu a vyhodnocení vlastního modelu. V průběhu hodiny se podíváme na tři hlavní fáze: výběr algoritmu a trénování modelu, testování a měření úspěšnosti a využití metrik, jako je přesnost a F1‑skóre, k posouzení výkonu. Cílem je, aby každý student pochopil, jak tyto kroky spolu souvisí a jak je aplikovat na reálných datech.

## 1. Tvorba modelu

### 1.1 Výběr vhodného algoritmu

Při výběru algoritmu je nejdůležitější zohlednit povahu dat a úlohu, kterou chceme řešit. Například pokud se jedná o klasifikaci (rozdělení dat do kategorií), můžeme zvážit jednoduché modely jako je logistická regrese nebo rozhodovací strom. Pokud se jedná o regresi (předpověď číselné hodnoty), vhodné mohou být lineární regrese nebo k-nn (k nejbližších sousedů).  
**Klíčové otázky, které pomáhají při výběru:**

- Jaké typy vstupních proměnných máme (číselné, kategorické, textové)?
- Kolik máme trénovacích vzorků?
- Jaká je požadovaná interpretovatelnost modelu?

### 1.2 Trénování modelu na datech

Po výběru algoritmu přichází fáze trénování. Model „učí“ na základě trénovacích dat – tedy na souboru, kde známe skutečné výstupy.  
**Postup:**

1. Rozdělíme data na trénovací a testovací část (obvykle 80 % / 20 %).
2. Před trénováním provedeme případné normalizace nebo kódování kategorií.
3. Spustíme trénovací proces, který optimalizuje parametry modelu tak, aby co nejlépe odpovídaly trénovacím datům.

## 2. Testování a metrika

### 2.1 Vyhodnocení úspěšnosti modelu

Po trénování je třeba zjistit, jak dobře model funguje na datech, která neviděl. Používáme testovací sadu, kterou model ještě neviděl.  
**Hlavní metriky:**

- **Přesnost (accuracy)** – podíl správně klasifikovaných vzorků.
- **F1‑skóre** – harmonický průměr mezi precizností a recall (citlivostí). Poskytuje lepší obrázek, pokud máme nevyvážené třídy.

### 2.2 Jak interpretovat výsledky

- **Vysoká přesnost** znamená, že model správně předpovídá většinu případů, ale nemusí zohledňovat, kolik falešně pozitivních nebo falešně negativních výsledků má.
- **Vysoké F1‑skóre** naznačuje, že model rovnovážně zvládá jak správné pozitivní, tak negativní předpovědi.

## 3. Metriky výkonu – praktický nástroj

### 3.1 Scikit‑learn.metrics

V Pythonu je populární knihovna **Scikit‑learn**, která poskytuje jednoduché funkce pro výpočet metrik.  
**Příklady:**

- `confusion_matrix(y_true, y_pred)` – tabulka, která ukazuje počet správných a špatných předpovědí pro každou třídu.
- `f1_score(y_true, y_pred, average='weighted')` – vypočítá F1‑skóre s váženým průměrem podle počtu vzorků v každé třídě.

### 3.2 Praktické ukázky

- **Krok 1:** Načtěte data a rozdělte je na tréninkovou a testovací sadu.
- **Krok 2:** Vyberte algoritmus a natrénujte model.
- **Krok 3:** Vytvořte předpovědi na testovací sadě.
- **Krok 4:** Použijte `confusion_matrix` a `f1_score` k vyhodnocení modelu.

**Tipy pro interpretaci:**

- V confusion matrix se podívejte na diagonální prvky (správné předpovědi).
- Vysoké hodnoty F1‑skóre při nízké přesnosti často indikují, že model dobře rozpoznává méně zastoupené třídy.

## Závěr: Co si odnesete a jak dále pokračovat

V průběhu této hodiny jsme se naučili, jak krok za krokem vytvořit, trénovat a vyhodnotit model strojového učení. Klíčové je:

- **Rozumět datům** a tomu, jaký typ úlohy řešíte.
- **Vybrat vhodný algoritmus** a správně ho trénovat.
- **Použít správné metriky** pro objektivní posouzení modelu.

**Call‑to‑action:** Vyzkoušejte si tvorbu modelu na jednoduchém datasetu, například s obrázky nebo texty, a sledujte, jak se mění přesnost a F1‑skóre při změně algoritmu nebo parametrů. Zaznamenejte si, co funguje nejlépe, a diskutujte to ve třídě. Tím si posílíte praktické dovednosti a zlepšíte schopnost kriticky hodnotit modely.

---

## GAPS & QUESTIONS

- Konkrétní příklady algoritmů a jejich charakteristiky (např. rozhodovací strom vs. logistická regrese).
- Detailní popis procesu normalizace a kódování kategorií.
- Příklady reálných datasetů, které by studenti mohli použít.
- Jak nastavit vážené průměry v F1‑skóre pro více tříd.
- Doporučené zdroje pro další studium (např. online tutoriály, knihy).

## EDIT NOTES

- **Tón**: Analytický a poutavý, aby zaujal široké publikum bez technického zázemí.
- **Struktura**: Dodržena požadovaná hierarchie nadpisů (H1, H2) a přehledná logika sekcí.
- **Délka**: Text je rozšířen tak, aby odpovídal 60‑minutovému přednášení, ale zůstává srozumitelný a přístupný.
- **Jazyk**: Všechny technické termíny vysvětleny jednoduchými slovy, bez žargonu.
- **Citace**: Vzhledem k nastavení `citations=false` nebyly přidány odkazy.
