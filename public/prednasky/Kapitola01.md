# Úvod do umělé inteligence: Váš první krok do světa strojů, které se učí

Představte si, že se probudíte a váš telefon vám už připravil playlist na míru vaší náladě. Cestou do práce vám navigace nejen ukazuje nejrychlejší trasu, ale předpovídá dopravní zácpy dřív, než vzniknou. V polední pauze si projedete fotky z dovolené a váš foťák sám rozpoznal a označil všechny vaše přátele. To není sci-fi, to je umělá inteligence (AI) v akci. Vítejte v první kapitole, kde odhalíme, co se skrývá za tímto magickým pojmem a jak můžete i vy naučit stroje přemýšlet.

---

## Co je to vlastně ta umělá inteligence?

Zapomeňte na chvíli na roboty z filmů. V jádru je umělá inteligence prostě snaha naučit počítače dělat úkoly, které by normálně vyžadovaly lidský mozek. Může to být cokoliv od rozpoznání kočky na obrázku po složení hudby.

Představte si AI jako dva různé druhy "mysli":

- **Slabá AI (Weak AI):** Tohle je 99 % toho, s čím se dnes setkáváme. Je to specialista na jeden úkol. Váš hlasový asistent je geniální v rozpoznávání příkazů, ale nezačne s vámi filozofovat o smyslu života. Je jako špičkový kuchař, který umí uvařit dokonalé jídlo, ale neopraví vám auto.
- **Silná AI (Strong AI):** To je ten svatý grál – stroj s vědomím a inteligencí srovnatelnou s lidskou. Zatím je to čistě teoretický koncept, který zaměstnává spíše filozofy a filmaře než programátory.

My se v tomto kurzu budeme věnovat té **slabé AI**, která je neuvěřitelně užitečná a mění svět právě teď.

---

## Klíčové pojmy, které vám otevřou dveře

Abychom mohli stavět dům, potřebujeme cihly. V AI jsou našimi cihlami tyto koncepty:

- **Strojové učení (Machine Learning):** Místo toho, abyste počítači přesně řekli, co má dělat, mu dáte hromadu příkladů a necháte ho, ať se to naučí sám. Je to jako učit dítě rozpoznat psa. Neřeknete mu "pokud to má čtyři nohy, ocas a štěká, je to pes". Ukážete mu deset psů a řeknete "tohle je pes". Po chvíli ho pozná samo.
- **Hluboké učení (Deep Learning):** To je takové strojové učení na steroidech. Používá "neuronové sítě", které jsou volně inspirované strukturou lidského mozku. Díky nim se počítač dokáže naučit velmi složité věci, jako je překlad jazyků v reálném čase nebo řízení auta.
- **Neuronové sítě (Neural Networks):** Představte si velkou firmu, kde každý zaměstnanec (neuron) má na starost malý úkol. Dostane informaci od kolegů, zpracuje ji a pošle dál. Když se všichni tito "zaměstnanci" spojí a spolupracují, dokážou vyřešit i velmi komplexní problém.
- **Datová věda (Data Science):** To je řemeslo, které to všechno umožňuje. Datoví vědci jsou detektivové, kteří v obrovském množství dat hledají vzory, příběhy a odpovědi na otázky. Bez dat by se žádná AI neměla z čeho učit.

---

## Kde všude AI pomáhá? Příklady, které znáte

Umělá inteligence není jen pro vědce v laboratořích. Používáte ji každý den:

1.  **Zdravotnictví:** Lékaři používají AI k analýze rentgenových snímků. AI dokáže najít miniaturní nádory, které by lidské oko mohlo přehlédnout, a to s neuvěřitelnou přesností.
2.  **Finance:** Vaše banka používá AI k ochraně vašeho účtu. Systém se naučí, jak běžně utrácíte, a pokud se objeví podezřelá transakce (třeba nákup v zemi, kde nejste), okamžitě ji zablokuje a upozorní vás.
3.  **Doprava:** Autonomní auta jsou jen špička ledovce. AI optimalizuje semafory ve městech, aby se tvořilo méně kolon, a logistické firmy díky ní plánují trasy tak, aby ušetřily palivo a čas.
4.  **Zábava:** Služby jako Netflix nebo Spotify analyzují, co se vám líbí, a doporučují vám další filmy a hudbu. Cílem je udržet vás u obrazovky (nebo se sluchátky) co nejdéle.
5.  **Zákaznický servis:** Když píšete dotaz na webu, často vám jako první odpovídá chatbot. Ty nejlepší už dnes dokáží vyřešit většinu běžných problémů a lidskému operátorovi předají jen ty složitější případy.

