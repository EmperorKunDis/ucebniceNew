# Úvod do neuronových sítí: Postavte si svůj první umělý neuron

Až dosud jsme používali hotové "černé skříňky". Dnes se ale odvážíme a jednu takovou skříňku si sami postavíme od úplných základů. Vytvoříme si nejjednodušší formu umělého neuronu, která odstartovala celou revoluci v AI – **Perceptron**.

---

## Perceptron jako Vrátný v klubu

Představte si Perceptron jako **vrátného (vyhazovače)** v exkluzivním klubu.
Jeho úkolem je rozhodnout: **Pustit dovnitř (1), nebo nepustit (0)?**

Aby se rozhodl, dívá se na několik kritérií (vstupů):

1.  **Je host plnoletý?** (Ano/Ne)
2.  **Je slušně oblečený?** (Ano/Ne)
3.  **Je to celebrita?** (Ano/Ne)

Každému kritériu dává jinou důležitost (**Váhu**):

- Plnoletost je nutnost. (Váha = 10).
- Oblečení je důležité, ale dá se přimhouřit oko. (Váha = 3).
- Celebrita má protekci. (Váha = 50).

### Jak probíhá rozhodování?

Vrátný sečte body:
`Skóre = (Plnoletost * 10) + (Oblečení * 3) + (Celebrita * 50)`

A nakonec porovná skóre s prahem (**Bias**):

- Pokud je `Skóre > 15`, pustí hosta dovnitř (Výstup 1).
- Jinak smůla (Výstup 0).

---

## Jak se neuron učí?

Na začátku je vrátný nový a nezná pravidla. Váhy si jen tipne.
Pak přijde manažer klubu (Trénovací data) a začne ho opravovat.

1.  Vrátný pustí dítě (chyba!).
    - Manažer: "Špatně! Plnoletost musí mít mnohem větší váhu!"
    - Vrátný si v hlavě **zvýší váhu** u plnoletosti.

2.  Vrátný nepustí celebritu v teplákách (chyba!).
    - Manažer: "Špatně! Celebrita má mít obrovskou váhu, i když je v teplákách!"
    - Vrátný si **zvýší váhu** u celebrity.

Tento proces (chyba -> úprava vah) se opakuje tisíckrát, dokud se vrátný nenaučí perfektně rozhodovat. Tomu říkáme **trénink neuronové sítě**.

---

## Biologická inspirace

Perceptron je velmi zjednodušenou kopií neuronu v našem mozku.

- **Dendrity** (vstupy) přijímají signál.
- **Jádro** (sčítání) signál zpracuje.
- **Axon** (výstup) pošle signál dál, pokud je dostatečně silný.

---

## Shrnutí kapitoly

- **Perceptron** je nejjednodušší umělý neuron.
- Má **vstupy**, **váhy** (důležitost) a **bias** (práh).
- Rozhoduje se na základě **váženého součtu**.
- **Učení** znamená postupné upravování vah na základě chyb.

---
