# Naivní Bayesův klasifikátor: Jak AI pozná spam podle "pytle slov"

V minulé kapitole jsme se naučili, jak Bayesova věta umožňuje chytře aktualizovat naše přesvědčení na základě nových důkazů. Dnes tento princip povýšíme na skutečný nástroj strojového učení, který denně používají miliony lidí: **Naivní Bayesův klasifikátor**.

Proč "naivní"? Protože jeho základní předpoklad je geniálně jednoduchý, až dětsky naivní. Představte si, že se snažíte poznat, zda je email spam. Algoritmus se "naivně" domnívá, že každé slovo v emailu je zcela nezávislý důkaz. Nevnímá gramatiku, kontext ani pořadí slov. Jen se ptá:

- "Jak často se slovo **'výhra'** objevuje ve spamech a jak často v normálních emailech?"
- "A co slovo **'zdarma'**?"
- "A co slovo **'zítra'**?"

Sečtením těchto malých, nezávislých "důkazů" pak pomocí Bayesovy věty dospěje k překvapivě přesnému verdiktu. Dnes si přesně takový spamový filtr společně postavíme.

---

## Princip fungování: Model "pytle slov" (Bag of Words)

Než začneme programovat, musíme pochopit, jak AI "vidí" text. Pro Naivní Bayesův klasifikátor je email jen **"pytel slov" (Bag of Words)**.

Představte si, že vezmete větu: _"Vyzvedněte si svou výhru zdarma!"_ a všechna slova z ní nasypete do jednoho pytle. V pytli pak budete mít: `{"vyzvedněte": 1, "si": 1, "svou": 1, "výhru": 1, "zdarma": 1}`.

Algoritmus nezajímá, že "výhru zdarma" je sousloví. Každé slovo je samostatná jednotka. Během tréninku se pak učí, která slova se typicky objevují v "pytlích" patřících do kategorie SPAM a která v "pytlích" patřících do kategorie HAM (ne-spam).

---

## Praktický projekt: Stavba spamového filtru v Pythonu

Pojďme si postavit jednoduchý, ale funkční spamový filtr pomocí knihovny `scikit-learn`.

**Krok 1: Příprava prostředí a dat**

Nejprve si nainstalujeme `scikit-learn`. Data si pro jednoduchost definujeme přímo v kódu.

```bash
pip install scikit-learn
```

**Krok 2: Kód pro trénink a klasifikaci**

Vytvořte si Python soubor a vložte do něj následující kód. Projdeme si ho krok po kroku.

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score

# 1. Naše trénovací data: dvojice (text emailu, kategorie)
data = [
    ('Vyzvedněte si svou výhru zdarma!', 'spam'),
    ('Exkluzivní nabídka jen pro vás, neváhejte!', 'spam'),
    ('Klikněte zde pro neuvěřitelnou slevu!', 'spam'),
    ('Získejte půjčku bez doložení příjmů, rychle a snadno.', 'spam'),
    ('Ahoj, jak se máš? Sejdeme se zítra.', 'ham'),
    ('Zpráva o stavu projektu.', 'ham'),
    ('Děkuji za váš email, odpovím co nejdříve.', 'ham'),
    ('Potvrzení vaší objednávky č. 12345.', 'ham')
]

# Převedeme data do přehlednější formy pomocí Pandas
df = pd.DataFrame(data, columns=['text', 'kategorie'])

# 2. Příprava dat pro model
# Oddělíme texty (X) od kategorií (y)
X = df['text']
y = df['kategorie']

# Převedeme text na "pytel slov" (Bag of Words)
# CountVectorizer vytvoří matici, kde pro každý email spočítá výskyt každého slova.
vectorizer = CountVectorizer()
X_vektorizovany = vectorizer.fit_transform(X)

print("Slovník (slova, která model zná):")
print(vectorizer.get_feature_names_out())
print("\nData převedená na vektory (matice výskytů):")
print(X_vektorizovany.toarray())


# 3. Trénink modelu
# Vytvoříme instanci Naivního Bayesova klasifikátoru
model = MultinomialNB()

# Natrénujeme model na našich datech
model.fit(X_vektorizovany, y)
print("\nModel byl úspěšně natrénován!")


# 4. Testování modelu na nových datech
# Tyto emaily model nikdy předtím neviděl
testovaci_emaily = [
    'Ahoj, pošleš mi prosím ten report?',
    'Výhra! Získejte iPhone zdarma, klikněte hned!',
    'Nová nabídka půjčky pro vás!'
]

# Převedeme testovací emaily na vektory pomocí stejného vectorizeru
testovaci_vektory = vectorizer.transform(testovaci_emaily)

# Provedeme predikci
predikce = model.predict(testovaci_vektory)
print("\n--- Výsledky predikce ---")
for email, kategorie in zip(testovaci_emaily, predikce):
    print(f"Email: '{email}' -> Predikce: {kategorie.upper()}")

# 5. Podívejme se na pravděpodobnosti
# Jak si je model jistý?
pravdepodobnosti = model.predict_proba(testovaci_vektory)
print("\n--- Pravděpodobnosti ---")
for email, prob in zip(testovaci_emaily, pravdepodobnosti):
    ham_prob = prob[0] * 100
    spam_prob = prob[1] * 100
    print(f"Email: '{email}' -> Šance, že je HAM: {ham_prob:.2f}%, Šance, že je SPAM: {spam_prob:.2f}%")

```

**Krok 3: Interpretace výsledků**

Když kód spustíte, uvidíte několik věcí:

1.  **Slovník:** Seznam všech unikátních slov, která se model naučil z trénovacích dat.
2.  **Vektory:** Jak `CountVectorizer` převedl každou větu na řádek čísel (počty slov).
3.  **Predikce:** Jak model správně označil nové emaily. Všimněte si, že i když nezná slovo "iPhone", přítomnost slov "výhra" a "zdarma" mu stačí k rozhodnutí.
4.  **Pravděpodobnosti:** Uvidíte, s jakou jistotou model dělá svá rozhodnutí. U emailu o iPhonu bude pravděpodobnost spamu velmi vysoká.

---

## Závěr: Síla v jednoduchosti

Gratuluji! Právě jste postavili jeden z nejklasičtějších a nejužitečnějších modelů strojového učení. Viděli jste, jak se z jednoduché myšlenky "počítání slov" a Bayesovy věty rodí efektivní spamový filtr.

Tento "naivní" přístup je i dnes překvapivě účinný a díky své rychlosti a jednoduchosti se stále používá pro:

- **Filtrování spamu**
- **Analýzu sentimentu:** Je recenze produktu pozitivní, nebo negativní?
- **Klasifikaci článků:** Patří tento článek do kategorie "Sport", "Politika", nebo "Kultura"?

**Vaše výzva:** Zkuste do našeho `data` listu přidat další emaily, jak spamové, tak legitimní. Přetrénujte model a sledujte, jak se jeho predikce mění. Co se stane, když přidáte email se slovem, které nikdy předtím neviděl?
