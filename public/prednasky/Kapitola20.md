# Klasifikace v praxi: Naučte AI rozpoznávat obrázky

Představte si, že jste digitální biolog, který dostal krabici s 50 000 fotkami. Jsou na nich žáby, koně, lodě, letadla, a vaším úkolem je vytvořit systém, který je dokáže automaticky roztřídit.

Jak byste na to šli?
Neučili byste se každou fotku nazpaměť. Hledali byste **vzory**.

- "Letadla mají křídla a modré pozadí (nebe)."
- "Žáby jsou zelené a mají velké oči."
- "Auta mají kola a hranatý tvar."

Přesně to dnes naučíme náš model umělé inteligence.

---

## Jak počítač "vidí" obrázek?

Když se podíváte na fotku kočky, vidíte chlupy, uši, vousky. Počítač vidí jen **tabulku čísel**.

1.  **Pixely:** Obrázek je mřížka bodů.
2.  **Barvy:** Každý bod má tři čísla (R, G, B) – kolik je tam červené, zelené a modré.
    - Černá = (0, 0, 0)
    - Bílá = (255, 255, 255)
    - Červená = (255, 0, 0)

Pro počítač je tedy fotka kočky jen obrovský seznam čísel, třeba `[255, 120, 30, 10, 5, ... ]`.
Jeho úkolem je najít v těchto číslech matematickou souvislost, která říká: "Když jsou čísla uspořádána takto, je to KOČKA."

---

## Proces učení: Od chaosu k řádu

Jak naučíme počítač poznat žábu, když neví, co je to "zelená" nebo "oko"?
Použijeme proces zvaný **Supervised Learning (Učení s učitelem)**.

### 1. Příprava dat (Tréninková sada)

Vezmeme 50 000 obrázků a ke každému dáme správnou odpověď (štítek).

- Obrázek 1 -> "ŽÁBA"
- Obrázek 2 -> "AUTO"
- ...

### 2. Trénink (Hledání vzorů)

Ukazujeme modelu obrázky jeden po druhém.

- Model si tipne: "Je to loď?"
- My řekne: "Chyba! Je to žába."
- Model si "upraví vnitřní nastavení" (váhy), aby příště tipoval lépe.
- Toto opakujeme milionkrát.

### 3. Testování (Zkouška)

Nakonec modelu ukážeme fotky, které **nikdy předtím neviděl**.
Pokud pozná žábu i na nové fotce, znamená to, že se naučil obecný koncept "žáby" (vzory), ne jen nazpaměť konkrétní obrázky.

---

## Problém: Zploštění (Flattening)

Jednoduché modely neumí číst 2D obrázky (čtverce). Musíme pro ně obrázek "rozstříhat" na řádky a slepit je do jedné dlouhé "nudle" čísel.

- Obrázek 32x32 pixelů se změní na řadu 1024 čísel.
- Tím bohužel ztrácíme informaci o tom, co bylo nad čím a vedle čeho. (Proto jsou tyto jednoduché modely na obrázky slabé a později je nahradíme Konvolučními sítěmi, které vidí 2D).

---

## Shrnutí kapitoly

- Počítač vidí obrázky jako **matice čísel** (pixelů).
- Cílem klasifikace je najít v těchto číslech **vzory**, které odpovídají konkrétním objektům.
- Proces učení vyžaduje tisíce otitulkovaných příkladů (**Tréninková data**).
- Schopnost modelu poznat nové obrázky se nazývá **Generalizace**.
