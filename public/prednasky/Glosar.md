# 📚 Glosář pojmů - AI Kurz

**Kompletní slovník všech klíčových pojmů z kurzu (Kapitoly 1-40)**

Tento slovník obsahuje definice všech důležitých termínů, se kterými se v kurzu setkáte. Pojmy jsou řazeny alfabeticky a u každého je uvedeno, ve které kapitole se poprvé objevuje.

---

## A

### Accuracy (Přesnost)

**Kapitola:** 20, 24
**Anglicky:** Accuracy
**Definice:** Metrika hodnocení modelu. Udává poměr správně klasifikovaných příkladů k celkovému počtu příkladů. Přesnost = (Správné predikce) / (Všechny predikce) × 100%
**Související:** Precision, Recall, F1-Score

---

### Activation Function (Aktivační funkce)

**Kapitola:** 28, 30
**Anglicky:** Activation Function
**Definice:** Matematická funkce v neuronu, která určuje, jak silný signál neuron pošle dál. Běžné funkce: Sigmoid, ReLU, Tanh.
**Analogie:** Regulátor hlasitosti - rozhoduje, jak "hlasitě" neuron mluví.
**Související:** Neuron, ReLU, Sigmoid

---

### Agent (Agent)

**Kapitola:** 11, 36
**Anglicky:** Agent
**Definice:** Autonomní entita, která vnímá prostředí a na základě toho koná akce k dosažení cílů.
**Příklad:** Herní AI v šachách, chatbot, robotický vysavač
**Související:** Environment, Action, Reinforcement Learning

---

### Algorithm (Algoritmus)

**Kapitola:** 1, 11
**Anglicky:** Algorithm
**Definice:** Přesně definovaná posloupnost kroků k řešení problému.
**Analogie:** Recept v kuchařce - krok za krokem k výsledku.

---

## B

### Backpropagation (Zpětná propagace)

**Kapitola:** 31
**Anglicky:** Backpropagation
**Definice:** Algoritmus pro trénování neuronových sítí. Vypočítává gradient chyby a upravuje váhy "odzadu dopředu".
**Související:** Gradient Descent, Training, Weights

---

### Batch (Dávka)

**Kapitola:** 29, 31
**Anglicky:** Batch
**Definice:** Podmnožina trénovacích dat zpracovaná najednou během trénování. Batch Size = počet vzorků v jedné dávce.
**Související:** Epoch, Training

---

### Bias (1 - Zaujatost)

**Kapitola:** 3, 36
**Anglicky:** Bias
**Definice:** Systematická nespravedlnost v AI systému, obvykle zděděná z trénovacích dat.
**Příklad:** Model pro schvalování úvěrů diskriminující podle pohlaví.
**Související:** Fairness, Ethics

---

### Bias (2 - Posun)

**Kapitola:** 28
**Anglicky:** Bias (neural network)
**Definice:** Parametr v neuronu, který posouvá výstup aktivační funkce. b v rovnici: y = w×x + b.
**Analogie:** "Prahová hodnota" - kolik signálu musí být, aby neuron zafungoval.
**Související:** Weight, Neuron

---

## C

### Classification (Klasifikace)

**Kapitola:** 1, 20, 24
**Anglicky:** Classification
**Definice:** Typ strojového učení, kde model přiřazuje vstup do jedné z předdefinovaných kategorií/tříd.
**Příklad:** Rozpoznání, zda je email spam nebo ne (2 třídy). Rozpoznání typu zvířete na fotce (víc tříd).
**Související:** Regression, Supervised Learning

---

### CNN (Convolutional Neural Network)

**Kapitola:** 33
**Anglicky:** Convolutional Neural Network
**Definice:** Typ neuronové sítě speciálně navržený pro zpracování obrazu. Používá konvoluční vrstvy.
**Analogie:** Lupa postupně skenující obrázek a hledající vzory.
**Související:** Convolution, Pooling, Computer Vision

---

