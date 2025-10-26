# Vysvětlitelná AI (XAI): Jak se podívat do "černé skříňky"

V minulých kapitolách jsme postavili modely, které fungovaly jako "černé skříňky". Dávaly nám odpovědi, ale často nám neříkaly, _proč_. Představte si lékaře, který vám oznámí: "Máte vážnou nemoc, protože to řekl můj počítač. Nevím proč, prostě to řekl." Důvěřovali byste mu? Pravděpodobně ne.

Stejné je to s umělou inteligencí. Abychom jí mohli důvěřovat, zejména v kritických oblastech jako je medicína nebo finance, potřebujeme jejím rozhodnutím rozumět. Vítejte ve světě **Vysvětlitelné AI (Explainable AI, XAI)**. Dnes se naučíme, jak pomocí moderních nástrojů otevřít černou skříňku a podívat se, jak AI "přemýšlí".

---

## Proč potřebujeme vysvětlitelnost?

1.  **Důvěra:** Uživatelé (ať už lékaři, soudci nebo bankéři) musí modelu důvěřovat, aby se na něj mohli spolehnout.
2.  **Odhalování chyb a nespravedlnosti:** Pokud model dělá chyby nebo je nespravedlivý (jak jsme viděli v kapitole o rizicích), XAI nám pomůže zjistit, _proč_. Možná se příliš spoléhá na citlivý údaj jako je pohlaví nebo rasa.
3.  **Zlepšování modelu:** Když víme, které faktory model považuje za důležité, můžeme lépe připravit data a vylepšit jeho architekturu.
4.  **Regulace a právo:** V mnoha odvětvích (např. bankovnictví) existuje "právo na vysvětlení", proč automatizovaný systém udělal určité rozhodnutí (např. zamítnutí úvěru).

---

## Praktický projekt: Vysvětlení predikcí pro přežití na Titanicu pomocí SHAP

Vrátíme se k našemu modelu pro predikci přežití na Titanicu. Natrénujeme ho a pak použijeme jednu z nejpopulárnějších XAI knihoven – **SHAP (SHapley Additive exPlanations)** – abychom se podívali, jak se rozhoduje.

Princip SHAP je založen na teorii her. Pro každou predikci spočítá "příspěvek" každého vstupního údaje (věk, pohlaví, třída...) k finálnímu výsledku. Řekne nám, které faktory "tlačily" predikci směrem k 'přežil' a které směrem k 'zemřel'.

**Krok 1: Příprava prostředí a modelu**

```bash
pip install pandas scikit-learn seaborn matplotlib shap
```

```python
import pandas as pd
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import shap

# Rychlá příprava dat (stejná jako v předchozích kapitolách)
titanic = sns.load_dataset('titanic')
titanic.drop(columns=['deck', 'embark_town', 'alive'], inplace=True)
titanic.dropna(inplace=True)

# Převedeme kategorické sloupce na čísla
categorical_cols = ['sex', 'embarked', 'class', 'who', 'adult_male', 'alone']
for col in categorical_cols:
    le = LabelEncoder()
    titanic[col] = le.fit_transform(titanic[col])

X = titanic.drop('survived', axis=1)
y = titanic['survived']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Natrénujeme model (Random Forest je pro SHAP vhodný)
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)
print(f"Model natrénován s přesností na testovacích datech: {model.score(X_test, y_test)*100:.2f}%")
```

**Krok 2: Globální vysvětlení – Co je pro model nejdůležitější?**

Nejprve se podíváme, které faktory považuje model za důležité **celkově**, napříč všemi predikcemi.

```python
# 1. Vytvoření SHAP explaineru
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# 2. Vytvoření souhrnného grafu (summary plot)
print("\nGeneruji globální SHAP summary plot...")
shap.summary_plot(shap_values, X_test, plot_type="bar", class_names=["Zemřel", "Přežil"])
```

**Co jsme se dozvěděli?** Tento graf seřadí všechny vstupní faktory podle jejich průměrného dopadu na rozhodování modelu. Téměř jistě uvidíte, že `sex` (pohlaví), `pclass` (třída) a `age` (věk) jsou na prvních místech. To dává smysl – odpovídá to historickému faktu "ženy a děti první".

**Krok 3: Lokální vysvětlení – Proč zrovna TENTO pasažér přežil?**

Teď přichází to nejzajímavější. Vybereme si jednoho konkrétního pasažéra z testovací sady a podíváme se, proč se model rozhodl zrovna u něj tak, jak se rozhodl.

```python
# 3. Vysvětlení jedné konkrétní predikce (force plot)
# Vybereme si prvního pasažéra z testovací sady
index_pasazera = 0
print(f"\nGeneruji lokální SHAP force plot pro pasažéra č. {index_pasazera}...")

# Inicializace JS vizualizace v notebooku (pokud používáte Jupyter)
shap.initjs()

# Vykreslení force plotu
shap.force_plot(explainer.expected_value[1],
                shap_values[1][index_pasazera,:],
                X_test.iloc[index_pasazera,:],
                matplotlib=True)
```

**Jak číst Force Plot:**

- **Základní hodnota (base value):** Průměrná predikce modelu napříč celým datasetem.
- **Výsledná predikce (f(x)):** Finální skóre pro tohoto konkrétního pasažéra.
- **Červené šipky:** Faktory, které "tlačily" predikci nahoru (směrem k "Přežil"). Délka šipky ukazuje sílu faktoru.
- **Modré šipky:** Faktory, které "tlačily" predikci dolů (směrem k "Zemřel").

U typického přeživšího (např. žena z první třídy) uvidíte, že hodnoty `sex=0` (žena) a `pclass=0` (1. třída) budou velké červené bloky, které posunuly výsledek výrazně doprava.

---

## Závěr: Od černé skříňky k průhlednému partnerovi

Dnes jste udělali něco, co bylo ještě před pár lety považováno za téměř nemožné: nahlédli jste do "mysli" komplexního AI modelu. Už pro vás není jen černou skříňkou, která vyplivne výsledek.

Pomocí nástrojů jako SHAP dokážete:

1.  Zjistit, které **faktory jsou pro model nejdůležitější celkově**.
2.  Detailně **interpretovat každé jednotlivé rozhodnutí**.

To je naprosto klíčové pro budování **důvěryhodné, transparentní a odpovědné umělé inteligence**. Umožňuje nám to odhalit chyby, bojovat proti nespravedlnosti a vytvářet modely, kterým můžeme skutečně rozumět.

**Vaše výzva:** Zkuste si v našem kódu vybrat jiného pasažéra – třeba muže z třetí třídy, který nepřežil (`X_test.iloc[...]`). Vygenerujte pro něj `force_plot` a slovně interpretujte, které faktory nejvíce přispěly k jeho tragické predikci.
