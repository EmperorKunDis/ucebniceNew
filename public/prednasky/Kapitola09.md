# Váš první AI projekt: Naučte počítač hrát "Kámen, nůžky, papír"

Dost bylo teorie! V předchozích kapitolách jsme si povídali o tom, co AI je a jak funguje. Dnes nebudeme o AI mluvit – dnes ji společně postavíme. Od úplného začátku až po hotovou webovou aplikaci.

Naším cílem bude vytvořit program, který se pomocí vaší webkamery podívá na vaši ruku a v reálném čase pozná, jestli ukazujete **kámen**, **nůžky**, nebo **papír**. A to nejlepší? Zvládneme to pomocí dvou úžasných a neuvěřitelně jednoduchých nástrojů, které vám ukážou, že tvořit AI může opravdu každý. Jste připraveni stát se tvůrci?

---

## Část 1: Trénink "mozku" aneb Učíme model s Teachable Machine

Každá AI potřebuje mozek – model, který se učí z dat. My si ten náš vytvoříme pomocí nástroje **Teachable Machine** od Googlu. Je to webová aplikace, která vám umožní natrénovat vlastní model pro rozpoznávání obrázků, zvuků nebo póz bez jediného řádku kódu.

**Krok 1: Otevřete Teachable Machine a vytvořte projekt**

