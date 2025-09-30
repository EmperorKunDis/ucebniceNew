# Aktivační funkce v neuronových sítích

## Proč jsou aktivační funkce nezbytné
Neuronové sítě bez aktivačních funkcí by fungovaly pouze jako lineární regrese. V takovém případě by výstup každého neuronového vrstva byl lineární kombinací vstupů, což by omezilo síť na řešení pouze lineárně separovatelných problémů. Aktivační funkce přidávají nelinearitu, která umožňuje síti modelovat složitější vztahy a řešit úlohy, pro které lineární model selhává.

## Různé typy aktivačních funkcí
### Sigmoid
Sigmoidní funkce převádí libovolnou reálnou hodnotu na rozsah mezi 0 a 1. Je vhodná, když potřebujeme interpretovat výstup jako pravděpodobnost. Nicméně, při velkých hodnotách se může stát, že gradienty budou velmi malé, což zpomalí učení.

### ReLU (Rectified Linear Unit)
ReLU je definována jako \(\text{ReLU}(x)=\max(0,x)\). Její jednoduchost a rychlé výpočty z ní činí populární volbu pro skrytá vrstvy. Má však problém s “mrtvými” neurony, kdy některé neurony mohou zůstat neaktivní po dlouhou dobu.

### Tanh
Tanh je hyperbolický tangens, který převádí vstupy do rozsahu mezi –1 a 1. Má centrální hodnotu 0, což často zlepšuje konvergenci tréninku oproti sigmoidní funkci. Stejně jako sigmoid může být ovlivněna problémy s malými gradienty při extrémních hodnotách.

## Praktická ukázka: Jak volba aktivační funkce ovlivňuje výsledek
Představme si jednoduchý klasifikátor, který se učí rozlišovat mezi dvěma třídy. Pokud použijeme sigmoidní funkci v poslední vrstvě, získáme výstup, který lze interpretovat jako pravděpodobnost patřící k třídě 1. Pokud však použijeme ReLU, výstup bude lineární a nebude mít smysl jako pravděpodobnost. Přechod od lineární regrese k neuronové síti s nelineárními funkcemi tedy zásadně mění schopnost modelu zachytit komplexní vzory.

## Praktické cvičení: Experimentování s PyTorch
Studenti si vyzkouší, jak různé aktivační funkce ovlivňují výkon modelu. V prostředí PyTorch vytvoří model s jednou skrytou vrstvou a vyzkouší:
- ReLU
- Sigmoid

Po tréninku porovnají:
- Ztrátovou funkci (loss) během epoch
- Konečnou přesnost na testovacím souboru

Tím získají přímý vhled do toho, jak volba funkce ovlivňuje učení a výsledek.

# Závěr
Aktivační funkce představují klíčový prvek, který umožňuje neuronovým sítím řešit složité úkoly. Rozumět jejich vlastnostem a vhodné volbě pro konkrétní úlohu je nezbytné pro úspěšné využití umělé inteligence. Doporučujeme studentům neustále experimentovat s různými funkcemi a sledovat jejich dopad na výkon modelu, aby si vybudovali praktické porozumění.

---

## GAPS & QUESTIONS
- Jaké konkrétní úlohy nebo dataset by nejlépe ilustrovaly rozdíl mezi sigmoid a ReLU v praxi?
- Existují další aktivační funkce, které by mohly být relevantní pro základní představu o jejich vlastnostech?
- Bylo by užitečné přidat vizuální ilustraci gradientových problémů u sigmoid a tanh?

## EDIT NOTES
- Volba analytického a poutavého tónu podporuje přístupnost tématu pro široké publikum.
- Struktura se drží požadovaného formátu s H1, H2 a závěrem, aby usnadnila sledování během 60minutového přednášení.
- V textu se vyvarovalo žargonu a superlativů, aby odpovídalo podmínkám z INPUTu a PARAMS.