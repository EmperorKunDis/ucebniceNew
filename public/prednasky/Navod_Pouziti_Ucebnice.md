# 📖 Návod k použití AI učebnice

## Jak efektivně studovat tento kurz (40 kapitol)

**Verze:** 1.0
**Pro koho:** Studenti, lektoři, self-learners
**Odhadovaná doba studia:** 60-80 hodin (celý kurz)

---

## 🎯 O kurzu

Tato učebnice vás provede od úplných základů AI až po pokročilé koncepty jako jsou LLM a agenti. Kurz je navržen pro:

✅ **Kariérní switchers** (25-35 let) - změna profese do AI
✅ **Studenty VŠ/VOŠ** - doplnění akademických znalostí praxí
✅ **Programátory** - rozšíření skillsetu o AI
✅ **Nadšence** - kteří chtějí rozumět AI světu

**Předpoklady:**

- ❌ **Nepotřebujete** znát programování (naučíte se v kurzu)
- ❌ **Nepotřebujete** matematiku nad střední školu
- ✅ **Potřebujete** počítač a internet
- ✅ **Potřebujete** ~3-5 hodin týdně (cca 4 měsíce studia)

---

## 📚 Struktura kurzu

Kurz je rozdělen do **6 bloků** (po 10 nebo méně kapitol):

### 📘 BLOK 1: Základy (Kapitoly 1-10)

**Zaměření:** Co je AI, historie, etika, první projekty
**Časová náročnost:** 10-15 hodin
**Klíčové kapitoly:** Kap 1 (Úvod), Kap 9 (První projekt), Kap 10 (Opakování)
**Výstup:** Postavíte svůj první AI model! 🎉

### 📗 BLOK 2: Klasická AI (Kapitoly 11-20)

**Zaměření:** Algoritmy hledání, grafy, pravděpodobnost
**Časová náročnost:** 12-18 hodin
**Obtížnost:** ⭐⭐⭐ (středně náročný - skok z Bloku 1)
**Klíčové kapitoly:** Kap 12 (A\* algoritmus), Kap 17 (Bayes)
**Výstup:** Pochopíte, jak AI "myslí" při řešení problémů

### 📙 BLOK 3: Machine Learning (Kapitoly 21-30)

**Zaměření:** Typy učení, data, modely, neuronky
**Časová náročnost:** 15-20 hodin
**Obtížnost:** ⭐⭐⭐⭐ (náročný - hodně nových konceptů)
**Klíčové kapitoly:** Kap 22 (Data preprocessing), Kap 28 (Perceptron), Kap 30 (Aktivace)
**Výstup:** Zvládnete celý ML pipeline od dat po model

### 📕 BLOK 4: Deep Learning (Kapitoly 31-35)

**Zaměření:** Backpropagation, CNN, Transfer Learning
**Časová náročnost:** 10-15 hodin
**Obtížnost:** ⭐⭐⭐⭐⭐ (pokročilý)
**Klíčové kapitoly:** Kap 31 (Backprop), Kap 33 (CNN)
**Výstup:** Postavíte vlastní konvoluční síť

### 📔 BLOK 5: Aplikace a Etika (Kapitoly 36-39)

**Zaměření:** Etika, explainability, generativní AI, LLM
**Časová náročnost:** 8-12 hodin
**Obtížnost:** ⭐⭐⭐ (konceptuální, méně kódu)
**Klíčové kapitoly:** Kap 37 (XAI), Kap 39 (LLM)
**Výstup:** Kritické myšlení o dopadech AI

### 📓 BLOK 6: Závěr (Kapitola 40)

**Zaměření:** Shrnutí, portfolio, další kroky
**Časová náročnost:** 2-3 hodiny
**Výstup:** Kompletní portfolio projektů

---

## 🗺️ Jak studovat - Doporučený přístup

### Varianta A: Intenzivní (2 měsíce)

**Pro:** Motivované osoby s volným časem
**Tempo:** 10-15 hodin týdně

