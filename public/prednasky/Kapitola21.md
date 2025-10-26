# Úvod do strojového učení: Tři trenéři pro vaši umělou inteligenci

Vítejte v posilovně pro umělou inteligenci! Až dosud jsme se učili jednotlivé cviky. Dnes se podíváme na tři základní "tréninkové styly", kterými se AI učí a sílí. Představte si je jako tři různé typy trenérů, z nichž každý má úplně jinou metodu:

1.  **Trenér s kartičkami (Učení s učitelem):** Ukazuje vám stovky kartiček. Na jedné je obrázek psa a on řekne: "Toto je pes". Na další je kočka a řekne: "Toto je kočka". Vaším úkolem je naučit se pravidla, abyste příště poznali zvíře sami.
2.  **Trenér-organizátor (Učení bez učitele):** Vysype před vás na stůl hromadu různých míčů – fotbalové, basketbalové, tenisáky, golfové – a řekne jen: "Roztřiď to do skupin, které dávají smysl." Neví, co je co, ale očekává, že najdete podobnosti a rozdíly.
3.  **Trenér "Pokus-Omyl" (Učení posilováním):** Postaví vás na hřiště, dá vám míč a řekne: "Zkus dát gól. Za každý gól dostaneš bod. Když mineš, bod ti seberu." Neřekne vám, jak máte kopat, jen vás odměňuje a trestá za výsledky.

Dnes si prakticky vyzkoušíme první dva styly a třetí si detailně vysvětlíme. Nasaďte si tréninkové rukavice, jdeme na to!

---

## 1. Učení s učitelem (Supervised Learning): Předpovídání ceny domu

Toto je nejběžnější typ strojového učení. Máme data, kde už známe správné odpovědi (říkáme jim "štítky"), a chceme, aby se model naučil na základě příkladů předpovídat odpovědi pro nová data.

**Náš úkol:** Máme data o velikosti několika domů a jejich prodejní ceně. Chceme vytvořit model, který odhadne cenu nového domu jen na základě jeho velikosti. Tomuto úkolu se říká **regrese**.

**Praktický projekt:**

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.linear_model import LinearRegression

# 1. Data: Velikost domu v m^2 (X) a jeho cena v mil. Kč (y)
# Máme 5 příkladů, ze kterých se model bude učit.
velikost_domu = np.array([50, 70, 80, 100, 120]).reshape(-1, 1)
cena_domu = np.array([1.5, 2.2, 2.5, 3.2, 4.0])

# 2. Vytvoření a trénink modelu
# Použijeme jednoduchý model Lineární Regrese.
model = LinearRegression()
model.fit(velikost_domu, cena_domu) # Zde probíhá "učení"
print("Model pro predikci ceny domu byl natrénován.")

# 3. Predikce pro nový dům
# Jaká bude cena domu o velikosti 90 m^2?
novy_dum = np.array([[90]])
predikovana_cena = model.predict(novy_dum)
print(f"Odhadovaná cena pro dům o velikosti 90 m^2 je: {predikovana_cena[0]:.2f} mil. Kč")

