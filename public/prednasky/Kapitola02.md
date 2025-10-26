# Historie AI: Souboj dvou myšlenek a příběh o tom, jak jsme naučili stroje snít

Představte si dva tábory vědců. První, říkejme jim "Architekti pravidel", věří, že inteligenci lze postavit jako dům – cihlu po cihle, pravidlo po pravidlu. Chtějí počítači dát dokonalou mapu lidského myšlení. Druhý tábor, "Zahradníci mozků", na to jde jinak. Věří, že inteligenci nelze postavit, ale musí vyrůst, podobně jako roste mozek. Chtějí zasadit semínko a nechat ho, ať se učí a propojuje samo. Tento souboj myšlenek je skutečným příběhem umělé inteligence. Není to jen nudný seznam dat a jmen, ale drama plné zvratů, slepých uliček a nakonec i triumfu.

---

## První jiskry: Turingův sen a zrození v Dartmouthu

Všechno začalo jedinou, provokativní otázkou: "Mohou stroje myslet?" Položil ji v roce 1950 geniální britský matematik **Alan Turing**, muž, který za druhé světové války prolomil kód Enigmy. Místo aby se utápěl ve filozofických definicích, navrhl geniálně jednoduchý test: **Turingův test**.

- **Jak funguje?** Představte si, že si píšete se dvěma neviditelnými partnery. Jeden je člověk, druhý je stroj. Pokud po pěti minutách konverzace nedokážete s jistotou říct, kdo je kdo, stroj testem prošel.
- **Proč je to tak důležité?** Turing přesunul debatu od nekonečného "co je inteligence?" k praktickému "jak poznáme inteligentní chování?". Tím otevřel dveře inženýrům a programátorům.

Oficiálně se ale AI narodila v létě roku 1956 na **Dartmouth College**. Skupina vizionářů (John McCarthy, Marvin Minsky a další) zde uspořádala workshop, kde poprvé zazněl termín "umělá inteligence". Jejich sen? Během jednoho léta položit základy strojů, které by dokázaly používat jazyk a tvořit. Byli neuvěřitelně optimističtí. Netušili, že je čekají desítky let práce.

---

## Velký rozkol: Architekti pravidel vs. Zahradníci mozků

Po Dartmouthu se pole rozdělilo na dva zmíněné tábory:

1.  **Symbolická AI (Architekti pravidel):** Vládli 60. a 70. letům. Věřili, že lidské myšlení je založeno na manipulaci se symboly (slova, čísla, pojmy) podle jasných logických pravidel. Jejich cílem bylo naprogramovat do počítače veškeré lidské vědění a pravidla pro jeho použití.
    - **Příklad:** Expertní systém **MYCIN**, který lékařům pomáhal diagnostikovat krevní infekce. Měl v sobě stovky "IF-THEN" pravidel, jako: "POKUD má pacient horečku A vyrážku, POTOM zvaž diagnózu X". Bylo to chytré, ale křehké. Co když se objevil příznak, který v pravidlech nebyl?

2.  **Konekcionismus (Zahradníci mozků):** Tento přístup byl inspirován biologií. Jeho zastánci, jako **Frank Rosenblatt** se svým **Perceptronem** (primitivní neuronovou sítí), chtěli vytvořit modely, které by se učily samy z příkladů, podobně jako se učí lidský mozek. V počátcích ale jejich modely zvládaly jen velmi jednoduché úkoly a byly terčem posměchu. Na desítky let se tento směr stal v AI okrajovým.

---

## Praktický projekt: Vizualizujte historii AI jako síť vztahů

Slova jsou jedna věc, ale obraz vydá za tisíc slov. Pojďme si vytvořit vizualizaci, která ukáže klíčové postavy a události historie AI a vztahy mezi nimi. Použijeme k tomu dvě mocné Python knihovny: `networkx` pro tvorbu grafů a `matplotlib` pro jejich zobrazení.

**Co budete potřebovat?**
Opět použijeme **Google Colab**.

