# Regrese: Jak se naučit předpovídat budoucnost z minulosti

Představte si, že jste učitel a na konci roku se snažíte odhadnout, jakou známku dostane student, který se na závěrečnou zkoušku učil 10 hodin. Máte k dispozici data od ostatních studentů: víte, kdo se kolik hodin učil a jakou známku nakonec dostal. Dokážete v těchto datech najít nějaký trend? A na jeho základě předpovědět výsledek pro nového studenta?

Přesně to je úkolem **regrese** – jedné z nejzákladnějších a nejužitečnějších technik strojového učení. Jejím cílem je najít matematický vztah mezi proměnnými a na jeho základě předpovídat budoucí spojité hodnoty (jako jsou známky, ceny, teploty...). Dnes se naučíme, jak "proložit přímku" daty a vytvořit si vlastní křišťálovou kouli na predikci výsledků.

---

## Lineární regrese: Hledání nejpřímější cesty

Nejjednodušším typem regrese je **lineární regrese**. Ta předpokládá, že vztah mezi našimi proměnnými je přímý – lineární. Čím více se student učí, tím lepší známku dostane. Čím větší je dům, tím je dražší. Hledáme tedy rovnici přímky:

**`y = β₁x + β₀`**

- `y` je hodnota, kterou chceme předpovědět (např. známka).
- `x` je hodnota, kterou známe (např. hodiny studia).
- `β₁` je **směrnice** přímky. Říká nám, o kolik se v průměru změní `y`, když se `x` změní o jednu jednotku. (Např. "každá hodina studia navíc zlepší známku o 5 bodů").
- `β₀` je **průsečík**. Říká nám, jakou hodnotu by mělo `y`, kdyby `x` bylo nula. (Např. "student, který se neučil vůbec, dostane 15 bodů").

**Jak model najde tu správnou přímku?**
Představte si, že každý váš datový bod (student) je spojen s hledanou přímkou nataženou gumičkou. Cílem lineární regrese je najít takovou přímku, která má nejmenší celkové "napětí" ve všech gumičkách dohromady. Matematicky se tomu říká **metoda nejmenších čtverců**.

---

## Praktický projekt: Předpověď studijních výsledků

Pojďme si postavit kompletní regresní model v Pythonu. Naším cílem bude předpovědět známku studenta na základě počtu hodin, které věnoval studiu.

**Krok 1: Příprava prostředí a dat**

```bash
pip install numpy scikit-learn matplotlib
```

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score

# 1. Naše data: hodiny studia a získaná známka (v bodech)
hodiny_studia = np.array([2.5, 5.1, 3.2, 8.5, 6.5, 9.2, 5.5, 8.3, 2.7, 7.7, 5.9, 6.1, 4.5, 3.3, 1.1, 8.9, 2.5, 1.9, 6.1, 7.4]).reshape(-1, 1)
ziskana_znamka = np.array([21, 47, 27, 75, 62, 88, 60, 81, 25, 85, 62, 67, 41, 30, 17, 95, 30, 24, 67, 69])

# Vizualizujme si data, abychom viděli trend
plt.figure(figsize=(8, 6))
plt.scatter(hodiny_studia, ziskana_znamka, color='blue', label='Skutečná data')
plt.title('Vztah mezi hodinami studia a známkou')
plt.xlabel('Hodiny studia')
plt.ylabel('Získaná známka (body)')
plt.grid(True)
plt.show()
```

_Už z prvního pohledu na graf vidíme, že mezi proměnnými existuje jasný lineární vztah._

**Krok 2: Trénink modelu a interpretace výsledků**

Nyní necháme Scikit-learn, aby našel tu nejlepší možnou přímku.

```python
# 2. Vytvoření a trénink modelu
model = LinearRegression()
model.fit(hodiny_studia, ziskana_znamka)
print("Model lineární regrese byl natrénován.")

# Podívejme se, co se model naučil
smernice = model.coef_[0]
prusecik = model.intercept_
print(f"Rovnice přímky: známka = {směrnice:.2f} * hodiny_studia + {prusecik:.2f}")
print(f"Interpretace: Každá hodina studia navíc zlepší známku v průměru o {směrnice:.2f} bodu.")
```

**Krok 3: Predikce a vizualizace modelu**

Model je natrénovaný. Pojďme ho použít k predikci a podívejme se, jak jeho přímka vypadá.

```python
# 3. Predikce pro nového studenta
hodiny_novy_student = np.array([[10.0]]) # Student se učil 10 hodin
predikovana_znamka = model.predict(hodiny_novy_student)
print(f"\nOdhadovaná známka pro studenta, který se učil 10 hodin: {predikovana_znamka[0]:.2f} bodů")

# 4. Vizualizace modelu
plt.figure(figsize=(8, 6))
plt.scatter(hodiny_studia, ziskana_znamka, color='blue', label='Skutečná data')
plt.plot(hodiny_studia, model.predict(hodiny_studia), color='red', linewidth=2, label='Regresní přímka')
plt.scatter(hodiny_novy_student, predikovana_znamka, color='green', s=100, label='Nová predikce', zorder=5)
plt.title('Lineární regrese: Predikce studijních výsledků')
plt.xlabel('Hodiny studia')
plt.ylabel('Získaná známka (body)')
plt.legend()
plt.grid(True)
plt.show()
```

**Krok 4: Vyhodnocení kvality modelu**

Jak dobrý náš model vlastně je? K tomu slouží metriky. Dvě nejdůležitější jsou:

- **Mean Squared Error (MSE):** Průměrná čtvercová chyba. Říká nám, jak moc se model v průměru "plete". Čím nižší, tím lepší.
- **R-squared (R²):** Koeficient determinace. Říká, kolik procent variability v datech dokáže náš model vysvětlit. Hodnota se pohybuje od 0 do 1. Čím blíže k 1 (nebo 100 %), tím lépe model data vystihuje.

```python
# 5. Vyhodnocení modelu
# Použijeme model k predikci na datech, na kterých se učil, abychom viděli, jak dobře je vystihuje
predikce_na_trenovacich_datech = model.predict(hodiny_studia)
mse = mean_squared_error(ziskana_znamka, predikce_na_trenovacich_datech)
r2 = r2_score(ziskana_znamka, predikce_na_trenovacich_datech)

print(f"\n--- Vyhodnocení modelu ---")
print(f"Průměrná čtvercová chyba (MSE): {mse:.2f}")
print(f"Koeficient determinace (R-squared): {r2:.2f} (model vysvětluje {r2*100:.2f}% rozptylu dat)")
```

---

## Závěr: Od dat k predikci

Gratuluji! Právě jste si postavili svůj první regresní model. Prošli jste celým procesem:

1.  Našli jste a vizualizovali jste vztah v datech.
2.  Natrénovali jste model, který se tento vztah naučil.
3.  Použili jste model k predikci nové, neznámé hodnoty.
4.  Změřili jste, jak dobrý váš model je.

Lineární regrese je základním, ale neuvěřitelně mocným nástrojem pro analýzu v ekonomii (predikce HDP), vědě (vztah mezi dávkou léku a reakcí pacienta) i byznysu (odhad prodejů na základě výdajů na marketing).

**Vaše výzva:** Zkuste do našich dat přidat dalšího studenta. Co když někdo studoval 15 hodin a dostal skvělou známku (např. 100 bodů)? Přidejte tento bod do polí `hodiny_studia` a `ziskana_znamka`, přetrénujte model a sledujte, jak se změní jeho přímka a R² skóre.
