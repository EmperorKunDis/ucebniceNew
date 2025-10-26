# AI ve hrách: Od šachových géniů po digitální bohy

Vzpomenete si na svého prvního herního protivníka? Možná to byl duch v Pac-Manovi, který vás neúnavně pronásledoval, nebo neomylný soupeř v šachu na starém počítači. To byla umělá inteligence ve své nejranější podobě. Dnes ale AI ve hrách dokáže mnohem víc. Řídí komplexní armády ve strategiích, vytváří nepředvídatelné protivníky ve střílečkách a dokonce se učí hrát lépe než nejlepší hráči světa. V této kapitole se podíváme na to, jak se z jednoduchých pravidel stala téměř živá inteligence, a vy si na konci naprogramujete vlastní malou, ale neporazitelnou AI pro Piškvorky.

---

## Tradiční herní AI: Dokonalý, ale předvídatelný stroj

První herní AI byly jako dokonalí šachoví mistři s přesně daným manuálem. Jejich mozkem byl často algoritmus zvaný **Minimax**.

- **Jak Minimax přemýšlí?** Představte si, že AI je extrémní pesimista. U každého svého tahu předpokládá, že vy, jako soupeř, zahrajete ten absolutně nejlepší možný tah pro vás. AI se tedy snaží vybrat takový svůj tah, který **minimalizuje maximální** škodu, kterou jí můžete způsobit. Prohledává strom všech možných budoucích tahů a hodnotí je: +10 za svou výhru, -10 za prohru, 0 za remízu. Pak se vrací zpět a vybírá cestu, která i při nejlepší snaze soupeře nevede k prohře.
- **Kde se používal?** V klasických deskových hrách jako šachy, dáma nebo piškvorky.
- **Výhody a nevýhody:** Je neporazitelný v jednoduchých hrách. Ale je také předvídatelný. Jakmile pochopíte jeho logiku, nikdy vás nepřekvapí. Navíc u složitých her, jako je Go, je strom možností tak obrovský, že by ho ani nejrychlejší počítač nedokázal propočítat.

---

## Moderní herní AI: Stroj, který se učí hrát sám

Co když neprogramujeme pravidla, ale necháme AI, ať si je najde sama? To je princip **zpětnovazebního učení (Reinforcement Learning)**.

- **Jak to funguje?** Je to jako cvičit psa. AI (agent) provádí v herním světě (prostředí) akce. Za dobré akce (získání bodu, poražení nepřítele) dostane **pozitivní odměnu** (digitální pamlsek). Za špatné akce (ztráta života) dostane **negativní odměnu**. Cílem AI je jediné: maximalizovat součet budoucích odměn.
- **Skutečný příklad: AlphaGo od DeepMind.** AlphaGo se nenaučil hrát Go studiem lidských partií. Naučil se ho tak, že hrál miliony her sám proti sobě. Na začátku hrál náhodně. Ale po každé hře mírně upravil svou strategii, aby podpořil akce, které vedly k vítězství. Po týdnech tréninku objevil strategie, které lidé za tisíce let hraní nikdy nevymysleli, a porazil nejlepšího hráče světa.
- **Kde se používá?** Pro trénování AI v komplexních hrách (Dota 2, StarCraft II), v robotice (učení se chůzi) nebo v simulacích.

---

## Praktický projekt: Naprogramujte neporazitelnou AI pro Piškvorky

Pojďme si postavit vlastního malého herního génia. Vytvoříme kompletní hru Piškvorky v Pythonu a implementujeme do ní **Minimax algoritmus**, aby proti vám hrál počítač.

**Krok 1: Základní kostra hry**

Nejprve potřebujeme funkce pro herní desku, zobrazení, kontrolu výhry a samotnou herní smyčku.

```python
# Globální proměnné pro hráče
HRAC_X = "X"
HRAC_O = "O"

def vytvor_desku():
    """Vytvoří prázdnou herní desku 3x3."""
    return [[" " for _ in range(3)] for _ in range(3)]

def zobraz_desku(deska):
    """Zobrazí aktuální stav herní desky."""
    for radek in deska:
        print("|" + "|".join(radek) + "|")

def je_vyhra(deska, hrac):
    """Zkontroluje, zda daný hráč vyhrál."""
    # Kontrola řádků, sloupců a diagonál
    for i in range(3):
        if all([deska[i][j] == hrac for j in range(3)]) or \
           all([deska[j][i] == hrac for j in range(3)]):
            return True
    if all([deska[i][i] == hrac for i in range(3)]) or \
       all([deska[i][2 - i] == hrac for i in range(3)]):
        return True
    return False

def je_remiza(deska):
    """Zkontroluje, zda je hra remíza (všechna pole jsou plná)."""
    return all(cell != " " for row in deska for cell in row)

def ziskej_mozne_tahy(deska):
    """Vrátí seznam všech možných (prázdných) tahů."""
    tahy = []
    for i in range(3):
        for j in range(3):
            if deska[i][j] == " ":
                tahy.append((i, j))
    return tahy
```

