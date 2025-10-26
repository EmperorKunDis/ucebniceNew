# Velké opakování: Posilovna pro váš AI mozek

Vítejte v základním táboře! Prošli jsme prvních devět kapitol – devět náročných, ale vzrušujících misí. Zjistili jsme, co je AI, nahlédli do její historie, prozkoumali etická dilemata a hlavně – postavili jsme si vlastní funkční AI aplikace. Dnes je čas zastavit se, nabrousit nástroje a zkontrolovat vybavení, než se vydáme na další, ještě náročnější výpravu do světa algoritmů.

Tato kapitola je vaše osobní posilovna pro AI mozek. Protáhneme si klíčové koncepty v zábavném kvízu, probereme nejdůležitější otázky a na závěr si dáme ještě jeden praktický mini-projekt, abychom si vše osahali v praxi.

---

## Část 1: Velký AI kvíz

Otestujte si, co vám utkvělo v paměti. U každé otázky je jen jedna správná odpověď. (Správné odpovědi najdete na konci kapitoly).

**1. Jaký je hlavní rozdíl mezi "slabou AI" (Weak AI) a "silnou AI" (Strong AI)?**
a) Slabá AI je pomalejší, silná AI je rychlejší.
b) Slabá AI je specializovaná na jeden úkol, silná AI má obecnou inteligenci a vědomí srovnatelné s člověkem.
c) Slabá AI se učí z malého množství dat, silná AI z velkého.

**2. Který přístup k AI historicky spoléhal na programování pevných pravidel a logiky (IF-THEN)?**
a) Konekcionismus
b) Symbolická AI
c) Zpětnovazební učení

**3. Když AI systém (např. pro schvalování úvěrů) systematicky znevýhodňuje určitou skupinu lidí, protože se to naučil z historických dat, nazýváme tento problém:**
a) Algoritmická chyba (bug)
b) Zaujatost (bias)
c) Přeučení (overfitting)

**4. Princip doporučovacích systémů na Netflixu nebo Spotify je nejčastěji založen na:**
a) Ručním výběru kurátorů.
b) Náhodném výběru z katalogu.
c) Kolaborativním filtrování (hledání uživatelů s podobným vkusem).

**5. Algoritmus Minimax, který jsme použili pro Piškvorky, je navržen tak, aby:**
a) Maximalizoval svou šanci na co nejrychlejší výhru.
b) Minimalizoval maximální možnou škodu, kterou může soupeř způsobit.
c) Hrál náhodné tahy, aby zmátl soupeře.

**6. Nástroj Teachable Machine nám v projektu "Kámen, nůžky, papír" posloužil k:**
a) Napsání Python kódu pro webovou aplikaci.
b. Vytvoření a natrénování modelu pro rozpoznávání obrázků bez psaní kódu.
c) Vytvoření grafického rozhraní (tlačítek a oken).

**7. Který obor se nejvíce zabývá hledáním vhledů a příběhů v datech, často s cílem vytvořit report nebo vizualizaci pro lidské rozhodování?**
a) Umělá inteligence (AI)
b) Datová věda (Data Science)
c) Softwarové inženýrství

**8. Problém "černé skříňky" (black box) v AI odkazuje na situaci, kdy:**
a) AI systém nefunguje.
b) AI systém je příliš pomalý.
c) Nevíme, jak a proč AI dospěla ke svému rozhodnutí.

**9. Co je hlavním cílem zpětnovazebního učení (Reinforcement Learning)?**
a) Co nejpřesněji klasifikovat data.
b) Maximalizovat celkovou odměnu za akce v čase.
c) Co nejlépe napodobit lidskou konverzaci.

**10. Knihovnu Gradio jsme v našem projektu použili k:**
a) Natrénování neuronové sítě.
b) Zrychlení výpočtů v Pythonu.
c) Rychlému vytvoření webového rozhraní pro náš AI model.

---

## Část 2: Diskuze o velkých otázkách

