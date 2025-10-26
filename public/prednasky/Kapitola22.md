# Zpracování dat: Kuchařka pro přípravu dokonalých "surovin" pro AI

Představte si, že jste šéfkuchař a právě vám dorazila bedna se zeleninou na přípravu slavnostní večeře. Jsou v ní krásné mrkve, ale i pár nahnilých. Některé brambory jsou obří, jiné zase maličké. A pár kousků zeleniny vůbec nepoznáváte. Co uděláte? Určitě nezačnete hned vařit. Nejprve si suroviny **připravíte**: vyhodíte shnilé kusy, oloupete brambory, nakrájíte vše na stejnou velikost.

Přesně totéž musíme udělat s daty, než je "naservírujeme" našemu AI modelu. Tomuto procesu se říká **čištění a předzpracování dat** a je to možná nejdůležitější, i když nejméně okouzlující, část práce datového vědce. Dnes si projdeme kompletní kuchařkou, jak z chaotických dat vytvořit prvotřídní surovinu.

---

## Náš "špinavý" dataset: Fiktivní inzeráty na byty

Abychom si vše ukázali v praxi, vytvoříme si malý, ale záměrně "špinavý" dataset s nabídkami bytů. Bude obsahovat všechny typické nešvary reálných dat. K práci použijeme knihovnu **Pandas**, která je v Pythonu standardem pro manipulaci s tabulkovými daty.

**Krok 1: Příprava prostředí a vytvoření datasetu**

```bash
pip install pandas scikit-learn
```

```python
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler

# Vytvoříme záměrně "špinavý" dataset
data = {
    'id': [1, 2, 3, 4, 5, 5, 6, 7],
    'plocha_m2': [60, 75, 55, 120, 65, 65, 500, 70],
    'cena_mil_kc': [5.5, 6.8, 5.1, 11.0, 6.1, 6.1, 50.0, 6.5],
    'patro': [3, 5, 2, 8, np.nan, 4, 1, 2] # np.nan reprezentuje chybějící hodnotu
}
byty_df = pd.DataFrame(data)

print("--- Původní, špinavá data ---")
byty_df.info()
print(byty_df)
```

**První pohled:** Už teď vidíme problémy! `info()` nám ukazuje, že ve sloupci `patro` je jen 7 hodnot z 8 (jedna chybí). A při pohledu na data vidíme duplicitní `id` 5 a podezřele vysokou plochu a cenu u bytu č. 6 a 7.

---

## Krok 2: Úklid – Duplikáty, chybějící hodnoty a odlehlé hodnoty

Jdeme uklízet, krok za krokem.

**1. Odstranění duplicit**
Duplicitní záznamy mohou zkreslit statistiky a učení modelu. Najdeme je a odstraníme.

```python
# Najdeme duplikáty podle 'id'
pocet_duplikatu = byty_df['id'].duplicated().sum()
print(f"\nNalezeno duplicitních id: {pocet_duplikatu}")

# Odstraníme duplicitní řádky, ponecháme první výskyt
byty_df_ciste = byty_df.drop_duplicates(subset='id', keep='first')
print("\n--- Data po odstranění duplicit ---")
print(byty_df_ciste)
```

**2. Zpracování chybějících hodnot**
Ve sloupci `patro` nám chybí hodnota. Máme několik možností, ale jednoduchá a robustní metoda je doplnit chybějící hodnotu **mediánem** (prostřední hodnotou) všech ostatních pater.

```python
# Doplnění chybějící hodnoty mediánem
median_patro = byty_df_ciste['patro'].median()
byty_df_ciste['patro'].fillna(median_patro, inplace=True)
print(f"\nChybějící hodnota pro 'patro' byla nahrazena mediánem: {median_patro}")
print("\n--- Data po doplnění chybějících hodnot ---")
print(byty_df_ciste)
```

**3. Odstranění odlehlých hodnot (Outliers)**
Byt s plochou 500 m² a cenou 50 mil. Kč je zjevně "mimo" oproti ostatním. Může to být chyba v datech nebo luxusní penthouse, který by zkreslil náš model pro běžné byty. Odstraníme ho.

```python
# Odstraníme byty s cenou vyšší než např. 20 mil. Kč
byty_df_ciste = byty_df_ciste[byty_df_ciste['cena_mil_kc'] < 20]
print("\n--- Data po odstranění odlehlých hodnot ---")
print(byty_df_ciste)
```

---

## Krok 3: Normalizace – Sjednocení měřítek

Nyní máme čistá data. Ale všimněte si, že `plocha_m2` je v desítkách, zatímco `cena_mil_kc` v jednotkách. Pro mnoho AI modelů je to problém – přikládaly by větší váhu ploše jen proto, že je to větší číslo. Proto data **normalizujeme** – převedeme všechny hodnoty do stejného rozsahu, typicky od 0 do 1.

```python
# Vybereme sloupce, které chceme normalizovat
sloupce_k_normalizaci = ['plocha_m2', 'cena_mil_kc', 'patro']
data_k_normalizaci = byty_df_ciste[sloupce_k_normalizaci]

# Vytvoříme a aplikujeme Min-Max Scaler
scaler = MinMaxScaler()
normalizovana_data = scaler.fit_transform(data_k_normalizaci)

# Převedeme zpět na DataFrame pro lepší čitelnost
normalizovany_df = pd.DataFrame(normalizovana_data, columns=sloupce_k_normalizaci)

print("\n--- Finální, čistá a normalizovaná data připravená pro AI ---")
print(normalizovany_df)
```

**Co se stalo?** Podívejte se na výsledek. Nejmenší byt má teď plochu 0, největší 1. Nejnižší cena je 0, nejvyšší 1. Všechny hodnoty jsou nyní ve stejném "hřišti" a jsou připraveny pro spravedlivé zpracování modelem.

---

## Závěr: Odpadky dovnitř, odpadky ven

V datové vědě platí zlaté pravidlo: **"Garbage in, garbage out"** (Odpadky dovnitř, odpadky ven). Můžete mít ten nejlepší a nejdražší AI model na světě, ale pokud ho "nakrmíte" špinavými, nekonzistentními daty, jeho výsledky budou vždy jen odpad.

Dnes jste se naučili nejdůležitější část řemesla:

1.  Jak systematicky **najít a odstranit** duplikáty a chybějící hodnoty.
2.  Jak identifikovat a **odfiltrovat** extrémní, odlehlé hodnoty.
3.  Proč a jak **normalizovat** data, aby měla stejné měřítko.

Těchto pár kroků v knihovně Pandas tvoří až 80 % práce na mnoha reálných projektech. Zvládnutím čištění dat si připravujete půdu pro úspěch jakéhokoliv AI modelu, který budete stavět.

**Vaše výzva:** Zkuste v našem kódu jinou strategii pro doplnění chybějící hodnoty v `patro`. Co by se stalo, kdybyste místo mediánu použili průměr (`.mean()`)? A co kdybyste celý řádek s chybějící hodnotou prostě smazali (`.dropna()`)? Jak by to ovlivnilo finální data?
