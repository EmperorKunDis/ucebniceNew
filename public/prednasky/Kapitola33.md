# Konvoluce: Jak se AI naučila "vidět" svět jako člověk

Až dosud naše neuronové sítě "viděly" obrázek jako jeden dlouhý seznam čísel. Ztratily veškeré prostorové informace a nevěděly, které pixely jsou vedle sebe.

Bylo to jako číst knihu, kde jsou všechna písmena vysypaná na jednu hromadu.

Dnes to změníme. Naučíme AI dívat se na obrázky tak, jako se dívá náš mozek: pomocí "detektorů", které hledají jednoduché tvary a vzory.

---

## Co je to konvoluce? Lupa na vzory

Představte si, že máte speciální **lupu**, která se jasně rozzáří, kdykoliv najde **svislou čáru**.
Co kdybyste touto lupou systematicky přejeli po celém obrázku?
Získali byste novou "mapu" všech svislých hran v obraze.

Gratuluji, právě jste objevili princip **konvoluce**.

### Jak to funguje?

1.  Máme malou matici čísel, zvanou **filtr** nebo **kernel** (např. 3x3).
2.  Tento filtr "posouváme" přes celý obrázek.
3.  V každém kroku:
    - Překryjeme kousek obrázku filtrem.
    - Vynásobíme odpovídající si čísla.
    - Výsledky sečteme.
    - Zapíšeme jedno číslo do nového obrázku (**mapa příznaků**).

Různé filtry hledají různé vzory:

- **Detektor hran** (svislých, vodorovných, diagonálních).
- **Detektor rohů**.
- **Rozmazání (Blur)**.
- **Zaostření (Sharpen)**.

---

## Příklady filtrů

### Filtr pro detekci svislé hrany

```
 1   0  -1
 1   0  -1
 1   0  -1
```

Tento filtr reaguje silně tam, kde je na levé straně světlo a na pravé tmavé.

### Filtr pro rozmazání

```
1/9  1/9  1/9
1/9  1/9  1/9
1/9  1/9  1/9
```

Tento filtr zprůměruje okolní pixely a vytvoří rozmazaný efekt.

---

## CNN: Když se filtry učí samy

A teď to nejdůležitější: Co je **Konvoluční neuronová síť (CNN)**?

Je to speciální typ neuronové sítě, která místo plně propojených vrstev používá **konvoluční vrstvy**.

### Geniální kouzlo

Hodnoty v těchto filtrech **nejsou pevně dané**!
Síť se je **učí sama** během tréninku pomocí zpětné propagace.

- **První vrstvy:** Učí se jednoduché filtry (detektory hran, barev).
- **Další vrstvy:** Učí se složitější filtry (detektory očí, nosů, uší).
- **Hlubší vrstvy:** Učí se filtry na celé obličeje, postavy psů nebo auta.

CNN se tak **automaticky a hierarchicky** učí, jaké vizuální vzory jsou důležité.

---

## Proč jsou CNN tak úspěšné?

- **Zachovávají prostorové informace:** Ví, co je vedle čeho.
- **Sdílení vah:** Stejný filtr se používá na celém obrázku -> méně parametrů.
- **Hierarchické učení:** Od jednoduchých tvarů k složitým objektům.

Proto jsou dnes absolutním králem v:

- Rozpoznávání obličejů.
- Samořídících autech.
- Lékařské diagnostice (rentgeny, CT snímky).

---

## Shrnutí kapitoly

- **Konvoluce** je proces hledání vzorů pomocí posuvné "lupy" (filtru).
- **Filtr** je malá matice, která "reaguje" na určitý vzor.
- **CNN** je síť, která si sama vymyslí své vlastní filtry během učení.
- CNN jsou základ moderního počítačového vidění.

---
