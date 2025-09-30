# Regrese – základní přehled a praktický návod

## Co je to regrese?

Regrese je statistická metoda, která se používá k předpovídání spojitých hodnot – tedy takových, které mohou nabývat libovolného reálného čísla. Typickými příklady jsou cena domu, teplota, výška nebo jakákoli jiná veličina, kterou lze měřit na číselné škále. Cílem regresního modelu je najít vztah mezi jednou nebo více vstupními proměnnými (tzv. prediktory) a cílovou proměnnou, kterou chceme předpovědět.

## Lineární regrese – princip a využití

Lineární regrese je nejjednodušší a nejčastěji používaná forma regresního modelu. Představuje předpoklad, že vztah mezi vstupními proměnnými a cílovou proměnnou lze popsat lineární rovnicí – tedy rovnicí, která vypadá jako přímka. Model se obvykle zapisuje ve tvaru:

\( y = \beta_0 + \beta_1 x_1 + \beta_2 x_2 + \dots + \beta_n x_n + \varepsilon \)

kde \(y\) je cílová proměnná, \(x_1, x_2, \dots, x_n\) jsou prediktory, \(\beta_0, \beta_1, \dots, \beta_n\) jsou koeficienty, které se při trénování modelu odhadují, a \(\varepsilon\) je chybný termín. Cílem je najít takové koeficienty, které minimalizují rozdíl mezi skutečnými hodnotami a hodnotami předpovězenými modelem – typicky se používá metoda nejmenších čtverců.

Lineární regrese se využívá v mnoha oblastech: od ekonomie a financí přes biomedicínské výzkumy až po predikci počasí. Její výhodou je jednoduchost interpretace – každý koeficient říká, o kolik se očekává změna cílové proměnné při jednotkové změně příslušného prediktoru, pokud ostatní prediktory zůstávají konstantní.

## Praktická ukázka: tvorba jednoduchého regresního modelu

V praktické části se studenti naučí vytvořit a natrénovat lineární regresní model pomocí knihovny **Scikit‑learn** a vizualizovat výsledky s pomocí **Matplotlib**. Proces se skládá z několika kroků:

1. **Příprava dat** – studenti si vyberou dataset, který obsahuje cílovou proměnnou i jeden nebo více prediktorů. Data se rozdělí na trénovací a testovací podmnožiny, aby bylo možné ověřit, jak dobře model generalizuje na nová data.

2. **Vytvoření modelu** – pomocí třídy `LinearRegression` z Scikit‑learnu se vytvoří objekt modelu. Tento objekt obsahuje metody `fit` (pro trénink) a `predict` (pro předpověď).

3. **Trénink modelu** – voláním `model.fit(X_train, y_train)` se model naučí koeficienty, které nejlépe popisují vztah mezi vstupy a výstupem v trénovacích datech.

4. **Vyhodnocení modelu** – po tréninku se pomocí `model.predict(X_test)` získají předpovězené hodnoty pro testovací data. Tyto hodnoty se porovnají s reálnými hodnotami a vypočítají se základní metriky, např. průměrná čtvercová chyba (MSE) nebo koeficient determinace \(R^2\).

5. **Vizualizace** – pomocí Matplotlibu se vytvoří graf, který zobrazí původní data (např. body na souřadnicové rovině) a přímku, kterou model nejlépe aproximuje. Tím studenti vizuálně ověří, jak dobře model zachycuje trend v datech.

Tato ukázka je záměrně jednoduchá, aby se studenti mohli soustředit na pochopení základních principů – jak se model vytváří, trénuje a vyhodnocuje, a jak se výsledky prezentují.

## Závěr

Regrese, a zejména lineární regrese, je klíčovým nástrojem pro předpovídání spojitých hodnot. Její jednoduchost a interpretovatelnost ji činí vhodnou pro širokou škálu aplikací, od ekonomických analýz až po predikce v oblasti zdraví. Praktická ukázka s využitím Scikit‑learn a Matplotlib ukazuje, jak se tyto koncepty přenášejí do reálného kódu a vizuálního zobrazení.

**Poznámka pro studenty:** Po absolvování této části si vyzkoušejte vytvořit vlastní regresní model s jinými daty – například s daty o počasí nebo o cenách akcií. Zaměřte se na to, jak změna vstupních proměnných ovlivní výsledky a jaký je dopad na kvalitu předpovědi. Experimentujte s různými metrikami a vizualizacemi, abyste lépe porozuměli tomu, co regrese skutečně říká o vašich datech.

---

## GAPS & QUESTIONS
- Konkrétní kód nebo příklady datasetů nejsou v podkladech uvedeny, takže není možné poskytnout konkrétní ukázky implementace.
- Nejsou uvedeny metriky pro vyhodnocení modelu (např. MSE, R²), takže je nutné se na tyto informace spolehnout z externích zdrojů.
- V textu nejsou zmíněny další typy regresních modelů (např. polynomická regrese), takže se zaměřujeme pouze na lineární variantu.