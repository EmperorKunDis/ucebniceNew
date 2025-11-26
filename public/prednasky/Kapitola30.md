# Aktivační funkce: Dejte svému neuronu osobnost

V minulé kapitole jsme postavili naši první neuronovou síť. Viděli jsme, že neurony sčítají vážené vstupy a posílají výsledek dál.
Ale co se přesně stane s tímto součtem? Jak se neuron "rozhodne", zda má "pálit" (poslat silný signál), být potichu, nebo něco mezi?

Toto rozhodnutí dělá **aktivační funkce**.
Představte si ji jako **"osobnost" neuronu**.

---

## Galerie osobností

Existuje mnoho aktivačních funkcí, ale tři z nich tvoří absolutní základ.

### 1. Sigmoid: Opatrný diplomat

- **Co dělá:** Jakékoliv číslo (od mínus nekonečna do plus nekonečna) "zmáčkne" do rozsahu **0 až 1**.
- **Osobnost:** "Všechno vidím jako pravděpodobnost. Nikdy neřeknu úplně ANO (1) ani úplně NE (0), vždycky si nechám zadní vrátka."
- **Použití:** Skvělý na úplném konci sítě, když chceme znát pravděpodobnost (např. "Je to kočka na 85 %").

### 2. Tanh (Hyperbolický tangens): Rozhodný diplomat

- **Co dělá:** Podobný jako Sigmoid, ale mačká čísla do rozsahu **-1 až 1**.
- **Osobnost:** "Umím říct i silné NE (-1). Jsem trochu rozhodnější než Sigmoid."
- **Použití:** Často ve skrytých vrstvách starších sítí.

### 3. ReLU (Rectified Linear Unit): Rozhodný pragmatik

- **Co dělá:**
  - Pokud je číslo záporné -> změní ho na **0**.
  - Pokud je číslo kladné -> nechá ho být (pošle ho dál beze změny).
- **Osobnost:** "Negativní věci mě nezajímají, ty ignoruji (0). Ale pozitivní věci podporuji naplno!"
- **Použití:** Hvězda moderní AI. Je extrémně rychlá a efektivní. Většina "mozků" dnešních AI (včetně těch, co generují obrázky) je plná ReLU neuronů.

---

## Proč je potřebujeme? (Nelinearita)

Kdybychom neměli aktivační funkce, celá neuronová síť by byla jen jedna velká násobilka.
Mohli byste mít milion vrstev, ale matematicky by se to všechno zprůměrovalo do jedné obyčejné přímky.

Aktivační funkce (hlavně ty "ohnuté" jako Sigmoid nebo "zlomené" jako ReLU) vnášejí do sítě **nelinearitu**.
Díky nim se síť může naučit chápat složité tvary, zatáčky a křivky. Bez nich by uměla kreslit jen rovné čáry.

---

## Shrnutí kapitoly

- **Aktivační funkce** rozhoduje, jak silný signál neuron pošle dál.
- **Sigmoid** (0 až 1) je dobrý pro pravděpodobnost.
- **ReLU** (0 nebo víc) je rychlý a moderní standard pro skryté vrstvy.
- Bez aktivačních funkcí by neuronové sítě byly hloupé a uměly by řešit jen lineární problémy.

---