---

## Váš první projekt: Naučte počítač rozhodovat!

Pojďme si to vyzkoušet. Vytvoříme jednoduchý "rozhodovací strom". Je to jeden z nejjednodušších a nejlépe pochopitelných algoritmů strojového učení. Náš cíl? Naučit počítač, aby na základě jednoduchých otázek poznal, jestli je ovoce jablko, nebo pomeranč.

**Co budete potřebovat?**
Pro náš první projekt použijeme **Google Colab**. Je to jako online poznámkový blok, kde můžete psát text a spouštět Python kód přímo v prohlížeči, bez jakékoliv instalace.

1.  Jděte na [colab.research.google.com](https://colab.research.google.com).
2.  Klikněte na "Nový poznámkový blok".

**Krok 1: Připravíme si "data"**

V reálném světě bychom měli velkou tabulku s daty. Pro náš příklad si je vytvoříme sami. Budeme mít data o ovoci – jeho váhu v gramech a texturu (0 = hladká, 1 = hrbolatá).

```python
# V Pythonu používáme knihovny, které nám usnadňují práci.
# Scikit-learn je zlatý standard pro strojové učení.
from sklearn import tree

# Naše "trénovací" data: [váha v gramech, textura (0=hladká, 1=hrbolatá)]
# Například [140, 0] je 140g hladké ovoce.
features = [[140, 0], [130, 0], [150, 1], [170, 1]]

# A tady jsou "správné odpovědi" (štítky). 0 = jablko, 1 = pomeranč.
# První ovoce (140g, hladké) je jablko, třetí (150g, hrbolaté) je pomeranč.
labels = [0, 0, 1, 1]
```

_Vložte tento kód do buňky v Colabu a spusťte ho stisknutím Shift+Enter._

**Krok 2: Vytvoříme a natrénujeme model**

Teď vytvoříme prázdný rozhodovací strom a "nakrmíme" ho našimi daty. Tomuto procesu se říká **trénování modelu**.

```python
# Vytvoříme prázdný model (klasifikátor) rozhodovacího stromu.
clf = tree.DecisionTreeClassifier()

# Natrénujeme model. Metoda .fit() najde vzory v našich datech.
# Počítač se teď "učí", jaká váha a textura odpovídá jablku a jaká pomeranči.
clf = clf.fit(features, labels)
```

_Vložte do další buňky a spusťte._

**Krok 3: Zeptáme se modelu na předpověď**

Model je natrénovaný! Teď se ho můžeme zeptat, co si myslí o novém kusu ovoce, který ještě neviděl. Co třeba 160g hrbolaté ovoce?

```python
# Zeptáme se modelu: "Co je ovoce, které váží 160g a má hrbolatou texturu?"
# Odpověď 0 znamená jablko, 1 znamená pomeranč.
prediction = clf.predict([[160, 1]])

# Vytiskneme výsledek srozumitelnou formou.
if prediction == 0:
    print("Předpověď: Je to Jablko!")
else:
    print("Předpověď: Je to Pomeranč!")

# Zkuste změnit hodnoty! Co třeba [120, 0] (120g hladké)?
```

_Vložte do další buňky a spusťte. Gratulujeme, právě jste natrénovali a použili svůj první AI model!_

---

## Závěr: Vaše cesta teprve začíná

Dnes jste udělali obrovský krok. Pochopili jste, že umělá inteligence není žádná černá magie, ale mocný nástroj postavený na datech a logice.

**Co jste se naučili:**

- Rozdíl mezi slabou a silnou AI.
- Co je strojové učení, hluboké učení a neuronová síť.
- Jak AI ovlivňuje svět od medicíny po zábavu.
- Napsali jste svůj první funkční kód, který se "učí" z dat.

Vaše výzva? Zkuste si v Colabu hrát. Přidejte do dat další ovoce. Co kdybychom přidali třetí vlastnost, třeba barvu? Jak by to změnilo kód? Nebojte se experimentovat. Právě jste otevřeli dveře do jednoho z nejvíce vzrušujících oborů současnosti. V příští kapitole se podíváme hlouběji na strojové učení.
