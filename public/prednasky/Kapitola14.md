# Svět očima AI: Jak počítač "vidí" a "hraje"

V minulých kapitolách jsme si kreslili mapy a hledali cesty. Ale jak to vypadá z pohledu samotné umělé inteligence? Když hrajete videohru, vidíte grafiku, stromy, nepřátele. AI nic z toho nevidí. Vidí jen čísla.

V této kapitole se podíváme pod kapotu virtuálních světů. Zjistíme, jak AI vnímá své okolí, jak se rozhoduje a proč je pro ni hra jen velká matematická tabulka.

---

## Agent a Prostředí: Dva tanečníci

V každé simulaci nebo hře existují dvě hlavní entity:

1.  **Agent (AI):** To je ten, kdo jedná. Může to být postava ve hře, robotický vysavač nebo autopilot v letadle.
2.  **Prostředí (Svět):** Všechno kolem agenta. Bludiště, silnice, šachovnice.

Jejich vztah funguje v nekonečné smyčce zvané **Smyčka vnímání a akce (Perception-Action Loop)**:

1.  **Vnímání (SENSE):** Agent se podívá kolem sebe. "Vidím zeď vlevo a volno vpravo."
2.  **Myšlení (THINK):** Agent použije svůj mozek (algoritmus jako A\* nebo BFS). "Cíl je vpravo, takže chci jít doprava."
3.  **Akce (ACT):** Agent provede pohyb. "Jdu o krok doprava."
4.  **Reakce prostředí:** Svět se změní. Agent je na nové pozici. A smyčka začíná znovu.

---

## Jak AI "vidí"? Senzory vs. Data

Lidé mají oči. AI má **senzory** nebo přímý přístup k datům.

### 1. Mřížkové vidění (Grid World)

V jednoduchých hrách (jako Pac-Man nebo naše bludiště) AI vidí svět jako šachovnici.

- Nevidí "zeď". Vidí políčko s hodnotou `1`.
- Nevidí "cestu". Vidí políčko s hodnotou `0`.
- Je to jako kdybyste hráli šachy se zavázanýma očima a někdo vám jen hlásil souřadnice: "Na E5 je pěšec."

### 2. Paprskové vidění (Raycasting)

V 3D střílečkách AI často používá "neviditelné laserové paprsky".

- Agent vyšle paprsek před sebe.
- Pokud paprsek do něčeho narazí po 5 metrech, AI ví: "Přede mnou je překážka 5 metrů daleko."
- Tímto způsobem si "ohmatává" svět kolem sebe, podobně jako netopýr echolokací.

---

## Simulace: Bezpečné hřiště pro učení

Proč AI trénujeme ve hrách a simulacích, a ne rovnou v realitě?
Představte si, že učíte autonomní auto řídit.

- **Realita:** První chyba = bouračka za milion korun a ohrožení života.
- **Simulace:** První chyba = restart hry.

Simulace nám umožňují zrychlit čas. To, co by v reálu trvalo roky (např. evoluce robota, který se učí chodit), můžeme v počítači nasimulovat za pár hodin. AI může "zemřít" milionkrát, aby se naučila, jak jednou přežít.

---

## Shrnutí kapitoly

- **Agent** je ten, kdo se rozhoduje. **Prostředí** je svět, ve kterém žije.
- Fungují v cyklu: **Vnímej -> Mysli -> Konei**.
- AI nevidí grafiku, vidí **data** (mřížku čísel nebo vzdálenosti).
- **Simulace** jsou klíčové pro bezpečný trénink AI před nasazením do reality.
