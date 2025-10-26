# Projekt Neuronové sítě: Naučte AI číst ručně psané číslice

V minulých kapitolách jsme si postavili první neurony a sítě od nuly. Dnes odložíme šroubovák a sedneme za volant skutečného "sporťáku" hlubokého učení. Naším úkolem bude postavit a natrénovat neuronovou síť, která se naučí číst a rozpoznávat ručně psané číslice.

Použijeme k tomu slavný dataset **MNIST**, který je v podstatě "Hello, World!" pro počítačové vidění, a moderní knihovnu **PyTorch**. Na konci této kapitoly budete mít funkční model, který je základem pro rozpoznávání textu v reálném světě, a získáte praktickou zkušenost s celým procesem vývoje v PyTorch.

---

## Seznámení s datasetem MNIST

MNIST je obrovská databáze ručně psaných číslic, kterou vytvořili američtí středoškoláci a zaměstnanci úřadu pro sčítání lidu. Obsahuje 60 000 obrázků pro trénování a 10 000 obrázků pro testování. Každý obrázek je malý, černobílý, o velikosti 28x28 pixelů. Pro každý obrázek máme "štítek" – správnou číslici, kterou reprezentuje. Naším úkolem je naučit síť, aby se podívala na obrázek a správně určila, o jakou číslici se jedná.

---

## Praktický projekt: Klasifikátor číslic v PyTorch

Projdeme si celý proces krok za krokem, od načtení dat až po finální vyhodnocení.

**Krok 1: Příprava prostředí a dat**

```bash
pip install torch torchvision matplotlib
```

```python
import torch
import torch.nn as nn
import torchvision
import torchvision.transforms as transforms
import matplotlib.pyplot as plt

# Nastavení hyperparametrů
input_size = 784  # 28x28 pixelů zploštěných do jednoho vektoru
hidden_size = 128 # Počet neuronů ve skryté vrstvě
num_classes = 10  # 10 číslic (0-9)
num_epochs = 5    # Kolikrát projdeme celá trénovací data
batch_size = 100  # Kolik obrázků zpracujeme najednou
learning_rate = 0.001

# 1. Načtení a příprava MNIST datasetu
train_dataset = torchvision.datasets.MNIST(root='./data',
                                           train=True,
                                           transform=transforms.ToTensor(),
                                           download=True)

test_dataset = torchvision.datasets.MNIST(root='./data',
                                          train=False,
                                          transform=transforms.ToTensor())

# DataLoader pro efektivní práci s daty
train_loader = torch.utils.data.DataLoader(dataset=train_dataset,
                                           batch_size=batch_size,
                                           shuffle=True)

test_loader = torch.utils.data.DataLoader(dataset=test_dataset,
                                          batch_size=batch_size,
                                          shuffle=False)

# Ukázka několika obrázků
examples = iter(test_loader)
example_data, example_targets = next(examples)

for i in range(6):
    plt.subplot(2,3,i+1)
    plt.imshow(example_data[i][0], cmap='gray')
plt.suptitle("Ukázka číslic z MNIST datasetu")
plt.show()
```

**Krok 2: Definice architektury sítě**

Vytvoříme si jednoduchou síť se dvěma skrytými vrstvami.

```python
# 2. Definice modelu neuronové sítě
class NeuralNet(nn.Module):
    def __init__(self, input_size, hidden_size, num_classes):
        super(NeuralNet, self).__init__()
        self.l1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.l2 = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out = self.l1(x)
        out = self.relu(out)
        out = self.l2(out)
        # Softmax pro výstupní pravděpodobnosti se aplikuje v loss funkci
        return out

model = NeuralNet(input_size, hidden_size, num_classes)
```

**Krok 3: Definice ztrátové funkce a optimalizátoru**

```python
# 3. Ztrátová funkce a optimalizátor
criterion = nn.CrossEntropyLoss() # Ideální pro více-třídní klasifikaci
optimizer = torch.optim.Adam(model.parameters(), lr=learning_rate)
```

**Krok 4: Trénovací smyčka**

Toto je srdce celého procesu, kde se model učí.

```python
# 4. Trénovací smyčka
print("\n--- Zahajuji trénink ---")
n_total_steps = len(train_loader)
for epoch in range(num_epochs):
    for i, (images, labels) in enumerate(train_loader):
        # Zploštění obrázků z [100, 1, 28, 28] na [100, 784]
        images = images.reshape(-1, 28*28)

        # Dopředný průchod
        outputs = model(images)
        loss = criterion(outputs, labels)

        # Zpětná propagace a optimalizace
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if (i+1) % 100 == 0:
            print (f'Epocha [{epoch+1}/{num_epochs}], Krok [{i+1}/{n_total_steps}], Ztráta: {loss.item():.4f}')
print("--- Trénink dokončen ---")
```

**Krok 5: Testování a vyhodnocení modelu**

Nyní se podíváme, jak si náš natrénovaný model vede na datech, která nikdy neviděl.

```python
# 5. Testování modelu
with torch.no_grad():
    n_correct = 0
    n_samples = 0
    for images, labels in test_loader:
        images = images.reshape(-1, 28*28)
        outputs = model(images)
        # Získáme predikci s nejvyšší hodnotou
        _, predicted = torch.max(outputs.data, 1)
        n_samples += labels.size(0)
        n_correct += (predicted == labels).sum().item()

    acc = 100.0 * n_correct / n_samples
    print(f'\nPřesnost sítě na 10 000 testovacích obrázcích: {acc:.2f} %')
```

**Co se stalo?** I s touto velmi jednoduchou sítí bychom měli dosáhnout přesnosti přes 95 %! To znamená, že náš model se úspěšně naučil rozpoznávat obecné vzory v ručně psaných číslicích.

---

## Závěr: Váš první skutečný Deep Learning projekt

Gratuluji! Právě jste postavili a natrénovali neuronovou síť, která se naučila "číst". Prošli jste kompletním procesem od načtení dat až po finální vyhodnocení, a to vše pomocí moderního frameworku PyTorch.

Tento model, i když jednoduchý, je základem pro mnohem složitější systémy v počítačovém vidění, jako je rozpoznávání obličejů, analýza lékařských snímků nebo řízení autonomních vozidel. Princip zůstává stejný, jen se mění složitost architektury a množství dat.

**Vaše výzva:** Experimentujte s "hyperparametry" na začátku kódu. Co se stane, když:

- Zvýšíte `num_epochs` na 10? Zlepší se přesnost?
- Změníte `hidden_size` na 256 nebo 512?
- Zkusíte jinou rychlost učení (`learning_rate`), například `0.01`?

Sledujte, jak tyto změny ovlivňují finální přesnost. Vítejte ve světě ladění neuronových sítí!
