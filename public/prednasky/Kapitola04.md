# Tým snů pro umělou inteligenci: Kdo je kdo v rodině chytrých oborů?

Představte si, že stavíte revoluční autonomní auto. Kdo všechno je v týmu? Potřebujete nejen inženýra, co sestrojí motor. Potřebujete také analytika, který prostuduje mapy a dopravní data, psychologa, který pochopí chování řidičů, a etika, který nastaví pravidla pro krizové situace. Umělá inteligence není sólový hráč. Je to kapitán hvězdného týmu, kde má každý svou nezastupitelnou roli. V této kapitole si představíme její nejdůležitější spoluhráče: datovou vědu, statistiku, kognitivní vědu a filozofii. Pochopíte, proč AI není jen programování, ale fascinující průsečík mnoha disciplín.

---

## AI vs. Datová věda: Stavitel a Průzkumník

Často se zaměňují, ale jejich cíle jsou odlišné. Představte si je jako dva různé experty pracující s daty o zákaznících.

- **Datový vědec (Průzkumník):** Jeho úkolem je **porozumět minulosti a současnosti**. Ponoří se do dat a hledá odpovědi na otázky jako: "Proč nám minulý měsíc odešlo 5 % zákazníků? Souvisí to s naší novou marketingovou kampaní?" Vytvoří reporty, grafy a vizualizace, které pomohou lidem ve firmě udělat lepší rozhodnutí. Jeho hlavním produktem je **vhled**.

- **AI inženýr (Stavitel):** Jeho úkolem je **předpovídat a automatizovat budoucnost**. Použije vhledy od datového vědce a postaví systém, který se sám učí. Například vytvoří model, který analyzuje chování každého zákazníka a s 90% přesností předpoví, že se chystá odejít. Systém mu pak může automaticky nabídnout slevu, aby si ho udržel. Jeho hlavním produktem je **akce**.

Zjednodušeně: Datová věda hledá příběh v datech. AI tento příběh používá k automatickému rozhodování.

---

## AI vs. Statistika: Prediktor a Interpretátor

Statistika je matematický základ, na kterém stojí jak datová věda, tak AI. Ale opět se liší v tom, na co kladou důraz.

- **Statistik (Interpretátor):** Chce především **dokonale popsat a ověřit vztahy** v datech. Používá modely, které jsou často jednodušší, ale zato křišťálově čisté a interpretovatelné. Statistik vám řekne: "S 95% jistotou mohu říci, že každý miligram kofeinu navíc zvyšuje tepovou frekvenci o 0.5 úderu za minutu." Důležitá je pro něj přesnost a prokazatelnost modelu.

- **AI inženýr (Prediktor):** Chce především **co nejpřesnější předpověď**, i za cenu toho, že model bude složitá "černá skříňka". Použije klidně i velmi komplexní algoritmus (jako neuronovou síť), který zkombinuje stovky proměnných. Možná nebude schopen přesně říct, _proč_ si model myslí, že zrovna tento email je spam, ale pokud to určí s 99.9% přesností, je to pro něj výhra.

Statistika je o vysvětlování. AI je o předpovídání.

---

## Kognitivní věda a Filozofie: Inspirace a Svědomí

Tyto dva humanitní obory dávají AI hlubší smysl.

- **Kognitivní věda (Inspirace):** Studuje, jak funguje lidská mysl – jak se učíme, vnímáme, pamatujeme si. Pro AI je to bezedná studnice inspirace. První neuronové sítě byly přímo inspirovány strukturou mozku. Když chceme, aby AI rozuměla jazyku, studujeme, jak se jazyk učí děti.

- **Filozofie (Svědomí):** Klade ty nejtěžší, ale nejdůležitější otázky. Co je to vlastně inteligence? Má stroj, který projde Turingovým testem, vědomí? A hlavně: Jaké jsou etické hranice? Pokud autonomní auto musí v krizové situaci volit mezi srážkou dvou různých skupin lidí, podle jakého klíče se má rozhodnout? Filozofie je morálním kompasem AI.

---

## Praktický projekt: Týmová práce na datech o květinách

Pojďme si ukázat spolupráci těchto oborů na slavném "Iris datasetu". Tento dataset obsahuje měření délky a šířky kališních a okvětních lístků pro tři druhy kosatců (Iris). Cílem je rozpoznat druh kosatce podle těchto měření.

**Krok 1: Role Datového vědce (průzkum dat)**

Načteme data a podíváme se na ně. Použijeme knihovny `pandas` a `seaborn`.

```python
import seaborn as sns
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.datasets import load_iris

# Načteme data
iris_data = load_iris()
df = pd.DataFrame(data=iris_data.data, columns=iris_data.feature_names)
df['species'] = iris_data.target_names[iris_data.target]

# Zobrazíme prvních 5 řádků, abychom viděli, jak data vypadají
print("Prvních 5 řádků dat:")
print(df.head())

# Vytvoříme vizualizaci, která ukáže vztahy mezi proměnnými
print("\nVizualizace dat:")
sns.pairplot(df, hue='species')
plt.show()
```

_Datový vědec právě zjistil, že některé druhy kosatců jsou podle měření lístků velmi dobře odlišitelné._

**Krok 2: Role Statistika (jednoduchý vhled)**

Statistik by mohl spočítat jednoduchou, ale silnou metriku.

```python
# Spočítáme průměrnou délku okvětního lístku pro každý druh
average_petal_length = df.groupby('species')['petal length (cm)'].mean()
print("\nPrůměrná délka okvětního lístku:")
print(average_petal_length)
```

_Statistik potvrzuje, že druh 'setosa' má výrazně menší okvětní lístky. To je silný a interpretovatelný poznatek._

**Krok 3: Role AI Inženýra (stavba prediktivního modelu)**

AI inženýr vezme data a postaví model, který bude druh kosatce předpovídat automaticky.

```python
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score

# Rozdělíme data na trénovací a testovací sadu
X = iris_data.data
y = iris_data.target
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Vytvoříme a natrénujeme model (K-nejbližších sousedů)
knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)

# Otestujeme, jak si model vede na datech, která ještě neviděl
predictions = knn.predict(X_test)
accuracy = accuracy_score(y_test, predictions)

print(f"\nPřesnost našeho AI modelu je: {accuracy * 100:.2f}%")

# Zkusíme předpovědět nový, neznámý vzorek
# Co je to za kosatec, když má tyto rozměry?
new_flower = [[5.1, 3.5, 1.4, 0.2]] # Rozměry typické pro setosu
prediction_result = knn.predict(new_flower)
print(f"Model předpovídá, že nová květina je: {iris_data.target_names[prediction_result][0]}")
```

_AI inženýr postavil systém, který s vysokou přesností automaticky klasifikuje nové květiny._

---

## Závěr: Najděte si svou roli v týmu

Jak vidíte, AI není monolit. Je to výsledek spolupráce.

- **Datový vědec** najde v datech zlato.
- **Statistik** ověří jeho pravost a hodnotu.
- **AI inženýr** z něj postaví stroj, který generuje další zlato automaticky.
- **Kognitivní vědec** a **filozof** se starají o to, aby stroj fungoval v souladu s lidskými hodnotami.

Vaše cesta do světa AI může vést přes kteroukoli z těchto rolí. Baví vás víc hledat příběhy v datech, stavět prediktivní modely, nebo přemýšlet o etických dopadech? Ať už si vyberete jakoukoliv cestu, pochopení celého "týmu" vám dá obrovskou výhodu.
