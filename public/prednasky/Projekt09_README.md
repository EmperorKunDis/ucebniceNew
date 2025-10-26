# 🎮 AI Rozpoznávač: Kámen, Nůžky, Papír

**Váš první kompletní AI projekt - od nuly po funkční webovou aplikaci!**

![Status](https://img.shields.io/badge/status-ready-green) ![Python](https://img.shields.io/badge/python-3.7%2B-blue) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📖 O Projektu

Tento projekt je součástí **Kapitoly 9** AI kurzu. Naučíte se:

- ✅ Natrénovat vlastní AI model (bez jediného řádku kódu!)
- ✅ Vytvořit webovou aplikaci v Pythonu
- ✅ Pochopíte celý ML pipeline: data → trénink → inference → UI

**Výsledek:** Funkční web app, která rozpozná vaše gesto z fotky během 2 sekund s přesností > 85%!

---

## 🚀 Quick Start (5 minut)

### Krok 1: Natrénujte model (2 min)

1. Otevřete [Teachable Machine](https://teachablemachine.withgoogle.com/)
2. Klikněte **"Get Started"** → **"Image Project"** → **"Standard"**
3. Vytvoř

te 3 třídy:

- **Kámen** - vyfotit zavřenou pěst (30+ fotek)
- **Nůžky** - vyfotit gesto nůžky (30+ fotek)
- **Papír** - vyfotit otevřenou dlaň (30+ fotek)

4. Klikněte **"Train Model"** (počkejte 2-5 min)
5. Klikněte **"Export Model"** → **"Upload my model"**
6. **Zkopírujte URL** (něco jako `https://teachablemachine.withgoogle.com/models/ABC123/`)

### Krok 2: Stáhněte a nastavte projekt (2 min)

```bash
# 1. Stáhněte nebo naklonujte tento projekt
git clone https://github.com/YOUR_REPO/ai-rock-paper-scissors.git
cd ai-rock-paper-scissors

# 2. Vytvořte virtuální prostředí (doporučeno)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Nainstalujte závislosti
pip install -r requirements.txt
```

### Krok 3: Vložte své URL a spusťte (1 min)

Otevřete `app.py` a na řádku ~69 vložte svůj model URL:

```python
MODEL_URL = "https://teachablemachine.withgoogle.com/models/YOUR_ID_HERE/"
```

Spusťte aplikaci:

```bash
python app.py
```

Otevřete prohlížeč: **http://localhost:7860**

🎉 **HOTOVO!** Nahrajte fotku ruky a uvidíte predikci!

---

## 📋 Požadavky

### Software

- **Python 3.7+** ([stáhnout](https://www.python.org/downloads/))
- **Webový prohlížeč** (Chrome, Firefox, Safari)
- **Webkamera** (pro trénink modelu v Teachable Machine)

###硬件 Requirements

- **RAM:** 2 GB minimum (4 GB doporučeno)
- **Disk:** 500 MB volného místa
- **Internet:** Pouze při prvním spuštění (stahování závislostí a modelu)

---

## 📦 Instalace (Detailní návod)

### Varianta A: S Git

```bash
# Klonovat repozitář
git clone https://github.com/YOUR_USERNAME/ai-rock-paper-scissors.git
cd ai-rock-paper-scissors

# Vytvořit virtuální prostředí
python -m venv venv

# Aktivovat virtuální prostředí
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Nainstalovat závislosti
pip install -r requirements.txt
```

### Varianta B: Bez Git (stáhnout ZIP)

1. Klikněte na zelené tlačítko **"Code"** → **"Download ZIP"**
2. Rozbalte ZIP do složky
3. Otevřete terminál v této složce
4. Pokračujte kroky "Vytvořit virtuální prostředí" výše

---

## 🎓 Kompletní Tutoriál

### 1️⃣ Trénink Modelu (Teachable Machine)

**Proč Teachable Machine?**

- 🚫 Žádné programování
- ☁️ Trénink probíhá v cloudu (nepotřebujete GPU)
- ⚡ Rychlé (2-5 minut)

**Nejlepší praktiky pro kvalitní model:**

✅ **Rozmanitá data:**

- Měňte úhel ruky (zleva, zprava, shora)
- Měňte vzdálenost od kamery
- Různé osvětlení (denní světlo, umělé světlo)
- Různá pozadí (ne pouze bílá zeď!)

✅ **Dostatek dat:**

- **Minimum:** 30 fotek na třídu
- **Doporučeno:** 50-100 fotek na třídu
- **Pravidlo:** Víc dat = lepší model

❌ **Běžné chyby:**

- Všechny fotky ze stejného úhlu → model se naučí jen jeden pohled
- Pouze dobré osvětlení → model selže při špatném světle
- Příliš málo dat → nízká přesnost

### 2️⃣ Pochopení Kódu

Pojďme projít `app.py` krok za krokem:

#### Import knihoven

```python
import gradio as gr           # Web UI framework
import tensorflow as tf       # ML engine
import numpy as np            # Matematické operace
from PIL import Image         # Zpracování obrázků
import requests               # Stahování modelu
```

#### Načtení modelu

```python
MODEL_URL = "YOUR_URL_HERE"
model = tf.keras.utils.get_file(
    'keras_model.h5',
    MODEL_URL + 'model.json'
)
model = tf.keras.models.load_model(model_path)
```

**Co se děje:** TensorFlow stáhne váš model z cloudu a načte ho do paměti.

#### Funkce pro předpověď

```python
def predict(image):
    # 1. Změň velikost na 224x224 (model to očekává)
    image = image.resize((224, 224))

    # 2. Převeď na čísla (RGB pixely)
    image_array = np.array(image)

    # 3. Normalizuj (0-255 → 0-1)
    image_array = image_array.astype('float32') / 255.0

    # 4. Přidej batch dimenzi
    image_array = np.expand_dims(image_array, axis=0)

    # 5. Spusť predikci!
    predictions = model.predict(image_array)

    # 6. Vrať výsledek
    return predictions
```

#### Gradio rozhraní

```python
interface = gr.Interface(
    fn=predict,                      # Jakou funkci volat
    inputs=gr.Image(type="pil"),     # Vstup: obrázek
    outputs=gr.Label(num_top_classes=3),  # Výstup: top 3 predikce
    title="🎮 Kámen, Nůžky, Papír AI"
)
interface.launch()  # Spustí webový server
```

### 3️⃣ Testování a Ladění

**Dobrý test:**

```python
# Zkuste různé scénáře:
- Vaše vlastní fotky ✅
- Fotky přátel ✅
- Fotky z Google Images ✅
- Špatné osvětlení ⚠️
- Neobvyklé úhly ⚠️
```

**Měření přesnosti:**

```python
# Vytvořte testovací sadu: 10 fotek od každé třídy
# Spočítejte: Kolik jich model uhádl správně?
# Přesnost = Správné / Celkem * 100%

# Cíl: > 85% přesnost
```

---

## 🔧 Konfigurace

### Změna portu

Pokud port 7860 již používá jiná aplikace:

```python
# V app.py, poslední řádek:
interface.launch(server_port=7861)  # Změňte na libovolný port
```

### Veřejné sdílení (demo pro přátele)

```python
# V app.py:
interface.launch(share=True)  # Vytvoří dočasný veřejný link (72 hodin)
```

### Přidání vlastních příkladů

```python
# V app.py:
examples=[
    ["examples/rock.jpg"],
    ["examples/scissors.jpg"],
    ["examples/paper.jpg"],
    ["moje_fotka.jpg"]  # Přidejte vlastní!
]
```

---

## 🐛 Troubleshooting

### Problém: `ModuleNotFoundError: No module named 'gradio'`

**Řešení:**

```bash
# Ujistěte se, že jste aktivovali virtuální prostředí
source venv/bin/activate  # nebo venv\Scripts\activate

# Přeinstalujte závislosti
pip install -r requirements.txt
```

### Problém: Model vrací vždy stejnou třídu

**Příčina:** Špatný trénink (příliš málo/uniformní data)

**Řešení:**

1. Vraťte se do Teachable Machine
2. Přidejte více rozmanitých fotek
3. Natrénujte model znovu
4. Aktualizujte MODEL_URL v `app.py`

### Problém: `OSError: Unable to open file`

**Příčina:** Špatné MODEL_URL nebo žádné internetové připojení

**Řešení:**

1. Zkontrolujte, že URL končí na `/` (např. `.../ABC123/`)
2. Zkontrolujte internetové připojení
3. Zkopírujte URL znovu z Teachable Machine

### Problém: Gradio se nespustí na Windows

**Řešení:**

```bash
# Zkuste přímo bez virtuálního prostředí:
pip install --upgrade gradio tensorflow pillow numpy requests
python app.py
```

Více řešení najdete v **[Troubleshooting_Guide.md](Troubleshooting_Guide.md)**

---

## 📁 Struktura Projektu

```
ai-rock-paper-scissors/
│
├── app.py                   # ⭐ Hlavní aplikace
├── requirements.txt         # Seznam závislostí
├── README.md                # Tento soubor
│
├── Projekt09_PRD.md        # 📄 Product Requirements
├── Projekt09_TechSpec.md   # 📄 Technická specifikace
│
├── examples/                # 📷 Příklady obrázků
│   ├── rock.jpg
│   ├── scissors.jpg
│   └── paper.jpg
│
└── tm_model/                # 🧠 Stažený model (auto-vytvoří se)
    ├── keras_model.h5
    └── labels.txt
```

---

## 🎨 Rozšíření a Nápady

### Úroveň 1: Začátečník

- [ ] Změňte barvy a nadpisy v Gradio UI
- [ ] Přidejte více příkladových obrázků
- [ ] Otestujte s různými pozadími

### Úroveň 2: Středně pokročilý

- [ ] Přidejte 4. třídu (např. "Palec nahoru")
- [ ] Vytvořte graf přesnosti modelu
- [ ] Přidejte zvukové efekty při predikci

### Úroveň 3: Pokročilý

- [ ] Real-time stream z webkamery (ne pouze upload)
- [ ] Deployment na Hugging Face Spaces
- [ ] Vlastní trénink v PyTorchu (bez Teachable Machine)

**Inspirace:**

- [Rozpoznávání celé abecedy](https://example.com)
- [AI hra "Kámen, nůžky, papír" proti počítači](https://example.com)
- [Mobilní app s TensorFlow Lite](https://example.com)

---

## 🤝 Contributing

Chcete přispět? Skvělé!

1. **Fork** tento repozitář
2. Vytvořte **feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit** změny (`git commit -m 'Add some AmazingFeature'`)
4. **Push** do branch (`git push origin feature/AmazingFeature`)
5. Otevřete **Pull Request**

**Co můžete vylepšit:**

- Překlad do dalších jazyků
- Více příkladů
- Video tutoriály
- Optimalizace kódu

---

## 📚 Další Zdroje

### Dokumentace

- **[Teachable Machine Docs](https://teachablemachine.withgoogle.com/faq)**
- **[Gradio Docs](https://gradio.app/docs/)**
- **[TensorFlow Docs](https://www.tensorflow.org/api_docs)**

### Související Kapitoly Kurzu

- **Kapitola 1-8:** Základy AI (prerekvizita)
- **Kapitola 10:** Opakování a další projekty
- **Kapitola 20:** Pokročilá klasifikace
- **Kapitola 33:** Konvoluční neuronové sítě (CNN)

### Video Tutoriály (doporučeno)

- [Teachable Machine za 5 minut](https://youtube.com)
- [Gradio crash course](https://youtube.com)

---

## 📜 License

Tento projekt je open-source pod **MIT licencí**.

```
MIT License

Copyright (c) 2025 Martin Švanda

Permission is hereby granted, free of charge, to any person obtaining a copy...
(viz LICENSE soubor pro detaily)
```

---

## 🙏 Poděkování

- **Google Teachable Machine** - za skvělý no-code ML nástroj
- **Gradio Team** - za nejjednodušší ML web framework
- **TensorFlow Team** - za open-source ML knihovnu
- **Všem studentům kurzu** - za feedback a testování!

---

## 📞 Kontakt & Podpora

**Máte problém?**

1. Zkontrolujte **[Troubleshooting_Guide.md](Troubleshooting_Guide.md)**
2. Přečtěte si **[FAQ](#FAQ)** níže
3. Otevřete **[Issue](https://github.com/YOUR_REPO/issues)** na GitHubu
4. Napište na **Discord: [AI Kurz CZ](#)** (komunita studentů)

**Chcete se pochlubit projektem?**

- Twitter: `#AIKurzCZ` `#TeachableMachine`
- Instagram: Označte `@ai_kurz_cz`

---

## ❓ FAQ

**Q: Mohu použít tento projekt komerčně?**
A: Ano! MIT licence to umožňuje. Ale pozor: Teachable Machine modely jsou veřejné.

**Q: Jak dlouho bude můj model URL platit?**
A: Teachable Machine modely jsou hostované permanentně (nezanikají).

**Q: Potřebuji GPU?**
A: Ne! Trénink probíhá v cloudu (Teachable Machine). Inference běží i na CPU.

**Q: Mohu použít vlastní dataset (ne z webkamery)?**
A: Ano! V Teachable Machine klikněte "Upload" místo "Webcam".

**Q: Funguje to na Raspberry Pi?**
A: Ano, ale bude to pomalé. Doporučujeme TensorFlow Lite optimalizaci.

**Q: Jak mohu zlepšit přesnost?**
A:

1. Více trénovacích dat (100+ na třídu)
2. Rozmanitější data (různé úhly, osvětlení)
3. Data augmentation (rotace, jas, kontrast)

---

## 🎯 Cíle Projektu (Learning Outcomes)

Po dokončení projektu byste měli umět:

- [x] Natrénovat image classification model bez kódu
- [x] Pochopit preprocessing (resize, normalizace)
- [x] Implementovat inference v Pythonu
- [x] Vytvořit web UI s Gradio
- [x] Debugovat ML aplikaci
- [x] Nasadit lokální demo

**Gratulujeme! Jste AI developer! 🚀**

---

**Happy Coding! 💻**

_Pokud se vám projekt líbil, dejte ⭐ na GitHubu!_
