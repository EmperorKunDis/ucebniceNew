# Úvod do umělé inteligence: Váš první krok do světa strojů, které se učí

Představte si, že se probudíte a váš telefon vám už připravil playlist na míru vaší náladě. Cestou do práce vám navigace nejen ukazuje nejrychlejší trasu, ale předpovídá dopravní zácpy dřív, než vzniknou. V polední pauze si projedete fotky z dovolené a váš foťák sám rozpoznal a označil všechny vaše přátele. To není sci-fi, to je umělá inteligence (AI) v akci. Vítejte v první kapitole, kde odhalíme, co se skrývá za tímto magickým pojmem a jak můžete i vy naučit stroje přemýšlet.

---

## Co je to vlastně ta umělá inteligence?

Zapomeňte na chvíli na roboty z filmů, kteří chtějí ovládnout svět. V jádru je umělá inteligence (AI) prostě snaha naučit počítače dělat úkoly, které by normálně vyžadovaly lidský mozek. Může to být cokoliv – od rozpoznání kočky na obrázku, přes překlad textu z angličtiny do češtiny, až po složení hudby.

Představte si AI jako dva různé druhy "mysli":

### 1. Slabá AI (Weak AI) – Specialista

Tohle je 99 % toho, s čím se dnes setkáváme. Je to **specialista na jeden úkol**.

- Váš hlasový asistent v mobilu je geniální v rozpoznávání příkazů, ale nezačne s vámi filozofovat o smyslu života.
- Šachový program porazí mistra světa, ale neumí si zavázat tkaničky.
- **Analogie:** Je to jako špičkový kuchař, který umí uvařit dokonalé jídlo, ale neopraví vám auto ani nevyléčí chřipku.

### 2. Silná AI (Strong AI) – Univerzál

To je ten "svatý grál" – stroj s vědomím a inteligencí srovnatelnou s lidskou. Stroj, který by chápal svět jako my, měl by emoce a dokázal by se učit cokoliv. Zatím je to čistě teoretický koncept, který zaměstnává spíše filozofy a filmaře než programátory.

**My se v tomto kurzu budeme věnovat té slabé AI, která je neuvěřitelně užitečná a mění svět právě teď.**

---

## Klíčové pojmy: Cihly, ze kterých stavíme

Abychom mohli stavět dům, potřebujeme cihly. V AI jsou našimi cihlami tyto koncepty. Nebojte se cizích názvů, hned si je vysvětlíme.

### Strojové učení (Machine Learning)

Klasické programování funguje jako recept: "Vezmi dvě vejce, rozbij je, zamíchej." Počítač dělá přesně to, co mu řeknete.
**Strojové učení** je jiné. Místo receptu ukážete počítači výsledek.

- **Příklad:** Chcete naučit počítač poznat psa.
  - _Klasicky:_ Museli byste popsat psa: "Má čtyři nohy, ocas, srst, čumák..." (Ale co když je to kočka? Nebo stůl s kožešinou?)
  - _Strojové učení:_ Ukážete počítači 1000 fotek psů a 1000 fotek věcí, co nejsou psi. Počítač si sám najde pravidla ("Aha, tyhle uši a tenhle tvar čumáku znamenají psa").

### Hluboké učení (Deep Learning)

To je strojové učení "na steroidech". Používá tzv. **neuronové sítě**.

- Představte si to jako velkou firmu. Jeden zaměstnanec (neuron) sám o sobě moc nezmůže. Ale když jich máte miliony a jsou uspořádaní do oddělení (vrstev), dokážou společně vyřešit neuvěřitelně složité úkoly – třeba řídit auto v hustém provozu.

### Datová věda (Data Science)

To je řemeslo, které to všechno umožňuje. Datoví vědci jsou jako detektivové. Prohrabávají se horami dat (čísel, textů, obrázků) a hledají v nich skryté stopy a vzory. Bez kvalitních dat by se AI neměla z čeho učit.

---

## Kde všude AI pomáhá? (Ani o tom nevíte)

Umělá inteligence není jen v laboratořích NASA. Používáte ji každý den:

