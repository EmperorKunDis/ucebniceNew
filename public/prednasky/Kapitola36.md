# Rizika umělé inteligence: Když se dobrý sluha stane zlým pánem

Stvořili jsme mocné nástroje. Naše neuronové sítě umí číst, naše klasifikátory třídit a naše modely předpovídat budoucnost. Ale s velkou mocí přichází velká zodpovědnost. Co se stane, když se náš model, natrénovaný na datech z naší nedokonalé společnosti, stane nespravedlivým soudcem? Co když začne systematicky znevýhodňovat určité skupiny lidí při žádostech o úvěr, práci nebo dokonce ve zdravotní péči?

Dnes se podíváme na temnou stranu AI: na rizika zneužití, diskriminace a etická selhání. A v praktickém projektu si na reálných datech ukážeme, jak snadno se může umělá inteligence, i s dobrým úmyslem, stát nespravedlivou.

---

## Tři hlavní hrozby: Soukromí, autonomie a nespravedlnost

I když existuje mnoho rizik, tři z nich jsou nejdiskutovanější:

1.  **Zneužití dat a ztráta soukromí:** Každý váš klik, lajk nebo vyhledávání vytváří datovou stopu. AI systémy tyto stopy analyzují a vytvářejí vaše detailní digitální profily. Ty se pak používají k cílení reklamy, ale mohou být využity i k manipulaci s veřejným míněním nebo k odhalení citlivých informací o vašem zdraví či názorech, a to často bez vašeho vědomí.

2.  **Autonomní systémy a etická dilemata:** Představte si samořídící auto, kterému selžou brzdy. Před ním je přechod s pěti chodci. Jediná možnost je strhnout řízení a narazit do zdi, což ale zabije pasažéra uvnitř. Jak se má AI rozhodnout? Kdo je za toto rozhodnutí zodpovědný – programátor, majitel auta, nebo výrobce? Tyto otázky zatím nemají snadné odpovědi.

3.  **Algoritmická nespravedlnost (Bias):** Toto je nejzáludnější a nejčastější problém. AI modely se učí z historických dat. Pokud tato data odrážejí existující společenské předsudky, model se je naučí a začne je automatizovaně aplikovat. Pokud v minulosti na manažerských pozicích bylo méně žen, model se může "naučit", že ženy jsou pro tyto pozice horší kandidátky, a začne je při výběrovém řízení znevýhodňovat.

---

## Praktický projekt: Audit spravedlnosti u predikce příjmů

Pojďme si algoritmickou nespravedlnost ukázat v praxi. Použijeme k tomu slavný dataset "Adult" z UCI, který obsahuje demografické údaje a cílem je předpovědět, zda příjem dané osoby přesahuje 50 000 $ ročně. Natrénujeme model a pak provedeme **audit spravedlnosti** – zjistíme, zda je stejně "přesný" pro muže i pro ženy.

**Krok 1: Příprava prostředí a dat**

```bash
pip install pandas scikit-learn seaborn matplotlib
```

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import matplotlib.pyplot as plt
import seaborn as sns

# Načtení dat z online zdroje
url = 'https://archive.ics.uci.edu/ml/machine-learning-databases/adult/adult.data'
columns = ['age', 'workclass', 'fnlwgt', 'education', 'education-num', 'marital-status',
           'occupation', 'relationship', 'race', 'sex', 'capital-gain', 'capital-loss',
           'hours-per-week', 'native-country', 'income']
df = pd.read_csv(url, header=None, names=columns, na_values=' ?', sep=', ')

# Zjednodušení a vyčištění dat
df.dropna(inplace=True)
# Převedeme kategorické sloupce na čísla
for col in df.columns:
    if df[col].dtype == 'object':
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])

# Příprava dat pro model
X = df.drop('income', axis=1)
y = df['income']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
```

**Krok 2: Trénink modelu a celkové vyhodnocení**

Natrénujeme model a podíváme se na jeho celkovou přesnost.

```python
# Trénink modelu
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)
predictions = model.predict(X_test)

# Celková přesnost
overall_accuracy = accuracy_score(y_test, predictions)
print(f"Celková přesnost modelu na testovacích datech: {overall_accuracy*100:.2f}%")
```

_Výsledek kolem 85 % vypadá na první pohled velmi dobře! Ale je model skutečně spravedlivý?_

**Krok 3: Audit spravedlnosti – "Aha!" moment**

Nyní rozdělíme testovací data podle pohlaví a změříme přesnost pro každou skupinu zvlášť.

```python
# Vytvoříme si kopii testovacích dat pro analýzu
X_test_audit = X_test.copy()
X_test_audit['true_income'] = y_test
X_test_audit['predicted_income'] = predictions

# Zjistíme, který číselný kód odpovídá mužům a ženám (může se lišit)
# V tomto datasetu je 'Male' obvykle 1 a 'Female' 0
sex_code_male = 1
sex_code_female = 0

# Oddělíme muže a ženy
test_male = X_test_audit[X_test_audit['sex'] == sex_code_male]
test_female = X_test_audit[X_test_audit['sex'] == sex_code_female]

# Vypočítáme přesnost pro každou skupinu
accuracy_male = accuracy_score(test_male['true_income'], test_male['predicted_income'])
accuracy_female = accuracy_score(test_female['true_income'], test_female['predicted_income'])

print(f"\nPřesnost modelu pro muže: {accuracy_male*100:.2f}%")
print(f"Přesnost modelu pro ženy: {accuracy_female*100:.2f}%")

# Vizualizace rozdílu
plt.figure(figsize=(8, 6))
sns.barplot(x=['Muži', 'Ženy'], y=[accuracy_male, accuracy_female])
plt.title('Porovnání přesnosti modelu podle pohlaví')
plt.ylabel('Přesnost')
plt.ylim(0, 1)
plt.show()
```

**Co jsme se dozvěděli?** S vysokou pravděpodobností uvidíte, že i když je celková přesnost vysoká, existuje znatelný rozdíl v přesnosti mezi muži a ženami. Model může být pro jednu skupinu výrazně přesnější než pro druhou. Právě jste kvantifikovali algoritmickou nespravedlnost.

---

## Závěr: Odpovědnost začíná měřením

Dnes jsme odhalili temné břicho šelmy. Viděli jste, jak model, který se na první pohled zdá být "přesný", může být ve skutečnosti nespravedlivý k určitým skupinám. To není nutně chyba AI, ale často je to odraz předsudků, které jsou již přítomny v našich datech a společnosti.

Jako tvůrci a uživatelé AI je naší povinností nejen se honit za co nejvyšší celkovou přesností, ale také aktivně **auditovat naše modely** a ptát se: "Je tento model fér? Neznevýhodňuje systematicky někoho?" Prvním krokem k nápravě je vždy měření.

**Vaše výzva:** Zkuste v našem kódu provést audit pro jinou citlivou proměnnou, například `race`. Zjistíte podobné disparity? A co by se dalo udělat pro jejich zmírnění? (Např. úprava dat, použití speciálních fairness-aware algoritmů, nebo prosté rozhodnutí, že citlivé atributy jako pohlaví a rasa se pro trénink vůbec nemají používat).
