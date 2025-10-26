# Klasifikace pomocí K-nejbližších sousedů (KNN): Jsi takový, jako tvoji přátelé

Představte si, že jste na velkém večírku, kde nikoho neznáte, a chcete odhadnout, kdo z hostů je fanouškem sci-fi filmů. Co uděláte? Pravděpodobně se podíváte na skupinku lidí, u které zrovna stojíte. Pokud se tři nejbližší lidé kolem vás baví o Star Wars, je velká šance, že jste narazili na fanoušky sci-fi.

Gratuluji, právě jste intuitivně použili algoritmus **K-nejbližších sousedů (K-Nearest Neighbors, KNN)**. Je to jeden z nejjednodušších a nejlépe pochopitelných algoritmů strojového učení, založený na prastaré moudrosti: "Vrána k vráně sedá" nebo "Jsi takový, jací jsou tvoji nejbližší přátelé". Dnes si ukážeme, jak tuto myšlenku převést do funkčního kódu a vizualizovat, jak se AI podle ní rozhoduje.

---

## Princip KNN: Hlasování nejbližších

Princip je geniálně jednoduchý a skládá se ze tří kroků:

1.  **Zvol si "K":** Nejdříve se rozhodneme, kolika "sousedů" se budeme ptát na názor. Toto číslo se označuje jako `k`. Pokud `k=1`, ptáme se jen toho úplně nejbližšího. Pokud `k=5`, ptáme se pěti nejbližších.
2.  **Najdi nejbližší sousedy:** Když se objeví nový, neznámý bod (např. nový zákazník, nový květ), změříme jeho vzdálenost ke všem ostatním bodům v našich datech. Nejčastěji se používá **Euklidovská vzdálenost** – délka přímky mezi dvěma body, jak by ji změřilo pravítko.
3.  **Uspořádej hlasování:** Podíváme se na `k` sousedů, které jsme našli. Která kategorie (třída) se mezi nimi vyskytuje nejčastěji? Tuto vítěznou kategorii pak přiřadíme našemu novému bodu.

To je vše! KNN se nemusí nic "učit" dopředu. Celá jeho "inteligence" spočívá v zapamatování si všech trénovacích dat a rychlém výpočtu vzdáleností v momentě, kdy dostane nový dotaz.

---

## Praktický projekt: Klasifikace květin a vizualizace "hranic moci"

Pojďme si KNN vyzkoušet na slavném **Iris datasetu**, který obsahuje měření pro tři druhy kosatců. Pro jednoduchost a možnost 2D vizualizace použijeme jen dva druhy a dvě jejich vlastnosti. Naším cílem bude nejen klasifikovat, ale i **vizualizovat rozhodovací hranici** – tedy mapu, která ukazuje, kde v prostoru končí "území" jednoho druhu a začíná území druhého.

**Krok 1: Příprava prostředí a dat**

```bash
pip install scikit-learn numpy matplotlib
```

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.neighbors import KNeighborsClassifier
from sklearn.datasets import load_iris
from matplotlib.colors import ListedColormap

# 1. Načtení a příprava dat
iris = load_iris()

# Použijeme jen dvě vlastnosti (délka a šířka okvětního lístku) a dva druhy květin
X = iris.data[50:, 2:]  # Bereme jen druhy Versicolor a Virginica
y = iris.target[50:]

# 2. Funkce pro vizualizaci rozhodovací hranice
def vizualizuj_hranici(k):
    # Vytvoření a trénink KNN modelu
    model = KNeighborsClassifier(n_neighbors=k)
    model.fit(X, y)

    # Vytvoření barevné mapy
    cmap_light = ListedColormap(['#FFAAAA', '#AAAAFF']) # Červená a modrá pro pozadí
    cmap_bold = ListedColormap(['#FF0000', '#0000FF'])  # Výrazné barvy pro body

    # Vytvoření mřížky bodů pro celý graf
    x_min, x_max = X[:, 0].min() - 0.5, X[:, 0].max() + 0.5
    y_min, y_max = X[:, 1].min() - 0.5, X[:, 1].max() + 0.5
    xx, yy = np.meshgrid(np.arange(x_min, x_max, 0.02),
                         np.arange(y_min, y_max, 0.02))

    # Predikce pro každý bod v mřížce
    Z = model.predict(np.c_[xx.ravel(), yy.ravel()])
    Z = Z.reshape(xx.shape)

    # Vykreslení grafu
    plt.figure(figsize=(8, 6))
    plt.pcolormesh(xx, yy, Z, cmap=cmap_light, shading='auto')

    # Vykreslení trénovacích bodů
    plt.scatter(X[:, 0], X[:, 1], c=y, cmap=cmap_bold, edgecolor='k', s=40)
    plt.xlim(xx.min(), xx.max())
    plt.ylim(yy.min(), yy.max())
    plt.title(f"Rozhodovací hranice KNN (k = {k})")
    plt.xlabel('Délka okvětního lístku (cm)')
    plt.ylabel('Šířka okvětního lístku (cm)')
    plt.show()
```

**Krok 2: Experiment s hodnotou `k`**

Nyní si vizualizujeme, jak se chování modelu mění s různým počtem sousedů.

```python
# Vizualizace pro k=1 (ptáme se jen nejbližšího souseda)
vizualizuj_hranici(1)
```

**Pozorování pro `k=1`:** Všimněte si, jak je rozhodovací hranice "zubatá" a složitá. Snaží se dokonale obkreslit každý jednotlivý bod. To znamená, že je velmi citlivá na šum a jednotlivé odlehlé body. Říkáme, že se model **přeučuje (overfitting)**.

```python
# Vizualizace pro k=15 (ptáme se 15 sousedů)
vizualizuj_hranici(15)
```

**Pozorování pro `k=15`:** Hranice je nyní mnohem hladší a obecnější. Model už nereaguje na každý osamocený bod, ale dívá se na širší okolí. Jeho rozhodování je robustnější. Pokud bychom ale `k` zvýšili příliš (např. na velikost celé skupiny), model by přestal vnímat lokální rozdíly a stal by se příliš zjednodušujícím (**underfitting**).

---

## Závěr: Umění volby správného "sousedství"

Dnes jste nejen použili KNN, ale i nahlédli do jeho "mysli" tím, že jste vizualizovali jeho rozhodovací hranici. Tento graf je klíčový pro pochopení chování klasifikačních algoritmů.

Naučili jste se, že:

- KNN je jednoduchý a intuitivní algoritmus založený na "hlasování" sousedů.
- Volba parametru `k` je klíčová. Neexistuje jedno správné `k` pro všechny problémy.
- Příliš malé `k` vede k přeučení (model je příliš citlivý na trénovací data).
- Příliš velké `k` vede k podučení (model je příliš zjednodušující a ignoruje lokální struktury).

**Vaše výzva:** Zkuste v našem kódu experimentovat s různými hodnotami `k`. Zkuste `k=3`, `k=7`, `k=25`. Sledujte, jak se rozhodovací hranice postupně vyhlazuje. Která hodnota `k` se vám pro tento dataset zdá nejlepší? Neexistuje správná odpověď, je to o hledání rovnováhy mezi jednoduchostí a přesností.
