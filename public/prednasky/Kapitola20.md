# Klasifikace v praxi: Naučte AI rozpoznávat obrázky

Představte si, že jste digitální biolog, který dostal krabici s 50 000 fotkami. Jsou na nich žáby, koně, lodě, letadla, a vaším úkolem je vytvořit systém, který je dokáže automaticky roztřídit. Jak byste na to šli? Neučili byste se každou fotku nazpaměť. Hledali byste vzory – "letadla mají křídla a modré pozadí", "žáby jsou zelené a mají velké oči".

Přesně to dnes naučíme náš model umělé inteligence. Projdeme si kompletní proces od "chaotické krabice fotek" až po funkční klasifikátor obrázků. Použijeme k tomu slavný dataset **CIFAR-10** a ukážeme si standardní postup každého datového vědce: **příprava dat, trénink modelu a jeho vyhodnocení.**

---

## Krok 1: Příprava dat – Úklid před příchodem hostů

Než může AI začít "přemýšlet", musíme jí připravit data v jazyce, kterému rozumí. Je to jako úklid a organizace poznámek před velkou zkouškou.

**Načtení dat:** Použijeme dataset CIFAR-10, který je naštěstí součástí knihovny Keras (součást TensorFlow), takže jeho načtení je velmi snadné.

**Normalizace:** Počítač vidí obrázek jako mřížku čísel od 0 do 255, kde každé číslo představuje jas jednoho barevného kanálu (červená, zelená, modrá). Pro modely strojového učení je mnohem lepší, když jsou všechna čísla v malém rozsahu, typicky od 0 do 1. Tento proces se nazývá **normalizace**. Je to jako převádět všechny měny na dolary, než je začnete porovnávat.

**Zploštění (Flattening):** Jednoduché modely si neumí poradit s 2D obrázkem. Musíme pro ně obrázek "natáhnout" do jednoho dlouhého řádku čísel. Obrázek 32x32 pixelů se 3 barevnými kanály se tak stane jedním vektorem o délce 32 _ 32 _ 3 = 3072 čísel.

Pojďme si to ukázat v kódu.

```bash
pip install tensorflow scikit-learn matplotlib
```

```python
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.datasets import cifar10
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# 1. Načtení dat
(x_train, y_train), (x_test, y_test) = cifar10.load_data()

# Názvy kategorií v datasetu CIFAR-10
kategorie = ['letadlo', 'auto', 'pták', 'kočka', 'jelen', 'pes', 'žába', 'kůň', 'loď', 'kamion']

# Ukázka několika obrázků
plt.figure(figsize=(10, 4))
for i in range(5):
    plt.subplot(1, 5, i + 1)
    plt.imshow(x_train[i])
    plt.title(kategorie[y_train[i][0]])
    plt.axis('off')
plt.suptitle("Ukázka obrázků z datasetu CIFAR-10")
plt.show()

# 2. Příprava dat
# Normalizace - převedeme hodnoty pixelů z 0-255 na 0-1
x_train_norm = x_train.astype('float32') / 255.0
x_test_norm = x_test.astype('float32') / 255.0

# Zploštění obrázků do jednoho vektoru
# Původní rozměr: (50000, 32, 32, 3) -> Nový rozměr: (50000, 3072)
nsamples, nx, ny, nrgb = x_train_norm.shape
x_train_flat = x_train_norm.reshape((nsamples, nx * ny * nrgb))

nsamples_test, nx_test, ny_test, nrgb_test = x_test_norm.shape
x_test_flat = x_test_norm.reshape((nsamples_test, nx_test * ny_test * nrgb_test))

# Zploštění popisků (y) z 2D na 1D pole
y_train_flat = y_train.flatten()
y_test_flat = y_test.flatten()

print(f"Původní rozměr trénovacích dat: {x_train.shape}")
print(f"Nový rozměr zploštěných dat: {x_train_flat.shape}")
```

---

## Krok 2: Trénování modelu – Učení se vzorům