### Confusion Matrix (Matice záměn)

**Kapitola:** 24
**Anglicky:** Confusion Matrix
**Definice:** Tabulka ukazující, jak často model správně/špatně klasifikuje jednotlivé třídy.
**Související:** Precision, Recall, Accuracy

---

### Convolution (Konvoluce)

**Kapitola:** 33
**Anglicky:** Convolution
**Definice:** Matematická operace, která aplikuje filtr (kernel) na obrázek a detekuje lokální vzory (hrany, textury).
**Související:** CNN, Kernel, Filter

---

## D

### Data Augmentation (Rozšíření dat)

**Kapitola:** 33
**Anglicky:** Data Augmentation
**Definice:** Technika pro umělé zvětšení datasetu pomocí transformací (rotace, ořez, změna jasu).
**Účel:** Prevence přeučení, zlepšení generalizace.
**Související:** Overfitting, Generalization

---

### Data Science (Datová věda)

**Kapitola:** 1, 7
**Anglicky:** Data Science
**Definice:** Obor zabývající se extrakcí znalostí a vhledů z dat pomocí statistiky, ML a vizualizace.
**Související:** AI, Machine Learning, Analytics

---

### Dataset (Dataset)

**Kapitola:** 1, 20, 22
**Anglicky:** Dataset
**Definice:** Soubor dat použitých pro trénování nebo testování modelu.
**Rozdělení:** Training set (trénink), Validation set (validace), Test set (test).
**Související:** Training, Data Preprocessing

---

### Decision Tree (Rozhodovací strom)

**Kapitola:** 1, 10
**Anglicky:** Decision Tree
**Definice:** Algoritmus strojového učení, který rozhoduje pomocí série otázek (IF-THEN pravidel) uspořádaných do stromové struktury.
**Analogie:** Diagnostický diagram - "Pokud ANO, jdi vlevo, pokud NE, jdi vpravo."
**Související:** Random Forest, Classification

---

### Deep Learning (Hluboké učení)

**Kapitola:** 1, 28, 29
**Anglicky:** Deep Learning
**Definice:** Podoblast strojového učení používající hluboké neuronové sítě (mnoho vrstev).
**Související:** Neural Network, CNN, RNN

---

### Dropout

**Kapitola:** 32
**Anglicky:** Dropout
**Definice:** Regularizační technika, která během trénování náhodně "vypíná" neurony (nastavuje na 0), aby se síť nepřeučila.
**Analogie:** Trénink fotbalového týmu bez náhodně vybraných hráčů - tým se naučí být robustnější.
**Související:** Overfitting, Regularization

---

## E

### Epoch (Epocha)

**Kapitola:** 29, 31
**Anglicky:** Epoch
**Definice:** Jeden průchod celým trénovacím datasetem během trénování modelu.
**Příklad:** Pokud máte 1000 vzorků a trénujete 10 epoch, model uvidí všech 1000 vzorků celkem 10×.
**Související:** Batch, Training

---

### Ethics (Etika)

**Kapitola:** 3, 36
**Anglicky:** Ethics
**Definice:** Morální principy a pravidla pro odpovědný vývoj a použití AI.
**Témata:** Bias, Privacy, Transparency, Accountability.
**Související:** Fairness, Explainability

---

### Explainability (Vysvětlitelnost)

**Kapitola:** 37
**Anglicky:** Explainability (XAI)
**Definice:** Schopnost AI systému vysvětlit, JAK a PROČ dospěl k určitému rozhodnutí.
**Související:** Black Box, SHAP, Interpretability

---

## F

### F1-Score

**Kapitola:** 24
**Anglicky:** F1-Score
**Definice:** Harmonický průměr Precision a Recall. Používá se, když chceme vyvážit obě metriky. F1 = 2 × (Precision × Recall) / (Precision + Recall)
**Související:** Precision, Recall, Accuracy

---

### Feature (Příznak)