Teď, když máte za sebou prvních devět kapitol, je čas se zamyslet. Zde jsou tři otázky k zamyšlení nebo k diskuzi s přáteli:

1.  **Který z etických problémů AI, které jsme probírali – zaujatost (bias), problém černé skříňky, nebo otázka odpovědnosti (kdo je vinen, když se AI splete?) – považujete osobně za nejnebezpečnější pro společnost a proč?**
2.  **Představte si, že máte neomezené zdroje a přístup k nejlepším AI nástrojům. Jaký jeden konkrétní problém ve vašem městě, práci nebo komunitě byste se pokusili vyřešit a jaké přístupy z našeho kurzu (např. rozpoznávání obrazu, analýza dat, generování textu) byste k tomu použili?**
3.  **Změnil se nějak váš pohled na budoucnost AI od začátku tohoto kurzu? Je pro vás představa obecné umělé inteligence (AGI) spíše fascinující, nebo spíše děsivá? Proč?**

---

## Část 3: Příští mise – Svět algoritmů a hledání

Naše dosavadní cesta byla o základech a prvních projektech. V další části kurzu se ponoříme hlouběji do "myšlení" AI. Staneme se digitálními detektivy a dobrodruhy a prozkoumáme svět **algoritmů a hledání**.

Zjistíme, jak AI řeší problémy, které jsou v podstatě obrovská bludiště možností. Jak najde nejkratší cestu z Prahy do Brna (prohledávání grafů a Dijkstrův algoritmus)? Jak logistická firma naplánuje nejefektivnější rozvoz balíčků? Jak herní postava najde cestu ven z jeskyně? Odhalíme elegantní a mocné algoritmy, které jsou páteří logistiky, robotiky, herního designu a plánování. Připravte se, začneme přemýšlet jako stroj.

---

## Část 4: Závěrečný projekt – Postavte si vlastní Spam Detektor

Pojďme si ještě jednou spojit vše, co jsme se naučili, do jednoho praktického projektu v Google Colab. Vytvoříme si jednoduchý, ale funkční detektor spamu.

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score

# Krok 1: Vytvoříme si jednoduchá data
# V reálu bychom měli tisíce emailů. Pro ukázku stačí pár.
data = {
    'text': [
        'Vyzvedněte si svou výhru zdarma!',
        'Exkluzivní nabídka jen pro vás, neváhejte!',
        'Ahoj, jak se máš? Sejdeme se zítra.',
        'Zpráva o stavu projektu.',
        'Klikněte zde pro neuvěřitelnou slevu!',
        'Děkuji za váš email, odpovím co nejdříve.',
        'Získejte půjčku bez doložení příjmů, rychle a snadno.',
        'Potvrzení vaší objednávky č. 12345.'
    ],
    'kategorie': [
        'spam', 'spam', 'ham', 'ham', 'spam', 'ham', 'spam', 'ham' # 'ham' znamená 'ne spam'
    ]
}
df = pd.DataFrame(data)

print("Naše data:")
print(df)

# Krok 2: Převedeme text na čísla, kterým model rozumí
# CountVectorizer spočítá, kolikrát se každé slovo vyskytuje v každém emailu.
vectorizer = CountVectorizer()
X = vectorizer.fit_transform(df['text'])
y = df['kategorie']

# Krok 3: Rozdělíme data na trénovací a testovací sadu
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

# Krok 4: Natrénujeme model
# Multinomial Naive Bayes je klasický a velmi efektivní algoritmus pro klasifikaci textu.
model = MultinomialNB()
model.fit(X_train, y_train)

# Krok 5: Otestujeme model na datech, která ještě neviděl
predictions = model.predict(X_test)
accuracy = accuracy_score(y_test, predictions)
print(f"\nPřesnost našeho spam detektoru je: {accuracy * 100:.2f}%")

# Krok 6: Vyzkoušíme náš detektor na nových emailech!
nove_emaily = [
    'Ahoj, pošleš mi prosím ten report?',
    'Výhra! Získejte iPhone zdarma, klikněte hned!'
]
nove_emaily_transformed = vectorizer.transform(nove_emaily)
predikce_nove = model.predict(nove_emaily_transformed)

