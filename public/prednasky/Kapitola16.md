# Úvod do pravděpodobnosti: Jak zkrotit náhodu a vyhrát auto

Představte si, že jste v televizní soutěži a stojíte před třemi zavřenými dveřmi. Za jedněmi je zbrusu nové auto, za zbylými dvěma jsou kozy.

1.  Vyberete si dveře č. 1.
2.  Moderátor, který ví, co je za kterými dveřmi, otevře dveře č. 3 a ukáže vám kozu.
3.  A teď vám dá životní nabídku: **"Chcete zůstat u svých dveří číslo 1, nebo chcete změnit svou volbu na dveře číslo 2?"**

Co byste měli udělat? Většina lidí si řekne: "To je jedno, teď už je to 50 na 50."
**Mýlí se.** Matematika říká jasně: **Vždy změňte dveře!** Zdvojnásobíte tím svou šanci na výhru.

Vítejte ve světě pravděpodobnosti, nástroje, který nám umožňuje nahlédnout do budoucnosti a kvantifikovat nejistotu.

---

## Proč změnit dveře? (Monty Hallův problém)

Tento problém zmátl i profesory matematiky. Pojďme si ho vysvětlit selským rozumem.

### Situace na začátku

Máte 3 dveře.

- Šance, že jste trefili auto (Dveře 1): **1/3 (33 %)**.
- Šance, že auto je jinde (Dveře 2 nebo 3): **2/3 (66 %)**.

### Co se stalo pak?

Moderátor otevřel Dveře 3 a ukázal kozu.

- Důležité: Moderátor **nesmí** otevřít vaše dveře a **nesmí** otevřít dveře s autem. Musí ukázat kozu.
- Tím vám dal **novou informaci**.

### Situace na konci

- Vaše dveře (Dveře 1) mají stále svou původní šanci **1/3**. Nic se na nich nezměnilo.
- Skupina "Ostatní dveře" měla šanci **2/3**.
- Protože víme, že ve Dveřích 3 auto není (šance 0), celá ta pravděpodobnost 2/3 se "přelila" na jediné zbývající dveře – Dveře 2.

**Závěr:** Dveře 1 mají šanci 33 %. Dveře 2 mají šanci 66 %. Změna se vyplatí.

---

## Základní pojmy: Jazyk náhody

Abychom mohli o náhodě mluvit s AI, potřebujeme pár slovíček.

1.  **Jev:** Cokoliv, co se může stát (padne panna, bude pršet).
2.  **Pravděpodobnost P(A):** Číslo mezi 0 (nemožné) a 1 (jisté).
    - Hod mincí: P(panna) = 0.5 (50 %).
    - Hod kostkou: P(šestka) = 1/6 (cca 16.7 %).
3.  **Nezávislé jevy:** To, že padla panna teď, neovlivní další hod. Mince nemá paměť.
4.  **Podmíněná pravděpodobnost:** Jak se změní pravděpodobnost, když se dozvím něco nového? (Viz Monty Hall).

---

## Proč to AI potřebuje?

AI neustále pracuje s nejistotou.

- **Samořídící auto:** "Na 99 % je to chodec, na 1 % je to papírová krabice." (Auto raději zabrzdí).
- **Lékařská AI:** "Na 80 % je to chřipka, ale na 20 % zápal plic." (AI doporučí rentgen pro jistotu).

Svět není černobílý (0 nebo 1). Svět je o odstínech šedi (pravděpodobnostech).

---

## Shrnutí kapitoly

- **Pravděpodobnost** nám umožňuje měřit nejistotu.
- **Nová informace** mění pravděpodobnost (princip Monty Hall).
- Naše lidská intuice v pravděpodobnosti často selhává (myslíme si, že je to 50:50, i když není).
- AI používá matematiku, aby tyto chyby v úsudku nedělala.