**Kapitola:** 1, 20, 22
**Anglicky:** Feature
**Definice:** Měřitelná vlastnost dat použitá pro trénování modelu. V tabulce = sloupec.
**Příklad:** Pro klasifikaci domu: features = plocha, počet pokojů, rok stavby.
**Také:** Input, Variable, Attribute
**Související:** Label, Training Data

---

### Fine-tuning (Doladění)

**Kapitola:** 35, 39
**Anglicky:** Fine-tuning
**Definice:** Proces úpravy předtrénovaného modelu na specifickou úlohu s menším datasetem.
**Příklad:** Vzít GPT model a doladit ho na lékařské dotazy.
**Související:** Transfer Learning, Pre-training

---

## G

### Generalization (Generalizace)

**Kapitola:** 23, 24
**Anglicky:** Generalization
**Definice:** Schopnost modelu fungovat dobře na nových, neviděných datech (ne jen na trénovacích).
**Opak:** Overfitting (model memoroval data, ale neumí generalizovat).
**Související:** Overfitting, Test Set

---

### Gradient Descent (Gradientní sestup)

**Kapitola:** 31
**Anglicky:** Gradient Descent
**Definice:** Optimalizační algoritmus pro hledání minima loss funkce. Postupně upravuje parametry modelu směrem dolů po "svahu" chyby.
**Analogie:** Sjíždění z kopce se zavázanýma očima - vždy jdete směrem, kde to klesá nejvíc.
**Související:** Learning Rate, Backpropagation, Optimizer

---

## H

### Hyperparameter (Hyperparametr)

**Kapitola:** 31
**Anglicky:** Hyperparameter
**Definice:** Parametr nastavený PŘED tréninkem (ne během). Určuje, JAK se model trénuje.
**Příklady:** Learning rate, počet epoch, batch size, počet vrstev.
**Rozdíl od Parameter:** Parameters se učí z dat (váhy), hyperparameters nastavujeme ručně.
**Související:** Training, Tuning

---

## I

### Inference (Inference)

**Kapitola:** 9, 20
**Anglicky:** Inference
**Definice:** Použití natrénovaného modelu k predikci na nových datech. "Produkční fáze" modelu.
**Rozdíl od Training:** Training = učení, Inference = aplikace naučeného.
**Související:** Prediction, Deployment

---

## K

### K-Nearest Neighbors (KNN)

**Kapitola:** 25
**Anglicky:** K-Nearest Neighbors
**Definice:** Jednoduchý klasifikační algoritmus. Pro nový vzorek najde K nejbližších sousedů v trénovacích datech a přiřadí nejčastější třídu.
**Analogie:** "Řekni mi, kdo jsou tvoji přátelé, a já ti řeknu, kdo jsi."
**Související:** Classification, Distance

---

### Kernel (Jádro/Filtr)

**Kapitola:** 33
**Anglicky:** Kernel
**Definice:** Malá matice (např. 3×3) použitá v konvoluci pro detekci vzorů v obrázku.
**Příklad:** Kernel pro detekci svislých hran.
**Související:** Convolution, CNN

---

## L

### Label (Štítek)

**Kapitola:** 1, 20, 21
**Anglicky:** Label
**Definice:** Správná odpověď/kategorie pro trénovací vzorek. V supervised learning to, co chceme, aby model predikoval.
**Příklad:** Fotka psa má label="pes", fotka kočky label="kočka".
**Také:** Target, Ground Truth, Output
**Související:** Feature, Supervised Learning

---

### Learning Rate (Rychlost učení)

**Kapitola:** 31
**Anglicky:** Learning Rate
**Definice:** Hyperparametr určující velikost kroku při úpravě vah během gradient descent.
**Analogie:** Velikost kroku při sjíždění z kopce. Příliš velký = přeskočíte minimum, příliš malý = trvá věčnost.
**Typické hodnoty:** 0.001, 0.01, 0.1
**Související:** Gradient Descent, Optimizer

---