```
Týden 1-2:   Blok 1 (Kap 1-10)       + Test_Blok1.md
Týden 3-4:   Blok 2 (Kap 11-20)      + Test_Blok2.md
Týden 5-6:   Blok 3 (Kap 21-30)      + Test_Blok3.md
Týden 7:     Blok 4 (Kap 31-35)
Týden 8:     Blok 5-6 (Kap 36-40)    + Test_Blok4.md
```

### Varianta B: Standardní (4 měsíce)

**Pro:** Pracující lidé, studenti s dalšími povinnostmi
**Tempo:** 5-7 hodin týdně

```
Měsíc 1:   Blok 1 (Kap 1-10)        + Test_Blok1.md
Měsíc 2:   Blok 2 (Kap 11-20)       + Test_Blok2.md
Měsíc 3:   Blok 3 (Kap 21-30)       + Test_Blok3.md
Měsíc 4:   Bloky 4-6 (Kap 31-40)    + Test_Blok4.md
```

### Varianta C: Relaxační (6-8 měsíců)

**Pro:** Hobby projekty, pomalé tempo
**Tempo:** 2-3 hodiny týdně

```
Každý týden: 2 kapitoly + praktický projekt z kapitoly
```

---

## 📖 Jak studovat jednotlivou kapitolu (Checklist)

### 1. Příprava (5 minut)

