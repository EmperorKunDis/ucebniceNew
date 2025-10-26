# Test - Blok 1 (Kapitoly 1-10)

## Základy umělé inteligence a první projekty

**Časový limit:** 90 minut
**Bodové hodnocení:** 100 bodů celkem
**Procházející skóre:** 70+ bodů

---

## 📋 Instrukce

Tento test ověřuje vaše znalosti z kapitol 1-10. Skládá se ze čtyř částí:

1. **Multiple Choice** (40 bodů) - Vyberte jednu správnou odpověď
2. **Pravda/Nepravda** (15 bodů) - Určete, zda je tvrzení pravdivé
3. **Krátké odpovědi** (25 bodů) - Vysvětlete vlastními slovy
4. **Praktický projekt** (20 bodů) - Hands-on úkol v Google Colab

**Pravidla:**

- Můžete používat poznámky a kapitoly kurzu
- NEMŮŽETE kopírovat odpovědi od kolegů
- Praktický projekt musí být funkční (spustitelný kód)

---

## ČÁST 1: Multiple Choice (40 bodů)

_Vyberte jednu správnou odpověď. Každá otázka = 4 body._

### Otázka 1

**Co nejlépe popisuje "slabou AI" (Weak AI)?**

a) AI, která má nízkou výpočetní rychlost
b) AI specializovaná na jeden konkrétní úkol
c) AI s lidským vědomím, ale omezenými znalostmi
d) AI, která funguje pouze v laboratoři

---

### Otázka 2

**Který historický přístup k AI spoléhal na programování explicitních pravidel (IF-THEN)?**

a) Konekcionismus
b) Strojové učení
c) Symbolická AI
d) Hluboké učení

---

### Otázka 3

**Když AI systém systematicky znevýhodňuje určitou skupinu lidí kvůli problémům v trénovacích datech, jedná se o:**

a) Overfitting (přeučení)
b) Bias (zaujatost)
c) Variance (rozptyl)
d) Underfitting (podučení)

---

### Otázka 4

**Jak fungují doporučovací systémy typu Netflix nebo Spotify?**

a) Manuální výběr kurátorů
b) Náhodný výběr z databáze
c) Kolaborativní filtrování (hledání podobných uživatelů)
d) Chronologické řazení podle data vydání

---

### Otázka 5

**Co je hlavním cílem algoritmu Minimax v herní AI?**

a) Maximalizovat rychlost výpočtu
b) Minimalizovat maximální možnou škodu od soupeře
c) Hrát náhodné tahy pro nepředvídatelnost
d) Maximalizovat počet tahů do výhry

---

### Otázka 6

**K čemu sloužil nástroj Teachable Machine v projektu "Kámen, nůžky, papír"?**

a) Napsání Python kódu aplikace
b) Trénink modelu bez psaní kódu
c) Vytvoření webového rozhraní
d) Hosting aplikace v cloudu

---

### Otázka 7

**Jaký je rozdíl mezi Datovou vědou (Data Science) a Umělou inteligencí (AI)?**

a) Data Science je starší název pro AI
b) Data Science hledá vhledy v datech, AI vytváří autonomní systémy
c) Žádný rozdíl, jsou to synonyma
d) Data Science pracuje pouze s čísly, AI pouze s textem

---

### Otázka 8

**Co znamená problém "černé skříňky" (black box) v AI?**

a) AI systém je fyzicky uzavřen v krabici
b) Nevíme, jak AI dospěla ke svému rozhodnutí
c) AI pracuje pouze s černobílými obrázky
d) AI nefunguje na tmavých tématech

---

### Otázka 9

**Která knihovna Pythonu se standardně používá pro rychlé vytvoření webového rozhraní pro ML modely?**

a) Flask
b) Django
c) Gradio
d) FastAPI

---

### Otázka 10

**Co z následujícího NENÍ typ strojového učení?**

a) Učení s učitelem (Supervised Learning)
b) Učení bez učitele (Unsupervised Learning)
c) Zpětnovazební učení (Reinforcement Learning)
d) Induktivní učení (Inductive Learning)

---

## ČÁST 2: Pravda/Nepravda (15 bodů)

_Určete, zda je tvrzení pravdivé nebo nepravdivé. Každá otázka = 3 body._

### Otázka 11