### Loss Function (Ztrátová funkce)

**Kapitola:** 29, 31
**Anglicky:** Loss Function
**Definice:** Funkce měřící, JAK MOC se model mýlí. Cíl trénování = minimalizovat loss.
**Příklady:** Mean Squared Error (regrese), Cross-Entropy (klasifikace).
**Také:** Cost Function, Objective Function
**Související:** Training, Optimization

---

## M

### Machine Learning (Strojové učení)

**Kapitola:** 1, 21
**Anglicky:** Machine Learning
**Definice:** Obor AI, kde se počítač učí ze dat místo explicitního programování pravidel.
**Typy:** Supervised, Unsupervised, Reinforcement Learning.
**Analogie:** Místo říkat dítěti "pokud má 4 nohy a štěká, je to pes", ukážete mu 100 psů a ono si to odvodí samo.
**Související:** AI, Deep Learning, Training

---

### Model (Model)

**Kapitola:** 1, 20
**Anglicky:** Model
**Definice:** Matematická reprezentace vzorů naučených z dat. "Mozek" AI.
**Příklady:** Decision Tree, Neural Network, Linear Regression.
**Související:** Training, Inference

---

## N

### Neural Network (Neuronová síť)

**Kapitola:** 1, 28, 29
**Anglicky:** Neural Network
**Definice:** Model inspirovaný strukturou mozku, skládající se z vrstev vzájemně propojených neuronů.
**Struktura:** Input Layer → Hidden Layers → Output Layer
**Související:** Deep Learning, Neuron, Backpropagation

---

### Neuron

**Kapitola:** 28
**Anglicky:** Neuron
**Definice:** Základní jednotka neuronové sítě. Přijme vstupy, vynásobí je váhami, přičte bias, aplikuje aktivační funkci.
**Matematicky:** output = activation(Σ(weights × inputs) + bias)
**Analogie:** Vrátný rozhodující, zda vás pustit dovnitř na základě vašich "přihlašovacích údajů".
**Související:** Weight, Activation Function, Layer

---

### Normalization (Normalizace)

**Kapitola:** 22
**Anglicky:** Normalization
**Definice:** Převod dat do stejného rozsahu (typicky 0-1 nebo -1 až 1), aby všechny features měly stejnou váhu.
**Příklad:** Plochavýška = 60m² → 0.6, cena = 5000000 Kč → 0.5 (po normalizaci).
**Související:** Preprocessing, StandardScaler

---

## O

### Overfitting (Přeučení)

**Kapitola:** 10, 23, 32
**Anglicky:** Overfitting
**Definice:** Když model příliš dobře "memoruje" trénovací data a nefunguje na nových datech.
**Symptom:** Train accuracy = 99%, Test accuracy = 60%.
**Analogie:** Student naučivší se odpovědi nazpaměť, ale nerozumí principu.
**Prevence:** Více dat, Dropout, Regularizace, Cross-validation.
**Související:** Generalization, Underfitting, Dropout

---

### Optimizer (Optimalizátor)

**Kapitola:** 31
**Anglicky:** Optimizer
**Definice:** Algoritmus určující, JAK se upravují váhy během trénování.
**Příklady:** SGD (Stochastic Gradient Descent), Adam, RMSprop.
**Související:** Gradient Descent, Learning Rate

---

## P

### Perceptron

**Kapitola:** 28
**Anglicky:** Perceptron
**Definice:** Nejjednodušší typ neuronu. Lineární klasifikátor. Historicky první neuronový model (1958).
**Omezení:** Může rozdělit pouze lineárně separabilní data (např. nemůže XOR).
**Související:** Neuron, Neural Network

---

### Pooling

**Kapitola:** 33
**Anglicky:** Pooling
**Definice:** Operace v CNN redukující rozměry obrázku (downsampling). Nejčastěji Max Pooling.
**Účel:** Snížení výpočetní náročnosti, zvýraznění důležitých features.
**Příklad:** Max Pooling 2×2 vezme okno 2×2 pixelů a vybere maximum.
**Související:** CNN, Convolution

