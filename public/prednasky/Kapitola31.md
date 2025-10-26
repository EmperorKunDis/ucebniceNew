# Zpětná propagace: Jak se neuronová síť učí ze svých chyb

V minulé kapitole jsme postavili vícevrstvou síť, která dokázala vyřešit problém XOR. Ale nechali jsme tam jedno velké tajemství – jak přesně funguje proces učení? Řekli jsme, že síť "šíří chybu zpět", ale co to znamená? Dnes odhalíme toto tajemství.

Představte si, že síť je tým dělníků, kteří staví zeď. Na konci přijde mistr (ztrátová funkce) a řekne: "Zeď je o 10 cm křivá!" **Zpětná propagace (Backpropagation)** je proces, kdy mistr jde od posledního dělníka (výstupní vrstva) k prvnímu (vstupní vrstva) a každému řekne, jak moc se _on_ podílel na celkové křivosti a jakým směrem má příště pohnout svou cihlou (upravit svou váhu). Je to geniální algoritmus pro spravedlivé rozdělení "viny" a nápravu chyb.

---

## Čtyři kroky učení: Cyklus zpětné vazby

Každý tréninkový cyklus (epocha) v neuronové síti se skládá ze čtyř základních kroků. Ukážeme si je na našem problému XOR, tentokrát s využitím knihovny **PyTorch**, která nám celý proces neuvěřitelně zjednoduší.

1.  **Dopředný průchod (Forward Pass):** Pošleme vstupní data skrze síť a necháme ji udělat predikci. Je to jako když se dělníci postaví na svá místa a postaví zeď podle aktuálního plánu.
2.  **Výpočet ztráty (Loss Calculation):** Porovnáme predikci sítě se správnou odpovědí a spočítáme, jak moc se síť mýlila. To je náš "mistr", který měří křivost zdi.
3.  **Zpětný průchod (Backward Pass):** Zde se děje kouzlo. Zavoláme funkci `.backward()` na naší ztrátě. PyTorch automaticky provede zpětnou propagaci – spočítá pro každou váhu v síti, jak moc přispěla k celkové chybě (matematicky řečeno, spočítá gradienty).
4.  **Aktualizace vah (Weight Update):** Nakonec řekneme "optimalizátoru" (našemu stavbyvedoucímu), aby udělal krok (`.step()`). Ten vezme vypočítané "viny" a mírně upraví všechny váhy v síti tak, aby příští pokus byl o něco lepší.

Tento cyklus opakujeme tisíckrát a síť se postupně, krok za krokem, stává přesnější.

---

## Praktický projekt: Řešení XOR v PyTorch a vizualizace učení

Pojďme si ukázat, jak elegantní je tento proces v PyTorch. Vyřešíme stejný problém XOR, ale tentokrát s mnohem jednodušším a čistším kódem.

**Krok 1: Příprava prostředí a dat**

```bash
pip install torch matplotlib
```

```python
import torch
import torch.nn as nn
import matplotlib.pyplot as plt

# Data pro XOR jako PyTorch tenzory
X = torch.tensor([[0, 0], [0, 1], [1, 0], [1, 1]], dtype=torch.float32)
y = torch.tensor([[0], [1], [1], [0]], dtype=torch.float32)
```

**Krok 2: Definice sítě a trénink**

Vytvoříme si jednoduchou síť a trénovací smyčku, která bude ukládat hodnotu ztráty v každé epoše.

```python
# Definice architektury sítě
class XORNet(nn.Module):
    def __init__(self):
        super(XORNet, self).__init__()
        self.layer1 = nn.Linear(2, 4) # Vstupní vrstva (2 neurony) -> Skrytá vrstva (4 neurony)
        self.activation = nn.ReLU()   # Aktivační funkce pro skrytou vrstvu
        self.layer2 = nn.Linear(4, 1) # Skrytá vrstva -> Výstupní vrstva (1 neuron)
        self.output_activation = nn.Sigmoid()

    def forward(self, x):
        x = self.layer1(x)
        x = self.activation(x)
        x = self.layer2(x)
        x = self.output_activation(x)
        return x

model = XORNet()

# Definice ztrátové funkce a optimalizátoru
criterion = nn.MSELoss() # Mean Squared Error Loss
optimizer = torch.optim.SGD(model.parameters(), lr=0.1) # Stochastic Gradient Descent

# Trénovací smyčka
epochs = 10000
losses = [] # Seznam pro ukládání ztráty v každé epoše

for epoch in range(epochs):
    # 1. Dopředný průchod
    outputs = model(X)

    # 2. Výpočet ztráty
    loss = criterion(outputs, y)
    losses.append(loss.item()) # Uložíme hodnotu ztráty

    # Vynulování gradientů před zpětným průchodem
    optimizer.zero_grad()

    # 3. Zpětný průchod (Backpropagation)
    loss.backward()

    # 4. Aktualizace vah
    optimizer.step()

    if (epoch + 1) % 1000 == 0:
        print(f'Epocha [{epoch+1}/{epochs}], Ztráta: {loss.item():.4f}')

print("\nTrénink dokončen!")
```

**Krok 3: Vizualizace procesu učení (Učící křivka)**

Nyní se podíváme, jak se model učil. Vykreslíme si graf, který ukazuje, jak ztráta (chyba) postupně klesala s každou epochou.

```python
# Vizualizace učící křivky
plt.figure(figsize=(10, 6))
plt.plot(losses)
plt.title('Průběh učení neuronové sítě (Učící křivka)')
plt.xlabel('Epocha')
plt.ylabel('Ztráta (Loss)')
plt.grid(True)
plt.show()

# Finální test modelu
with torch.no_grad():
    test_predictions = model(X)
    print("\nFinální predikce pro vstupy [0,0], [0,1], [1,0], [1,1]:")
    print(torch.round(test_predictions).flatten())
```

**Co jsme se dozvěděli?** Graf učící křivky je vizuálním důkazem učení. Vidíte, jak chyba na začátku strmě klesá a postupně se ustálí na velmi nízké hodnotě. Síť se úspěšně naučila řešit problém XOR.

---

## Závěr: Motor hlubokého učení

Gratuluji! Dnes jste nahlédli do samotného srdce a motoru moderního hlubokého učení. Viděli jste, že:

- **Zpětná propagace (backpropagation)** je chytrý algoritmus pro "spravedlivé" rozdělení viny za chybu mezi všechny váhy v síti.
- Moderní knihovny jako **PyTorch** tento neuvěřitelně složitý matematický proces automatizují do jediného příkazu: `loss.backward()`.
- **Učící křivka** (graf ztráty v čase) je jako EKG naší sítě – umožňuje nám sledovat její "zdraví" a to, jak dobře se učí.

Tento cyklus – dopředný průchod, výpočet chyby, zpětná propagace a aktualizace vah – je základem pro trénování téměř všech neuronových sítí, od těch malých až po obrovské jazykové modely.

**Vaše výzva:** Experimentujte s "hyperparametry" v našem kódu. Zkuste změnit **rychlost učení (`lr`)** v optimizeru. Co se stane, když ji nastavíte na velmi vysokou hodnotu (např. `1.0`)? A co na velmi nízkou (např. `0.001`)? Sledujte, jak se změní tvar učící křivky.
