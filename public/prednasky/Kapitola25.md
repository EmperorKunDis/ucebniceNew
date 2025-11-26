# Klasifikace pomocí K-nejbližších sousedů (KNN): Jsi takový, jako tvoji přátelé

Představte si, že jste na velkém večírku, kde nikoho neznáte, a chcete odhadnout, kdo z hostů je fanouškem sci-fi filmů. Co uděláte?
Pravděpodobně se podíváte na skupinku lidí, u které zrovna stojíte. Pokud se tři nejbližší lidé kolem vás baví o Star Wars, je velká šance, že jste narazili na fanoušky sci-fi.

Gratuluji, právě jste intuitivně použili algoritmus **K-nejbližších sousedů (KNN)**.
Je to jeden z nejjednodušších algoritmů, založený na prastaré moudrosti: **"Vrána k vráně sedá"** nebo **"Jsi takový, jací jsou tvoji nejbližší přátelé"**.

---

## Jak to funguje: Hlasování sousedů

Princip je geniálně jednoduchý. Když se objeví někdo nový (nový bod v datech) a my nevíme, kam patří, uděláme toto:

1.  **Změříme vzdálenost:** Podíváme se, kdo stojí nejblíže. (Jako bychom vzali pravítko).
2.  **Vybereme "K" sousedů:** Rozhodneme se, kolika lidí se zeptáme. To je to číslo **K**.
    - Pokud K=1, zeptáme se jen toho úplně nejbližšího.
    - Pokud K=5, zeptáme se pěti nejbližších.
3.  **Hlasování:** Podíváme se, do jaké skupiny patří tito sousedé. Která skupina vyhraje, tam zařadíme i nováčka.

---

## Magické číslo "K"

Volba čísla K je klíčová.

- **K = 1 (Nervózní soused):**
  - Ptáme se jen jednoho člověka.
  - **Problém:** Co když je ten jeden člověk výjimka? Co když je to fanoušek metalu, který se omylem přimíchal mezi fanoušky dechovky? Náš model se splete. Je příliš citlivý na šum.

- **K = 100 (Davové šílenství):**
  - Ptáme se stovky lidí v širokém okolí.
  - **Problém:** Hlasování se zprůměruje. Detaily se ztratí. Model bude příliš obecný.

- **Ideální K:**
  - Někde mezi. Dost velké na to, aby ignorovalo ojedinělé podivíny, ale dost malé na to, aby vnímalo lokální rozdíly.

---

## Kde se to používá?

- **Doporučování filmů:** "Lidem, kteří mají podobný vkus jako ty (tvoji sousedé v datech), se líbil Matrix. Tobě se bude líbit taky."
- **Rozpoznávání písma:** "Tento klikyhák vypadá nejvíc jako písmena 'A', která už znám."
- **Medicína:** "Tento pacient má podobné příznaky jako těchto 5 pacientů, kteří měli chřipku."

---

## Shrnutí kapitoly

- **KNN (K-Nearest Neighbors)** klasifikuje podle podobnosti.
- Neučí se žádná složitá pravidla, jen si **pamatuje** všechna data.
- Když přijde nový bod, podívá se na jeho **nejbližší sousedy**.
- Parametr **K** určuje, kolik sousedů má hlasovací právo.

---