# 4. Vizualizace
plt.figure(figsize=(8, 6))
plt.scatter(velikost_domu, cena_domu, color='blue', label='Trénovací data')
plt.plot(velikost_domu, model.predict(velikost_domu), color='red', label='Naučená přímka modelu')
plt.scatter(novy_dum, predikovana_cena, color='green', s=100, label='Predikce pro nový dům', zorder=5)
plt.title('Učení s učitelem: Predikce ceny domu')
plt.xlabel('Velikost domu (m^2)')
plt.ylabel('Cena domu (mil. Kč)')
plt.legend()
plt.grid(True)
plt.show()
```

**Co se stalo?** Model se podíval na tečky (naše data) a našel přímku, která je nejlépe vystihuje. Nyní dokáže pro jakoukoliv novou velikost domu najít odpovídající bod na této přímce a tím odhadnout jeho cenu.

---

## 2. Učení bez učitele (Unsupervised Learning): Hledání skupin zákazníků

Zde nemáme žádné správné odpovědi. Máme jen data a chceme, aby v nich AI našla nějakou "skrytou strukturu" nebo skupiny. Tomuto procesu se říká **shlukování (clustering)**.

**Náš úkol:** Máme data o zákaznících e-shopu – jejich roční příjem a skóre útrat (jak moc utrácejí). Chceme je automaticky rozdělit do marketingových segmentů (např. "opatrní boháči", "nadšení utráceči").

**Praktický projekt:**

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import KMeans

# 1. Data: Fiktivní zákazníci [příjem, skóre útrat]
zakaznici = np.array([
    [20, 80], [22, 90], [25, 85], # Skupina 1: Nízký příjem, vysoké útraty
    [50, 50], [55, 45], [60, 55], # Skupina 2: Střední příjem, střední útraty
    [80, 20], [85, 15], [90, 18]  # Skupina 3: Vysoký příjem, nízké útraty
])

# 2. Vytvoření a trénink modelu
# Chceme najít 3 skupiny (klastry).
kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
kmeans.fit(zakaznici) # Zde probíhá "hledání struktury"

# 3. Získání výsledků
# Model každému zákazníkovi přiřadil číslo klastru (0, 1, nebo 2).
predikovane_skupiny = kmeans.labels_
print(f"Model rozdělil zákazníky do skupin: {predikovane_skupiny}")

# 4. Vizualizace
plt.figure(figsize=(8, 6))
plt.scatter(zakaznici[:, 0], zakaznici[:, 1], c=predikovane_skupiny, cmap='viridis', s=100)
plt.title('Učení bez učitele: Rozdělení zákazníků do skupin')
plt.xlabel('Roční příjem')
plt.ylabel('Skóre útrat')
plt.grid(True)
plt.show()
```

**Co se stalo?** Algoritmus se podíval na "mrak" bodů a našel tři přirozené skupiny, aniž bychom mu řekli, které body patří k sobě. Sám identifikoval segmenty zákazníků, na které teď může marketingové oddělení lépe cílit.

---

## 3. Učení posilováním (Reinforcement Learning): Trénink herního agenta

Tento typ učení je nejpodobnější tomu, jak se učí živé bytosti – metodou pokus-omyl. Implementace je složitá, proto si princip vysvětlíme na myšlenkovém experimentu.

**Náš úkol:** Naučit malého robota (`Agent`) najít cestu z bludiště (`Prostředí`).

**Princip:**

1.  **Stav:** Robot je na nějakém políčku `(x, y)`.
2.  **Akce:** Může se pohnout nahoru, dolů, doleva, doprava.
3.  **Odměna/Trest:**
    - Za každý krok, který udělá, dostane malý trest: **-1 bod** (aby se snažil najít co nejkratší cestu).
    - Pokud narazí do zdi, dostane velký trest: **-100 bodů**.
    - Pokud dojde do cíle, dostane obrovskou odměnu: **+1000 bodů**.
4.  **Učení:** Robot na začátku neví nic a pohybuje se náhodně. Zkouší různé cesty. Postupně si ale buduje "mapu hodnot" (tzv. Q-tabulku), kde si pamatuje, jak dobré je provést určitou akci v určitém stavu. Pokud z políčka `(2,3)` šlápne doprava a dostane odměnu, hodnota této akce se zvýší. Pokud narazí do zdi, hodnota se sníží.
5.  **Cíl:** Po tisících her se robot naučí takovou strategii (tzv. **policy**), která maximalizuje jeho celkové skóre. Bude se vyhýbat zdem a půjde nejefektivnější cestou k cíli, protože se mu to v minulosti nejvíce vyplatilo.

Tímto způsobem se učí AI hrát šachy, Go, ale i řídit auta nebo ovládat robotické paže.

---

## Závěr: Tři různé nástroje pro tři různé problémy

Dnes jste si prakticky osahali tři fundamentálně odlišné způsoby "myšlení" AI.

- **Učení s učitelem:** Skvělé, když máte historická data se správnými odpověďmi a chcete předpovídat budoucnost (ceny, počasí, diagnózy).
- **Učení bez učitele:** Ideální pro průzkum dat, když chcete najít skryté souvislosti, segmentovat zákazníky nebo detekovat anomálie.
- **Učení posilováním:** Nepostradatelné pro trénování agentů, kteří se mají pohybovat v komplexním prostředí a dělat optimální rozhodnutí (hry, robotika, řízení).

**Vaše výzva:** Podívejte se na problémy kolem sebe. Který byste řešili kterým typem učení? Předpověď návštěvnosti vašeho webu? Doporučení podobných písniček ve vašem playlistu? Naučení robota uklízet váš pokoj? Správná volba "trenéra" je prvním krokem k úspěšnému AI projektu.