1.  Jděte na webovou stránku: [https://teachablemachine.withgoogle.com/](https://teachablemachine.withgoogle.com/)
2.  Klikněte na velké modré tlačítko **"Get Started"**.
3.  Vyberte **"Image Project"** (Obrázkový projekt) a zvolte **"Standard image model"**.

**Krok 2: Sbíráme data (fotíme ruce)**

Nyní uvidíte rozhraní pro tvorbu "tříd" (classes). To jsou kategorie, které chceme, aby naše AI rozpoznávala.

1.  Přejmenujte první třídu "Class 1" na **"Kámen"**. Klikněte na tlačítko **"Webcam"** a nahrajte alespoň 30-40 fotek vaší ruky sevřené v pěst.
    - **PRO TIP:** Hýbejte rukou! Měňte úhel, vzdálenost od kamery, osvětlení. Čím rozmanitější data, tím chytřejší bude váš model.
2.  Klikněte na **"Add a class"**. Novou třídu "Class 2" přejmenujte na **"Nůžky"**. Opět pomocí webkamery nahrajte 30-40 fotek vaší ruky ukazující gesto nůžek.
3.  Přidejte třetí třídu, pojmenujte ji **"Papír"**, a nahrajte 30-40 fotek otevřené dlaně.

**Krok 3: Trénujeme a exportujeme model**

Máme data, teď je čas na trénink!

1.  Uprostřed obrazovky klikněte na tlačítko **"Train Model"**. Proces může pár minut trvat, protože Teachable Machine v cloudu trénuje neuronovou síť na vašich obrázcích. Během tréninku nezavírejte okno prohlížeče!
2.  Jakmile je trénink hotový, v pravé části obrazovky pod oknem "Preview" se aktivuje vaše webkamera. Zkuste před ni dát ruku a ukazovat jednotlivá gesta. Měli byste vidět, jak model v reálném čase správně určuje, co ukazujete!
3.  Funguje to? Skvělé! Teď klikněte na tlačítko **"Export Model"**. Objeví se nové okno. Ujistěte se, že jste na záložce **"Tensorflow.js"** a klikněte na **"Upload my model"**.
4.  Po chvilce se vám vygeneruje unikátní odkaz v sekci "Your sharable link". **TENTO ODKAZ SI ZKOPÍRUJTE!** Je to adresa vašeho natrénovaného modelu, kterou budeme potřebovat v dalším kroku.

---

## 🐍 Python Quick Start: Vše, co potřebujete vědět (15 minut)

Než se pustíme do kódu, pojďme si projít **základy Pythonu**. Pokud jste už Python používali, můžete tuto sekci přeskočit. Pokud ne, věnujte jí pár minut – ukážeme si přesně to, co budete potřebovat pro náš projekt.

### Co je Python a proč ho používáme?

Python je programovací jazyk, který je:

- **Jednoduchý:** Čte se skoro jako angličtina
- **Mocný:** Používá se v AI, web vývoji, data science
- **Populární:** Obrovská komunita a tisíce knihoven

**Analogie:** Pokud je programování jako stavění domu, Python je jako LEGO – jednotlivé kostky (knihovny) už jsou hotové, vy je jen skládáte dohromady.

---

### Základní syntaxe - 5 věcí, které musíte znát

#### 1. **Proměnné** (ukládání hodnot)

```python
# Proměnná je jako krabička s nálepkou
jmeno = "Martin"        # Text (string)
vek = 25                # Číslo (integer)
vyska = 1.75            # Desetinné číslo (float)
je_student = True       # Pravda/Nepravda (boolean)

# Použití proměnné
print(jmeno)            # Vypíše: Martin
print(vek + 5)          # Vypíše: 30
```

**Klíčové:**

- Název proměnné = hodnota
- Python je case-sensitive: `jmeno` ≠ `Jmeno`
- Znak `#` = komentář (Python to ignoruje)

---

#### 2. **Funkce** (znovupoužitelné kousky kódu)

```python
# Definice funkce
def pozdrav(jmeno):
    zprava = f"Ahoj, {jmeno}!"  # f-string = formátování textu
    return zprava

# Zavolání funkce
vysledek = pozdrav("Petra")
print(vysledek)  # Vypíše: Ahoj, Petra!
```

**Klíčové:**

- `def` = definuj funkci
- `(parametry)` = co funkce přijímá
- `return` = co funkce vrací
- **Odsazení (4 mezery) je povinné!** Python pozná, co je "uvnitř" funkce podle odsazení

---

#### 3. **Import knihoven** (použití hotového kódu)

```python
# Import celé knihovny
import numpy

# Import s aliasem (zkratkou)
import numpy as np

# Import konkrétní funkce
from PIL import Image

# Použití
pole = np.array([1, 2, 3])  # Používáme 'np' místo 'numpy'
```

**Co je knihovna?**

- Sbírka hotových funkcí, které někdo jiný napsal
- Příklad: `numpy` = matematické operace, `PIL` = práce s obrázky
- Nemusíte vědět, JAK fungují uvnitř, jen JAK je použít

---

#### 4. **Seznamy** (kolekce věcí)

```python
# Seznam čísel
cisla = [1, 2, 3, 4, 5]

# Seznam textů
ovoce = ["jablko", "hruška", "banán"]

# Přístup k prvkům (indexování od 0!)
prvni = ovoce[0]      # "jablko"
druhe = ovoce[1]      # "hruška"

# Přidání do seznamu
ovoce.append("pomeranč")
```

---

#### 5. **Slovníky** (dvojice klíč-hodnota)

```python
# Slovník = mapa klíč → hodnota
osoba = {
    "jmeno": "Anna",
    "vek": 30,
    "mesto": "Praha"
}

# Přístup
print(osoba["jmeno"])  # Vypíše: Anna

# Přidání nové dvojice
osoba["profese"] = "programátorka"
```

---

### Praktický příklad: Jednoduchá kalkulačka

Pojďme si to vyzkoušet! Otevřete [Google Colab](https://colab.research.google.com) a vytvořte nový notebook:

```python
# Funkce pro sečítání
def secti(a, b):
    return a + b

# Funkce pro násobení
def vynasob(a, b):
    return a * b

# Použití
vysledek1 = secti(5, 3)
vysledek2 = vynasob(4, 7)

print(f"5 + 3 = {vysledek1}")      # Vypíše: 5 + 3 = 8
print(f"4 × 7 = {vysledek2}")      # Vypíše: 4 × 7 = 28
```

**Zkuste si to!** Vytvořte funkci `odecti(a, b)` a `vydel(a, b)`.

---

### Co znamená ten kód v našem projektu?

Teď, když znáte základy, pojďme si rozebrat, CO budeme dělat v našem AI projektu:

```python
import gradio as gr          # Import knihovny pro web UI
import tensorflow as tf      # Import knihovny pro AI modely
```

👆 "Půjč mi nástroje (knihovny), které potřebuji"

```python
MODEL_URL = "https://..."    # Proměnná s adresou modelu
```

👆 "Ulož si adresu, odkud stáhnout mozek naší AI"

```python
def predict(image):          # Funkce, která dostane obrázek
    ...
    return results           # A vrátí predikci
```

👆 "Tady je recept, jak zpracovat obrázek a dostat odpověď"

```python
iface = gr.Interface(...)    # Vytvoření webové aplikace
iface.launch()               # Spuštění aplikace
```

👆 "Postav web stránku a spusť ji"

---

### 💡 Tipy pro úspěch

**1. Když něco nefunguje:**

```python
# Použijte print() pro debugging
print("DEBUG: Tady jsem!")
print(f"DEBUG: Hodnota x = {x}")
```

**2. Odsazení je KRITICKÉ:**

```python
# ŠPATNĚ (chybí odsazení):
def moje_funkce():
print("Ahoj")  # ❌ IndentationError!

# DOBŘE:
def moje_funkce():
    print("Ahoj")  # ✅ 4 mezery odsazení
```

**3. Velká/malá písmena záleží:**

```python
jmeno = "Anna"
print(Jmeno)  # ❌ NameError: 'Jmeno' není definováno
print(jmeno)  # ✅ Vypíše: Anna
```

**4. Závorky a uvozovky párově:**

```python
print("Ahoj")      # ✅
print("Ahoj'       # ❌ Chybí párová uvozovka
secti(1, 2)        # ✅
secti(1, 2         # ❌ Chybí )
```

---

### 🎯 Checkpoint: Jste připraveni?

Než půjdeme dál, zkontrolujte, že rozumíte:

- [ ] Co je proměnná a jak ji vytvořím
- [ ] Co dělá `import` a proč ho používáme
- [ ] Co je funkce a jak vypadá její definice (`def`)
- [ ] Že odsazení (4 mezery) je v Pythonu důležité
- [ ] Jak vypsat hodnotu pomocí `print()`

**Pokud něco není jasné:** Vraťte se k příkladům výše nebo se zeptejte na [Troubleshooting_Guide.md](Troubleshooting_Guide.md).

**Pokud je vše jasné:** Jste připraveni na váš první AI projekt! 🚀

---

## Část 2: Stavba "těla" aneb Tvoříme webovou aplikaci s Gradio

Máme mozek (model), teď mu potřebujeme dát tělo – jednoduché webové rozhraní, kam kdokoli může nahrát obrázek a dostat odpověď. K tomu použijeme úžasnou Python knihovnu **Gradio**.

**Krok 1: Příprava prostředí**

Budeme potřebovat Python a pár knihoven. Otevřete si terminál nebo příkazový řádek.

```bash
# Nainstalujeme potřebné knihovny
pip install gradio tensorflow numpy
```

**Krok 2: Píšeme kód aplikace**

Vytvořte si nový Python soubor (např. `app.py`) a vložte do něj následující kód. Nezapomeňte na jednom místě vložit váš unikátní odkaz z Teachable Machine!

```python
import gradio as gr
import tensorflow as tf
import numpy as np
from PIL import Image
import requests

# Načtení popisků (tříd) z Teachable Machine
# V našem případě to budou "Kámen", "Nůžky", "Papír"
labels_path = "labels.txt" # Tento soubor se stáhne automaticky s modelem

# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
# ZDE VLOŽTE VÁŠ UNIKÁTNÍ ODKAZ Z TEACABLE MACHINE
# Příklad: "https://teachablemachine.withgoogle.com/models/a1b2c3d4/"
MODEL_URL = "ZDE VLOŽTE VÁŠ ODKAZ"
# <<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

# Načtení modelu z cloudu
model_path = tf.keras.utils.get_file(
    'keras_model.h5',
    MODEL_URL + 'model.json',
    cache_dir='.',
    cache_subdir='tm_model'
)
model = tf.keras.models.load_model(model_path, compile=False)

# Načtení popisků
try:
    with open(labels_path, 'r') as f:
        labels = [line.strip().split(' ')[1] for line in f.readlines()]
except FileNotFoundError:
    # Pokud soubor neexistuje, stáhneme ho
    response = requests.get(MODEL_URL + 'labels.txt')
    with open(labels_path, 'wb') as f:
        f.write(response.content)
    with open(labels_path, 'r') as f:
        labels = [line.strip().split(' ')[1] for line in f.readlines()]


def predict(image):
    """Funkce pro předpověď na základě obrázku."""
    # Změna velikosti obrázku na 224x224, jak to vyžaduje model
    image = image.resize((224, 224))

    # Převedení obrázku na pole a normalizace
    image_array = np.asarray(image)
    normalized_image_array = (image_array.astype(np.float32) / 127.0) - 1

    # Příprava dat pro model
    data = np.ndarray(shape=(1, 224, 224, 3), dtype=np.float32)
    data[0] = normalized_image_array

    # Provedení predikce
    prediction = model.predict(data)

    # Formátování výsledku do slovníku {popisek: pravděpodobnost}
    confidence_scores = {labels[i]: float(prediction[0][i]) for i in range(len(labels))}
    return confidence_scores

# Vytvoření a spuštění Gradio rozhraní
iface = gr.Interface(
    fn=predict,
    inputs=gr.Image(type="pil", label="Nahrajte obrázek vaší ruky"),
    outputs=gr.Label(num_top_classes=3, label="Výsledek"),
    title="Detektor Kámen, Nůžky, Papír",
    description="Nahrajte obrázek a AI pozná, jaké gesto ukazujete. Model byl natrénován pomocí Teachable Machine."
)

# Spuštění aplikace
iface.launch()
```

**Krok 3: Spuštění vaší AI aplikace**

1.  Uložte soubor `app.py`.
2.  V terminálu spusťte příkaz: `python app.py`
3.  V terminálu se objeví adresa, pravděpodobně `http://127.0.0.1:7860`. Otevřete ji v prohlížeči.

A je to! Právě se díváte na svou vlastní, plně funkční webovou aplikaci s umělou inteligencí. Zkuste nahrát obrázek své ruky a sledujte, jak model pracuje.

---

## Závěr: Z konzumenta tvůrcem

Gratuluji! Dnes jste prošli celým procesem tvorby AI produktu:

1.  **Definovali jste problém** (rozpoznávání gest).
2.  **Nasbírali a připravili jste data** (fotky vaší ruky).
3.  **Natrénovali jste model** (mozek naší AI).
4.  **Vytvořili jste aplikaci** (tělo naší AI) a nasadili ji.

Uvědomili jste si, že AI není jen něco, co používáte, ale něco, co můžete sami tvořit. Nástroje jako Teachable Machine a Gradio demokratizují přístup k AI a umožňují komukoli proměnit nápad v realitu. Co postavíte příště? Klasifikátor druhů ovoce? Detektor úsměvu? Rozpoznávač psích plemen? Možnosti jsou nekonečné a teď už víte, jak na to.
