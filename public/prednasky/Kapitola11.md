# Prostor stavů: Jak pro umělou inteligenci nakreslit mapu k řešení problému

Představte si, že jste v akčním filmu a musíte zneškodnit bombu. Máte dvě nádoby, jednu na 4 litry a druhou na 3 litry, a žádné další odměrky. K deaktivaci časovače potřebujete odměřit **přesně 2 litry** vody. Jak to uděláte?

Zkoušet to náhodně by vedlo k výbuchu. Potřebujete mapu. Mapu všech možných kroků a jejich výsledků. Vítejte ve světě **stavových prostorů** – elegantního konceptu, který umožňuje AI převést jakýkoliv problém, od hlavolamů po plánování cesty, na přehlednou mapu.

---

## Anatomie problému: Stavy, operátory a cíl

Abychom mohli problém proměnit v mapu, musíme definovat tři klíčové věci.

### 1. Stav (State)

Je to "snímek" situace v daném okamžiku.

- V našem případě je stav určen množstvím vody v nádobách.
- **Start:** (0 litrů, 0 litrů).
- **Cíl:** Jakýkoliv stav, kde je v jedné nádobě číslo 2.

### 2. Operátory (Akce)

To jsou pravidla hry. Co můžeme dělat?

- Naplnit nádobu až po okraj.
- Vylít nádobu do prázdna.
- Přelít vodu z jedné do druhé (dokud není první prázdná nebo druhá plná).

### 3. Prostor stavů (Mapa)

Toto je soubor všech možných situací, které mohou nastat.

- Z počátečního stavu (0,0) můžeme jít do (4,0) [naplnění velké] nebo (0,3) [naplnění malé].
- Z (4,0) můžeme jít do (4,3), (0,0) nebo (1,3) [přelití do malé].

AI si v paměti vytvoří obrovskou síť (graf), kde uzly jsou stavy a čáry jsou akce. Řešení problému je pak jen hledání cesty v této síti.

---

## Příklad: Hanojské věže

Znáte hlavolam se třemi tyčkami a disky různých velikostí?

- **Pravidlo:** Větší disk nesmí ležet na menším.
- **Cíl:** Přesunout celou věž na jinou tyčku.

Pro člověka je to o "intuici". Pro AI je to opět jen hledání cesty ve stavovém prostoru.

1.  **Stav:** Kde leží který disk.
2.  **Operátor:** Přesunout vrchní disk na jinou tyčku (pokud to pravidla dovolí).
3.  **Řešení:** Sekvence tahů z bodu A do bodu B.

---

## Proč je to důležité?

Tento princip se nepoužívá jen na hádanky.

- **Navigace:** Stav je vaše poloha na mapě. Operátor je "zahni doleva". Cíl je "domov".
- **Robotika:** Stav je poloha robotické ruky. Operátor je "pohni kloubem o 5 stupňů". Cíl je "uchopit hrnek".
- **Šachy:** Stav je rozestavení figurek. Operátor je tah figurkou. Cíl je mat.

Problém je, že u šachů je stavový prostor tak obrovský (více než atomů ve vesmíru), že ho nelze celý nakreslit. Proto AI potřebuje chytré algoritmy, aby v něm nebloudila věčně. O těch si povíme v příští kapitole.

---

## Graf jako reprezentace prostoru stavů

AI si prostor stavů nepředstavuje jako zásobník papírů, ale jako **graf** - matematickou strukturu.

### Co je to graf?

Graf je soubor **uzlů** (bodů) spojených **hranami** (čarami).

- **Uzel (Node/Vertex):** Jeden konkrétní stav (např. "4 litry v první nádobě, 0 v druhé").
- **Hrana (Edge):** Operátor/akce, která vede z jednoho stavu do druhého (např. "naplň první nádobu").

### Proč je to užitečné?

Když AI vidí problém jako graf, může použít **algoritmy pro hledání cesty v grafu**:

- **BFS (Breadth-First-Search):** Prohledávání do šířky.
- **DFS (Depth-First Search):** Prohledávání do hloubky.
- **A\*:** Hledání nejkratší cesty s heuristikou.

Každý z těchto algoritmů "chodí po grafu" a hledá cestu ze **startovního uzlu** (počáteční stav) do **cílového uzlu** (cíl).

**Představte si to jako:**

- **Mapa metra:** Každá stanice je uzel, koleje jsou hrany. Hledáte nejrychlejší cestu z bodu A do B.
- **Hra na šachovnici:** Každá pozice figurky je uzel, možné tahy jsou hrany.

Grafová reprezentace je **univerzální jazyk** pro modelování problémů v AI.

---

## Shrnutí kapitoly

- **Stavový prostor** je mapa všech možných situací problému.
- **Stav** je jeden konkrétní bod na mapě (např. "mám 3 litry vody").
- **Operátor** je akce, která nás posune z jednoho stavu do druhého.
- Řešení problému pro AI znamená **najít cestu** z počátečního stavu do cílového stavu.
