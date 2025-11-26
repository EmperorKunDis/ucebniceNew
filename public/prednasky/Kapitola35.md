# Projekt Neuronové sítě: Naučte AI číst ručně psané číslice

Dnes odložíme šroubovák a sedneme za volant skutečného "sporťáku" hlubokého učení.
Naším úkolem bude postavit a natrénovat neuronovou síť, která se naučí **číst a rozpoznávat ručně psané číslice**.

Použijeme k tomu slavný dataset **MNIST**, který je v podstatě "Hello, World!" pro počítačové vidění.

---

## Co je to MNIST?

MNIST je obrovská databáze ručně psaných číslic.

- **60 000** obrázků pro trénování.
- **10 000** obrázků pro testování.
- Každý obrázek: Malý, černobílý, 28x28 pixelů.

Pro každý obrázek máme "štítek" – správnou číslici (0-9).

Naším úkolem je naučit síť, aby se podívala na obrázek a správně určila, o jakou číslici se jedná.

---

## Proces: Od dat k predikci

### 1. Načtení dat

- Stáhneme MNIST dataset.
- Rozdělíme ho na trénovací a testovací sadu.
- Každý obrázek je matice 28x28 = **784 čísel** (hodnoty pixelů).

### 2. Definice architektury sítě

Vytvoříme síť s:

- **Vstupní vrstva:** 784 neuronů (jeden pro každý pixel).
- **Skrytá vrstva:** Například 128 neuronů s aktivační funkcí ReLU.
- **Výstupní vrstva:** 10 neuronů (jeden pro každou číslici 0-9).

### 3. Trénink

Pošleme síti tisíce obrázků a necháme ji učit se pomocí zpětné propagace.

- **Dopředný průchod:** Síť tipne, jaká je to číslice.
- **Výpočet chyby:** Porovnáme tip se správnou odpovědí.
- **Zpětná propagace:** Upravíme váhy.
- **Opakuj** tisíckrát.

### 4. Testování

Nakonec síť otestujeme na 10 000 obrázcích, které nikdy neviděla.

- Změříme **přesnost** (kolik procent pozná správně).

---

## Očekávané výsledky

I s velmi jednoduchou sítí by se měla přesnost pohybovat kolem **95-97 %**.
To znamená, že náš model se úspěšně naučil rozpoznávat obecné vzory v ručně psaných číslicích.

---

## Co to znamená v praxi?

Tento princip se používá pro:

- **Rozpoznávání textu (OCR):** Čtení dokumentů, SPZ aut.
- **Třídění pošty:** Automatické čtení PSČ na obálkách.
- **Bankovnictví:** Rozpoznávání čísel na šecích.
- **Lékařská diagnostika:** Analýza rentgenů, CT snímků.

---

## Shrnutí kapitoly

- **MNIST** je dataset 70 000 ručně psaných číslic.
- Síť se učí převést obrázek (784 čísel) na jednu číslici (0-9).
- Proces je: Načti data -> Definuj síť -> Trénuj -> Testuj.
- Jednoduchá síť dosahuje přesnosti přes 95 %.

---
