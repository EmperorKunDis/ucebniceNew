# AI a trh práce: Vezmou nám roboti práci, nebo nám dají novou?

"Přicházejí roboti, aby nám vzali práci!" To je otázka, která visí ve vzduchu od první průmyslové revoluce. Dnes, s příchodem umělé inteligence, je tato otázka naléhavější než kdy dřív. Ale možná je to špatná otázka. Místo "vezmou nám práci?" se ptejme: **"Jak se naše práce změní?"**

AI není meteorit, který zničí pracovní trh. Je to spíše nový, mocný nástroj, jako byl parní stroj nebo internet. Některé profese zaniknou, jiné se transformují a úplně nové se zrodí. Dnes se nebudeme dohadovat, podíváme se na reálná data a zjistíme, jaké jsou skutečné trendy a které dovednosti budou v budoucnu k nezaplacení.

---

## Zánik, transformace a zrození

Dopad AI na práci lze rozdělit do tří kategorií:

1.  **Zánik úkolů (ne nutně profesí):** AI je neuvěřitelně efektivní v rutinních, opakujících se a předvídatelných úkolech. Práce jako je základní zadávání dat, třídění dokumentů nebo jednoduchá telefonická podpora jsou první na řadě pro automatizaci.
2.  **Transformace profesí:** Většina profesí nezanikne, ale zásadně se promění. Grafik dnes místo kreslení od nuly tráví více času generováním konceptů pomocí nástrojů jako Midjourney a jejich následnou úpravou. Programátor nepíše každý řádek kódu sám, ale používá GitHub Copilot, aby za něj napsal rutinní funkce, a soustředí se na celkovou architekturu. AI se stává **kopilotem**.
3.  **Zrození nových profesí:** S každou technologií vznikají nové role. S internetem přišel "správce sociálních sítí". S AI přichází:
    - **Prompt Engineer:** Specialista, který se učí "mluvit" s AI, aby jí zadával co nejefektivnější příkazy.
    - **AI Trainer:** Člověk, který připravuje a čistí data, aby se na nich modely mohly učit.
    - **AI Auditor:** "Detektiv", který kontroluje, zda se AI modely nechovají nespravedlivě nebo diskriminačně.

---

## Praktický projekt: Analýza rizika automatizace profesí

Pojďme se podívat na data. Použijeme slavnou studii od Frey a Osborna z Oxfordské univerzity, která odhadla pravděpodobnost automatizace pro více než 700 profesí. Zjistíme, které profese jsou nejvíce a nejméně ohrožené.

**Krok 1: Příprava prostředí a dat**

```bash
pip install pandas seaborn matplotlib
```

```python
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt

# Načtení dat přímo z online zdroje (GitHub repozitář s daty ze studie)
url = 'https://raw.githubusercontent.com/futureofwork/data/master/Frey-Osborne-2013-data-original-and-extended-classifications.csv'
df = pd.read_csv(url)

# Pro zjednodušení vybereme jen klíčové sloupce
df = df[['Occupation', 'Probability of computerisation', 'Median annual wage 2012 ($)']]
df.rename(columns={'Probability of computerisation': 'Riziko_automatizace',
                   'Median annual wage 2012 ($)': 'Prumerny_plat'}, inplace=True)

print("--- Ukázka dat o riziku automatizace profesí ---")
print(df.head())
```

**Krok 2: Analýza – Kdo je v největším ohrožení?**

Seřadíme si data a podíváme se na 10 nejvíce a nejméně ohrožených profesí.

```python
# Seřazení dat
df_sorted = df.sort_values(by='Riziko_automatizace', ascending=False)

print("\n--- 10 nejvíce ohrožených profesí ---")
print(df_sorted.head(10))

print("\n--- 10 nejméně ohrožených profesí ---")
print(df_sorted.tail(10))
```

**Co jsme se dozvěděli?** Na prvních místech vidíme profese založené na rutinní, manuální nebo administrativní práci (telemarketing, zpracování dat, úředníci). Naopak na konci jsou profese vyžadující vysokou míru kreativity, empatie a komplexního řešení problémů (terapeuti, choreografové, lékaři).

**Krok 3: Vizualizace – Souvisí riziko s platem?**

Vytvoříme si bodový graf (scatter plot), abychom zjistili, zda existuje vztah mezi rizikem automatizace a průměrným platem.

```python
plt.figure(figsize=(10, 7))
sns.regplot(data=df, x='Riziko_automatizace', y='Prumerny_plat',
            scatter_kws={'alpha':0.3}, line_kws={'color':'red'})
plt.title('Vztah mezi rizikem automatizace a průměrným platem')
plt.xlabel('Pravděpodobnost automatizace')
plt.ylabel('Průměrný roční plat (v $)')
plt.grid(True)
plt.show()
```

**Co jsme se dozvěděli?** Graf ukazuje jasný **negativní trend** (červená čára klesá). Profese s vysokým rizikem automatizace mají tendenci mít nižší průměrný plat, zatímco profese s nízkým rizikem jsou často lépe placené. To naznačuje, že trh si již dnes cení dovedností, které AI nedokáže snadno nahradit.

---

## Závěr: Budoucnost patří kreativcům a empatickým lídrům

Dnes jsme se z dat naučili, že AI pravděpodobně nenahradí "práci" jako takovou, ale spíše **"úkoly"** – zejména ty rutinní a předvídatelné. Nejlepší obranou proti automatizaci není se jí bránit, ale zaměřit se na dovednosti, které jsou unikátně lidské.

Budoucnost nepatří těm, kdo umí dělat práci jako stroj, ale těm, kdo umí dělat práci, kterou stroj dělat neumí:

- **Kreativita a inovace**
- **Kritické myšlení a řešení komplexních problémů**
- **Emoční inteligence a empatie**
- **Vedení lidí a spolupráce**

**Vaše výzva:** Zamyslete se nad svou vlastní prací nebo oborem, který studujete. Které úkoly jsou rutinní a daly by se zautomatizovat? A které naopak vyžadují kreativitu a lidský přístup? Investice do těchto "lidských" dovedností je nejlepší přípravou na budoucnost, ať už bude jakákoliv.
