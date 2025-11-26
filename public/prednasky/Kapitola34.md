# Teachable Machine podruhé: Naučte AI poslouchat vaše příkazy

V kapitole 9 jsme se stali mistry v rozpoznávání obrázků. Naučili jsme AI hrát "Kámen, nůžky, papír" pomocí **Google Teachable Machine**.

Dnes se vrátíme k tomuto nástroji, ale posuneme se o úroveň výš. Zapomeňte na obrázky.
Dnes naučíme počítač **"poslouchat"**.

Naším cílem bude vytvořit model, který v reálném čase pozná, jestli jste **tleskli**, **luskli prsty**, nebo **zapískali**.

---

## Proč se vracet k Teachable Machine?

Teachable Machine je ideální nástroj pro pochopení základního principu strojového učení, protože odděluje dva klíčové kroky:

1.  **Trénink modelu:** Sběr dat a učení vzorů (to děláme v Teachable Machine **bez kódu**).
2.  **Použití modelu:** Integrace natrénovaného "mozku" do aplikace.

Dnes se zaměříme na první krok, ale s novým typem dat – se **zvukem**.

---

## Zvuk vs. Obrázek: Stejný princip

I když data jsou jiná, proces myšlení AI zůstává **stejný**:

- **U obrázků:** Hledáme vzory v pixelech.
- **U zvuku:** Hledáme vzory ve frekvencích a amplitudách.

Obě jsou jen různé druhy vln – jedna světelná, druhá zvuková.

---

## Projekt: Klasifikátor zvuků "Tleskni, luskni, zapískej"

Pojďme si krok za krokem vytvořit model, který bude reagovat na vaše zvukové povely.

### Krok 1: Teachable Machine – Audio Project

1.  Otevřete: [https://teachablemachine.withgoogle.com/](https://teachablemachine.withgoogle.com/)
2.  Klikněte na **"Get Started"** a vyberte **"Audio Project"**.

### Krok 2: KLÍČOVÝ TRIK – Třída "Pozadí"

První třída je vždy pro **hluk pozadí**.

- Klikněte na **"Record 20s"** a buďte 20 sekund potichu.
- Nahrajte běžný šum místnosti (ticho počítačového ventilátoru, bzučení lednice).

**PROČ?**
Tímto krokem učíte model, co má **ignorovat**. Jinak by reagoval na každý náhodný zvuk.

### Krok 3: Nahrajte zvukové třídy

1.  **Třída "Tlesknutí":**
    - Přidejte třídu, přejmenujte ji.
    - Nahrajte 8-10 krátkých vzorků (každý cca 2 sekundy).
    - Každý vzorek = jedno tlesknutí.

2.  **Třída "Lusknutí":**
    - Stejný postup pro lusknutí prsty.

3.  **Třída "Pískání" (volitelné):**
    - Můžete přidat další zvuky.

### Krok 4: Trénink a testování

1.  Klikněte na **"Train Model"**.
2.  Po tréninku se v části "Preview" aktivuje mikrofon.
3.  **Zkuste to!**
    - Tlesknete -> Ukazatel u "Tlesknutí" stoupne.
    - Luskněte -> Aktivuje se "Lusknutí".
    - Ticho -> Aktivní jen "Pozadí".

### Krok 5: Export modelu

1.  Klikněte na **"Export Model"**.
2.  Zkopírujte si **"Sharable link"**.
3.  Tento odkaz obsahuje váš natrénovaný "mozek".

---

## Shrnutí kapitoly

- AI princip je **univerzální** pro obrázky, zvuk i text.
- **Teachable Machine** umožňuje učit AI bez programování.
- **Klíč k úspěchu:** Kvalitní data + třída "Pozadí" pro zvuky.

---
