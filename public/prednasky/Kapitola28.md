# Úvod do neuronových sítí: Postavte si svůj první umělý neuron

Až dosud jsme používali hotové "černé skříňky" z knihoven jako Scikit-learn. Dnes se ale odvážíme a jednu takovou skříňku si sami postavíme od úplných základů. Vytvoříme si nejjednodušší formu umělého neuronu, která odstartovala celou revoluci v AI – **Perceptron**.

Představte si ho jako vrátného v exkluzivním klubu. Jeho úkolem je rozhodnout, zda někoho pustí dál (výstup `1`), nebo ne (výstup `0`). Dívá se na několik "kritérií" (vstupů) – je host plnoletý? Je slušně oblečený? Každému kritériu dává jinou "důležitost" (váhu). Pokud je celkové skóre dostatečně vysoké, pustí hosta dál. Dnes naučíme našeho vrátného, jak se má správně rozhodovat, a to jen na základě příkladů.

---

## Biologická inspirace a stavební kameny

Neuronové sítě jsou volně inspirovány lidským mozkem. Náš mozek obsahuje miliardy neuronů, které si navzájem posílají signály. Umělý neuron (perceptron) tento proces zjednodušuje do tří základních kroků:

1.  **Přijme vstupy:** Získá několik číselných vstupů. Každý vstup má přiřazenou **váhu**, která určuje jeho důležitost.
2.  **Spočítá vážený součet:** Vynásobí každý vstup jeho váhou a všechny výsledky sečte. K tomuto součtu často přičte i tzv. **bias**, což je jakýsi startovací bonus nebo postih, který posouvá rozhodovací hranici.
3.  **Aplikuje aktivační funkci:** Výsledek váženého součtu pošle do "rozhodovací" funkce. Náš vrátný použije jednoduchou **skokovou funkci (step function)**:
    - Pokud je součet >= 0, výstup je `1` (pustit dovnitř).
    - Pokud je součet < 0, výstup je `0` (nepustit).

**Jak se to učí?**
To je to kouzlo! Pokaždé, když perceptron udělá chybu, mírně si upraví své váhy a bias, aby se příště rozhodl lépe.

- **Chyba:** Predikoval `0`, ale správně mělo být `1`. Znamená to, že vážený součet byl příliš nízký. Proto mírně **zvýší** váhy u vstupů, které byly aktivní.
- **Chyba:** Predikoval `1`, ale správně mělo být `0`. Vážený součet byl příliš vysoký. Proto mírně **sníží** váhy u aktivních vstupů.

Tento jednoduchý proces opakujeme stále dokola na trénovacích datech, dokud se váhy neustálí na hodnotách, které dělají co nejméně chyb.

---

## Praktický projekt: Perceptron od nuly pro logickou bránu AND

Naprogramujeme si perceptron, který se naučí funkci logického AND (`vystup = vstup1 A ZÁROVEŇ vstup2`). Použijeme pouze knihovnu **NumPy**.

**Krok 1: Příprava prostředí a dat**

```bash
pip install numpy matplotlib
```

```python
import numpy as np
import matplotlib.pyplot as plt

# Trénovací data pro logický AND
# Vstupy: [vstup1, vstup2]
# Výstupy: [vystup]
X_train = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y_train = np.array([0, 0, 0, 1])
```

**Krok 2: Třída Perceptron**

Vytvoříme si třídu, která bude obsahovat celou logiku našeho neuronu.

