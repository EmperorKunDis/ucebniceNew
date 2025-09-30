# Úvod do strojového učení

## Úvod a kontext

Představte si, že máte k dispozici velké množství dat – fotografie, texty, čísla, zvuky. Strojové učení je metoda, kterou počítače používají k tomu, aby z těchto dat získaly užitečné informace, aniž by je člověk musel explicitně programovat. V průběhu této přednášky se podíváme na tři základní způsoby, jakým se počítače učí, a na jeden nástroj, který jim pomáhá učit se rychle a efektivně.

## 1. Učení s učitelem – Supervised Learning

### Co to je?

V tomto přístupu počítač získává data, která již obsahují odpovědi. Představte si, že máte obrázky psů a koček a k nim je připojen štítek, který říká, zda se jedná o psa nebo kočku. Počítač se snaží najít vzory, které spojí obrázek s odpovídajícím štítkem. Když se naučí dostatečně dobře, může pak na základě nového obrázku předpovědět, jestli je to pes nebo kočka.

### Jaké typy úloh se tím řeší?

- **Klasifikace** – rozhodování mezi několika kategoriemi, např. „pes“, „kočka“, „pták“.
- **Regrese** – předpovídání číselných hodnot, např. cena domu na základě jeho vlastností.

### Proč je to důležité?

Tento typ učení je základem mnoha aplikací, které znáte – od rozpoznávání obličeje v mobilních telefonech po doporučovací systémy na e‑obchodech. Učí se z příkladů, které mu poskytneme, a následně se snaží aplikovat to, co se naučil, na nové situace.

## 2. Učení bez učitele – Unsupervised Learning

### Co to je?

Zde počítač pracuje s daty, která nemají žádné štítky. Místo toho se snaží najít v nich skryté struktury nebo skupiny. Představte si, že máte seznam všech produktů, které lidé kupují, ale nevíte, jaké jsou jejich preference. Počítač může rozdělit produkty do skupin podle toho, jak často se kupují společně, a odhalit tak „shluky“ podobných zboží.

### Typické úlohy

- **Shlukování (clustering)** – rozdělení dat do skupin, které jsou uvnitř sebe podobné a mezi sebou odlišné.

### Proč je to užitečné?

Unsupervised learning pomáhá odhalovat vzory, které by člověk mohl přehlédnout. Například může pomoci najít nové segmenty zákazníků nebo identifikovat neobvyklé vzory v datech, které mohou signalizovat problémy nebo příležitosti.

## 3. Učení posilováním – Reinforcement Learning

### Co to je?

V tomto přístupu počítač, nazývaný agent, interaguje s prostředím a učí se na základě zpětné vazby v podobě odměn a trestů. Agent se rozhoduje, co udělat, a podle toho získává odměnu nebo trest. Cílem je maximalizovat součet odměn, které agent získá v průběhu času.

### Příklady

- **Hry** – počítač se učí hrát šachy nebo videoherní strategie.
- **Robotika** – robot se učí pohybovat v prostoru a vyhýbat se překážkám.

### Proč je to významné?

Reinforcement learning umožňuje počítačům řešit problémy, kde je těžké předem definovat přesné pravidla. Učí se postupně a zlepšuje své rozhodování na základě zkušeností.

## 4. Scikit-learn – nástroj pro strojové učení

### Co je Scikit-learn?

Scikit-learn je knihovna v programovacím jazyce Python, která poskytuje jednoduché a konzistentní rozhraní pro mnoho metod strojového učení. Umožňuje rychle vyzkoušet různé modely bez nutnosti psát složitý kód od nuly.

### Jak se používá?

- **Importování modelu** – např. `from sklearn.linear_model import LinearRegression`.
- **Trénování** – metoda `fit()` se používá k učení modelu na datech s označeními.
- **Předpověď** – metoda `predict()` umožňuje získat odhad na základě nových dat.

### Co se studenti naučí?

Studenti se seznámí s API (rozhraním pro programování aplikací), které umožňuje volat různé modely pro učení s učitelem i bez učitele. Učí se, jak připravit data, jak volit vhodný model a jak vyhodnocovat jeho výkonnost.

## Shrnutí a další kroky

- **Učení s učitelem** se zaměřuje na práci s daty, která již obsahují odpovědi. Používá se pro klasifikaci a regresi.
- **Učení bez učitele** se snaží najít skryté struktury v datech bez předchozích štítků. Typickým příkladem je shlukování.
- **Učení posilováním** umožňuje agentovi učit se na základě interakce s prostředím a zpětné vazby v podobě odměn.
- **Scikit-learn** je praktický nástroj, který usnadňuje experimentování s těmito metodami.

### Co je nyní dál?

1. **Zkoušejte sami** – vyhledejte dataset, který vás zajímá, a vyzkoušejte jednoduchý model v Scikit-learn.
2. **Experimentujte** – změňte parametry modelu a sledujte, jak se mění výsledek.
3. **Sdílejte** – popište, co jste se naučili, a co vás překvapilo.

---

**Závěr:** Strojové učení je široký obor, který umožňuje počítačům učit se z dat a řešit problémy, které by jinak byly složité. Základní typy učení – s učitelem, bez učitele a posilování – nabízejí různé přístupy k řešení různých úloh. Scikit-learn je nástroj, který pomáhá tyto metody praktikovat a učit se z nich. Pokud chcete dále rozvíjet své znalosti, doporučujeme začít s jednoduchými datasetem a postupně se přenášet k složitějším úlohám.