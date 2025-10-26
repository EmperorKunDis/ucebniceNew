# Úvod do pravděpodobnosti: Jak zkrotit náhodu a vyhrát auto

Představte si, že jste v televizní soutěži a stojíte před třemi zavřenými dveřmi. Za jedněmi je zbrusu nové auto, za zbylými dvěma jsou kozy. Vyberete si dveře č. 1. Moderátor, který ví, co je za kterými dveřmi, se usměje, otevře dveře č. 3 a ukáže vám kozu. A teď vám dá životní nabídku:

> "Chcete zůstat u svých dveří číslo 1, nebo chcete změnit svou volbu na dveře číslo 2?"

Co byste měli udělat? Většina lidí si řekne, že je to teď 50 na 50, takže na tom nezáleží. Ale mýlí se. Správná odpověď odporuje intuici, ale matematika a pravděpodobnost mluví jasně. Na konci této kapitoly budete nejen znát správnou odpověď, ale budete si schopni v Pythonu dokázat, proč je správná. Vítejte ve světě pravděpodobnosti, nástroje, který nám umožňuje nahlédnout do budoucnosti a kvantifikovat nejistotu.

---

## Základní pojmy: Jazyk náhody

Abychom mohli o náhodě mluvit, potřebujeme pár základních slovíček.

- **Jev:** Jakýkoliv výsledek, který může nastat (padne panna, na kostce bude 6).
- **Pravděpodobnost jevu P(A):** Číslo mezi 0 a 1 (nebo 0 % a 100 %), které říká, jak moc je pravděpodobné, že jev A nastane. P(A) = 0 znamená nemožné, P(A) = 1 znamená jisté. Pro hod kostkou je P(padne 6) = 1/6 ≈ 0.167.
- **Podmíněná pravděpodobnost P(A|B):** "Pravděpodobnost jevu A, _za podmínky_, že nastal jev B". Toto je klíčový koncept pro umělou inteligenci (a náš hlavolam). Ptáme se: Jak nová informace (B) změní pravděpodobnost původního jevu (A)? Například: Jaká je P(za dveřmi 2 je auto | moderátor otevřel dveře 3)?

---

## Zákony pravděpodobnosti: Pravidla hry

Matematika nám dává dvě hlavní pravidla pro práci s pravděpodobností:

1.  **Pravidlo sčítání (pro "NEBO"):** Jaká je pravděpodobnost, že na kostce padne 1 NEBO 6? Pokud se jevy nemohou stát najednou, jednoduše jejich pravděpodobnosti sečteme.
    - `P(A nebo B) = P(A) + P(B)`
    - `P(padne 1 nebo 6) = 1/6 + 1/6 = 2/6`

2.  **Pravidlo násobení (pro "A ZÁROVEŇ"):** Jaká je pravděpodobnost, že hodím na dvou kostkách dvě šestky za sebou? Pokud jsou jevy na sobě nezávislé, jejich pravděpodobnosti vynásobíme.
    - `P(A a B) = P(A) * P(B)`
    - `P(první je 6 a druhá je 6) = 1/6 * 1/6 = 1/36`

---

## Praktický projekt: Simulace Monty Hall problému

Teorie je jedna věc, ale pojďme si náš hlavolam dokázat v praxi. Napíšeme si v Pythonu simulaci, která odehraje tuto hru 10 000krát a spočítá, která strategie – "zůstat", nebo "změnit" – je úspěšnější.

**Krok 1: Příprava prostředí**

```bash
pip install numpy
```

**Krok 2: Kód simulace**

Tento skript simuluje tisíce her a počítá výsledky pro obě strategie.

