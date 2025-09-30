**H1: Projektová fáze vývoje neuronových sítí – od návrhu po prezentaci**

**H2: Úvod do projektu**  
Ve třídě se studenti připravují na praktickou část výuky umělé inteligence. Cílem je, aby si osvojili postup od návrhu architektury neuronové sítě až po její implementaci a prezentaci výsledků. Instruktor předkládá rámcové zadání: studentům je nabídnut problém, který mají vyřešit – například rozpoznávání číslic z rukopisu – a následně mají navrhnout a naprogramovat jednoduchou síť, kterou natrénují.

**H2: Návrh sítě (Hodiny 52.1)**  
Studenti nejprve brainstormují, jak by mohli problém řešit. Instruktor jim vysvětluje základní principy neuronové sítě: vstupní vrstvu, skryté vrstvy a výstupní vrstvu. Dále diskutují, kolik neuronů bude potřeba v každé vrstvě a jaký typ aktivační funkce (např. ReLU – rectified linear unit, která zjednodušuje výpočet a pomáhá při učení) použít. V této fázi se studenti rozhodují o architektuře, kterou následně dokumentují v jednoduchém diagramu.

**H2: Implementace a trénink (Hodiny 53.1)**  
Po návrhu přecházejí studenti do kódu. Instruktor ukazuje, jak pomocí knihovny PyTorch (open‑source framework pro strojové učení) vytvořit model podle svého diagramu. Studenti zapisují kód, inicializují váhy a zvolí optimalizační algoritmus (např. Adam, který rychleji konverguje než tradiční gradient descent). Následně trénují síť na připraveném datasetu číslic, sledují metriky přesnosti a zajišťují, že se model nepřeučí (overfitting). Instruktor jim ukazuje, jak využít validační sadu k monitorování výkonnosti.

**H2: Prezentace projektu (Hodiny 54.1)**  
Po úspěšném tréninku studenti připravují prezentaci. Vysvětlují, proč zvolili konkrétní architekturu, jaké parametry upravili a jaké výsledky dosáhli. Instruktor podporuje interaktivní diskusi: ostatní studenti mohou klást otázky k rozhodnutím, metodám a výsledkům. Cílem je, aby studenti rozvinuli dovednost komunikovat technické informace jasným a přístupným způsobem.

**H2: Pokročilý projekt – generátor textu (52.2)**  
Pro studenty, kteří již zvládli základní projekt, je nabízena možnost rozšířit se na pokročilejší úkol: vytvoření jednoduchého generátoru textu. Instruktor předkládá knihovnu transformers (knihovna pro práci s předtrénovanými modely typu GPT) a ukazuje, jak ji integrovat do PyTorch. Studenti si vyberou konkrétní úkol – např. generování krátkých básní – a postupují od načtení dat, přes předzpracování, až po trénink a testování modelu. V rámci projektu se zaměřují na hyperparametry, jako je velikost batchu a počet epoch, a na vyhodnocení kvality generovaného textu.

**Závěr: Shrnutí a výzva k dalšímu učení**  
Projektová fáze ukazuje, jak se teoretické znalosti přetvářejí do praktických dovedností. Studentům je připomenuto, že klíč k úspěchu spočívá v pečlivém plánování, správném výběru nástrojů a otevřené komunikaci výsledků. Doporučuje se pokračovat v experimentování s různými architekturami, prohlubovat znalosti o optimalizačních metodách a zkoušet nové úlohy – od klasifikace obrázků po generování textu.  

---  

**GAPS & QUESTIONS**  
- Konkrétní zadání úlohy (např. dataset, požadovaná přesnost) není uvedeno.  
- Informace o požadovaném rozsahu kódu a konkrétních nástrojích (verze PyTorch, dostupnost GPU) chybí.  
- Nejsou uvedeny konkrétní metriky, které by měly být sledovány při tréninku.  

**EDIT NOTES**  
- Tón „analytický a poutavý“ byl zvolen tak, aby vyhovoval cílové skupině a zároveň zprostředkoval strukturovaný přehled.  
- Struktura podle požadavku: H1 + H2 + závěr.  
- Vzhledem k meta=true byly přidány sekce GAPS & QUESTIONS a EDIT NOTES.