**Krok 2: Implementace Minimax algoritmu**

Toto je mozek naší AI. Funkce rekurzivně zkouší všechny tahy a hodnotí je.

```python
def minimax(deska, hloubka, je_tah_ai):
    """Minimax algoritmus pro nalezení nejlepšího tahu."""
    if je_vyhra(deska, HRAC_O): # AI (O) vyhrála
        return 10 - hloubka
    if je_vyhra(deska, HRAC_X): # Hráč (X) vyhrál
        return hloubka - 10
    if je_remiza(deska):
        return 0

    if je_tah_ai: # Tah AI (maximalizující hráč)
        nejlepsi_skore = -float('inf')
        for tah in ziskej_mozne_tahy(deska):
            deska[tah[0]][tah[1]] = HRAC_O
            skore = minimax(deska, hloubka + 1, False)
            deska[tah[0]][tah[1]] = " " # Vrátit tah zpět
            nejlepsi_skore = max(nejlepsi_skore, skore)
        return nejlepsi_skore
    else: # Tah hráče (minimalizující hráč)
        nejlepsi_skore = float('inf')
        for tah in ziskej_mozne_tahy(deska):
            deska[tah[0]][tah[1]] = HRAC_X
            skore = minimax(deska, hloubka + 1, True)
            deska[tah[0]][tah[1]] = " " # Vrátit tah zpět
            nejlepsi_skore = min(nejlepsi_skore, skore)
        return nejlepsi_skore

def najdi_nejlepsi_tah(deska):
    """Najde nejlepší možný tah pro AI."""
    nejlepsi_skore = -float('inf')
    nejlepsi_tah = None
    for tah in ziskej_mozne_tahy(deska):
        deska[tah[0]][tah[1]] = HRAC_O
        skore = minimax(deska, 0, False)
        deska[tah[0]][tah[1]] = " " # Vrátit tah zpět
        if skore > nejlepsi_skore:
            nejlepsi_skore = skore
            nejlepsi_tah = tah
    return nejlepsi_tah
```

**Krok 3: Hlavní herní smyčka**

Spojíme vše dohromady a umožníme hráči hrát proti naší AI.

```python
def hraj_hru():
    """Hlavní funkce pro spuštění hry."""
    deska = vytvor_desku()
    print("Vítejte ve hře Piškvorky! Hrajete za 'X'.")

    while True:
        zobraz_desku(deska)
        # Tah hráče
        try:
            radek, sloupec = map(int, input("Zadejte svůj tah (řádek a sloupec oddělené mezerou): ").split())
            if deska[radek][sloupec] == " ":
                deska[radek][sloupec] = HRAC_X
            else:
                print("Toto pole je již obsazené. Zkuste to znovu.")
                continue
        except (ValueError, IndexError):
            print("Neplatný vstup. Zadejte dvě čísla od 0 do 2.")
            continue

        if je_vyhra(deska, HRAC_X):
            zobraz_desku(deska)
            print("Gratuluji, vyhráli jste!")
            break
        if je_remiza(deska):
            zobraz_desku(deska)
            print("Hra skončila remízou.")
            break

        # Tah AI
        print("AI přemýšlí...")
        tah_ai = najdi_nejlepsi_tah(deska)
        if tah_ai:
            deska[tah_ai[0]][tah_ai[1]] = HRAC_O

        if je_vyhra(deska, HRAC_O):
            zobraz_desku(deska)
            print("Bohužel, AI vyhrála.")
            break
        if je_remiza(deska):
            zobraz_desku(deska)
            print("Hra skončila remízou.")
            break

# Spuštění hry
if __name__ == "__main__":
    hraj_hru()
```

_Zkopírujte si celý tento kód do jednoho Python souboru a spusťte ho. Zkuste AI porazit!_

---

## Závěr: Od jednoduchých pravidel k nekonečným možnostem

Gratulujeme! Právě jste naprogramovali umělou inteligenci, která je v piškvorkách neporazitelná. Použili jste klasický algoritmus Minimax, který je základním stavebním kamenem herní AI.

Dnes jsme viděli obrovský skok: od pevně daných pravidel Minimaxu až po samoučící se systémy jako AlphaGo. Ať už jde o jednoduchou logiku nebo komplexní neuronové sítě, cíl herní AI je vždy stejný: vytvořit pro hráče co nejlepší, nejzajímavější a nejvíce strhující zážitek. A teď, když znáte základy, můžete začít tvořit své vlastní herní světy.
