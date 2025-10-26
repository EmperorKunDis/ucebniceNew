# Vizualizace dat: Proměňte nudná čísla v poutavé příběhy

Představte si, že data v tabulce jsou jako notový zápis. Pro zkušeného hudebníka jsou čitelná, ale pro většinu z nás je to jen změť teček a čar. Vizualizace je jako když hudebník vezme noty a zahraje je na klavír. Najednou slyšíme melodii, vnímáme harmonii a rytmus. Data ožijí.

Dnes se naučíme být dirigenty našeho datového orchestru. Pomocí knihoven **Matplotlib** a **Seaborn** v Pythonu rozehrajeme koncert vhledů a porozumění. Ukážeme si, jak odhalit skryté vzory, ověřit předpoklady a prezentovat výsledky tak, aby jim každý rozuměl.

---

## Náš orchestr: Dataset o spropitném v restauraci

Abychom si vše ukázali v praxi, budeme pracovat s jedním jednoduchým a zábavným datasetem. Knihovna Seaborn obsahuje data o spropitném, které zákazníci nechali v restauraci. Naším cílem bude tato data vizuálně prozkoumat a zjistit, co ovlivňuje výši spropitného.

**Krok 1: Příprava prostředí a načtení dat**

```bash
pip install pandas matplotlib seaborn scikit-learn
```

```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Seaborn má v sobě zabudovaných několik datasetů, 'tips' je jedním z nich.
tips_df = sns.load_dataset('tips')

print("---" Prvních 5 řádků našich dat ---")
print(tips_df.head())

print("\n---" Základní informace o datech ---")
tips_df.info()
```

**První pohled:** Máme zde informace o celkové útratě (`total_bill`), spropitném (`tip`), pohlaví platícího (`sex`), zda byl kuřák (`smoker`), den v týdnu (`day`), čas (`time`) a velikost skupiny (`size`).

---

## Praktický workshop: Galerie základních grafů

Pojďme si postupně vytvořit několik klíčových grafů a u každého si řekneme, co nám prozradil.

**1. Histogram: Jaké jsou nejčastější útraty?**
Histogram nám ukazuje rozložení jedné číselné proměnné.

```python
plt.figure(figsize=(8, 6))
sns.histplot(data=tips_df, x='total_bill', bins=20, kde=True)
plt.title('Rozložení celkové útraty (Histogram)')
plt.xlabel('Celková útrata ($)')
plt.ylabel('Počet účtů')
plt.show()
```

**Co jsme se dozvěděli?** Většina útrat se pohybuje mezi 10 a 20 dolary. Vyšší útraty jsou méně časté. Křivka `kde` nám ukazuje vyhlazený odhad tohoto rozložení.

**2. Scatter Plot: Existuje vztah mezi útratou a spropitným?**
Scatter plot (bodový graf) je ideální pro zobrazení vztahu mezi dvěma číselnými proměnnými.

```python
plt.figure(figsize=(8, 6))
sns.scatterplot(data=tips_df, x='total_bill', y='tip')
plt.title('Vztah mezi celkovou útratou a spropitným')
plt.xlabel('Celková útrata ($)')
plt.ylabel('Spropitné ($)')
plt.grid(True)
plt.show()
```

**Co jsme se dozvěděli?** Jasně vidíme pozitivní trend: čím vyšší útrata, tím vyšší spropitné. Vztah se zdá být lineární.

**3. Regresní přímka: Jak silný je tento vztah?**
Seaborn umí do scatter plotu snadno přidat i regresní přímku, která tento trend kvantifikuje.

```python
plt.figure(figsize=(8, 6))
sns.regplot(data=tips_df, x='total_bill', y='tip', line_kws={'color': 'red'})
plt.title('Regresní přímka pro útratu a spropitné')
plt.xlabel('Celková útrata ($)')
plt.ylabel('Spropitné ($)')
plt.grid(True)
plt.show()
```

**Co jsme se dozvěděli?** Červená přímka je nejlepší lineární odhad vztahu, který našel regresní model. Šedá oblast kolem ní představuje interval spolehlivosti – ukazuje nejistotu modelu.

**4. Box Plot: Liší se spropitné podle dne v týdnu?**
Box plot (krabicový graf) je skvělý pro porovnání rozložení číselné proměnné napříč několika kategoriemi.

```python
plt.figure(figsize=(10, 6))
sns.boxplot(data=tips_df, x='day', y='tip')
plt.title('Rozložení spropitného podle dne v týdnu')
plt.xlabel('Den v týdnu')
plt.ylabel('Spropitné ($)')
plt.show()
```

**Co jsme se dozvěděli?** "Krabice" ukazuje, kde se nachází prostředních 50 % dat (interkvartilové rozpětí). Čára uprostřed je medián. Vidíme, že o víkendu (Sat, Sun) bývá medián spropitného o něco vyšší než ve všední dny. Také vidíme několik odlehlých hodnot (tečky nad "vousy").

**5. Heatmapa matice záměn: Vizualizace chyb modelu**
Jak jsme se naučili v minulé lekci, matice záměn je klíčová pro hodnocení klasifikace. Ještě lepší je ji vizualizovat pomocí heatmapy. Rychle si vytvoříme model, který hádá, zda byl zákazník kuřák.

```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import confusion_matrix

# Rychlá příprava dat pro klasifikaci
df_for_model = tips_df.copy()
df_for_model['sex'] = df_for_model['sex'].apply(lambda x: 1 if x == 'Male' else 0)
X = df_for_model[['total_bill', 'tip', 'size', 'sex']]
y = df_for_model['smoker'].apply(lambda x: 1 if x == 'Yes' else 0)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Trénink a predikce
model = LogisticRegression()
model.fit(X_train, y_train)
predictions = model.predict(X_test)

# Výpočet a vizualizace matice záměn
cm = confusion_matrix(y_test, predictions)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Nekuřák', 'Kuřák'], yticklabels=['Nekuřák', 'Kuřák'])
plt.xlabel('Predikce modelu')
plt.ylabel('Skutečnost')
plt.title('Matice záměn pro predikci kuřáka')
plt.show()
```

**Co jsme se dozvěděli?** Na první pohled vidíme, jak si model vedl. Čísla na diagonále ukazují správné predikce. Mimo diagonálu vidíme chyby – kolikrát si model spletl kuřáka s nekuřákem a naopak.

---

## Závěr: Vidět znamená věřit

Dnes jste se naučili používat nejdůležitější nástroje datového vědce pro vizuální průzkum dat. Už se nedíváte jen na řádky a sloupce, ale vidíte příběhy, vztahy a vzory. Zvládli jste:

- Zobrazit rozložení jedné proměnné pomocí **histogramu**.
- Odhalit vztah dvou proměnných pomocí **scatter plotu** a **regresní přímky**.
- Porovnat skupiny pomocí **box plotu**.
- Zviditelnit výkon modelu pomocí **heatmapy matice záměn**.

**Vaše výzva:** Hrajte si! Vezměte si náš `tips_df` dataset a zkuste vytvořit další grafy. Jak se liší průměrná útrata (`total_bill`) mezi muži a ženami (zkuste `barplot`)? Existuje nějaký zajímavý vztah, který odhalíte pomocí `pairplot(tips_df, hue='sex')`? Nechte data, ať k vám promluví skrze grafy.
