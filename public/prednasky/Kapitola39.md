# Generativní AI: Staňte se "zaříkávačem" jazykových modelů

Dosud jsme se učili AI, která _analyzuje_ a _předpovídá_. Rozpoznávala obrázky, odhalovala spam, hledala trendy. Dnes se podíváme na druhý, ještě více fascinující typ AI: **Generativní AI**. Je to umělá inteligence, která _tvoří_. AI, která píše básně, maluje obrazy, skládá hudbu a programuje kód.

Vstoupíme do světa **velkých jazykových modelů (LLM)**, motorů této kreativní revoluce. Naučíme se, jak s nimi efektivně komunikovat, a staneme se "zaříkávači AI", neboli **Prompt Engineery**. A na konci si postavíme vlastní jednoduché chatovací rozhraní, abychom si s lokálním modelem mohli povídat v pohodlí našeho prohlížeče.

---

## Co je to velký jazykový model (LLM)? Geniální předpovídač slov

Jak LLM jako GPT nebo Llama funguje? V jádru je jeho úkol překvapivě jednoduchý:

> Na základě sekvence slov, kterou dostal, se snaží předpovědět **další nejpravděpodobnější slovo**.

Představte si asistenta, který přečetl celý internet. Když mu řeknete větu: "Hlavní město Francie je...", on na základě miliard textů, které "viděl", ví, že nejpravděpodobnější slovo, které má následovat, je "Paříž". Pak vezme novou větu "Hlavní město Francie je Paříž" a hádá další slovo. A další. Opakováním tohoto jednoduchého kroku dokáže generovat celé souvislé věty, odstavce a články. Jeho schopnost tvořit je jen vedlejším produktem extrémně dobré schopnosti předpovídat.

---

## Umění promptu: Kvalitní otázka = kvalitní odpověď

Klíčem k odemknutí potenciálu LLM je **prompt** – instrukce, kterou mu dáme. Kvalita výstupu je přímo úměrná kvalitě vstupu.

- **Špatný prompt:** "Napiš něco o psech."
  - _Výsledek bude obecný, nudný a nepoužitelný._

- **Dobrý prompt:** "Vžij se do role zkušeného kynologa. Napiš krátký, poutavý odstavec (cca 100 slov) pro začínajícího majitele štěněte labradora. Zaměř se na tři nejdůležitější a nečekané tipy pro první týden doma. Styl by měl být přátelský, ale autoritativní."
  - _Výsledek bude konkrétní, cílený a užitečný._

**Základní techniky promptingu:**

1.  **Přiřazení role:** "Chovej se jako..." (expert na marketing, pirát, Shakespeare).
2.  **Poskytnutí kontextu:** Dejte modelu všechny potřebné informace.
3.  **Specifikace formátu:** "Odpověz ve formě tabulky", "Napiš 5 bodů", "Výstupem bude JSON objekt".
4.  **Příklady (Few-shot prompting):** Dejte mu jeden nebo dva příklady toho, jak má odpověď vypadat.

---

## Praktický projekt: Váš vlastní lokální chatbot s Gradio

V kapitole 3 jsme si ukázali, jak nainstalovat **Ollama** a spustit lokální jazykový model. Dnes si k němu postavíme jednoduché a elegantní webové rozhraní pomocí knihovny **Gradio**.

**Krok 1: Příprava prostředí**

Ujistěte se, že máte nainstalovanou a spuštěnou Ollamu s nějakým modelem (např. `llama3`). V terminálu spusťte:

```bash
ollama run llama3
```

_(Nechte tento terminál běžet na pozadí)._

Nyní si v novém terminálu nainstalujeme potřebné Python knihovny:

```bash
pip install gradio ollama
```

**Krok 2: Kód pro chatbot rozhraní**

Vytvořte si Python soubor (např. `chatbot.py`) a vložte do něj tento kód. Je neuvěřitelně krátký díky kouzlu moderních knihoven.

```python
import gradio as gr
import ollama

# --- Funkce, která bude zpracovávat konverzaci ---
# message: aktuální zpráva od uživatele
# history: seznam předchozích párů [uživatel, bot]
def chat_function(message, history):
    # Připravíme zprávy ve formátu, kterému Ollama rozumí
    # Spojíme historii a novou zprávu
    messages = []
    for user_msg, bot_msg in history:
        messages.append({'role': 'user', 'content': user_msg})
        messages.append({'role': 'assistant', 'content': bot_msg})
    messages.append({'role': 'user', 'content': message})

    # Zavoláme model přes Ollama API a streamujeme odpověď
    # Streamování znamená, že odpověď se objevuje slovo po slově
    stream = ollama.chat(
        model='llama3', # Ujistěte se, že tento model máte stažený
        messages=messages,
        stream=True
    )

    # Postupně skládáme odpověď a vracíme ji do rozhraní
    response = ""
    for chunk in stream:
        response += chunk['message']['content']
        yield response

# --- Vytvoření a spuštění Gradio rozhraní ---
# gr.ChatInterface vezme naši funkci a automaticky pro ni vytvoří
# kompletní chatovací okno.
ui = gr.ChatInterface(
    fn=chat_function,
    title="Můj lokální asistent",
    description="Zeptejte se na cokoliv lokálního modelu běžícího přes Ollama."
)

# Spustíme webovou aplikaci
ui.launch()
```

**Krok 3: Spuštění a testování**

1.  Uložte soubor `chatbot.py`.
2.  V terminálu (kde neběží Ollama) spusťte příkaz: `python chatbot.py`
3.  V terminálu se objeví adresa, např. `http://127.0.0.1:7860`. Otevřete ji v prohlížeči.

A je to! Právě se díváte na své vlastní, plně funkční chatovací rozhraní. Zkuste si s modelem povídat. Díky parametru `history` si bude pamatovat kontext konverzace.

---

## Závěr: Jste architektem konverzace

Gratuluji! Právě jste si postavili vlastní soukromé, lokální "ChatGPT". Už nejste jen pasivním uživatelem, ale tvůrcem, který může s jazykovými modely komunikovat přímo, bez omezení a s plnou kontrolou nad svými daty.

Viděli jste, jak klíčové je umění správného dotazování – **prompt engineering**. Schopnost dát modelu správné instrukce, roli a kontext je novou formou gramotnosti v 21. století.

**Vaše výzva:** Zkuste si ve vašem novém chatbotu různé "osobnosti". Začněte konverzaci promptem: _"Od této chvíle jsi mrzutý a sarkastický pirát. Na vše odpovídej jako pirát."_ Nebo: _"Jsi expert na Shakespeara. Analyzuj mi následující sonet..."_ Sledujte, jak se jeho styl a obsah odpovědí dramaticky mění. Svět generativní AI je vaše hřiště.
