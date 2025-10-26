# Aktivační funkce: Dejte svému neuronu osobnost

V minulé kapitole jsme postavili naši první neuronovou síť. Viděli jsme, že neurony sčítají vážené vstupy a posílají výsledek dál. Ale co se přesně stane s tímto součtem? Jak se neuron "rozhodne", zda má "pálit" (poslat silný signál), být potichu, nebo něco mezi?

Toto rozhodnutí dělá **aktivační funkce**. Představte si ji jako "regulátor hlasitosti" nebo "osobnost" neuronu. Jednoduchý Perceptron měl jen přepínač ON/OFF (skoková funkce). Moderní neurony mají mnohem sofistikovanější regulátory, které jim umožňují učit se komplexní, nelineární vzory. Dnes se podíváme na ty nejdůležitější a vizualizujeme si, jak dramaticky ovlivňují, co se síť dokáže naučit.

---

## Galerie osobností: Sigmoid, Tanh a ReLU

Existuje mnoho aktivačních funkcí, ale tři z nich tvoří absolutní základ. Pojďme si jejich "osobnosti" vizualizovat.

```python
import numpy as np
import matplotlib.pyplot as plt

def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def tanh(x):
    return np.tanh(x)

def relu(x):
    return np.maximum(0, x)

x = np.linspace(-5, 5, 100)

plt.figure(figsize=(12, 7))
plt.plot(x, sigmoid(x), label='Sigmoid')
plt.plot(x, tanh(x), label='Tanh')
plt.plot(x, relu(x), label='ReLU')
plt.title('Tři základní aktivační funkce')
plt.xlabel('Vstup neuronu (vážený součet)')
plt.ylabel('Výstup neuronu (aktivace)')
plt.legend()
plt.grid(True)
plt.ylim(-1.2, 1.5)
plt.show()
```

- **Sigmoid (modrá):** Klasická volba. Jakékoliv číslo "zmáčkne" do rozsahu mezi 0 a 1. Je skvělá pro výstupní vrstvu, když chceme výsledek interpretovat jako pravděpodobnost.
- **Tanh (oranžová):** Velmi podobná Sigmoidu, ale "mačká" čísla do rozsahu -1 až 1. Její výstup je centrovaný kolem nuly, což často mírně zlepšuje a zrychluje trénink ve skrytých vrstvách.
- **ReLU (zelená):** Hvězda moderních sítí. Její osobnost je brutálně jednoduchá: "Pokud je vstup negativní, můj výstup je 0. Pokud je pozitivní, prostě ho pošlu dál." Je výpočetně extrémně rychlá a ve většině případů funguje nejlépe pro skryté vrstvy.

---

## Praktický projekt: Souboj aktivací na "problému dvou měsíců"

Teorie je fajn, ale pojďme si ukázat, jaký mají tyto funkce dopad v praxi. Použijeme k tomu **PyTorch**, moderní knihovnu pro hluboké učení, a pokusíme se vyřešit problém, který je pro lineární modely nemožný: oddělit dva propletené "půlměsíce".

**Krok 1: Příprava prostředí a dat**

```bash
pip install torch scikit-learn numpy matplotlib
```

```python
import torch
import torch.nn as nn
from sklearn.datasets import make_moons
import matplotlib.pyplot as plt

# 1. Vytvoření a vizualizace dat
X, y = make_moons(n_samples=200, noise=0.1, random_state=42)
X_torch = torch.from_numpy(X).float()
y_torch = torch.from_numpy(y).float().view(-1, 1)

plt.figure(figsize=(8, 6))
plt.scatter(X[:,0], X[:,1], c=y, cmap=plt.cm.coolwarm)
plt.title('Dataset "Dva měsíce"')
plt.show()
```

_Vidíte, že data nelze oddělit jednou přímkou. Potřebujeme nelinearitu._

**Krok 2: Stavba a trénink sítě**

Vytvoříme si jednoduchou neuronovou síť a trénovací smyčku. Klíčové bude, že si budeme moci vybrat, jakou aktivační funkci použijeme ve skryté vrstvě.

```python
# 2. Definice modelu
class Net(nn.Module):
    def __init__(self, activation_func):
        super(Net, self).__init__()
        self.hidden = nn.Linear(2, 16) # Skrytá vrstva s 16 neurony
        self.activation = activation_func # Možnost volby aktivace
        self.output = nn.Linear(16, 1)  # Výstupní vrstva

    def forward(self, x):
        x = self.activation(self.hidden(x))
        x = torch.sigmoid(self.output(x)) # Na výstupu vždy Sigmoid pro pravděpodobnost
        return x

# 3. Trénovací smyčka
def train_and_visualize(activation_func, activation_name):
    model = Net(activation_func)
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    criterion = nn.BCELoss() # Loss funkce pro binární klasifikaci

    for epoch in range(5000):
        optimizer.zero_grad()
        outputs = model(X_torch)
        loss = criterion(outputs, y_torch)
        loss.backward()
        optimizer.step()

    # Kód pro vizualizaci rozhodovací hranice (podobný jako v kapitole o KNN)
    # ... (pro zjednodušení zde vynechán, ale je v plném kódu)
    # Výsledkem bude graf, který ukazuje, jak se model naučil data rozdělit.
    print(f"Trénink dokončen pro: {activation_name}")
    # Zde by následoval kód pro vykreslení grafu s rozhodovací hranicí
    # Např. plot_decision_boundary(model, X, y, f"Hranice pro {activation_name}")
```

**Krok 3: Souboj! ReLU vs. Tanh**

Nyní natrénujeme dvě identické sítě, které se liší pouze v jedné věci – v "osobnosti" jejich skrytých neuronů.

- **Model 1: Použije Tanh**
  - `train_and_visualize(nn.Tanh(), "Tanh")`
  - **Očekávaný výsledek:** Model se naučí data oddělit. Hranice bude hladká, plynule kopírující tvar měsíců.

- **Model 2: Použije ReLU**
  - `train_and_visualize(nn.ReLU(), "ReLU")`
  - **Očekávaný výsledek:** Model se také naučí data oddělit, často rychleji (potřeboval by méně epoch). Hranice bude složená z rovných úseků, bude "ostřejší" a méně hladká.

_Při spuštění plného kódu byste viděli dva grafy. První s hladkou hranicí od Tanh, druhý s ostrou, lineární hranicí od ReLU. Oba modely problém vyřeší, ale každý jiným "stylem"._

---

## Závěr: Osobnost, která definuje učení

Dnes jste viděli, že aktivační funkce není jen drobný detail – je to srdce neuronu, které definuje jeho chování a schopnost učit se.

- **Sigmoid a Tanh** jsou hladké funkce, které byly historicky velmi populární. Jejich nevýhodou je, že u velmi hlubokých sítí může jejich "učící signál" slábnout (tzv. _vanishing gradient problem_).
- **ReLU** je dnes standardní a nejčastější volbou pro skryté vrstvy. Je výpočetně efektivní a v praxi funguje skvěle pro většinu problémů, i když má své vlastní drobné mouchy (jako "umírající neurony").

Správná volba aktivační funkce je jedním z klíčových rozhodnutí při návrhu architektury neuronové sítě.

**Vaše výzva:** Zkuste si v (plném) kódu pro tento projekt přidat další skrytou vrstvu do naší sítě. Jak to ovlivní tvar rozhodovací hranice? A co se stane, když změníte počet neuronů ve skrytých vrstvách? Sledujte, jak se mění schopnost sítě "obkreslit" složité tvary v datech.