Nyní, když máme data připravená, můžeme na nich natrénovat náš první klasifikační model. Použijeme **Logistickou Regresi**, což je jednoduchý, rychlý a dobře interpretovatelný model. Je to základní stavební kámen pro mnoho složitějších úloh.

Model se bude dívat na tisíce "zploštěných" obrázků a jejich správných kategorií a snažit se najít matematické vztahy mezi hodnotami pixelů a tím, zda je na obrázku pes, auto nebo loď.

```python
# Pro urychlení použijeme jen část dat (např. 10 000 obrázků)
# Trénink na všech 50 000 by trval déle.
X_subset = x_train_flat[:10000]
y_subset = y_train_flat[:10000]

# 3. Trénování modelu
print("\nTrénuji model Logistické Regrese...")
model = LogisticRegression(max_iter=100) # max_iter omezuje dobu tréninku
model.fit(X_subset, y_subset)
print("Model úspěšně natrénován!")
```

---

## Krok 3: Testování a vyhodnocení – Zkouška z dospělosti

Náš model se naučil, co mohl, z trénovacích dat. Ale umí to použít i na obrázky, které nikdy neviděl? To zjistíme pomocí testovací sady.

- **Přesnost (Accuracy):** Jednoduchá metrika, která říká, kolik procent obrázků model zařadil správně.
- **Classification Report:** Detailnější pohled, který nám ukáže, jak si model vedl v každé jednotlivé kategorii. Řekne nám, které kategorie plete dohromady (např. kočky a psy).

```python
# 4. Testování a vyhodnocení
print("\nTestuji model na neviděných datech...")
predictions = model.predict(x_test_flat)

accuracy = accuracy_score(y_test_flat, predictions)
print(f"\nCelková přesnost modelu: {accuracy * 100:.2f}%")

print("\nDetailní report klasifikace:")
print(classification_report(y_test_flat, predictions, target_names=kategorie))

# Vizualizace několika predikcí
plt.figure(figsize=(12, 8))
for i in range(10):
    plt.subplot(2, 5, i + 1)
    plt.imshow(x_test[i])
    skutecna_kategorie = kategorie[y_test_flat[i]]
    predikovana_kategorie = kategorie[predictions[i]]
    barva = 'green' if skutecna_kategorie == predikovana_kategorie else 'red'
    plt.title(f"Skutečnost: {skutecna_kategorie}\nPredikce: {predikovana_kategorie}", color=barva)
    plt.axis('off')
plt.suptitle("Ukázka predikcí na testovacích datech")
plt.tight_layout()
plt.show()
```

**Interpretace výsledků:** Uvidíte, že přesnost se pohybuje kolem 30-40 %. To se může zdát málo, ale uvědomte si, že náhodné hádání by mělo přesnost jen 10 % (protože je 10 kategorií). Náš jednoduchý model se tedy rozhodně něco naučil! Detailní report vám pak ukáže, že některé kategorie (jako 'auto' nebo 'loď') rozpoznává lépe než jiné (často plete 'kočka' a 'pes').

---

## Závěr: První krok do světa počítačového vidění

Gratuluji! Právě jste natrénovali svůj první model na rozpoznávání obrázků, jeden ze základních kamenů moderní AI. Prošli jste si kompletním a realistickým procesem, kterým prochází každý datový vědec:

1.  Načetli a prozkoumali jste data.
2.  Připravili jste je pro model (normalizace, zploštění).
3.  Natrénovali jste model.
4.  Vyhodnotili jste jeho výkon na neviděných datech.

Nízká přesnost není selhání, je to realistický výchozí bod. Cesta k lepším výsledkům (přes 90 %) vede přes pokročilejší modely, zejména **konvoluční neuronové sítě (CNN)**, které jsou navrženy speciálně pro práci s obrázky a kterým se budeme věnovat v dalších částech kurzu.

**Vaše výzva:** Zkuste v kódu použít jiný jednoduchý klasifikátor ze Scikit-learn. Nahraďte `LogisticRegression()` například za `KNeighborsClassifier()`. Zlepší se, nebo zhorší přesnost?