1.  Jděte na [colab.research.google.com](https://colab.research.google.com) a vytvořte si nový poznámkový blok.
2.  Nejprve musíme nainstalovat knihovnu `networkx`.

```python
# V Colabu můžeme instalovat balíčky přímo v buňce pomocí 'pip'
!pip install networkx
```

_Vložte do buňky a spusťte._

**Krok 1: Vytvoříme graf a přidáme uzly (osoby a události)**

```python
import networkx as nx
import matplotlib.pyplot as plt

# Vytvoříme prázdný graf (síť)
G = nx.Graph()

# Přidáme uzly - klíčové body naší historie
# Můžeme jim dát atributy, např. typ (osoba/událost)
G.add_node("Alan Turing", type='person')
G.add_node("Turingův test", type='event')
G.add_node("Dartmouth Conf.", type='event')
G.add_node("John McCarthy", type='person')
G.add_node("Marvin Minsky", type='person')
G.add_node("Symbolická AI", type='concept')
G.add_node("Konekcionismus", type='concept')
G.add_node("Geoffrey Hinton", type='person') # Jeden z otců konekcionismu
G.add_node("Neuronové sítě", type='concept')
```

_Vložte do další buňky a spusťte._

**Krok 2: Propojíme uzly hranami (vztahy)**

```python
# Teď vytvoříme vztahy mezi uzly
G.add_edge("Alan Turing", "Turingův test")
G.add_edge("John McCarthy", "Dartmouth Conf.")
G.add_edge("Marvin Minsky", "Dartmouth Conf.")
G.add_edge("John McCarthy", "Symbolická AI")
G.add_edge("Marvin Minsky", "Symbolická AI")
G.add_edge("Geoffrey Hinton", "Konekcionismus")
G.add_edge("Konekcionismus", "Neuronové sítě")
G.add_edge("Symbolická AI", "Dartmouth Conf.") # Symbolický přístup dominoval po konferenci
```

_Vložte do další buňky a spusťte._

**Krok 3: Vizualizujeme graf**

Teď to nejlepší – necháme si graf vykreslit. Pro přehlednost obarvíme uzly podle typu.

```python
# Nastavíme velikost obrázku
plt.figure(figsize=(12, 8))

# Rozmístění uzlů pro lepší čitelnost
pos = nx.spring_layout(G, seed=42)

# Obarvíme uzly podle jejich typu
colors = []
for node in G.nodes(data=True):
    if node[1]['type'] == 'person':
        colors.append('skyblue')
    elif node[1]['type'] == 'event':
        colors.append('lightgreen')
    else:
        colors.append('salmon')

# Vykreslíme graf
nx.draw(G, pos, with_labels=True, node_size=3000, node_color=colors, font_size=10, font_weight='bold')

# Zobrazíme výsledek
plt.title("Síť klíčových momentů v historii AI", size=15)
plt.show()
```

_Vložte do poslední buňky a spusťte. Měli byste vidět krásný graf, který vizuálně shrnuje naši lekci!_

---

## Závěr: Návrat Zahradníků a vaše role v příběhu

Desítky let dominovali "Architekti pravidel". Ale s příchodem obrovského množství dat a mnohem výkonnějších počítačů v 21. století se stalo něco nečekaného. "Zahradníci mozků" a jejich neuronové sítě se vrátili na scénu v plné síle. Ukázalo se, že pro složité úkoly, jako je rozpoznávání obrazu nebo překlad, je mnohem efektivnější nechat stroj, ať se to naučí sám z milionů příkladů, než se snažit napsat všechna pravidla ručně.

Dnes žijeme ve světě, který si vysnili konekcionisté. A nejlepší na tom je, že nástroje k "pěstování" vlastní AI jsou dostupné všem. Tím, že jste si dnes vizualizovali historii, jste se stali součástí tohoto příběhu. Příště se podíváme na to, jak funguje ten nejdůležitější nástroj moderní AI – strojové učení.
