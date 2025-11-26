# Vícevrstvé sítě: Tým, který vyřeší neřešitelné

V minulé kapitole jsme oslavovali. Náš Perceptron (Vrátný) se naučil jednoduchá pravidla.
Dnes ho ale postavíme před úkol, na kterém si vyláme zuby. Tím úkolem je logická funkce **XOR (buď anebo)**.

Zjistíme, proč jeden neuron nestačí, a abychom problém vyřešili, budeme muset povýšit. Postavíme si skutečnou **vícevrstvou neuronovou síť**.

---

## Problém XOR: Zeď, kterou nelze prorazit

Představte si taneční parket.

- V jednom rohu jsou lidé v červeném.
- V protějším rohu jsou také lidé v červeném.
- Ve zbylých dvou rozích jsou lidé v modrém.

Úkol pro vrátného: **"Natáhni jedno červené lano (přímku) tak, abys oddělil všechny červené od modrých."**

Zkuste si to nakreslit na papír. **To nejde!**
Jednou rovnou čárou nikdy neoddělíte protější rohy. Perceptron umí dělat jen rovné čáry. Proto na tomto úkolu selže.

---

## Řešení: Tým vrátných (Skrytá vrstva)

Jak to vyřešit? Co když najmeme **dva vrátné**?

1.  Vrátný A natáhne lano jedním směrem.
2.  Vrátný B natáhne lano druhým směrem.
3.  A za nimi bude stát **Manažer** (výstupní neuron), který řekne: "Pokud jsi za lanem A a zároveň za lanem B, jsi v modré zóně."

Tím, že jsme přidali další vrstvu lidí (vrátné A a B), jsme vytvořili **Skrytou vrstvu (Hidden Layer)**.
Díky ní už síť nemusí kreslit jen jednu čáru. Může kombinovat více čar a vytvářet složité tvary (trojúhelníky, kruhy, křivky).

---

## Zpětné šíření chyby (Backpropagation): Hra na viníka

Jak se takový tým učí? Je to složitější než u jednoho vrátného.
Používá se algoritmus zvaný **Backpropagation**. Představte si to jako "tichou poštu pozpátku s obviňováním".

1.  **Manažer (Výstup)** udělá chybu.
2.  Otočí se na vrátné A a B a řekne: "Hej, udělal jsem chybu, protože vy jste mi dali špatné informace! Ty, A, jsi za to mohl z 80 %. Ty, B, z 20 %."
3.  **Vrátní A a B** se otočí na své vstupy a také rozdělí vinu. "Já jsem to spletl, protože ty, Vstupe 1, jsi byl moc silný."

Chyba se šíří od konce na začátek a každý si trochu upraví své váhy. Tím se celá síť postupně sladí.

---

## Shrnutí kapitoly

- Jeden neuron (Perceptron) umí řešit jen jednoduché, lineární problémy.
- Pro složité problémy (jako XOR) potřebujeme **vícevrstvou síť**.
- **Skrytá vrstva** umožňuje síti chápat složité vztahy a tvary.
- **Backpropagation** je metoda učení, kdy se chyba rozpočítává zpětně na všechny neurony v síti.

---
