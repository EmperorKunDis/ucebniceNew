# Teachable Machine podruhé: Naučte AI poslouchat vaše příkazy

V jedné z minulých kapitol (Kapitola 9) jsme se stali mistry v rozpoznávání obrázků. Naučili jsme umělou inteligenci hrát "Kámen, nůžky, papír" pomocí úžasného nástroje **Google Teachable Machine**. Dnes se k tomuto nástroji vrátíme, ale posuneme naše schopnosti o úroveň výš a vstoupíme do světa **zvuku**.

Zapomeňte na obrázky. Dnes naučíme počítač "poslouchat". Naším cílem bude vytvořit model, který v reálném čase pozná, jestli jste **tleskli**, **luskli prsty**, nebo **zapískali**. Otevřeme naší umělé inteligenci uši a ukážeme si, že princip trénování je pro různé typy dat téměř identický.

---

## Proč se vracet k Teachable Machine?

Teachable Machine je ideální nástroj pro pochopení základního principu strojového učení, protože odděluje dva klíčové kroky:

1.  **Trénink modelu:** Sběr dat a učení vzorů (to děláme v Teachable Machine bez kódu).
2.  **Použití modelu:** Integrace natrénovaného "mozku" do reálné aplikace (to děláme v Pythonu).

Dnes se zaměříme na první krok, ale s novým typem dat – se zvukem. Ukážeme si, že i když se data mění, proces myšlení zůstává stejný.

---

## Praktický projekt: Klasifikátor zvuků "Tleskni, luskni, zapískej"

Pojďme si krok za krokem vytvořit model, který bude reagovat na vaše zvukové povely.

**Krok 1: Otevřete Teachable Machine a vyberte Audio Project**

1.  Jděte na webovou stránku: [https://teachablemachine.withgoogle.com/](https://teachablemachine.withgoogle.com/)
2.  Klikněte na **"Get Started"** a tentokrát vyberte **"Audio Project"**.

**Krok 2: Sběr zvukových dat – Klíč je v pozadí!**

Uvidíte rozhraní pro nahrávání zvukových "tříd". Zde je první a nejdůležitější krok jiný než u obrázků.

1.  **Třída "Pozadí" (Background Noise):** První třída je vždy vyhrazena pro hluk pozadí. Klikněte na **"Record 20s"** a buďte 20 sekund potichu. Nahrajte běžný šum vaší místnosti.
    - **PROČ?** Tímto krokem učíte model, co má **ignorovat**. Je to naprosto klíčové pro to, aby model nereagoval na každý náhodný zvuk.

2.  **Třída "Tlesknutí":** Klikněte na **"Add a class"**. Přejmenujte ji na "Tlesknutí". Nyní klikněte na **"Record 2s"** a nahrajte jeden krátký vzorek tlesknutí. Opakujte to alespoň 8-10krát, abyste měli dostatek dat. Každý vzorek by měl obsahovat jen jedno tlesknutí.

3.  **Třída "Lusknutí":** Přidejte další třídu, pojmenujte ji "Lusknutí". Opět nahrajte 8-10 krátkých vzorků lusknutí prsty.

4.  **Třída "Pískání" (volitelné):** Můžete přidat další třídu, například "Pískání", a opět nahrát několik vzorků.

**Krok 3: Trénink a testování v reálném čase**

1.  Máte nasbíraná data? Skvělé! Nyní klikněte na tlačítko **"Train Model"**. Trénink zvukového modelu je obvykle rychlejší než u obrázků. Během tréninku nezavírejte okno.
2.  Jakmile je trénink hotový, v pravé části "Preview" se aktivuje váš mikrofon. A teď přichází ta zábava!
3.  Zkuste tlesknout. Měli byste vidět, jak ukazatel u třídy "Tlesknutí" prudce stoupne.
4.  Zkuste lusknout. Měl by se aktivovat ukazatel pro "Lusknutí".
5.  Buďte chvíli potichu. Měl by být aktivní pouze ukazatel pro "Pozadí".

**Co se stalo?** Právě jste v reálném čase otestovali svůj vlastní klasifikátor zvuků. Model "poslouchá" zvuk z mikrofonu a každou sekundu ho porovnává se vzory, které se naučil, a vypisuje pravděpodobnost pro každou kategorii.

**Krok 4: Export modelu**

Stejně jako u obrázkového projektu, i tento model si můžete exportovat pro použití v externí aplikaci.

1.  Klikněte na **"Export Model"**.
2.  Ujistěte se, že jste na záložce **"Tensorflow.js"** a klikněte na **"Upload my model"**.
3.  Zkopírujte si vygenerovaný **"Sharable link"**. Tento odkaz obsahuje váš natrénovaný zvukový "mozek".

---

## Jak použít zvukový model v aplikaci?

Pamatujete si na náš Gradio projekt z kapitoly 9, kde jsme vytvořili webovou aplikaci pro klasifikaci obrázků? Použití tohoto zvukového modelu by bylo téměř identické, jen s malou změnou.

Místo vstupního prvku pro obrázek:
`inputs=gr.Image(...)`

...byste použili vstupní prvek pro zvuk, který umožňuje nahrávání z mikrofonu:
`inputs=gr.Audio(source="microphone", type="filepath")`

Zbytek logiky – načtení modelu z URL pomocí TensorFlow a provedení predikce – by fungoval na velmi podobném principu. To ukazuje, jak jsou moderní nástroje flexibilní.

---

## Závěr: Vaše AI má teď uši!

Dnes jste si potvrdili, že základní princip strojového učení je univerzální. Nezáleží na tom, jestli pracujete s obrázky, zvukem nebo textem. Proces je vždy stejný:

1.  **Nasbírat kvalitní data.**
2.  **Označit je do kategorií.**
3.  **Nechat model, ať se naučí vzory.**

Možnosti zvukové klasifikace jsou obrovské:

- Aplikace, která rozpozná **ptačí zpěv**.
- Systém, který pozná **štěkot psa od mňoukání kočky**.
- Bezpečnostní zařízení, které spustí alarm při **zvuku rozbitého skla**.
- Hlasem ovládané rozhraní pro lidi s omezenou hybností.

**Vaše výzva:** Vraťte se do Teachable Machine a zkuste si vytvořit vlastní, originální zvukový klasifikátor. Naučte model rozpoznávat vaše "ano" a "ne". Nebo zkuste rozeznat zvuk různých hudebních nástrojů. Hranice určuje jen vaše fantazie a kvalita vašich dat.
