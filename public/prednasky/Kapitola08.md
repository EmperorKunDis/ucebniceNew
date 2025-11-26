# AI ve hrách: Od šachových géniů po digitální bohy

Vzpomenete si na svého prvního herního protivníka? Možná to byl duch v Pac-Manovi, který vás neúnavně pronásledoval, nebo neomylný soupeř v šachu na starém počítači. To byla umělá inteligence ve své nejranější podobě.

Dnes AI ve hrách dokáže mnohem víc. Řídí komplexní armády ve strategiích, vytváří nepředvídatelné protivníky ve střílečkách a dokonce se učí hrát lépe než nejlepší hráči světa. V této kapitole se podíváme na to, jak se z jednoduchých pravidel stala téměř živá inteligence.

---

## Tradiční herní AI: Dokonalý, ale předvídatelný stroj

První herní AI byly jako dokonalí šachoví mistři s přesně daným manuálem. Jejich mozkem byl často algoritmus zvaný **Minimax**.

### Jak Minimax přemýšlí?

Představte si, že AI je **extrémní pesimista**.

1.  Chce udělat tah.
2.  Podívá se do budoucnosti: "Když udělám tah A, soupeř (který je chytrý) udělá tah B, já pak C..."
3.  Předpokládá, že soupeř vždy zahraje ten **nejlepší možný tah pro sebe** (a tedy nejhorší pro AI).
4.  AI se snaží vybrat takovou cestu, která i v tom nejhorším případě (kdy soupeř hraje dokonale) vede k nejmenší škodě. **Minimalizuje maximální ztrátu.**

### Výhoda a nevýhoda

- **Výhoda:** V jednoduchých hrách (piškvorky, dáma) je neporazitelný.
- **Nevýhoda:** Je předvídatelný. Jakmile pochopíte jeho logiku, nikdy vás nepřekvapí. A u složitých her (Go) je možností tolik, že je nelze všechny spočítat.

---

## Moderní herní AI: Stroj, který se učí hrát sám

Co když neprogramujeme pravidla, ale necháme AI, ať si je najde sama? To je princip **Zpětnovazebního učení (Reinforcement Learning)**.

### Princip: Cukr a bič

Je to jako cvičit psa.

1.  **Agent (AI):** Hraje hru.
2.  **Akce:** Udělá náhodný pohyb.
3.  **Odměna/Trest:**
    - Pokud vyhraje nebo získá bod -> dostane **+1 (pamlsek)**.
    - Pokud prohraje nebo spadne do jámy -> dostane **-1 (trest)**.
4.  **Cíl:** AI chce maximalizovat počet pamlsků. Postupně zjistí, že skákat do jámy se nevyplácí, ale sbírat mince ano.

### Příklad: AlphaGo

Slavný program AlphaGo se nenaučil hrát starodávnou hru Go studiem knih.

- Hrál miliony her **sám proti sobě**.
- Na začátku hrál náhodně jako dítě.
- Po týdnech tréninku objevil strategie, které lidé za 3000 let hraní nikdy nevymysleli.
- Porazil mistra světa Lee Sedola, což byl šok pro celý svět.

---

## AI jako herní designér

AI dnes hry nejen hraje, ale i _vytváří_.

- **Procedurální generování:** AI dokáže vytvořit nekonečný vesmír (jako ve hře No Man's Sky), kde je každá planeta jiná. Nemusí ji kreslit grafik, vytvoří ji algoritmus.
- **Chytrá obtížnost:** AI sleduje, jak hrajete. Když vidí, že se nudíte, pošle na vás více nepřátel. Když vidí, že prohráváte, nenápadně vám pomůže (např. nepřátelé budou méně přesní). Cílem je udržet vás v "zóně zábavy".

---

## Algoritmy pro herní AI: Minimax a Alpha-Beta

Aby AI mohla hrát strateg

ické hry (šachy, piškvorky), potřebuje algoritmus, který **předvídá budoucnost**.

### Minimax: Plánování všech možností

**Minimax** je algoritmus, který prozkoumává všechny možné tahy několik kroků dopředu.

**Jak funguje (na příkladu piškorek):**

1.  AI vytvoří "strom možností" - všechny možné tahy, které může udělat.
2.  Pro každý tah prozkoumá, jak by soupeř mohl odpovědět.
3.  A pak zase, jak by AI odpověděla na soupeřovu odpověď.
4.  To opakuje třeba 5 tahů dopředu.
5.  Na konci každé větve vyhodnotí: "Kdo by vyhrál?"
6.  Pak se "vrací zpět" a vybírá nejlepší cestu.

**Název Minimax:**

- **MAX** - AI se snaží **maximalizovat** své skóre.
- **MIN** - AI předpokládá, že soupeř se bude snažit **minimalizovat** skóre AI (tedy maximalizovat své vlastní).

### Alpha-Beta Pruning: Chytrá zkratka

Problém Minimaxu? Prozkoumává **VŠECHNY** možnosti. U složitých her (šachy) to znamená miliardy pozic!

**Alpha-Beta Pruning** je vylepšení, které "ořezává" (pruning = prořezávání) zbytečné větve.

**Princip:**
Když AI zjistí, že určitá větev **nemůže** vést k lepšímu výsledku než už nalezený tah, přestane ji zkoumat.

**Analogie:**
Hledáte nejlevnější jablka na třech trzích.

- Trh A: 20 Kč/kg.
- Trh B: Už vidíte cedulku "25 Kč/kg" - nemusíte dál chodit, víte, že je to dražší než A.
- Tím jste "ořezali" zbytečnou cestu.

Díky Alpha-Beta může AI prozkoumat **stejně hluboko** (např. 10 tahů dopředu) mnohem **rychleji**.

---

## Shrnutí kapitoly

- **Minimax** je klasický algoritmus, který propočítává tahy dopředu a předpokládá dokonalého soupeře.
- **Reinforcement Learning (Zpětnovazební učení)** je moderní metoda, kde se AI učí metodou pokus-omyl (odměna/trest).
- **AlphaGo** ukázal, že AI se může naučit strategie, které přesahují lidské chápání.
- AI ve hrách slouží k tomu, aby byl zážitek pro hráče zábavnější a dynamičtější.
