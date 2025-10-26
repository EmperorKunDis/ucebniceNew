# Konvoluce: Jak se AI naučila "vidět" svět jako člověk

Až dosud naše neuronové sítě "viděly" obrázek jako jeden dlouhý, nesmyslný seznam čísel. Ztratily veškeré prostorové informace a nevěděly, které pixely jsou vedle sebe. Bylo to jako číst knihu, kde jsou všechna písmena vysypaná na jednu hromadu.

Dnes to změníme. Naučíme AI dívat se na obrázky tak, jako se dívá náš mozek: pomocí "detektorů", které hledají jednoduché tvary a vzory. Představte si, že máte speciální lupu, která se jasně rozzáří, kdykoliv najde svislou čáru. Co kdybyste touto lupou systematicky přejeli po celém obrázku? Získali byste novou, "mapu" všech svislých hran v obraze.

Gratuluji, právě jste objevili princip **konvoluce**. Je to základní operace, která pohání celé moderní počítačové vidění.

---

## Co je to konvoluce? Lupa na vzory

Konvoluce je matematická operace, kde malou matici čísel, zvanou **filtr** nebo **kernel**, "posouváme" přes velký obrázek. V každém kroku:

1.  Překryjeme část obrázku naším filtrem.
2.  Vynásobíme odpovídající si čísla (pixel filtru \* pixel obrázku).
3.  Všechny tyto součiny sečteme.
4.  Výsledné jediné číslo zapíšeme do nového obrázku (tzv. **mapa příznaků** nebo feature map).

Tento proces opakujeme pro celý obrázek. Různé filtry hledají různé vzory. Jeden filtr může být "detektor hran", jiný "detektor rohů", další "detektor zelené barvy".

Pojďme si to ukázat na mini-příkladu. Máme jednoduchý obrázek 5x5 a filtr 3x3 pro detekci svislé hrany.

```python
import numpy as np
import matplotlib.pyplot as plt

# Jednoduchý obrázek (svislá čára uprostřed)
obrazek = np.array([
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]
])

# Filtr pro detekci svislé hrany
filtr = np.array([
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1]
])

# Vizualizace
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(8, 4))
ax1.imshow(obrazek, cmap='gray')
ax1.set_title('Původní obrázek')
ax2.imshow(filtr, cmap='gray')
ax2.set_title('Filtr (Detektor svislé hrany)')
plt.show()
```

Když bychom tento filtr posunuli přes obrázek, nejvyšší hodnoty v nové mapě by byly přesně tam, kde se v obrázku nachází svislá čára. Filtr by ji "našel".

---

## Praktický projekt: Úprava fotek pomocí konvolučních filtrů

Teď si to vyzkoušíme na reálném obrázku. Použijeme knihovny `scikit-image` pro obrázek a `scipy` pro provedení konvoluce.

**Krok 1: Příprava prostředí a dat**

```bash
pip install numpy matplotlib scikit-image scipy
```

**Krok 2: Načtení obrázku a definice filtrů**

Budeme aplikovat několik slavných filtrů a sledovat, co s obrázkem udělají.

```python
import numpy as np
import matplotlib.pyplot as plt
from skimage import data
from skimage.color import rgb2gray
from scipy.signal import convolve2d

# Načtení a příprava obrázku
obrazek_rgb = data.camera() # Načteme slavný obrázek "kameramana"
obrazek_gray = rgb2gray(obrazek_rgb)

# Definice několika 3x3 filtrů (kernelů)
sharpen_filtr = np.array([
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0]
])

horizontal_edge_filtr = np.array([
    [1, 1, 1],
    [0, 0, 0],
    [-1, -1, -1]
])

vertical_edge_filtr = np.array([
    [1, 0, -1],
    [1, 0, -1],
    [1, 0, -1]
])

blur_filtr = np.array([
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1]
]) / 9.0 # Dělení 9 je pro normalizaci, aby obrázek nezesvětlal
```

**Krok 3: Aplikace filtrů a vizualizace**

Nyní aplikujeme každý filtr na náš obrázek a vykreslíme výsledky vedle sebe.

```python
# Aplikace konvoluce pro každý filtr
sharpen_img = convolve2d(obrazek_gray, sharpen_filtr, mode='same', boundary='symm')
horizontal_edge_img = convolve2d(obrazek_gray, horizontal_edge_filtr, mode='same', boundary='symm')
vertical_edge_img = convolve2d(obrazek_gray, vertical_edge_filtr, mode='same', boundary='symm')
blur_img = convolve2d(obrazek_gray, blur_filtr, mode='same', boundary='symm')

# Vytvoření mřížky pro zobrazení výsledků
fig, axes = plt.subplots(nrows=2, ncols=2, figsize=(10, 10))
axes[0, 0].imshow(sharpen_img, cmap='gray')
axes[0, 0].set_title('Zaostření (Sharpen)')

axes[0, 1].imshow(horizontal_edge_img, cmap='gray')
axes[0, 1].set_title('Detekce horizontálních hran')

axes[1, 0].imshow(vertical_edge_img, cmap='gray')
axes[1, 0].set_title('Detekce svislých hran')

axes[1, 1].imshow(blur_img, cmap='gray')
axes[1, 1].set_title('Rozmazání (Blur)')

for ax in axes.flat:
    ax.axis('off')

plt.show()
```

**Co jsme se dozvěděli?** Na vlastní oči vidíte, jak různé malé matice čísel (filtry) dokáží z obrázku "vytáhnout" úplně jiné informace. Detektory hran našly kontury, zaostřovací filtr zvýraznil detaily a rozmazávací filtr je zprůměroval.

---

## Konvoluční neuronové sítě (CNN): Když se filtry učí samy

A teď to nejdůležitější: Co je **Konvoluční neuronová síť (CNN)**?

Je to speciální typ neuronové sítě, která místo plně propojených vrstev používá **konvoluční vrstvy**. A kouzlo je v tom, že hodnoty v těchto filtrech nejsou pevně dané! Síť se je **učí sama** během tréninku pomocí zpětné propagace.

- První vrstvy se naučí jednoduché filtry (detektory hran, barev, textur).
- Další vrstvy berou mapy příznaků z prvních vrstev a učí se na nich složitější filtry (detektory očí, nosů, uší).
- Ještě hlubší vrstvy pak kombinují tyto části a učí se filtry na celé obličeje, postavy psů nebo tvary aut.

CNN se tak automaticky a hierarchicky učí, jaké vizuální vzory jsou pro daný úkol důležité. Proto jsou dnes absolutním králem v oblasti počítačového vidění.

---

## Závěr: Vidět svět v příznacích

Dnes jste nahlédli do srdce moderního počítačového vidění. Pochopili jste, že konvoluce je proces "hledání vzorů" pomocí malých detektorů (filtrů) a že CNN je hierarchie těchto detektorů, které se navíc učí automaticky.

Tento princip umožnil obrovský průlom v rozpoznávání objektů, samořídících autech, lékařské diagnostice a mnoha dalších oborech.

**Vaše výzva:** Zkuste si v našem kódu vytvořit a aplikovat vlastní 3x3 filtr. Co se stane, když dáte vysoké číslo doprostřed a záporná čísla do rohů? Nebo co když vytvoříte filtr pro detekci diagonálních hran? Experimentujte a staňte se digitálním umělcem, který "maluje" pomocí matematiky.