1.  **Zdravotnictví:** Lékaři používají AI jako "druhé oči". AI projde tisíce rentgenových snímků a upozorní lékaře na podezřelé stíny, které by unavené lidské oko mohlo přehlédnout.
2.  **Finance:** Vaše banka má AI hlídače. Ten se naučil, jak běžně utrácíte. Když se najednou objeví platba za diamanty v Tichomoří, AI zbystří a transakci zablokuje, aby ochránila vaše peníze.
3.  **Doprava:** Navigace v autě nepočítá jen vzdálenost. Používá AI k předpovídání dopravy. "V pátek odpoledne tu bývá zácpa, raději tě pošlu jinudy."
4.  **Zábava (Netflix, Spotify):** "Protože jste sledovali Romantickou komedii, mohlo by se vám líbit..." To je AI, která analyzuje váš vkus a snaží se vám nabídnout to, co vás potěší.
5.  **E-maily:** Váš spam filtr je AI. Naučil se, že e-maily s předmětem "VYHRÁLI JSTE MILION!!!" jsou většinou podvod, a rovnou je hází do koše.

---

## Jak se počítač učí? (Velmi zjednodušeně)

Představte si, že chcete naučit počítač rozeznat **Jablko** od **Pomeranče**.

1.  **Vstupy (Data):** Musíme ovoce popsat čísly.
    - Váha: 150 gramů.
    - Povrch: Hladký (0) nebo Hrbolatý (1).
2.  **Trénink:** Ukážeme počítači tabulku:
    - 140g, Hladký -> JABLKO
    - 130g, Hladký -> JABLKO
    - 150g, Hrbolatý -> POMERANČ
    - 160g, Hrbolatý -> POMERANČ
3.  **Model:** Počítač si vytvoří pravidlo (model). Třeba: "Pokud je to hrbolaté, je to pomeranč. Pokud je to hladké, je to jablko."
4.  **Předpověď:** Pak mu ukážete nové ovoce: 155g, Hrbolatý. Počítač použije své pravidlo a řekne: "To bude asi POMERANČ!"

Takhle jednoduše to v principu funguje. V praxi jsou těch pravidel miliony, ale základ je stejný.

---

## Naše dílna: Nástroje pro práci s AI

Aby tesař mohl stavět dům, potřebuje kladivo a pilu. My budeme stavět AI, takže potřebujeme své nástroje.

### Python - Jazyk AI

**Python** je programovací jazyk, který si zamilovala celá AI komunita. Proč?

- Je jednoduchý a čitelný (vypadá skoro jako angličtina).
- Má obrovské množství hotových knihoven pro AI (jako LEGO kostky, které můžete poskládat).
- Používají ho všichni - od začátečníků po Google a NASA.

### Google Colab / Jupyter Notebooks - Interaktivní sešit

Představte si sešit, kde můžete psát text, vkládat obrázky, **a zároveň spouštět živý kód**.

- **Jupyter Notebook:** Interaktivní prostředí, kde píšete kód do "buněk" a spouštíte ho kousek po kousku.
- **Google Colab:** To samé, ale běží v prohlížeči a nemusíte nic instalovat. Je to jako Google Docs pro programátory.

V praxi to znamená: Napíšete řádek kódu, zmáčknete Shift+Enter, a hned vidíte výsledek. Pak napíšete další řádek. Je to jako konverzace s počítačem.

---

## První AI koncept: Rozhodovací strom

Představte si, že jdete na procházku a ptáte se: "Mám si vzít deštník?"
Váš mozek vytvoří **rozhodovací strom**:

```
Prší venku?
├─ ANO → Vezmi deštník
└─ NE
   └─ Je předpověď deště?
      ├─ ANO → Vezmi deštník
      └─ NE → Nemusíš brát deštník
```

Rozhodovací strom je jeden z nejjednodušších AI algoritmů. Funguje jako série otázek typu "ANO/NE", které vedou k rozhodnutí.

**Příklad použití:**

- **Lékařská diagnostika:** "Má pacient horečku? ANO → Má vyrážku? ANO → Možná spalničky."
- **Schvalování úvěru:** "Má příjem vyšší než 30 000? ANO → Má dobrou historii? ANO → Schválit úvěr."

Je to intuitivní, vysvětlitelné (vidíte každý krok) a přesně tak, jak často rozhodujete i vy sami.

---

## Shrnutí kapitoly

- **AI (Umělá inteligence)** je snaha naučit stroje myslet a učit se.
- **Slabá AI** je specialista na jeden úkol (dnešní realita). **Silná AI** je univerzální mysl (zatím sci-fi).
- **Strojové učení** znamená, že se počítač učí z příkladů (dat), místo aby měl pevně daný recept.
- AI je všude kolem nás – v telefonu, v bance, v autě i v nemocnici.

V příští kapitole se podíváme na to, jaké nástroje budeme potřebovat, abychom si takovou AI mohli sami vyzkoušet postavit. Nebojte, nebude to bolet!

---