print("\nTestování na nových emailech:")
for i, email in enumerate(nove_emaily):
    print(f"Email: '{email}' -> Predikce: {predikce_nove[i]}")

```

_Tento kód si můžete spustit v Google Colab. Ukazuje celý proces od surových textových dat až po funkční prediktivní model._

---

## 📚 Mini-slovník pojmů (Kapitoly 1-10)

Zde je souhrn klíčových pojmů, které jste se naučili v prvních 10 kapitolách kurzu. Pro podrobnější definice viz [Glosar.md](Glosar.md).

### Umělá inteligence (AI)

Schopnost počítačů vykonávat úkoly, které normálně vyžadují lidskou inteligenci.

### Slabá AI (Weak AI)

AI specializovaná na jeden konkrétní úkol (99% dnešních AI systémů).

### Silná AI (Strong AI)

AI s obecnou inteligencí a vědomím (zatím neexistuje).

### Strojové učení (Machine Learning)

Přístup k AI, kde se počítač učí ze dat místo explicitního programování pravidel.

### Hluboké učení (Deep Learning)

Podoblast strojového učení používající neuronové sítě s mnoha vrstvami.

### Neuronová síť (Neural Network)

Model inspirovaný strukturou mozku, složený z vrstev propojených "neuronů".

### Datová věda (Data Science)

Obor zabývající se extrakcí znalostí a vhledů z dat.

### Trénování (Training)

Proces, kdy se model učí ze dat úpravou svých parametrů.

### Inference

Použití natrénovaného modelu k předpovědi na nových datech.

### Model

Matematická reprezentace vzorů naučených z dat.

### Dataset

Soubor dat použitých pro trénování nebo testování modelu.

### Feature (Příznak)

Měřitelná vlastnost dat (ve sloupcích tabulky).

### Label (Štítek)

Správná odpověď/kategorie pro trénovací vzorek.

### Klasifikace (Classification)

Typ ML úlohy, kde model přiřazuje vstup do jedné z předdefinovaných kategorií.

### Regrese (Regression)

Typ ML úlohy, kde model predikuje spojitou číselnou hodnotu.

### Rozhodovací strom (Decision Tree)

Algoritmus, který rozhoduje pomocí série IF-THEN otázek.

### Přeučení (Overfitting)

Když model příliš dobře memoruje trénovací data a nefunguje na nových datech.

### Bias (Zaujatost)

Systematická nespravedlnost v AI systému, obvykle zděděná z dat.

### Etika v AI

Morální principy a pravidla pro odpovědný vývoj a použití AI.

### Černá skříňka (Black Box)

Problém, kdy nevíme, JAK a PROČ AI dospěla ke svému rozhodnutí.

### Google Colab

Cloudová služba umožňující spouštět Python kód v prohlížeči bez instalace.

### Python

Programovací jazyk nejpoužívanější v AI a datové vědě.

### Knihovna (Library)

Soubor hotových funkcí, které můžete použít ve svém kódu.

### Gradio

Python knihovna pro rychlé vytvoření webového rozhraní pro ML modely.

### Teachable Machine

No-code nástroj od Googlu pro trénování image/audio modelů.

### Supervised Learning (Učení s učitelem)

ML typ, kde trénovací data obsahují vstupy i správné odpovědi.

### Unsupervised Learning (Učení bez učitele)

ML typ, kde model hledá vzory v datech bez labels.

### Reinforcement Learning (Zpětnovazební učení)

ML typ, kde agent se učí akcemi a odměnami/tresty.

---

💡 **Tip:** Pokud při dalších kapitolách narazíte na neznámý pojem, vyhledejte ho v [Glosar.md](Glosar.md)!

---

**Správné odpovědi ke kvízu:**
1.b, 2.b, 3.b, 4.c, 5.b, 6.b, 7.b, 8.c, 9.b, 10.c