---

### Precision (Přesnost pozitivních predikcí)

**Kapitola:** 24
**Anglicky:** Precision
**Definice:** Z toho, co model označil jako pozitivní, kolik jich opravdu bylo pozitivních.
Precision = True Positives / (True Positives + False Positives)
**Příklad:** Model označil 10 emailů jako spam. 8 jich opravdu bylo spam → Precision = 80%.
**Související:** Recall, F1-Score

---

### Prediction (Predikce)

**Kapitola:** 1, 20
**Anglicky:** Prediction
**Definice:** Výstup modelu - odhad/předpověď pro nový vstup.
**Také:** Inference, Forecast
**Související:** Model, Inference

---

## R

### Recall (Úplnost)

**Kapitola:** 24
**Anglicky:** Recall
**Definice:** Z všech skutečně pozitivních případů, kolik jich model zachytil.
Recall = True Positives / (True Positives + False Negatives)
**Příklad:** Ze 100 spamových emailů model zachytil 80 → Recall = 80%.
**Také:** Sensitivity, True Positive Rate
**Související:** Precision, F1-Score

---

### Regression (Regrese)

**Kapitola:** 24
**Anglicky:** Regression
**Definice:** Typ strojového učení, kde model predikuje spojitou číselnou hodnotu (ne kategorii).
**Příklad:** Predikce ceny domu (v Kč), teploty zítra (°C).
**Rozdíl od Classification:** Regression → číslo, Classification → kategorie.
**Související:** Linear Regression, Supervised Learning

---

### Reinforcement Learning (Zpětnovazební učení)

**Kapitola:** 21
**Anglicky:** Reinforcement Learning
**Definice:** Typ ML, kde agent se učí tím, že koná akce a dostává odměny nebo tresty.
**Příklad:** AI učící se hrát šachy - dostane +1 za výhru, -1 za prohru, 0 za remízu.
**Klíčové pojmy:** Agent, Environment, Reward, Policy.
**Související:** Q-Learning, Policy

---

### ReLU (Rectified Linear Unit)

**Kapitola:** 30
**Anglicky:** ReLU
**Definice:** Nejpoužívanější aktivační funkce. ReLU(x) = max(0, x). Pokud x < 0, vrátí 0, jinak vrátí x.
**Výhody:** Rychlá, efektivní, pomáhá s "vanishing gradient problem".
**Související:** Activation Function, Sigmoid, Tanh

---

## S

### SHAP (SHapley Additive exPlanations)

**Kapitola:** 37
**Anglicky:** SHAP
**Definice:** Metoda pro vysvětlení predikcí ML modelů. Ukazuje, jak moc každý feature přispěl k predikci.
**Použití:** Explainability, debugging modelů.
**Související:** XAI, Explainability

---

### Sigmoid

**Kapitola:** 28, 30
**Anglicky:** Sigmoid
**Definice:** Aktivační funkce tvaru "S". Převádí jakékoliv číslo do rozsahu 0-1.
Sigmoid(x) = 1 / (1 + e^(-x))
**Použití:** Výstupní vrstva pro binární klasifikaci (pravděpodobnost).
**Související:** Activation Function, ReLU, Tanh

---

### Supervised Learning (Učení s učitelem)

**Kapitola:** 21
**Anglicky:** Supervised Learning
**Definice:** Typ ML, kde trénovací data obsahují vstupy I správné odpovědi (labels).
**Příklad:** Učení rozpoznávat psy - dostanete fotky A label "pes"/"ne-pes".
**Typy úloh:** Classification, Regression.
**Související:** Unsupervised Learning, Label, Training

---

## T

### Tanh (Hyperbolický tangens)