```python
import numpy as np

def simulace_monty_hall(pocet_her=10000):
    """Simuluje Monty Hall problém a vrací úspěšnost strategií."""

    vyhry_pri_zmene = 0
    vyhry_pri_zustani = 0

    for _ in range(pocet_her):
        # 1. Náhodně umístíme auto za jedny ze tří dveří (0, 1, 2)
        dvere = [0, 1, 2]
        dvere_s_autem = np.random.randint(0, 3)

        # 2. Hráč si náhodně vybere jedny dveře
        hracova_volba = np.random.randint(0, 3)

        # 3. Moderátor otevře jedny ze zbývajících dveří, kde je koza
        zbyvajici_dvere = [d for d in dvere if d != dvere_s_autem and d != hracova_volba]
        dvere_k_otevreni = np.random.choice(zbyvajici_dvere)

        # 4. Hráč se rozhodne, zda změní volbu
        # Dveře, na které může změnit, jsou ty, které nejsou jeho původní volba ani ty otevřené moderátorem.
        dvere_pro_zmenu = [d for d in dvere if d != hracova_volba and d != dvere_k_otevreni][0]

        # Vyhodnocení strategie "ZŮSTAT"
        if hracova_volba == dvere_s_autem:
            vyhry_pri_zustani += 1

        # Vyhodnocení strategie "ZMĚNIT"
        if dvere_pro_zmenu == dvere_s_autem:
            vyhry_pri_zmene += 1

    uspesnost_zustani = (vyhry_pri_zustani / pocet_her) * 100
    uspesnost_zmeny = (vyhry_pri_zmene / pocet_her) * 100

    return uspesnost_zustani, uspesnost_zmeny

# Spuštění simulace
pocet_simulaci = 10000
uspesnost_zustani, uspesnost_zmeny = simulace_monty_hall(pocet_simulaci)

print(f"Po {pocet_simulaci} hrách:")
print(f"Úspěšnost strategie 'Zůstat u původní volby': {uspesnost_zustani:.2f}%")
print(f"Úspěšnost strategie 'Vždy změnit volbu': {uspesnost_zmeny:.2f}%")
```

**Krok 3: Interpretace výsledků**

Když kód spustíte, uvidíte něco velmi překvapivého:

- Úspěšnost strategie 'Zůstat' se bude pohybovat kolem **33.3 %**.
- Úspěšnost strategie 'Vždy změnit' se bude pohybovat kolem **66.7 %**.

**Závěr simulace je jasný: Vždy se vyplatí změnit dveře!**

---

## Proč to tak je? Bayesova věta a nová informace

Jak je to možné? Protože moderátorova akce není náhodná. Tím, že otevřel dveře s kozou, vám dal klíčovou **novou informaci**.

- Na začátku máte šanci 1/3, že jste si vybrali auto, a šanci 2/3, že auto je za jedněmi ze dvou zbývajících dveří.
- Když moderátor jedny z těchto dvou dveří (ty s kozou) vyloučí, ta pravděpodobnost 2/3 se "nesdělí" rovnoměrně, ale celá se "přelije" na ty jediné zbývající zavřené dveře, které jste si nevybrali.
- Vaše původní volba má stále jen 1/3 šanci. Ale dveře, na které můžete změnit, nyní nesou celou tu původní pravděpodobnost 2/3.

Matematicky se tento proces "aktualizace pravděpodobnosti na základě nových důkazů" popisuje **Bayesovou větou**, která je absolutním základem pro mnoho oblastí AI, zejména pro strojové učení.

---

## Závěr: Pravděpodobnost jako kompas v nejistotě

Dnes jste viděli, že pravděpodobnost není jen o házení kostkou. Je to mocný nástroj pro aktualizaci našich přesvědčení na základě nových důkazů. A co víc, naučili jste se, jak si pomocí simulace v Pythonu ověřit i ty nejvíce proti-intuitivní teorie.

Schopnost správně odhadnout pravděpodobnost a aktualizovat své odhady na základě nových dat je přesně to, co dělá AI "chytrou". Od diagnostikování nemocí po předpovídání cen akcií, vše je hra s pravděpodobnostmi.

**Vaše výzva:** Zkuste si v našem simulačním kódu změnit počet dveří na začátku. Co se stane, když budete vybírat z 10 dveří, vyberete si jedny a moderátor jich pak 8 otevře (a ukáže 8 koz)? Jaká bude nyní úspěšnost strategie "změnit"? Experimentujte a objevujte zákony náhody!
