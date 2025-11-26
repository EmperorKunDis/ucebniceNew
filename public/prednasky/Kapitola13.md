# Heuristiky a A\* algoritmus: Jak dát umělé inteligenci šestý smysl

V minulé kapitole jsme se naučili, jak BFS (Opatrný Průzkumník) a DFS (Odvážný Dobrodruh) prohledávají bludiště.

- **BFS** byl systematický, ale pomalý (prohledal vše).
- **DFS** byl rychlý, ale často zabloudil.

Co kdybychom mohli mít to nejlepší z obou světů? Co kdyby náš průzkumník měl **kompas**, který by mu neustále napovídal, kterým směrem se cíl pravděpodobně nachází?

Přesně to je principem **A\* (A-star) algoritmu**. Je to v podstatě BFS s kompasem. Je to mozek, který pohání vaši navigaci v autě i postavy ve videohrách.

---

## Co je to heuristika? Informovaný odhad

Slovo "heuristika" zní složitě, ale znamená jednoduchou věc: **Kvalifikovaný odhad** nebo **Intuice**.

Představte si, že hledáte cestu z Prahy do Brna.

- **Realita (Silnice):** Nevíte přesně, kudy vede dálnice, kde jsou objížďky. To musíte zjistit jízdou.
- **Heuristika (Vzdušná čára):** Podíváte se na mapu a vidíte, že Brno je na jihovýchod. I když nevíte, kudy přesně vede cesta, víte, že nemá smysl jet na sever do Liberce.

Heuristika dává AI "směr". Říká: "Tudy to vypadá slibněji, zkus to tam nejdřív."

---

## Jak funguje A\*? Rovnice cesty

A\* je geniální v tom, že při rozhodování kombinuje dvě hodnoty: **Realitu** a **Odhad**.

Matematicky se to zapíše jako: **`f(n) = g(n) + h(n)`**

1.  **`g(n)` = Minulost (Realita):** Kolik kilometrů už jsem ujel od startu? To víme přesně. Je to cena, kterou jsme už zaplatili.
2.  **`h(n)` = Budoucnost (Heuristika):** Kolik kilometrů mi asi ještě zbývá do cíle? To nevíme, ale odhadujeme to (např. vzdušnou čarou).

A\* vždy vybere tu cestu, která má nejnižší součet těchto dvou čísel.

- Nejde jen za nosem (jako DFS), protože bere v úvahu, kolik už ušel (`g`).
- Nehledá slepě všude (jako BFS), protože se nechá vést odhadem (`h`).

---

## Příklad: Navigace ve městě

Chcete se dostat z bodu A do bodu B.

1.  Přijdete na křižovatku.
2.  Doleva vede široká silnice (rychlá), ale mírně se odklání od cíle.
3.  Doprava vede úzká ulička (pomalá), ale míří přímo k cíli.

A\* si spočítá:

- **Cesta vlevo:** Nízké `g` (rychlá jízda) + Vyšší `h` (jedu špatným směrem).
- **Cesta vpravo:** Vyšší `g` (pomalá jízda) + Nízké `h` (jedu správným směrem).

Porovná součty a vybere tu lepší variantu. Díky tomu najde nejrychlejší cestu, i když to není ta nejkratší na kilometry.

---

## Shrnutí kapitoly

- **Heuristika** je odhad vzdálenosti k cíli (intuice).
- **A\* (A-star)** je algoritmus, který kombinuje již ušlou vzdálenost a odhad zbývající vzdálenosti.
- Je to zlatý standard pro hledání cest v mapách a hrách.
- Pracuje chytřeji, ne tvrději – prozkoumává jen ty cesty, které dávají smysl.