**Tvrzení:** Silná AI (Strong AI) s lidským vědomím již existuje a je komerčně dostupná.

- [ ] Pravda
- [ ] Nepravda

---

### Otázka 12

**Tvrzení:** Neuronové sítě jsou přesnou kopií lidského mozku a fungují úplně stejně.

- [ ] Pravda
- [ ] Nepravda

---

### Otázka 13

**Tvrzení:** Google Colab umožňuje spouštět Python kód v prohlížeči bez lokální instalace.

- [ ] Pravda
- [ ] Nepravda

---

### Otázka 14

**Tvrzení:** Bias (zaujatost) v AI systémech vzniká pouze kvůli špatně naprogramovanému algoritmu, nikdy ne kvůli datům.

- [ ] Pravda
- [ ] Nepravda

---

### Otázka 15

**Tvrzení:** Rozhodovací strom (Decision Tree) je typ algoritmu strojového učení používaný pro klasifikaci.

- [ ] Pravda
- [ ] Nepravda

---

## ČÁST 3: Krátké odpovědi (25 bodů)

_Odpovězte 3-5 větami. Vysvětlete vlastními slovy._

### Otázka 16 (10 bodů)

**Vysvětlete rozdíl mezi "tréninkem modelu" a "inferencí". Použijte analogii nebo konkrétní příklad.**

```
Vaše odpověď:





```

---

### Otázka 17 (8 bodů)

**Proč je etika důležitá v AI? Uveďte dva konkrétní příklady etických problémů zmíněných v kurzu.**

```
Vaše odpověď:





```

---

### Otázka 18 (7 bodů)

**Co je to "overfitting" (přeučení) a jak se projevuje? Jak byste ho poznali?**

```
Vaše odpověď:





```

---

## ČÁST 4: Praktický projekt (20 bodů)

**Úkol:** Upravte základní klasifikátor z Kapitoly 1 tak, aby rozpoznával 3 druhy zvířat místo ovoce.

### Zadání

Vytvořte v Google Colabu nový notebook s následujícím:

1. **Data (8 bodů):** Vytvořte dataset pro 3 třídy zvířat (např. pes, kočka, pták)
   - Každá třída musí mít alespoň 3 vzorky
   - Použijte 2 features (např. váha v kg, výška v cm)

2. **Model (8 bodů):** Natrénujte DecisionTreeClassifier
   - Importujte správné knihovny
   - Vytvořte a natrénujte model

3. **Predikce (4 bodů):** Otestujte model na novém vzorku
   - Vytvořte predikci pro zvíře, které model neviděl
   - Vypište výsledek čitelně

### Šablona kódu

```python
# ČÁST 1: Import knihoven (doplňte chybějící)
from sklearn import tree
# ... další importy ...

# ČÁST 2: Vytvoření dat
# Formát: [váha_kg, výška_cm]
features = [
    # DOPLŇTE: 3 vzorky pro každou třídu (celkem 9 vzorků)
]

# Štítky: 0 = pes, 1 = kočka, 2 = pták
labels = [
    # DOPLŇTE: odpovídající štítky
]

# ČÁST 3: Trénink modelu
clf = tree.DecisionTreeClassifier()
# DOPLŇTE: natrénujte model

# ČÁST 4: Testování
# DOPLŇTE: vytvořte predikci pro nové zvíře
# Např. zvíře vážící 15 kg a vysoké 40 cm

print(f"Predikce: {# DOPLŇTE #}")
```

### Hodnocení praktického projektu

| Kritérium                                 | Body   |
| ----------------------------------------- | ------ |
| Funkční kód (spustitelný bez chyb)        | 8      |
| Správná struktura dat (features + labels) | 6      |
| Predikce funguje a je čitelná             | 4      |
| Komentáře a čistota kódu                  | 2      |
| **CELKEM**                                | **20** |

---

## 🎯 Bonusová otázka (+5 bodů)

**Nepovinná - může vám pomoci k lepšímu hodnocení.**

**Otázka 19 (5 bodů):**
**Navrhněte jednu konkrétní AI aplikaci, která by mohla pomoci ve vašem každodenním životě nebo práci. Popište:**

- Jaký problém řeší?
- Jaká data by potřebovala?
- Jaký typ ML by se použil? (klasifikace, regrese, doporučování...)

