# Bayesova věta: Matematický kompas pro aktualizaci našich přesvědčení

Váš přítel má suchý kašel. Váš mozek okamžitě začne pracovat. Je to jen nachlazení? Chřipka? Nebo ta vzácná "Drakonitida", o které jste včera četli ve zprávách? Aniž byste si to uvědomovali, váš mozek provádí v reálném čase **Bayesovské uvažování**. Intuitivně vážíte pravděpodobnost různých příčin na základě nových důkazů (kašel).

Dnes si tento proces rozebereme, dáme mu přesnou matematickou formu a naučíme se, jak se nenechat zmást statistikou a první dojem. Bayesova věta je jedním z nejdůležitějších nástrojů v celé umělé inteligenci. Je to recept, jak chytře aktualizovat naše názory, když se objeví nové skutečnosti.

---

## Odvození a interpretace Bayesovy věty

Bayesova věta je elegantní vzorec, který spojuje čtyři klíčové myšlenky. Pojďme si je hned ukázat na našem příkladu s "Drakonitidou".

Vzorec zní:
**`P(A|B) = [P(B|A) * P(A)] / P(B)`**

A teď si to přeložme do našeho problému:

- `A` = Pacient má Drakonitidu.
- `B` = Pacient má suchý kašel.

Co chceme zjistit, je **`P(A|B)`**: Jaká je pravděpodobnost, že pacient má Drakonitidu, _když víme_, že má suchý kašel?

K tomu potřebujeme tři informace:

1.  **`P(A)` - Apriorní pravděpodobnost (Prior):** Jaká je pravděpodobnost, že náhodný člověk má Drakonitidu? Řekněme, že je to velmi vzácná nemoc, která postihuje jen 0.1 % populace.
    - `P(A) = 0.001`

2.  **`P(B|A)` - Věrohodnost (Likelihood):** Jaká je pravděpodobnost, že pacient bude mít suchý kašel, _pokud víme_, že má Drakonitidu? Řekněme, že je to hlavní příznak, takže pravděpodobnost je vysoká, 90 %.
    - `P(B|A) = 0.9`

3.  **`P(B)` - Důkaz (Evidence):** Jaká je celková pravděpodobnost, že náhodný člověk v populaci má suchý kašel (ať už z jakéhokoliv důvodu – nachlazení, alergie, Drakonitida...)? Řekněme, že v danou chvíli kašle 5 % populace.
    - `P(B) = 0.05`

Nyní máme vše, co potřebujeme, abychom spočítali naši odpověď.

---

## Praktický projekt: Výpočet a vizualizace Bayesovy věty

Pojďme si to spočítat a vizualizovat v Pythonu. Uvidíte, jak moc se může lišit naše intuice od matematické reality.

**Krok 1: Příprava prostředí**

```bash
pip install matplotlib
```

**Krok 2: Kód pro výpočet a vizualizaci**

Tento skript vezme naše zadané hodnoty, dosadí je do Bayesova vzorce a výsledek zobrazí v grafu.

```python
import matplotlib.pyplot as plt

def bayes_theorem(p_a, p_b_given_a, p_b):
    """Spočítá aposteriorní pravděpodobnost P(A|B) pomocí Bayesovy věty."""
    # P(A|B) = (P(B|A) * P(A)) / P(B)
    p_a_given_b = (p_b_given_a * p_a) / p_b
    return p_a_given_b

# Naše hodnoty z příkladu s Drakonitidou
# P(A): Pravděpodobnost, že člověk má Drakonitidu (Prior)
p_drakonitida = 0.001

# P(B|A): Pravděpodobnost, že má kašel, pokud má Drakonitidu (Likelihood)
p_kasel_pri_drakonitide = 0.9

# P(B): Celková pravděpodobnost, že má člověk kašel (Evidence)
p_kasel = 0.05

# Výpočet finální pravděpodobnosti
# P(A|B): Jaká je pravděpodobnost, že má Drakonitidu, když víme, že kašle?
p_drakonitida_pri_kasli = bayes_theorem(p_drakonitida, p_kasel_pri_drakonitide, p_kasel)

print(f"Apriorní pravděpodobnost Drakonitidy (před důkazem): {p_drakonitida*100:.2f}%")
print(f"Aposteriorní pravděpodobnost Drakonitidy (po důkazu, že pacient kašle): {p_drakonitida_pri_kasli*100:.2f}%")

# --- Vizualizace ---
fig, ax = plt.subplots()
pravdepodobnosti = [p_drakonitida * 100, p_drakonitida_pri_kasli * 100]
nazvy = ['Před důkazem (Prior)', 'Po důkazu (Posterior)']

ax.bar(nazvy, pravdepodobnosti, color=['skyblue', 'salmon'])
ax.set_ylabel('Pravděpodobnost (%)')
ax.set_title('Změna přesvědčení o nemoci po zjištění příznaku (kašel)')
ax.set_ylim(0, max(pravdepodobnosti) * 1.2) # Trochu místa nahoře

for i, v in enumerate(pravdepodobnosti):
    ax.text(i, v + 0.1, f"{v:.2f}%", ha='center', fontweight='bold')

plt.show()
```

**Krok 3: Interpretace výsledku – past základní míry (Base Rate Fallacy)**

Když kód spustíte, zjistíte, že pravděpodobnost, že váš přítel má Drakonitidu, je pouhých **1.8 %**!

Jak je to možné, když kašel je 90% příznakem? Tomuto jevu se říká **"past základní míry" (Base Rate Fallacy)**. Náš mozek se soustředí na silný příznak (kašel) a ignoruje klíčovou informaci: že nemoc samotná je extrémně vzácná. I když má přítel příznak, je stále mnohem, mnohem pravděpodobnější, že jeho kašel je způsoben něčím běžným (co tvoří zbylou část z 5 % kašlajících lidí). Bayesova věta nám pomáhá tuto past odhalit a zkorigovat naši intuici.

---

## Závěr: Bayes jako mozek umělé inteligence

Dnes jste se naučili jeden z nejdůležitějších vzorců v moderní statistice a AI. Bayesova věta je všude:

- **Spamové filtry:** Jaká je `P(Spam | email obsahuje slovo "výhra")`?
- **Lékařská diagnostika:** Jaká je `P(Nemoc | pozitivní test)`?
- **Samořídící auta:** Jaká je `P(Chodec přede mnou | data ze senzoru)`?
- **Strojové učení:** Mnoho algoritmů (např. Naivní Bayesův klasifikátor) je na tomto principu přímo postaveno.

Schopnost aktualizovat "názor" na základě nových dat je základem učení. A Bayesova věta je čistý, matematický recept, jak to dělat správně.

**Vaše výzva:** Zkuste v našem kódu změnit vstupní hodnoty. Co se stane, když nemoc nebude tak vzácná a bude ji mít 10 % populace (`p_drakonitida = 0.1`)? Jak se změní výsledek? Sledujte, jak se vaše aposteriorní pravděpodobnost mění s novými důkazy.
