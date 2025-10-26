# Vícevrstvé sítě: Jak vyřešit problém, na který jeden neuron nestačí

V minulé kapitole jsme oslavovali. Náš jednoduchý Perceptron, náš první umělý neuron, se úspěšně naučil logickou funkci AND. Zdálo se, že je neporazitelný. Dnes ho ale postavíme před úkol, na kterém si vyláme zuby a který odhalí jeho zásadní limitaci. Tím úkolem je logická funkce **XOR (exclusive OR, "buď anebo")**.

Zjistíme, proč jeden neuron selže, a abychom problém vyřešili, budeme muset povýšit. Postavíme si skutečnou, i když maličkou, **vícevrstvou neuronovou síť (Multi-Layer Perceptron, MLP)** se skrytou vrstvou. Dnes povýšíme našeho osamělého vrátného na koordinovaný tým bodyguardů.

---

## Problém XOR: Zeď, kterou nelze prorazit jednou čarou

Logický XOR funguje následovně: vrací `1` (pravda) pouze tehdy, pokud je právě jeden ze vstupů `1`. Pokud jsou oba vstupy stejné (oba `0` nebo oba `1`), vrací `0` (nepravda).

| Vstup 1 | Vstup 2 | Výstup (XOR) |
| :-----: | :-----: | :----------: |
|    0    |    0    |      0       |
|    0    |    1    |      1       |
|    1    |    0    |      1       |
|    1    |    1    |      0       |

Pojďme si to vizualizovat. A zkusme na tom natrénovat náš starý známý Perceptron z minulé lekce.

```python
import numpy as np
import matplotlib.pyplot as plt
# Zde by byl kód Perceptronu z minulé kapitoly...
# Pro zjednodušení si jen ukážeme výsledek.

# Data pro XOR
X_xor = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y_xor = np.array([0, 1, 1, 0])

# Vizualizace problému
plt.figure(figsize=(6, 6))
plt.scatter(X_xor[:, 0], X_xor[:, 1], c=y_xor, cmap=plt.cm.coolwarm, s=200)
plt.title("Problém XOR")
plt.xlabel("Vstup 1")
plt.ylabel("Vstup 2")
plt.grid(True)
plt.show()
```

**Aha! Moment selhání:** Podívejte se na graf. Ať se snažíte sebevíc, **nemůžete nakreslit jednu jedinou přímku**, která by oddělila modré body od červených. A protože náš jednoduchý Perceptron neumí nic jiného než kreslit přímky, na tomto úkolu nevyhnutelně selže.

---

## Řešení: Tým neuronů a skrytá vrstva

Jak to vyřešit? Co když místo jedné přímky můžeme nakreslit dvě a jejich výsledky zkombinovat?

- **Analogie:** Jeden vrátný (neuron) dokáže na parketu udělat jen jednu rovnou čáru křídou. Co když ale najmeme dva vrátné? První nakreslí jednu čáru, druhý druhou. Tím rozdělí parket na složitější oblasti. A za nimi bude stát manažer (výstupní neuron), který se finálně rozhodne na základě hlášení od obou vrátných.

Toto je princip **vícevrstvé sítě**. Mezi vstupní a výstupní vrstvu vložíme jednu nebo více **skrytých vrstev (hidden layers)**. Tyto skryté neurony se naučí rozpoznávat jednodušší vzory, a výstupní neuron se pak učí rozpoznávat vzory v jejich výsledcích.

**Nové nástroje:**

1.  **Aktivační funkce Sigmoid:** Místo jednoduché skokové funkce (0/1) použijeme hladší funkci **Sigmoid**. Ta vrací hodnotu mezi 0 a 1 a říká nám, jak moc je neuron "aktivovaný". Její hladký tvar je klíčový pro proces učení.
2.  **Zpětné šíření chyby (Backpropagation):** Je to algoritmus pro učení vícevrstvých sítí. Zjednodušeně je to jako "tichá pošta pozpátku s obviňováním".
    a. Výstupní neuron spočítá celkovou chybu.
    b. Řekne neuronům ve skryté vrstvě: "Hej, vy jste mi dali špatné podklady! Tady máte, jak moc jste se _vy_ podíleli na mé chybě."
    c. Neurony ve skryté vrstvě vezmou tuto "vinu" a pošlou ji dál k vahám, které k nim vedou.
    d. Každá váha v síti se tak mírně upraví podle toho, jak moc přispěla k celkové chybě.