- [ ] Přečti název a úvodní odstavec
- [ ] Zkontroluj, že máš Google Colab otevřený ([colab.research.google.com](https://colab.research.google.com))
- [ ] Připrav si poznámkový blok (digitální nebo papír)

### 2. První čtení - Pochopení (20-30 minut)

- [ ] Přečti kapitolu od začátku do konce (NECVIČ kód ještě)
- [ ] Dělej si poznámky neznámých pojmů → dohledej v [Glosar.md](Glosar.md)
- [ ] Všimni si **analogií** (často vysvětlují složité koncepty jednoduše)
- [ ] Poznamenej si části, kterým nerozumíš

### 3. Hands-On - Praktické cvičení (30-60 minut)

- [ ] Otevři Google Colab
- [ ] Zkopíruj kód z kapitoly do Colab notebooku
- [ ] Spusť kód **krok za krokem** (ne celý najednou!)
- [ ] **Experimentuj:** Změň čísla, parametry → co se stane?
- [ ] Pokud něco nefunguje → [Troubleshooting_Guide.md](Troubleshooting_Guide.md)

### 4. Vlastní projekt - Aplikace (30-45 minut)

- [ ] Zkus upravit projekt z kapitoly (např. jiná data, více tříd)
- [ ] Nebo vytvoř miniverzi vlastního projektu s těmito koncepty
- [ ] Ulož notebook do Google Drive (File → Save to Drive)

### 5. Opakování - Fixace (10 minut)

- [ ] Odpověz sám sobě: "Co jsem se dnes naučil?"
- [ ] Přečti si sekci "Závěr" v kapitole znovu
- [ ] Zkus vysvětlit koncept příteli/rodině (Feynmanovy technika)

### 6. Test (volitelné)

- [ ] Po dokončení bloku (10 kapitol) udělejte test:
  - Test_Blok1.md (po kap 10)
  - Test_Blok2.md (po kap 20)
  - Test_Blok3.md (po kap 30)
  - Test_Blok4.md (po kap 40)

---

## 🛠️ Nástroje a zdroje

### Povinné nástroje

- **Google Colab** - spouštění Python kódu (zdarma)
- **Webový prohlížeč** - Chrome/Firefox (pro Colab)
- **Poznámky** - Notion, Obsidian, nebo klasický sešit

### Doporučené nástroje

- **Python lokálně** (volitelné) - pokud chcete pracovat offline
  - Instalace: [python.org](https://python.org)
  - IDE: VS Code, PyCharm
- **Git/GitHub** - ukládání projektů (naučíte se v kurzu)
- **Discord/Slack** - komunita studentů (link v kurzu)

### Doplňující zdroje

- **[Glosar.md](Glosar.md)** - slovník všech pojmů
- **[Troubleshooting_Guide.md](Troubleshooting_Guide.md)** - řešení problémů
- **YouTube kanál kurzu** - video tutoriály (link)
- **Stack Overflow** - pokud uvíznete s kódem

---

## 🎓 Testy a hodnocení

### Jak fungují testy?

**Kdy dělat test:**
Po dokončení každého bloku (10 kapitol)

**Formát testů:**

1. **Multiple Choice** (40 bodů) - teoretické otázky
2. **Pravda/Nepravda** (15 bodů) - koncepty
3. **Krátké odpovědi** (25 bodů) - vysvětlení vlastními slovy
4. **Praktický projekt** (20 bodů) - hands-on kód

**Časový limit:** 90 minut

**Hodnocení:**

```
90-100 bodů: A (Výborně)
80-89 bodů:  B (Velmi dobře)
70-79 bodů:  C (Dobře)
60-69 bodů:  D (Uspokojivě)
< 60 bodů:   F (Neprošel - vraťte se ke kapitolám)
```

**Pravidla:**

- ✅ Můžete používat poznámky a kapitoly
- ✅ Můžete používat Glosář
- ❌ Nemůžete kopírovat od druhých
- ❌ Nemůžete používat AI asistenty (ChatGPT) - to je vaše zkouška!

---

## 💡 Tipy pro úspěch

### 1. Učte se AKTIVNĚ, ne pasivně

```
❌ ŠPATNĚ: Pouze číst kapitoly
✅ DOBŘE:   Číst + psát kód + experimentovat + vlastní projekt
```

### 2. Používejte "Feynmanovu techniku"

```
Naučili jste se nový koncept? Zkuste ho vysvětlit:
1. Kamarádovi (nebo plyšákovi 🧸)
2. Jako byste učili 10leté dítě
3. Pokud uvíznete → nevíte to dost dobře → vraťte se ke kapitole
```

### 3. Dělejte si POZNÁMKY

```
✍️ Co fungovalo:
- Psát vlastními slovy (ne kopírovat definice)
- Kreslit diagramy (vizuální paměť)
- Dělat souvislosti mezi kapitolami

❌ Co nefungovalo:
- Zvýrazňovat celé odstavce (neefektivní)
- Kopírovat definice nazpaměť
```

### 4. Experimentujte s kódem

```python
# Když vidíte kód jako tento:
epochs = 10
learning_rate = 0.01

# ZKUSTE změnit:
epochs = 50          # Co se stane?
learning_rate = 0.1  # Je to lepší/horší?

# Učíte se tím víc než jen spuštěním!
```

### 5. Utvořte studijní rutinu

```
🕐 Stejný čas každý den (např. 19:00-21:00)
📍 Stejné místo (tichá místnost)
📵 Bez rozptylování (telefon pryč!)
☕ S pauzami (Pomodoro: 25 min práce, 5 min pauza)
```

### 6. Připojte se ke komunitě

```
👥 Najděte study buddies
💬 Ptejte se na Discordu
🤝 Sdílejte své projekty
📢 Učte druhé (nejlepší způsob, jak se naučit!)
```

---

## 🚫 Časté chyby (a jak se jim vyhnout)

### Chyba 1: "Tutorial Hell"

**Problém:** Jen sledujete tutoriály, ale sami nic nestavíte
**Řešení:** Po KAŽDÉ kapitole udělejte vlastní mini-projekt

### Chyba 2: Přeskakování základů

**Problém:** "Kapitoly 1-10 jsou nudné, jdu rovnou na neuronky!"
**Řešení:** Základy jsou KRITICKÉ. Bez nich nepostavíte nic funkčního.

### Chyba 3: Neprocvičování kódu

**Problém:** Jen čtete, nespouštíte kód
**Řešení:** Colab MUSÍ být otevřený při každé kapitole!

### Chyba 4: Nevyřešené problémy

**Problém:** "Nefunguje mi to, jdu dál..."
**Řešení:** VŽDY vyřešte problém PŘED pokračováním (jinak se to navrství)

### Chyba 5: Samostudium v izolaci

**Problém:** Učíte se sami, nikdo vás nemotivuje
**Řešení:** Připojte se ke study group nebo najděte accountability partnera

---

## 📊 Sledování pokroku

### Checklist pro každý blok:

**BLOK 1 (Kapitoly 1-10)**

- [ ] Přečteny všechny kapitoly
- [ ] Spuštěn kód z každé kapitoly v Colabu
- [ ] Vytvořen vlastní projekt (např. klasifikátor ovoce/zvířat)
- [ ] Dokončen Test_Blok1.md (skóre > 70 bodů)
- [ ] Přečten mini-slovník v Kapitole 10

**BLOK 2 (Kapitoly 11-20)**

- [ ] Přečteny všechny kapitoly
- [ ] Implementován A\* algoritmus
- [ ] Vytvořena vlastní Bayesovská klasifikace
- [ ] Dokončen Test_Blok2.md (skóre > 70 bodů)
- [ ] Přečten mini-slovník v Kapitole 20

**BLOK 3 (Kapitoly 21-30)**

- [ ] Přečteny všechny kapitoly
- [ ] Data preprocessing na vlastním datasetu
- [ ] Vytrénována vlastní neuronová síť
- [ ] Dokončen Test_Blok3.md (skóre > 70 bodů)
- [ ] Přečten mini-slovník v Kapitole 30

**BLOK 4-6 (Kapitoly 31-40)**

- [ ] Přečteny všechny kapitoly
- [ ] Implementován backpropagation (kap 31)
- [ ] Vytvořena CNN (kap 33)
- [ ] Vytvořen chatbot s LLM (kap 39)
- [ ] Dokončen Test_Blok4.md (skóre > 70 bodů)
- [ ] Vytvořeno AI portfolio (kap 40)

---

## 🎯 Co dál po dokončení kurzu?

### Možnost 1: Praxe v projektech

- Kaggle soutěže (datascience soutěže)
- Open-source AI projekty na GitHubu
- Vlastní side project (aplikace s AI)

### Možnost 2: Další vzdělání

- **Fast.ai** - Practical Deep Learning for Coders
- **DeepLearning.AI** - Andrew Ng kurzy na Coursera
- **Hugging Face** - NLP a Transformers

### Možnost 3: Kariéra

- **Junior ML Engineer** - s tímto kurzem + portfolio
- **Data Analyst** - zaměření na data science
- **AI Consultant** - pomáhat firmám implementovat AI

---

## 📞 Podpora a pomoc

**Kde hledat pomoc?**

1. **[Troubleshooting_Guide.md](Troubleshooting_Guide.md)**
   Nejčastější problémy a řešení

2. **[Glosar.md](Glosar.md)**
   Neznámý pojem? Hledejte zde

3. **Diskord komunita**
   [Link na Discord]

4. **GitHub Issues**
   [github.com/kurz-ai/issues](https://github.com)

5. **Email podpora**
   support@aicourse.cz

**Než se zeptáte:**

- [ ] Zkontrolovali jste Troubleshooting Guide?
- [ ] Googl(ov)ali jste chybovou hlášku?
- [ ] Restartovali jste (Python/Colab/počítač)?
- [ ] Máte minimální reprodukovatelný příklad?

---

## ✅ Finální checklist - Jste připraveni začít?

Před začátkem kurzu zkontrolujte:

- [ ] Mám počítač a stabilní internet
- [ ] Vím, jak otevřít Google Colab
- [ ] Přečetl jsem tento Návod k použití
- [ ] Vybral jsem si variantu studia (A/B/C)
- [ ] Vytvořil jsem si studijní rutinu (čas + místo)
- [ ] Připojil jsem se ke komunitě (Discord/Slack)
- [ ] Mám motivaci a trpělivost! 💪

---

**Hodně štěstí na vaší AI cestě! 🚀**

_"The journey of a thousand miles begins with a single step." - Lao Tzu_

_Váš první krok? Kapitola 1. Pojďme na to!_