```
Vaše odpověď:






```

---

## ✅ Správné odpovědi a vysvětlení

### ČÁST 1: Multiple Choice

**1. b)** AI specializovaná na jeden konkrétní úkol
_Vysvětlení: Slabá AI je expert na jeden úkol (rozpoznávání řeči, hraní šachu), ale nedokáže se adaptovat na úplně jiné úkoly._

**2. c)** Symbolická AI
_Vysvětlení: Symbolická AI používala explicitní pravidla (IF patient má horečku THEN pravděpodobně nemocný). Konekcionismus používá neuronové sítě._

**3. b)** Bias (zaujatost)
_Vysvětlení: Algoritmická zaujatost vzniká, když trénovací data obsahují historické nerovnosti (např. méně schválených úvěrů pro určitou skupinu → model se to "naučí")._

**4. c)** Kolaborativní filtrování
_Vysvětlení: Systém najde uživatele s podobným vkusem a doporučí vám, co se líbilo jim. "Lidé, kteří poslouchali X, také poslouchali Y."_

**5. b)** Minimalizovat maximální možnou škodu od soupeře
_Vysvětlení: Minimax předpokládá, že soupeř hraje optimálně. AI se snaží zvolit tah, který minimalizuje nejhorší možný scénář._

**6. b)** Trénink modelu bez psaní kódu
_Vysvětlení: Teachable Machine je no-code nástroj od Googlu pro rychlý trénink image/audio modelů._

**7. b)** Data Science hledá vhledy v datech, AI vytváří autonomní systémy
_Vysvětlení: Data Science je analytická disciplína (vytváření reportů, dashboardů). AI se zaměřuje na autonomní rozhodování._

**8. b)** Nevíme, jak AI dospěla ke svému rozhodnutí
_Vysvětlení: Zvlášť u hlubokých neuronových sítí je těžké vysvětlit "proč" model udělal konkrétní rozhodnutí. To je problém v medicíně nebo justici._

**9. c)** Gradio
_Vysvětlení: Gradio je speciálně navržené pro ML demos. Flask a Django jsou obecné web frameworky._

**10. d)** Induktivní učení
_Vysvětlení: Toto je filozofický termín, ne standardní ML kategorie. Tři hlavní typy jsou: Supervised, Unsupervised, Reinforcement._

---

### ČÁST 2: Pravda/Nepravda

**11. Nepravda**
_Vysvětlení: AGI (Artificial General Intelligence) zatím neexistuje. Vše, co dnes máme, je Weak AI (úzce specializovaná)._

**12. Nepravda**
_Vysvětlení: Neuronové sítě jsou pouze volně inspirované biologickými neurony. Fungují matematicky úplně jinak._

**13. Pravda**
_Vysvětlení: Colab běží v cloudu (Google servery), stačí pouze prohlížeč._

**14. Nepravda**
_Vysvětlení: Bias vzniká PRIMÁRNĚ z dat. Pokud jsou trénovací data zaujatá (např. historicky diskriminační rozhodnutí), model se to naučí._

**15. Pravda**
_Vysvětlení: Decision Tree je klasický algoritmus pro klasifikaci i regresi. Funguje jako série IF-THEN pravidel._

---

### ČÁST 3: Krátké odpovědi - Vzorové odpovědi

**16. Trénink vs. Inference**

_Vzorová odpověď:_

> Trénink modelu je jako učení se na zkoušku - model dostává příklady (data) a učí se z nich vzory. Inference je samotná zkouška - model dostane nová, neviděná data a musí udělat predikci.
>
> Analogie: Když se učíte rozpoznávat psy, trénink = dívání se na stovky fotek psů a učení se "jak pes vypadá". Inference = když vidíte nové zvíře na ulici a rozhodnete "to je pes!"
>
> Trénink probíhá jednou (nebo občas při update), inference pak tisíckrát (každá predikce).

**17. Etika v AI**

_Vzorová odpověď:_

> Etika je důležitá, protože AI rozhodnutí ovlivňují reálné životy lidí. Špatně navržená AI může způsobit nespravedlnost nebo diskriminaci.
>
> Příklad 1: Systém pro schvalování úvěrů - pokud je zaujatý, může systematicky odmítat určité skupiny lidí (např. podle etnicity nebo pohlaví).
>
> Příklad 2: Medicínská diagnostická AI - pokud nefunguje správně nebo není transparentní, může vést k chybným diagnózám a ohrožení pacientů.

