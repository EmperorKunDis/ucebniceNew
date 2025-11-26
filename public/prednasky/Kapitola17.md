# Nejistota a predikce: Jak AI předpovídá budoucnost z neúplné minulosti

Představte si, že jste datový vědec v roce 1912 a máte v ruce seznam pasažérů Titanicu. U každého znáte jméno, pohlaví a v jaké třídě cestoval. Dokázali byste jen na základě těchto dat odhadnout, kdo z nich měl největší šanci na přežití?

A co když u spousty pasažérů klíčový údaj – jejich věk – úplně chybí?

Vítejte ve světě reálné umělé inteligence. Světě plném **nejistoty**, chybějících dat a odhadů. Dnes se naučíme, jak AI dokáže dělat chytré předpovědi i z děravých informací.

---

## Co je nejistota?

V učebnicích jsou data dokonalá. V životě jsou data "špinavá".

1.  **Chybějící data:** Nevíme věk pasažéra. Nevíme, kolik stál lístek.
2.  **Šum:** Někdo zapsal jméno s překlepem. Někdo lhal o svém věku.

AI se s tím musí vyrovnat. Místo aby se zhroutila ("Error!"), musí udělat **nejlepší možný odhad**.

### Jak doplnit chybějící věk?

Máte seznam 1000 lidí, u 200 z nich chybí věk. Co s tím?

- **Špatné řešení:** Smazat těch 200 lidí. (Ztratíte cenná data).
- **Lepší řešení (Průměr):** Spočítáte průměrný věk ostatních (např. 30 let) a doplníte ho všem.
- **Chytré řešení (Imputace):** Podíváte se na titul. Pokud je to "Master" (mladý pán), doplníte věk dítěte (např. 5 let). Pokud je to "Mrs." (paní), doplníte věk dospělé ženy.

---

## Bayesovo uvažování: Detektivní práce

Jak AI zpřesňuje své odhady? Používá princip zvaný **Bayesovo uvažování**. Je to neustálé aktualizování názoru.

### Příklad: Přežití na Titanicu

1.  **Krok 1: Apriorní odhad (Prior)**
    - Nic o pasažérovi nevíme.
    - Statistika říká: Celkově přežilo asi **38 %** lidí.
    - Náš odhad: "Šance na přežití je 38 %."

2.  **Krok 2: Nový důkaz (Evidence)**
    - Dozvíme se: "Pasažér je žena."
    - Víme, že ženy měly přednost ("Ženy a děti první").
    - Náš odhad roste: "Šance na přežití je **74 %**."

3.  **Krok 3: Další důkaz**
    - Dozvíme se: "Cestovala v 1. třídě."
    - Víme, že 1. třída byla blíže člunům.
    - Náš odhad roste: "Šance na přežití je **97 %**."

Takhle "přemýšlí" AI. Začíná s obecným odhadem a s každou další informací ho zpřesňuje.

---

## Proč AI nikdy neříká "Ano/Ne"?

Dobrý AI model vám málokdy řekne "Tento člověk přežil". Místo toho řekne: "Tento člověk přežil s pravděpodobností 85 %."

To je klíčové.

- Pokud AI řekne, že máte rakovinu na 51 %, lékař vás pošle na další testy.
- Pokud AI řekne, že máte rakovinu na 99 %, lékař okamžitě zahájí léčbu.
  Číslo (pravděpodobnost) nese informaci o **jistotě**.

---

## Shrnutí kapitoly

- **Nejistota** je v datech všudypřítomná (chybějící hodnoty, chyby).
- **Imputace** je proces chytrého doplňování chybějících dat.
- **Bayesovo uvažování** je proces aktualizace pravděpodobnosti na základě nových důkazů.
- Výstupem AI je často **pravděpodobnost** (např. 80 %), ne jistota.
