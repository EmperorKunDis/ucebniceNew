# Dropout: Jak naučit neuronovou síť, aby si nebyla tak jistá sama sebou

Představte si studenta, který se na zkoušku učí tak, že se celý test i se správnými odpověďmi naučí nazpaměť. Na tomto konkrétním testu bude mít 100% úspěšnost. Ale když dostane mírně odlišnou otázku, která testuje skutečné pochopení, selže.

Nenaučil se totiž principy, jen si zapamatoval data. Tomuto jevu se v umělé inteligenci říká **přeučení (overfitting)**.

Je to nepřítel číslo jedna každého datového vědce.

---

## Problém: Model si pamatuje místo aby

chápal

**Přeučení** nastává, když je model tak posedlý detaily trénovacích dat, že ztratí schopnost **generalizovat** – tedy správně fungovat na nových, neviděných datech.

### Příznaky přeučení

- **Na trénovacích datech:** Přesnost 99 %.
- **Na testovacích datech:** Přesnost jen 75 %.
- Model se naučil "šum" v datech místo skutečných vzorů.

---

## Řešení: Dropout – Náhodné vypínání neuronů

Princip **Dropoutu** je geniálně jednoduchý:

> Během každého kroku tréninku náhodně "vypneme" (ignorujeme) určitý podíl neuronů ve skryté vrstvě.

### Analogie: Tým expertů

Představte si tým 10 expertů.

- **Bez Dropoutu:** Pokud se můžete vždy spolehnout na experta č. 3, ostatní zleníví.
- **S Dropoutem:** Expert č. 3 může kdykoliv náhodně "onemocnět". Ostatní se musí naučit jeho práci také, aby ho dokázali zastoupit.

Tým se stane robustnější a nespoléhá na jednotlivce.

---

## Jak to pomáhá?

Dropout nutí síť, aby:

1.  Nespoléhala na pár specifických neuronů.
2.  Vytvářela **redundantní znalosti** napříč celou sítí.
3.  Byla odolnější vůči "šumu" v datech.

Výsledkem je model, který lépe generalizuje.

---

## Dropout v praxi

- **Parametr p:** Určuje, jaké procento neuronů vypínáme. Typicky **p = 0.5** (vypínáme 50 %).
- **Pouze během tréninku:** Během testování jsou všechny neurony zapnuté. Model má k dispozici plný "tým".
- **Kde aplikovat:** Obvykle po skrytých vrstvách, ne na výstupní vrstvu.

---

## Shrnutí kapitoly

- **Overfitting (Přeučení)** je když model zná tréninková data nazpaměť, ale nerozumí principům.
- **Dropout** náhodně vypíná neurony při tréninku.
- Tím nutí síť učit se robustněji a nespoléhat na jednotlivce.
- Výsledek: Lepší **generalizace** na nová data.

---