**18. Overfitting**

_Vzorová odpověď:_

> Overfitting (přeučení) nastává, když se model "naučí nazpaměť" trénovací data místo toho, aby pochopil obecné vzory. Model pak funguje perfektně na trénovacích datech, ale špatně na nových, reálných datech.
>
> Poznáte ho tak, že: Tréninkové skóre = 99%, ale testovací skóre = 60%. To znamená, že model jen memoroval příklady, ale neobecnil.
>
> Je to jako student, který se naučil nazpaměť odpovědi na 100 příkladů, ale nerozumí principu - když dostane mírně jiný příklad, neví si rady.

---

### ČÁST 4: Praktický projekt - Vzorové řešení

```python
# ŘEŠENÍ: Klasifikátor zvířat

# ČÁST 1: Import knihoven
from sklearn import tree
import numpy as np

# ČÁST 2: Vytvoření dat
# Formát: [váha_kg, výška_cm]
features = [
    # Psi (0)
    [25, 60],   # Střední pes
    [8, 30],    # Malý pes
    [40, 70],   # Velký pes

    # Kočky (1)
    [4, 25],    # Normální kočka
    [5, 28],    # Velká kočka
    [3, 23],    # Malá kočka

    # Ptáci (2)
    [0.5, 20],  # Holub
    [0.3, 15],  # Vrabec
    [1.2, 35]   # Krkavec
]

# Štítky: 0 = pes, 1 = kočka, 2 = pták
labels = [0, 0, 0, 1, 1, 1, 2, 2, 2]

# ČÁST 3: Trénink modelu
clf = tree.DecisionTreeClassifier()
clf = clf.fit(features, labels)

print("Model úspěšně natrénován!")

# ČÁST 4: Testování
# Testujeme zvíře: 15 kg, 40 cm
test_animal = [[15, 40]]
prediction = clf.predict(test_animal)

# Mapování čísel na jména
animal_names = {0: "Pes", 1: "Kočka", 2: "Pták"}

print(f"\n--- Predikce ---")
print(f"Zvíře s váhou 15 kg a výškou 40 cm je pravděpodobně: {animal_names[prediction[0]]}")

# Bonus: Zobrazení pravděpodobností (pokud chcete)
if hasattr(clf, "predict_proba"):
    probabilities = clf.predict_proba(test_animal)[0]
    print(f"\nPravděpodobnosti:")
    for i, prob in enumerate(probabilities):
        print(f"  {animal_names[i]}: {prob*100:.1f}%")
```

**Hodnocení:**

- ✅ Funkční kód: 8/8
- ✅ 9 vzorků, 3 třídy: 6/6
- ✅ Predikce s výpisem: 4/4
- ✅ Komentáře: 2/2
- **CELKEM: 20/20**

---

## 📊 Bodové hodnocení

| Bodové rozpětí | Známka | Hodnocení                                      |
| -------------- | ------ | ---------------------------------------------- |
| 90-100 bodů    | A      | Výborně! Jste připraveni pokračovat.           |
| 80-89 bodů     | B      | Velmi dobře! Máte solidní základy.             |
| 70-79 bodů     | C      | Dobře. Projděte si kapitoly, které byly těžší. |
| 60-69 bodů     | D      | Uspokojivě, ale doporučujeme opakování.        |
| < 60 bodů      | F      | Vraťte se ke kapitolám 1-10 a procvičte.       |

---

## 💡 Tipy pro studium

**Pokud jste měli problémy s:**

- **Multiple Choice:** Přečtěte si znovu kapitoly 1, 3, 5, 9
- **Pravda/Nepravda:** Zaměřte se na klíčové koncepty (definice AI, neuronky, etika)
- **Krátké odpovědi:** Procvičte vysvětlování konceptů vlastními slovy (učit někoho jinému pomáhá!)
- **Praktický projekt:** Projděte si Kapitolu 1 a 9 znovu, zopakujte si Python

---

**Gratulujeme k dokončení Testu 1! 🎉**

_Připraveni na Blok 2 (Kapitoly 11-20): Algoritmy a hledání?_
