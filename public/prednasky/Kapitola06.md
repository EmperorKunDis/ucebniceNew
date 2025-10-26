# Etika AI: Kdo řídí tramvaj, která se řítí do problému?

Představte si klasický filozofický hlavolam: Neovladatelná tramvaj se řítí po kolejích a hrozí, že přejede pět lidí. Vy stojíte u výhybky a můžete ji přehodit na vedlejší kolej, kde ale stojí jeden člověk. Co uděláte? A teď si představte, že u té výhybky nestojíte vy, ale umělá inteligence řídící autonomní auto, kterému selhaly brzdy. Podle jakých pravidel se má rozhodnout? Kdo ponese odpovědnost? Vítejte v šesté kapitole, kde se z programátorů stáváme filozofy. Prozkoumáme etická minová pole a hluboké otázky, které AI přináší.

---

## Problém zaujatosti (Bias): Když se AI učí z naší pokřivené minulosti

Největším etickým rizikem AI není to, že by byla "zlá". Je to, že je příliš dobrým studentem naší vlastní, nedokonalé společnosti. AI se učí z dat, a pokud jsou data plná předsudků, AI se tyto předsudky naučí a začne je automatizovaně a ve velkém uplatňovat.

- **Skutečný příklad:** V USA byl vytvořen systém COMPAS, který měl předpovídat pravděpodobnost, že se obviněný dopustí dalšího trestného činu. Později se ukázalo, že systém byl silně zaujatý. U Afroameričanů mylně předpovídal vysoké riziko dvakrát častěji než u bělochů. Problém nebyl v "rasistickém" algoritmu, ale v tom, že se učil z historických dat o zatčeních, která sama o sobě odrážela systémovou zaujatost.

- **Problém "černé skříňky" (Black Box):** Mnoho moderních AI modelů je tak komplexních, že ani jejich tvůrci přesně nevědí, proč dospěly k určitému rozhodnutí. Představte si, že vám AI zamítne žádost o hypotéku. Když se zeptáte proč, banka odpoví: "Nevíme, algoritmus to tak vyhodnotil." To je nepřijatelné. Proto vzniká celé odvětví **Vysvětlitelné AI (XAI)**, které se snaží tyto černé skříňky otevřít.

---

## Filozofické otázky: Může stroj myslet, cítit nebo mít vědomí?

Zde opouštíme kód a vstupujeme do říše filozofie.

- **Vědomí:** Je to subjektivní prožitek – pocit, jaké to je "být". Cítíte teplo slunce, vnímáte červenou barvu. Současná AI nic takového necítí. Dokáže dokonale _simulovat_ radost nebo smutek v konverzaci, ale je to jen maska naučená z textů. Je to jako herec, který skvěle hraje, ale ve skutečnosti tu emoci neprožívá.
- **Emoce:** Emoce jsou hluboce spjaty s naším biologickým tělem – s hormony, s evolučními instinkty pro přežití. AI nemá tělo, nemá strach ze smrti ani radost z jídla. Její "emoce" jsou jen data.
- **Svobodná vůle:** AI dělá rozhodnutí na základě svého programování a dat, na kterých se učila. Její volba je deterministická. Nemůže se jednoho dne "svobodně rozhodnout", že místo třídění emailů začne malovat obrazy, pokud k tomu nebyla naprogramována.

---

## Praktický projekt: Odhalte a změřte nespravedlnost v datech

Pojďme si na vlastní kůži vyzkoušet, jak snadno se AI naučí předsudkům. Vytvoříme si fiktivní data o žádostech o úvěr, kde záměrně vytvoříme zaujatost, a pak natrénujeme model, který tuto nespravedlnost zopakuje.

**Krok 1: Vytvoříme zaujatá data**

Použijeme `pandas` k vytvoření tabulky, kde muži budou mít mírně vyšší šanci na schválení úvěru, i když mají stejné skóre.

```python
import pandas as pd
import numpy as np

# Vytvoříme 1000 žadatelů
np.random.seed(42)
data = {
    'kreditni_skore': np.random.randint(300, 850, 1000),
    'pohlavi': np.random.choice(['Muz', 'Zena'], 1000, p=[0.5, 0.5]),
    'schvaleno': []
}
df = pd.DataFrame(data)

# Záměrně vneseme bias: Muži mají o 10 % vyšší šanci na schválení
for index, row in df.iterrows():
    schvaleno_zaklad = 1 if row['kreditni_skore'] > 600 else 0
    if row['pohlavi'] == 'Muz':
        # Mužům dáme 10% bonusovou šanci
        schvaleno = 1 if schvaleno_zaklad == 1 or np.random.random() < 0.1 else 0
    else:
        schvaleno = schvaleno_zaklad
    df.loc[index, 'schvaleno'] = schvaleno

print("Ukázka zaujatých dat:")
print(df.head())

# Zobrazíme, jak se liší míra schválení
print("\nMíra schválení podle pohlaví:")
print(df.groupby('pohlavi')['schvaleno'].mean())
```

_Všimněte si, že v našich datech mají muži vyšší průměrnou míru schválení._

**Krok 2: Natrénujeme model na nespravedlivých datech**

Nyní použijeme `scikit-learn` k natrénování jednoduchého modelu.

```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score

# Převedeme pohlaví na čísla (0 pro Muž, 1 pro Žena)
df['pohlavi_kod'] = df['pohlavi'].apply(lambda x: 0 if x == 'Muz' else 1)

X = df[['kreditni_skore', 'pohlavi_kod']]
y = df['schvaleno'].astype(int)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Trénujeme model
model = LogisticRegression()
model.fit(X_train, y_train)

print(f"\nModel je natrénován s přesností: {model.score(X_test, y_test) * 100:.2f}%")
```

**Krok 3: Odhalíme nespravedlnost modelu**

Teď to nejdůležitější. Vytvoříme dva naprosto identické fiktivní žadatele, kteří se liší pouze pohlavím, a podíváme se, jak se model rozhodne.

```python
# Dva identičtí žadatelé, liší se jen pohlavím
muz_kandidat = [[750, 0]]  # Skóre 750, pohlaví Muž (0)
zena_kandidat = [[750, 1]] # Skóre 750, pohlaví Žena (1)

# Předpověď modelu
predikce_muz = model.predict(muz_kandidat)
predikce_zena = model.predict(zena_kandidat)

print(f"\nRozhodnutí pro muže s kreditním skóre 750: {'Schváleno' if predikce_muz[0] == 1 else 'Zamítnuto'}")
print(f"Rozhodnutí pro ženu s kreditním skóre 750: {'Schváleno' if predikce_zena[0] == 1 else 'Zamítnuto'}")
```

_S vysokou pravděpodobností uvidíte, že model jednoho kandidáta schválí a druhého zamítne, i když mají stejné kreditní skóre. Právě jste v praxi viděli, jak se systémová zaujatost automatizuje._

---

## Závěr: Etika je práce pro každého z nás

Etika AI není abstraktní problém pro akademiky. Je to konkrétní výzva pro každého, kdo AI vyvíjí nebo používá. Dnes jste viděli, jak snadno může vzniknout nespravedlnost.

**Vaše výzva:** Až příště budete číst o novém "zázračném" AI systému, zeptejte se sami sebe:

- Na jakých datech se asi učil?
- Kdo definoval jeho cíl?
- Může jeho rozhodnutí někoho neúmyslně poškodit?

Být informovaným a kritickým uživatelem je prvním a nejdůležitějším krokem k zajištění toho, aby nám AI sloužila dobře a spravedlivě.