---

## Praktický projekt: MLP pro XOR od nuly v NumPy

Pojďme si postavit a natrénovat naši první vícevrstvou síť (2 vstupy -> 2 neurony ve skryté vrstvě -> 1 výstupní neuron).

```python
import numpy as np

# Data pro XOR
X = np.array([[0, 0], [0, 1], [1, 0], [1, 1]])
y = np.array([[0], [1], [1], [0]])

# Aktivační funkce Sigmoid a její derivace (potřebná pro backpropagation)
def sigmoid(x):
    return 1 / (1 + np.exp(-x))

def sigmoid_derivative(x):
    return x * (1 - x)

# Nastavení sítě
input_neurons = 2
hidden_neurons = 2
output_neurons = 1
learning_rate = 0.1
epochs = 10000 # Počet opakování tréninku

# Náhodná inicializace vah a biasů
weights_hidden = np.random.uniform(size=(input_neurons, hidden_neurons))
bias_hidden = np.random.uniform(size=(1, hidden_neurons))
weights_output = np.random.uniform(size=(hidden_neurons, output_neurons))
bias_output = np.random.uniform(size=(1, output_neurons))

# Trénovací smyčka
for i in range(epochs):
    # --- Forward Pass (dopředné šíření) ---
    # 1. Výpočet pro skrytou vrstvu
    hidden_layer_input = np.dot(X, weights_hidden) + bias_hidden
    hidden_layer_activation = sigmoid(hidden_layer_input)

    # 2. Výpočet pro výstupní vrstvu
    output_layer_input = np.dot(hidden_layer_activation, weights_output) + bias_output
    predicted_output = sigmoid(output_layer_input)

    # --- Backward Pass (zpětné šíření chyby) ---
    # 3. Výpočet chyby
    error = y - predicted_output

    # 4. Výpočet gradientů (míry chyby) pro každou vrstvu
    d_predicted_output = error * sigmoid_derivative(predicted_output)

    error_hidden_layer = d_predicted_output.dot(weights_output.T)
    d_hidden_layer = error_hidden_layer * sigmoid_derivative(hidden_layer_activation)

    # 5. Aktualizace vah a biasů
    weights_output += hidden_layer_activation.T.dot(d_predicted_output) * learning_rate
    bias_output += np.sum(d_predicted_output, axis=0, keepdims=True) * learning_rate

    weights_hidden += X.T.dot(d_hidden_layer) * learning_rate
    bias_hidden += np.sum(d_hidden_layer, axis=0, keepdims=True) * learning_rate

print("Trénink dokončen!")
print("\nVýsledné predikce pro vstupy [0,0], [0,1], [1,0], [1,1]:")
# Zaokrouhlíme výstup, abychom dostali 0 nebo 1
print(np.round(predicted_output).flatten())
```

**Co se stalo?** Po spuštění kódu uvidíte, že model nyní správně vrací `[0 1 1 0]`. Díky skryté vrstvě se dokázal naučit nelineární vztah a problém XOR vyřešit!

---

## Závěr: Skok do hlubokého učení

Gratuluji! Dnes jste udělali obrovský skok. Nejenže jste pochopili limitaci jednoho neuronu, ale postavili jste si od nuly svou první skutečnou, **vícevrstvou neuronovou síť**. Viděli jste, jak skrytá vrstva umožňuje modelu naučit se komplexní, nelineární vztahy, a získali jste intuici pro **zpětné šíření chyby (backpropagation)**, což je motor, který pohání celé hluboké učení.

Když dnes slyšíte o obrovských modelech jako GPT, v jejich srdci je stále ten stejný princip, který jste si dnes naprogramovali – jen s miliony neuronů, mnoha vrstvami a na nepředstavitelném množství dat.

**Vaše výzva:** Zkuste v našem kódu změnit počet neuronů ve skryté vrstvě (`hidden_neurons`). Co se stane, když použijete 3? Nebo 10? Jak to ovlivní rychlost učení (zkuste snížit `epochs`)? Experimentujte a sledujte, jak architektura sítě ovlivňuje její schopnost učit se.
