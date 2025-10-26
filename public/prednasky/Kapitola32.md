# Dropout: Jak naučit neuronovou síť, aby si nebyla tak jistá sama sebou

Představte si studenta, který se na zkoušku učí tak, že se celý test i se správnými odpověďmi naučí nazpaměť. Na tomto konkrétním testu bude mít 100% úspěšnost. Ale když dostane mírně odlišnou otázku, která testuje skutečné pochopení, selže. Nenaučil se totiž principy, jen si zapamatoval data.

Tomuto jevu se v umělé inteligenci říká **přeučení (overfitting)**. Je to nepřítel číslo jedna každého datového vědce. Model je tak posedlý detaily a šumem v trénovacích datech, že ztratí schopnost **generalizovat** – tedy správně fungovat na nových, neviděných datech.

Dnes si ukážeme, jak tomu zabránit pomocí jedné z nejchytřejších a nejjednodušších technik: **Dropoutu**. Je to jako kdybychom studentovi při učení náhodně zakrývali části textu v učebnici. Donutíme ho tak přemýšlet o souvislostech a nespoléhat se na to, že se jedno konkrétní slovo vždy objeví na stejném místě.

---

## Jak Dropout funguje? Týmová práce vynucená náhodou

Princip Dropoutu je geniálně jednoduchý:

> Během každého kroku tréninku náhodně "vypneme" (ignorujeme) určitý podíl neuronů ve skryté vrstvě.

Představte si to jako tým expertů. Pokud víte, že se na experta č. 3 můžete vždy spolehnout, ostatní experti zleniví. Ale co když expert č. 3 může kdykoliv náhodně "onemocnět" a nebýt k dispozici? Ostatní se musí naučit jeho práci také, aby ho dokázali zastoupit. Tým se stane robustnější a nespoléhá na jednotlivce.

Přesně to dělá Dropout. Nutí síť, aby se neučila spoléhat na pár specifických neuronů, ale aby si vytvářela redundantní, distribuované znalosti napříč celou sítí. Výsledkem je model, který lépe generalizuje.

---

## Praktický projekt: Zkrocení přeučené sítě

Pojďme si ukázat sílu Dropoutu v praxi. Záměrně vytvoříme síť, která se přeučí, a pak ji pomocí Dropoutu "vyléčíme". Použijeme k tomu opět dataset "dvou měsíců", ale tentokrát s větším množstvím šumu.

**Krok 1: Příprava prostředí a dat**

```bash
pip install torch scikit-learn numpy matplotlib
```

```python
import torch
import torch.nn as nn
from sklearn.datasets import make_moons
import matplotlib.pyplot as plt
import numpy as np

# 1. Vytvoření dat s větším šumem
X, y = make_moons(n_samples=500, noise=0.3, random_state=42)
X_torch = torch.from_numpy(X).float()
y_torch = torch.from_numpy(y).float().view(-1, 1)

# Rozdělení na trénovací a testovací sadu
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(X_torch, y_torch, test_size=0.2, random_state=42)
```

**Krok 2: Model s Dropoutem a bez něj**

Vytvoříme si architekturu sítě, která bude mít možnost zapnout nebo vypnout Dropout vrstvy. Síť bude záměrně příliš velká a komplexní na tak jednoduchý problém, aby měla tendenci se přeučit.

```python
class MoonNet(nn.Module):
    def __init__(self, use_dropout=False):
        super(MoonNet, self).__init__()
        self.use_dropout = use_dropout
        self.layer1 = nn.Linear(2, 128)
        self.layer2 = nn.Linear(128, 128)
        self.layer3 = nn.Linear(128, 1)
        self.relu = nn.ReLU()
        self.dropout = nn.Dropout(p=0.5) # p=0.5 znamená, že vypínáme 50 % neuronů
        self.sigmoid = nn.Sigmoid()

    def forward(self, x):
        x = self.relu(self.layer1(x))
        if self.use_dropout:
            x = self.dropout(x) # Aplikujeme dropout po první vrstvě
        x = self.relu(self.layer2(x))
        if self.use_dropout:
            x = self.dropout(x) # Aplikujeme dropout po druhé vrstvě
        x = self.sigmoid(self.layer3(x))
        return x

# Funkce pro trénink a vyhodnocení
def train_and_evaluate(model, model_name):
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.BCELoss()
    model.train() # Přepnutí modelu do trénovacího režimu

    for epoch in range(10000):
        outputs = model(X_train)
        loss = criterion(outputs, y_train)
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

    model.eval() # Přepnutí modelu do vyhodnocovacího režimu (vypne dropout)
    with torch.no_grad():
        train_preds = torch.round(model(X_train))
        test_preds = torch.round(model(X_test))
        train_acc = (train_preds.eq(y_train).sum() / len(y_train)).item()
        test_acc = (test_preds.eq(y_test).sum() / len(y_test)).item()

    print(f"--- Výsledky pro model: {model_name} ---")
    print(f"Přesnost na trénovacích datech: {train_acc*100:.2f}%")
    print(f"Přesnost na TESTOVACÍCH datech: {test_acc*100:.2f}%")
    # Zde by následoval kód pro vizualizaci rozhodovací hranice...
```

**Krok 3: Experiment a porovnání**

Nyní natrénujeme oba modely a porovnáme jejich výsledky.

```python
# Trénink modelu BEZ dropoutu
model_bez_dropoutu = MoonNet(use_dropout=False)
train_and_evaluate(model_bez_dropoutu, "Bez Dropoutu")

# Trénink modelu S dropoutem
model_s_dropoutem = MoonNet(use_dropout=True)
train_and_evaluate(model_s_dropoutem, "S Dropoutem")
```

**Očekávané výsledky a "Aha!" moment:**

- **Model bez Dropoutu:** Dosáhne velmi vysoké přesnosti na trénovacích datech (např. 98 %), ale na testovacích datech bude jeho přesnost znatelně nižší (např. 91 %). To je jasný znak přeučení. Jeho rozhodovací hranice by byla velmi "kostrbatá", snažila by se obkreslit každý jednotlivý bod.
- **Model s Dropoutem:** Jeho přesnost na trénovacích datech bude o něco nižší (např. 95 %), protože jsme mu učení "ztížili". Ale jeho přesnost na **testovacích datech bude vyšší** (např. 94 %)! Model lépe generalizuje. Jeho rozhodovací hranice bude hladší a bude lépe vystihovat skutečný tvar "měsíců", ignorujíc šum.

---

## Závěr: Lék na přílišné sebevědomí AI

Dnes jste na vlastní oči viděli nepřítele číslo jedna – **přeučení** – a naučili jste se, jak proti němu bojovat. Dropout je jako přidání "šumu" a nejistoty do procesu učení, který nutí síť, aby se nespoléhala na jednotlivé neurony a vytvářela si robustnější, obecnější znalosti.

Je to jedna z mnoha tzv. **regulačních technik**, které zajišťují, že naše modely jsou dobrými studenty, kteří chápou principy, a ne jen stroji na memorování. V praxi se Dropout používá téměř ve všech moderních neuronových sítích.

**Vaše výzva:** Experimentujte s parametrem `p` v `nn.Dropout(p=...)`. Tento parametr určuje, jaké procento neuronů se vypíná. Co se stane, když nastavíte `p=0.1` (vypínáte jen 10 %)? A co když `p=0.8` (vypínáte 80 %)? Jak to ovlivní rozdíl mezi trénovací a testovací přesností a výslednou rozhodovací hranici?
