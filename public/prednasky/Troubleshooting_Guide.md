# 🔧 Průvodce řešením problémů

## Troubleshooting Guide pro AI Kurz

**Verze:** 1.0
**Poslední aktualizace:** 2025-10-26

---

## 📖 O tomto průvodci

Tento dokument vám pomůže vyřešit nejčastější problémy, se kterými se studenti setkávají během kurzu. Problémy jsou rozděleny do kategorií:

1. 🐍 **Python a instalace**
2. 📓 **Google Colab**
3. 📦 **Knihovny a závislosti**
4. 🤖 **ML modely a trénink**
5. 🌐 **Webové aplikace (Gradio)**
6. 💾 **Data a soubory**

**Jak používat tento průvodce:**

1. Najděte kategorii vašeho problému
2. Použijte vyhledávání (Ctrl+F / Cmd+F) pro konkrétní chybovou hlášku
3. Následujte krok-za-krokem řešení

---

## 🐍 SEKCE 1: Python a instalace

### Problém 1.1: `python: command not found`

**Příznaky:**

```bash
$ python app.py
bash: python: command not found
```

**Příčina:** Python není nainstalován nebo není v PATH

**Řešení:**

**macOS/Linux:**

```bash
# Zkuste python3 místo python
python3 app.py

# Nebo vytvořte alias
echo "alias python=python3" >> ~/.bashrc
source ~/.bashrc
```

**Windows:**

