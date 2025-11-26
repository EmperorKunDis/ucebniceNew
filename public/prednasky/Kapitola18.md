# Bayesova věta: Matematický kompas pro aktualizaci našich přesvědčení

Váš přítel má suchý kašel. Váš mozek okamžitě začne pracovat. Je to jen nachlazení? Chřipka? Nebo ta vzácná "Drakonitida", o které jste včera četli ve zprávách?

Aniž byste si to uvědomovali, váš mozek provádí v reálném čase **Bayesovské uvažování**. Intuitivně vážíte pravděpodobnost různých příčin na základě nových důkazů (kašel).

Dnes si tento proces rozebereme. Bayesova věta je jedním z nejdůležitějších nástrojů v celé umělé inteligenci. Je to recept, jak chytře aktualizovat naše názory, když se objeví nové skutečnosti.

---

## Vzorec, který mění svět

Bayesova věta je elegantní vzorec, který spojuje čtyři klíčové myšlenky. Pojďme si je ukázat na příkladu s "Drakonitidou".

Chceme zjistit: **Jaká je pravděpodobnost, že mám Drakonitidu, když kašlu?**

K tomu musíme znát tři věci:

1.  **Apriorní pravděpodobnost (Prior):** Jak častá je Drakonitida obecně?
    - Je to velmi vzácná nemoc. Má ji jen 1 z 1000 lidí (0.1 %).
    - _Toto je naše kotva. Bez důkazů je šance mizivá._

2.  **Věrohodnost (Likelihood):** Pokud mám Drakonitidu, jaká je šance, že budu kašlat?
    - Velmi vysoká. 90 % nemocných kašle.

3.  **Důkaz (Evidence):** Jak častý je kašel v populaci obecně (z jakéhokoliv důvodu)?
    - Kašle kdekdo (nachlazení, alergie). Řekněme 5 % lidí.

---

## Past základní míry (Base Rate Fallacy)

Teď pozor. Většina lidí (včetně lékařů!) udělá chybu v úsudku.
Řeknou si: "Mám kašel. Kašel je 90% příznakem Drakonitidy. Takže mám asi Drakonitidu!"

**To je omyl.**

Bayesova věta nám spočítá skutečnou pravděpodobnost. A výsledek vás šokuje.
Pravděpodobnost, že máte Drakonitidu, je jen asi **1.8 %**.

### Proč tak málo?

Protože nemoc samotná je extrémně vzácná (0.1 %).

- Představte si 1000 lidí.
- Jen **1** má Drakonitidu (a pravděpodobně kašle).
- Ale **50** dalších lidí kašle z jiných důvodů (nachlazení).
- Takže z 51 kašlajících lidí je jen 1 nemocný Drakonitidou. To je cca 2 %.

Náš mozek se soustředí na silný příznak (kašel) a ignoruje, že nemoc je vzácná. Bayesova věta nás vrací do reality.

---

## Kde se to používá?

1.  **Spamové filtry:**
    - Prior: Většina emailů je OK.
    - Důkaz: Email obsahuje slovo "VIAGRA".
    - Aktualizace: Pravděpodobnost spamu raketově roste.

2.  **Samořídící auta:**
    - Prior: Na dálnici chodci nebývají.
    - Důkaz: Senzor vidí tvar připomínající člověka.
    - Aktualizace: Auto musí zvážit, zda je to člověk, nebo jen stín, s ohledem na to, jak vzácní jsou chodci na dálnici.

3.  **Hledání ztracených lodí:**
    - Bayesovské hledání se používá k nalezení vraků na dně oceánu. Aktualizuje se mapa pravděpodobnosti podle toho, kde už jsme hledali a nic nenašli.

---

## Shrnutí kapitoly

- **Bayesova věta** je matematický nástroj pro aktualizaci pravděpodobnosti.
- Spojuje **předchozí znalost** (jak častý je jev) s **novým důkazem** (pozorování).
- Pomáhá nám vyhnout se **Pasti základní míry** (ignorování vzácnosti jevu).
- Je základem pro "inteligentní" rozhodování v nejistotě.