```python
class Perceptron:
    def __init__(self, learning_rate=0.1, n_iters=100):
        self.lr = learning_rate
        self.n_iters = n_iters
        self.activation_func = self._step_function
        self.weights = None
        self.bias = None

    def _step_function(self, x):
        """Skoková aktivační funkce."""
        return np.where(x >= 0, 1, 0)

    def fit(self, X, y):
        """Trénink modelu na datech."""
        n_samples, n_features = X.shape

        # Inicializace vah a biasu
        self.weights = np.zeros(n_features)
        self.bias = 0

        y_ = np.array([1 if i > 0 else 0 for i in y]) # Ujistíme se, že y je 0 nebo 1

        # Učící cyklus
        for _ in range(self.n_iters):
            for idx, x_i in enumerate(X):
                linear_output = np.dot(x_i, self.weights) + self.bias
                y_predicted = self.activation_func(linear_output)

                # Výpočet chyby a úprava vah
                update = self.lr * (y_[idx] - y_predicted)
                self.weights += update * x_i
                self.bias += update

    def predict(self, X):
        """Predikce pro nová data."""
        linear_output = np.dot(X, self.weights) + self.bias
        y_predicted = self.activation_func(linear_output)
        return y_predicted
```

**Krok 3: Trénink, testování a vizualizace**

Nyní si vytvoříme instanci našeho Perceptronu, natrénujeme ho a podíváme se, jak se naučil oddělit data.

```python
# Vytvoření a trénink perceptronu
perceptron = Perceptron(learning_rate=0.1, n_iters=10)
perceptron.fit(X_train, y_train)

print("Trénink dokončen!")
print(f"Naučené váhy: {perceptron.weights}")
print(f"Naučený bias: {perceptron.bias}")

# Testování
test_vstupy = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
predikce = perceptron.predict(test_vstupy)
print(f"\nPredikce pro vstupy [0,0], [0,1], [1,0], [1,1]: {predikce}")
print("Model se správně naučil funkci AND.")

# Vizualizace rozhodovací hranice
fig = plt.figure(figsize=(8,6))
ax = fig.add_subplot(1, 1, 1)
plt.scatter(X_train[:, 0], X_train[:, 1], marker='o', c=y_train, cmap=plt.cm.coolwarm)

x0_1 = np.amin(X_train[:, 0])
x0_2 = np.amax(X_train[:, 0])

# Výpočet a vykreslení rozhodovací přímky
x1_1 = (-perceptron.weights[0] * x0_1 - perceptron.bias) / perceptron.weights[1]
x1_2 = (-perceptron.weights[0] * x0_2 - perceptron.bias) / perceptron.weights[1]

ax.plot([x0_1, x0_2], [x1_1, x1_2], 'k')

plt.title("Rozhodovací hranice Perceptronu pro AND")
plt.xlabel("Vstup 1")
plt.ylabel("Vstup 2")
plt.ylim(-0.5, 1.5)
plt.xlim(-0.5, 1.5)
plt.grid(True)
plt.show()
```

**Co se stalo?** Perceptron si postupně upravoval své váhy a bias, dokud nenašel rovnici přímky (černá čára v grafu), která dokonale odděluje červený bod (`1`) od modrých bodů (`0`). Naučil se řešit problém!

---

## Závěr: Zrození inteligence

Gratuluji! Právě jste si postavili a natrénovali svůj první umělý neuron. Už to pro vás není jen abstraktní pojem. Viděli jste, jak se uvnitř násobí váhy, jak aktivační funkce dělá rozhodnutí a hlavně, jak se neuron na základě svých chyb **učí** a adaptuje.

Tento jednoduchý princip, objevený v 50. letech, je přímým předkem všech obrovských a komplexních neuronových sítí (jako GPT), které dnes pohánějí svět. Všechny jsou jen obrovským množstvím těchto jednoduchých jednotek, propojených do vrstev a trénovaných na masivních datech.

**Vaše výzva:** Zkuste si v našem kódu změnit trénovací data. Co se stane, když změníte `y_train` na `np.array([0, 1, 1, 1])`? Tím učíte perceptron logickou bránu **OR**. Zvládne to? (Odpověď je ano). A co když zkusíte `y_train` na `np.array([0, 1, 1, 0])` (logický **XOR**)? Zjistíte, že to perceptron s jednou přímkou vyřešit nedokáže. A právě proto vznikly vícevrstvé neuronové sítě.
