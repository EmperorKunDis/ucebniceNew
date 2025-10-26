# Nejistota a predikce: Jak AI předpovídá budoucnost z neúplné minulosti

Představte si, že jste datový vědec v roce 1912 a máte v ruce seznam pasažérů Titanicu. U každého znáte jméno, pohlaví a v jaké třídě cestoval. Dokázali byste jen na základě těchto dat odhadnout, kdo z nich měl největší šanci na přežití? A co když u spousty pasažérů klíčový údaj – jejich věk – úplně chybí?

Vítejte ve světě reálné umělé inteligence. Světě plném **nejistoty**, chybějících dat a pravděpodobnostních odhadů. Dnes se naučíme, jak AI dokáže dělat informované predikce i z neúplných dat a jak nám pravděpodobnost pomáhá vyjádřit, jak moc si je svým odhadem "jistá". Naším případem bude právě legendární Titanic.

---

## Co je nejistota a proč je pro AI normální?

V reálném světě jsou data málokdy dokonalá. Jsou špinavá, neúplná a plná šumu. Pro AI to znamená dva hlavní druhy nejistoty:

1.  **Nejistota v datech:** Data mohou být nepřesná (překlepy ve jménech) nebo mohou chybět (neznámý věk). Náš model se s tím musí umět vyrovnat.
2.  **Nejistota v modelu:** I s dokonalými daty je svět příliš komplexní na to, aby ho jakýkoliv model popsal se 100% přesností. Vždy bude existovat určitá míra nejistoty v jeho predikcích.

Cílem není nejistotu zcela eliminovat (to je nemožné), ale **měřit ji a pracovat s ní**. Místo aby model řekl "Tento pasažér přežil", řekne "S pravděpodobností 75 % tento pasažér přežil". To je mnohem užitečnější informace.

---

## Bayesovo uvažování: Aktualizace názorů na základě důkazů

Jak AI pracuje s novými informacemi, aby zpřesnila své odhady? Používá princip zvaný **Bayesovo uvažování**. Je to matematický způsob, jak aktualizovat naše přesvědčení.

- **Předchozí názor (Prior):** Než se podíváme na data, můžeme mít obecný předpoklad. Např. "Šance na přežití na Titanicu byla celkově nízká, řekněme 38 %."
- **Nový důkaz (Likelihood):** Pak získáme konkrétní informaci: "Tento pasažér byla žena cestující v 1. třídě."
- **Aktualizovaný názor (Posterior):** Na základě tohoto důkazu dramaticky změníme náš odhad. Víme, že ženy a děti měly přednost, a lidé z 1. třídy měli lepší přístup k záchranným člunům. Náš odhad pravděpodobnosti přežití pro tuto konkrétní osobu se tak může zvýšit z 38 % třeba na 95 %.

Toto neustálé "přehodnocování" na základě nových dat je základem toho, jak se modely strojového učení "učí".

---

## Praktický projekt: Předpověď přežití na Titanicu

Pojďme si to ukázat v praxi. Použijeme slavný dataset o Titanicu a postavíme model, který bude předpovídat šanci na přežití. Ukážeme si, jak se vypořádat s chybějícími daty.

**Krok 1: Příprava prostředí a načtení dat**

Budeme potřebovat knihovny `pandas`, `numpy`, `scikit-learn` a `seaborn` (ten má dataset Titanicu v sobě, takže ho nemusíme stahovat).

```bash
pip install pandas numpy scikit-learn seaborn
```

**Krok 2: Průzkum a čištění dat**

Načteme data a podíváme se, kde nám chybí hodnoty.

```python
import pandas as pd
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Načtení datasetu
titanic = sns.load_dataset('titanic')

# Podívejme se, kde chybí data
print("Chybějící hodnoty v jednotlivých sloupcích:")
print(titanic.isnull().sum())

# Chybí nám hodně hodnot ve sloupci 'age' (věk).
# Nahradíme chybějící věk mediánem (střední hodnotou) všech známých věků.
# Medián je odolnější vůči extrémním hodnotám než průměr.
median_age = titanic['age'].median()
titanic['age'].fillna(median_age, inplace=True)

# Sloupec 'deck' má příliš mnoho chybějících hodnot, takže ho odstraníme.
# 'embarked' a 'embark_town' mají jen pár, pro zjednodušení je odstraníme také.
titanic.drop(columns=['deck', 'embark_town', 'alive'], inplace=True)
titanic.dropna(inplace=True) # Odstraníme zbývající řádky s chybějícími daty

print("\nData po vyčištění:")
print(titanic.head())
```

**Krok 3: Příprava dat pro model**

Model nerozumí textu jako "male" nebo "female". Musíme ho převést na čísla.

```python
# Převedeme kategorické proměnné na číselné
titanic = pd.get_dummies(titanic, columns=['sex', 'class', 'who', 'adult_male', 'alone'], drop_first=True)

# Definujeme, co chceme předpovídat (cíl) a z čeho (vlastnosti)
X = titanic.drop('survived', axis=1)
y = titanic['survived']

# Rozdělíme data na trénovací a testovací sadu
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
```

**Krok 4: Trénink a vyhodnocení modelu**

Natrénujeme model `RandomForestClassifier`, což je silný a robustní model, a změříme jeho přesnost.

```python
# Vytvoříme a natrénujeme model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Provedeme predikce na testovacích datech
predictions = model.predict(X_test)

# Vyhodnotíme přesnost
accuracy = accuracy_score(y_test, predictions)
print(f"\nPřesnost našeho modelu je: {accuracy * 100:.2f}%")

# Ukázka pravděpodobnostní predikce pro prvních 5 pasažérů z testovací sady
# Model nám dá pravděpodobnost pro 'nepřežil' (třída 0) a 'přežil' (třída 1)
probabilities = model.predict_proba(X_test.head())
print("\nPravděpodobnost přežití pro prvních 5 testovacích pasažérů:")
for i, prob in enumerate(probabilities):
    print(f"Pasažér {i+1}: Šance na přežití = {prob[1]*100:.2f}%")
```

---

## Závěr: Od nejistoty k informovanému odhadu

Dnes jste se z dat o historické tragédii naučili něco neuvěřitelně cenného. Zjistili jste, jak se vypořádat s nepořádkem a nejistotou v reálných datech. Naučili jste se, že chybějící hodnoty nejsou konec světa, ale řešitelná výzva, a že jednoduchá technika jako **imputace mediánem** může být velmi efektivní.

A co je nejdůležitější, postavili jste model, který se z historie učí pravděpodobnostní vzorce přežití a dokáže své predikce vyjádřit v procentech, čímž kvantifikuje vlastní nejistotu.

**Vaše výzva:** Zkuste v našem kódu použít jinou strategii pro doplnění chybějícího věku. Co se stane, když použijete průměr (`.mean()`) místo mediánu? Nebo co kdybyste zkusili chytřejší přístup a doplnili chybějící věk mediánem věku pro danou třídu a pohlaví? Experimentujte a sledujte, jak se mění přesnost vašeho modelu!