1. Stáhněte Python z [python.org](https://python.org/downloads)
2. **DŮLEŽITÉ:** Při instalaci zaškrtněte "Add Python to PATH"!
3. Restartujte terminál
4. Ověřte: `python --version`

---

### Problém 1.2: `pip: command not found`

**Příznaky:**

```bash
$ pip install gradio
bash: pip: command not found
```

**Řešení:**

```bash
# Zkuste pip3
pip3 install gradio

# Nebo použijte python -m pip
python -m pip install gradio

# Na macOS, pokud máte Homebrew:
brew install python
```

---

### Problém 1.3: `IndentationError: unexpected indent`

**Příznaky:**

```python
  File "app.py", line 12
    print("Hello")
    ^
IndentationError: unexpected indent
```

**Příčina:** Python je citlivý na odsazení (indentaci). Mícháte taby a mezery.

**Řešení:**

1. **Používejte POUZE mezery** (ne taby)
2. **Konzistentní odsazení:** Vždy 4 mezery

**VS Code nastavení:**

```json
{
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  "editor.detectIndentation": false
}
```

**Rychlá oprava:**

```python
# ŠPATNĚ (mix taby a mezery):
def my_function():
    print("První řádek")  # 4 mezery
	print("Druhý řádek")  # TAB - ❌ CHYBA!

# SPRÁVNĚ:
def my_function():
    print("První řádek")  # 4 mezery
    print("Druhý řádek")  # 4 mezery ✅
```

---

### Problém 1.4: Python verze je příliš stará

**Příznaky:**

```
ERROR: This package requires Python 3.7+
You are using Python 3.6.8
```

**Řešení:**

**macOS (Homebrew):**

```bash
brew install python@3.11
echo 'export PATH="/usr/local/opt/python@3.11/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
python3 --version  # Mělo by zobrazit 3.11+
```

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install python3.11
python3.11 --version
```

**Windows:**

- Stáhněte nejnovější Python z python.org
- Odinstalujte starou verzi
- Nainstalujte novou (zaškrtněte "Add to PATH")

---

## 📓 SEKCE 2: Google Colab

### Problém 2.1: Notebook se neustále odpojuje

**Příznaky:** "Reconnecting..." každých 5-10 minut

**Příčiny & Řešení:**

**1. Neaktivita:**

- Colab odpojí po 90 minutách neaktivity
- **Řešení:** Spusťte jednoduchý script, který kliká každých 60s:

```javascript
// Vložte do konzole prohlížeče (F12 → Console)
function KeepAlive() {
  console.log('Keeping Colab alive')
  document.querySelector('colab-connect-button').click()
}
setInterval(KeepAlive, 60000) // Každou minutu
```

**2. Překročení limitu:**

- Free tier má limit GPU/RAM
- **Řešení:** Použijte Colab Pro ($10/měsíc) nebo restartujte runtime

---

### Problém 2.2: `Runtime disconnected: Connection lost`

**Řešení:**

1. **Uložte práci!** (File → Download .ipynb)
2. Klikněte **"Reconnect"**
3. Znovu spusťte buňky (Runtime → Run all)

**Prevence:**

```python
# Na začátku notebooku:
from google.colab import drive
drive.mount('/content/drive')

# Ukládejte důležité výsledky do Drive:
results.to_csv('/content/drive/MyDrive/results.csv')
```

---

### Problém 2.3: `ModuleNotFoundError` v Colabu

**Příznaky:**

```python
ModuleNotFoundError: No module named 'gradio'
```

**Řešení:**

```python
# V nové buňce na začátku notebooku:
!pip install gradio tensorflow numpy pandas matplotlib

# Pak restartujte runtime:
# Runtime → Restart runtime

# A znovu spusťte import:
import gradio as gr
```

**Poznámka:** Colab má předinstalované TensorFlow, NumPy, Pandas, Matplotlib. Stačí importovat!

---

## 📦 SEKCE 3: Knihovny a závislosti

### Problém 3.1: `No module named 'tensorflow'`

**Příznaky:**

```python
ImportError: No module named 'tensorflow'
```

**Řešení:**

**Základní instalace:**

```bash
pip install tensorflow
```

**Pokud máte GPU (NVIDIA):**

```bash
pip install tensorflow-gpu
```

**Pokud chcete jen CPU (menší):**

```bash
pip install tensorflow-cpu
```

**Ověření:**

```python
import tensorflow as tf
print(tf.__version__)  # Mělo by vypsat např. 2.15.0
```

---

### Problém 3.2: `ERROR: Could not find a version that satisfies the requirement`

**Příznaky:**

```bash
ERROR: Could not find a version that satisfies the requirement gradio==5.0
```

**Příčina:** Verze neexistuje nebo není kompatibilní s vaší Python verzí

**Řešení:**

**1. Naistalujte nejnovější verzi (bez čísla):**

```bash
pip install gradio
```

**2. Zkontrolujte dostupné verze:**

```bash
pip index versions gradio
```

**3. Nainstalujte kompatibilní verzi:**

```bash
# Např. pokud máte Python 3.7:
pip install gradio>=3.0,<4.0
```

---

### Problém 3.3: Konflikty závislostí

**Příznaky:**

```
ERROR: package-a requires numpy>=1.20, but you have numpy 1.19
ERROR: package-b requires numpy<1.20, but you need 1.20+
```

**Řešení:**

**1. Použijte virtuální prostředí (doporučeno!):**

```bash
# Vytvořte čisté prostředí
python -m venv projekt_env
source projekt_env/bin/activate  # Windows: projekt_env\Scripts\activate

# Nainstalujte závislosti
pip install -r requirements.txt
```

**2. Aktualizujte všechny balíčky:**

```bash
pip install --upgrade pip
pip install --upgrade numpy tensorflow gradio
```

**3. Použijte `requirements.txt` z projektu:**

```bash
pip install -r requirements.txt --force-reinstall
```

---

## 🤖 SEKCE 4: ML modely a trénink

### Problém 4.1: Model má nízkou přesnost (< 70%)

**Příznaky:** Model predikuje náhodně nebo vždy stejnou třídu

**Možné příčiny a řešení:**

**1. Příliš málo trénovacích dat:**

```python
# ŠPATNĚ: 10 vzorků celkem
features = [[1, 2], [2, 3], [3, 4], ...]  # Jen 10 řádků

# DOBŘE: Min. 30-50 vzorků NA TŘÍDU
features = [[...], [...], ...]  # 150+ řádků pro 3 třídy
```

**2. Nerozmanit á data (vše podobné):**

```python
# ŠPATNĚ: Všechny fotky ze stejného úhlu v Teachable Machine

# DOBŘE:
# - Různé úhly (zleva, zprava, shora)
# - Různé osvětlení
# - Různá pozadí
```

**3. Chybějící normalizace:**

```python
# ŠPATNĚ: Mix různých škál
features = [[1000, 0.5], [2000, 0.8]]  # První feature >> druhý

# DOBŘE: Normalizujte
from sklearn.preprocessing import MinMaxScaler
scaler = MinMaxScaler()
features_normalized = scaler.fit_transform(features)
```

**4. Overfitting (přeučení):**

```python
# Symptom: Train accuracy = 99%, Test accuracy = 60%

# Řešení:
from sklearn.model_selection import train_test_split

# Rozdělte data na train/test
X_train, X_test, y_train, y_test = train_test_split(
    features, labels, test_size=0.2, random_state=42
)

# Trénujte POUZE na train
model.fit(X_train, y_train)

# Vyhodnoťte na test
score = model.score(X_test, y_test)
print(f"Test accuracy: {score}")
```

---

### Problém 4.2: `ValueError: could not convert string to float`

**Příznaky:**

```python
ValueError: could not convert string to float: 'Kámen'
```

**Příčina:** Zapomněli jste převést kategorie na čísla

**Řešení:**

```python
# ŠPATNĚ:
labels = ["Kámen", "Nůžky", "Papír"]  # Strings ❌

# DOBŘE:
labels = [0, 1, 2]  # Čísla ✅

# Pokud máte stringy, použijte LabelEncoder:
from sklearn.preprocessing import LabelEncoder

text_labels = ["Kámen", "Nůžky", "Papír", "Kámen"]
encoder = LabelEncoder()
numeric_labels = encoder.fit_transform(text_labels)
# Výsledek: [0, 1, 2, 0]
```

---

### Problém 4.3: Teachable Machine URL nefunguje

**Příznaky:**

```python
OSError: Unable to open file (file signature not found)
```

**Řešení:**

**1. Zkontrolujte URL:**

```python
# ŠPATNĚ:
MODEL_URL = "https://teachablemachine.withgoogle.com/models/ABC123"  # Chybí /

# SPRÁVNĚ:
MODEL_URL = "https://teachablemachine.withgoogle.com/models/ABC123/"  # Končí /
```

**2. Ověřte, že model je uploadnutý:**

- Vraťte se do Teachable Machine
- Klikněte "Export Model"
- **"Upload my model"** (ne "Download")
- Zkopírujte nové URL

**3. Zkuste přímé načtení:**

```python
# Alternativa: Stáhněte model lokálně
# V Teachable Machine: Export → Download
# Pak:
model = tf.keras.models.load_model('my_model.h5')
```

---

## 🌐 SEKCE 5: Webové aplikace (Gradio)

### Problém 5.1: `OSError: [Errno 48] Address already in use`

**Příznaky:**

```
OSError: [Errno 48] Address already in use: Port 7860
```

**Příčina:** Port 7860 už používá jiná aplikace

**Řešení:**

**1. Změňte port:**

```python
interface.launch(server_port=7861)  # Zkuste jiný port
```

**2. Zastavte předchozí proces:**

**macOS/Linux:**

```bash
# Najděte proces na portu 7860
lsof -ti:7860

# Zastavte ho
kill -9 $(lsof -ti:7860)
```

**Windows:**

```cmd
# Najděte PID na portu 7860
netstat -ano | findstr :7860

# Zastavte proces (nahraďte PID číslem z předchozího příkazu)
taskkill /PID <PID> /F
```

---

### Problém 5.2: Gradio aplikace se spustí, ale nejde otevřít v prohlížeči

**Příznaky:**

```
Running on local URL:  http://127.0.0.1:7860
(Ale prohlížeč zobrazí "Connection refused")
```

**Řešení:**

**1. Zkuste všechny varianty URL:**

- `http://localhost:7860`
- `http://127.0.0.1:7860`
- `http://0.0.0.0:7860`

**2. Zkontrolujte firewall:**

```bash
# macOS: Povolte Python v Security & Privacy → Firewall

# Windows:
# Control Panel → Windows Defender Firewall → Allow an app
# Najděte Python.exe a zaškrtněte
```

**3. Použijte share link:**

```python
interface.launch(share=True)  # Vytvoří veřejný link
```

---

### Problém 5.3: `TypeError: 'NoneType' object is not callable`

**Příznaky:**

```python
TypeError: 'NoneType' object is not callable
```

**Příčina:** Funkce v `fn=` vrací `None` místo výsledku

**Řešení:**

```python
# ŠPATNĚ:
def predict(image):
    result = model.predict(image)
    # Zapomněli return ❌

# DOBŘE:
def predict(image):
    result = model.predict(image)
    return result  # ✅
```

---

## 💾 SEKCE 6: Data a soubory

### Problém 6.1: `FileNotFoundError: [Errno 2] No such file or directory`

**Příznaky:**

```python
FileNotFoundError: [Errno 2] No such file or directory: 'data.csv'
```

**Řešení:**

**1. Použijte absolutní cestu:**

```python
# ŠPATNĚ:
df = pd.read_csv('data.csv')  # Relativní cesta

# DOBŘE:
import os
current_dir = os.path.dirname(__file__)
data_path = os.path.join(current_dir, 'data.csv')
df = pd.read_csv(data_path)
```

**2. Ověřte, že soubor existuje:**

```python
import os
print(os.listdir('.'))  # Vypíše všechny soubory v aktuální složce
print(os.path.exists('data.csv'))  # True/False
```

**3. Zkontrolujte working directory:**

```python
import os
print(os.getcwd())  # Aktuální složka
os.chdir('/path/to/project')  # Změňte na správnou
```

---

### Problém 6.2: Chyba při načítání obrázku

**Příznaky:**

```python
PIL.UnidentifiedImageError: cannot identify image file
```

**Řešení:**

**1. Zkontrolujte formát:**

```python
# Podporované: JPEG, PNG, BMP, GIF
# Nepodporované: HEIC (iPhone), WebP (někdy)

# Konverze:
from PIL import Image
img = Image.open('photo.heic')  # Může selhat
img = img.convert('RGB')
img.save('photo.jpg')
```

**2. Zkontrolujte, že soubor není poškozený:**

```python
from PIL import Image
try:
    img = Image.open('photo.jpg')
    img.verify()  # Zkontroluje integritu
    print("Obrázek je OK")
except:
    print("Obrázek je poškozený!")
```

---

## 🆘 Obecné debugging tipy

### Tip 1: Print Debugging

**Nejjednodušší debugging technika:**

```python
def my_function(x):
    print(f"DEBUG: Input = {x}")  # Co dostávám?
    result = x * 2
    print(f"DEBUG: Result = {result}")  # Co vracím?
    return result
```

### Tip 2: Type Checking

```python
# Zkontrolujte, co vlastně máte:
print(type(data))  # <class 'list'> nebo <class 'numpy.ndarray'>?
print(data.shape)  # (100, 2) - rozměr dat
print(len(data))   # 100 - délka
```

### Tip 3: Postupné testování

```python
# ŠPATNĚ: Napsat 100 řádků a pak spustit
# (pak nevíte, kde je chyba)

# DOBŘE: Testujte po každých 5-10 řádcích
# 1. Načtení dat
data = load_data()
print("Data loaded:", data.shape)  # ✅ Funguje?

# 2. Preprocessing
data_clean = preprocess(data)
print("Data cleaned:", data_clean.shape)  # ✅ Funguje?

# atd...
```

---

## 📞 Kde hledat další pomoc?

### 1. Oficiální dokumentace

- **Python:** https://docs.python.org/3/
- **TensorFlow:** https://tensorflow.org/api_docs
- **Gradio:** https://gradio.app/docs
- **Pandas:** https://pandas.pydata.org/docs/

### 2. Stack Overflow

```
Formulace otázky:
1. Jaký je váš cíl?
2. Co jste zkoušeli?
3. Jakou chybu dostáváte? (celý traceback)
4. Minimální reprodukovatelný příklad (10-20 řádků)
```

### 3. AI Asistenti

- **ChatGPT:** Popište problém, vložte chybovou hlášku
- **Claude:** Podobně jako ChatGPT
- **GitHub Copilot:** Automatické návrhy kódu

### 4. Komunita kurzu

- Discord: [link]
- GitHub Issues: [link]
- Email: support@aicurz.cz

---

## ✅ Checklist před žádostí o pomoc

Než se zeptáte na pomoc, zkontrolujte:

- [ ] Přečetl/a jsem chybovou hlášku celou (ne jen první řádek)
- [ ] Googl(ov)al/a jsem chybovou hlášku
- [ ] Zkontroloval/a jsem tento Troubleshooting Guide
- [ ] Zkusil/a jsem restartovat (Python, Colab, počítač)
- [ ] Mám aktuální verze knihoven (`pip install --upgrade ...`)
- [ ] Umím problém reprodukovat (opakuje se pokaždé)
- [ ] Mám minimální příklad kódu, který chybu vyvolává

**Když žádáte o pomoc, uveďte:**

1. **Co se snažíte udělat?** (cíl)
2. **Co se děje?** (chybová hláška + screenshot)
3. **Co jste zkoušeli?** (jaké kroky řešení)
4. **Váš kód** (minimální reprodukovatelný příklad)
5. **Prostředí** (Python verze, OS, knihovny)

---

**Hodně štěstí s debugováním! 🐛→🦋**

_"Debugging is twice as hard as writing the code in the first place." - Brian Kernighan_