**Kapitola:** 30
**Anglicky:** Tanh
**Definice:** Aktivační funkce podobná Sigmoid, ale v rozsahu -1 až 1.
tanh(x) = (e^x - e^(-x)) / (e^x + e^(-x))
**Výhoda:** Centrovaná kolem 0 (na rozdíl od Sigmoid).
**Související:** Activation Function, Sigmoid

---

### Test Set (Testovací množina)

**Kapitola:** 23, 24
**Anglicky:** Test Set
**Definice:** Část datasetu použitá POUZE pro finální vyhodnocení modelu. Model tato data během trénování NEVIDÍ.
**Účel:** Zjistit, jak dobře model generalizuje.
**Typické rozdělení:** 70% train, 15% validation, 15% test.
**Související:** Training Set, Validation Set

---

### Training (Trénování)

**Kapitola:** 1, 20, 21
**Anglicky:** Training
**Definice:** Proces, během kterého se model učí z dat. Model upravuje své parametry (váhy), aby minimalizoval chybu.
**Analogie:** Učení se na zkoušku - opakované procházení příkladů, dokud to nezvládnete.
**Související:** Model, Loss Function, Backpropagation

---

### Transfer Learning (Přenosové učení)

**Kapitola:** 35
**Anglicky:** Transfer Learning
**Definice:** Použití modelu natrénovaného na jedné úloze jako výchozího bodu pro jinou úlohu.
**Příklad:** Model natrénovaný na ImageNet (rozpoznávání 1000 objektů) použít jako základ pro rozpoznávání rakovinných buněk.
**Související:** Fine-tuning, Pre-training

---

## U

### Underfitting (Podučení)

**Kapitola:** 23
**Anglicky:** Underfitting
**Definice:** Když je model příliš jednoduchý a nezachytí ani vzory v trénovacích datech.
**Symptom:** Train accuracy = 60%, Test accuracy = 55% (obojí špatné).
**Řešení:** Složitější model, více features, delší trénink.
**Opak:** Overfitting
**Související:** Model Complexity, Generalization

---

### Unsupervised Learning (Učení bez učitele)

**Kapitola:** 21
**Anglicky:** Unsupervised Learning
**Definice:** Typ ML, kde trénovací data NEOBSAHUJÍ labels. Model hledá strukturu/vzory v datech sám.
**Příklady úloh:** Clustering (shlukování), Dimensionality Reduction.
**Příklad:** Seskupit zákazníky do skupin podle chování (bez předem daných kategorií).
**Související:** Supervised Learning, Clustering

---

## V

### Validation Set (Validační množina)

**Kapitola:** 23, 24
**Anglicky:** Validation Set
**Definice:** Část datasetu použitá pro ladění hyperparametrů a sledování přeučení během trénování.
**Rozdíl od Test Set:** Validation vidíme průběžně (tuning), Test jen jednou na konci (finální vyhodnocení).
**Související:** Test Set, Training Set, Cross-validation

---

## W

### Weight (Váha)

**Kapitola:** 28, 29
**Anglicky:** Weight
**Definice:** Parametr neuronu, který určuje, jak moc je daný vstup důležitý. Upravuje se během trénování.
**Matematicky:** Ve vztahu y = w×x + b je w váha.
**Analogie:** "Hlasitost" každého vstupu - kolik pozornosti mu neuron věnuje.
**Související:** Bias, Neuron, Training

---

## X

### XAI (Explainable AI)

**Kapitola:** 37
**Anglicky:** Explainable AI
**Definice:** Oblast AI zaměřená na vytváření modelů, jejichž rozhodnutí jsou srozumitelná lidem.
**Metody:** SHAP, LIME, Feature Importance, Attention Visualization.
**Související:** Interpretability, Black Box

---

---

## 📚 Další zdroje

- **Anglicko-český slovník AI:** [link]
- **Video vysvětlení pojmů:** YouTube playlist
- **Interactive demos:** [link]

---

**Chybí vám některý pojem? Napište nám a doplníme ho!**

_Tento glosář je živý dokument - aktualizujeme podle vašeho feedbacku._
