# Budoucnost AI: Váš osobní génius v krabičce, nebo Pandořina skříňka?

Představte si na chvíli, že máte k dispozici asistenta. Ne takového, co vám jen nastaví budík nebo najde recept. Ale asistenta, který dokáže složit sonátu ve stylu Bacha, navrhnout lék na nemoc, která trápí vaši rodinu, nebo napsat scénář k filmu, který máte v hlavě. Asistenta, který rozumí nejen tomu, co říkáte, ale i tomu, co si myslíte. To je příslib **obecné umělé inteligence (AGI)**. Budoucnost AI není jen o rychlejších počítačích, je to o strojích, které tvoří, uvažují a možná i sní. Jsme na prahu zlatého věku, nebo se chystáme otevřít Pandořinu skříňku? Pojďme to zjistit.

---

## Dva horizonty budoucnosti: AGI a Superinteligence

Když mluvíme o budoucnosti AI, objevují se dva hlavní pojmy, které zní jako ze sci-fi, ale vědci je berou smrtelně vážně:

- **Obecná umělá inteligence (AGI - Artificial General Intelligence):** To je AI na lidské úrovni. Ne jen specialista na šachy nebo na řízení auta, ale systém s flexibilitou, kreativitou a schopností učit se cokoliv, co by se naučil člověk. Představte si AI lékaře, který nejenže analyzuje rentgen, ale vede s pacientem empatický rozhovor a navrhuje léčbu na základě nejnovějších studií z celého světa, které přečetl za pár sekund.
- **Superinteligence:** To je krok za AGI. Systém, který je v každém ohledu – kreativitě, moudrosti, sociálních dovednostech – řádově chytřejší než nejlepší lidské mozky. Zde se dostáváme do neprobádaných vod. Pro superinteligenci bychom mohli být tím, čím jsou pro nás mravenci. Pomohla by nám vyřešit hlad, nemoci a klimatickou změnu? Nebo by nás ve snaze o dosažení nějakého cíle, který plně nechápeme, prostě "uklidila z cesty"?

---

## Dopad na společnost: Nová průmyslová revoluce na steroidech

Ať už dosáhneme AGI, nebo ne, AI už teď spouští revoluci srovnatelnou s vynálezem internetu.

1.  **Práce a ekonomika:** Mnoho rutinních úkolů (analýza dokumentů, psaní reportů, zákaznická podpora) bude automatizováno. To neznamená konec práce, ale její transformaci. Vzniknou nové profese, o kterých dnes nemáme ani tušení – "trenér AI", "etik AI systémů" nebo "AI kreativní ředitel".
2.  **Vzdělávání:** Představte si osobního tutora pro každé dítě. AI, která pozná, že malý Petr bojuje se zlomky, a okamžitě mu vytvoří zábavnou hru na míru, aby je pochopil. Učení bude personalizované, adaptivní a mnohem efektivnější.
3.  **Medicína:** AI už dnes pomáhá objevovat nové léky a navrhovat personalizovanou léčbu rakoviny. V budoucnu by mohla poskytovat kvalitní diagnostiku i v nejodlehlejších částech světa, kde chybí lékaři.

---

## Praktický projekt: Spusťte si vlastní "mozek" AI na svém počítači

Dost teorie! Pojďme si ukázat sílu **generativní AI** v praxi. Nainstalujeme si a spustíme velký jazykový model (LLM) přímo na vašem počítači. Je to jednodušší, než si myslíte, díky nástroji jménem **Ollama**.

**Co je Ollama?** Je to nástroj, který vám umožní stáhnout a spouštět špičkové open-source jazykové modely (jako Llama 3, Mistral a další) lokálně. Váš vlastní soukromý ChatGPT!

**Krok 1: Instalace Ollama**

1.  Otevřete terminál (na Macu) nebo příkazový řádek (na Windows).
2.  Zadejte následující příkaz, který stáhne a nainstaluje Ollama:
    ```bash
    curl -fsSL https://ollama.com/install.sh | sh
    ```
3.  Po dokončení instalace by Ollama měla běžet na pozadí.

**Krok 2: Stažení a spuštění prvního modelu**

Začneme s malým, ale překvapivě schopným modelem jménem `tinyllama`. Je ideální na vyzkoušení.

1.  V terminálu zadejte:
    ```bash
    ollama run tinyllama
    ```
2.  Při prvním spuštění se model stáhne (může to chvíli trvat). Jakmile je hotovo, uvidíte `>>>` a můžete si s modelem začít povídat přímo v terminálu!
3.  Zeptejte se ho na něco česky: `Napiš krátkou báseň o Praze.` Sice není dokonalý v češtině, ale ukáže vám princip. Ukončíte ho příkazem `/bye`.

**Krok 3: Použití modelu v Pythonu**

Povídat si v terminálu je fajn, ale pravá síla se ukáže, když model zapojíte do vlastního programu.

1.  Nejprve nainstalujte Python knihovnu pro Ollama:
    ```bash
    pip install ollama
    ```
2.  Teď si v Google Colab nebo lokálním editoru vytvořte Python skript:

        ```python
        import ollama

        # Ujistěte se, že model 'tinyllama' běží (příkazem 'ollama run tinyllama' v terminálu)
        # Nebo ho Ollama spustí automaticky

        # Zavoláme model s naším dotazem
        response = ollama.chat(
            model='tinyllama',
            messages=[
                {'role': 'user', 'content': 'Why is the sky blue? Explain it simply.'},
            ]
        )

        # Vytiskneme odpověď
        print(response['message']['content'])
        ```

    _Spusťte skript. Gratulujeme! Právě jste použili lokální jazykový model ve svém vlastním Python programu. Můžete si zkusit stáhnout i lepší modely jako `ollama run llama3`._

---

## Závěr: Budoucnost je ve vašich rukou

Dnes jsme nahlédli za oponu budoucnosti. Viděli jsme úžasný potenciál AGI, ale i vážná rizika, která musíme jako společnost řešit.

**Co jste se naučili:**

- Co je AGI a superinteligence.
- Jaké konkrétní dopady bude mít AI na práci, vzdělávání a medicínu.
- Jak si na vlastním počítači zprovoznit a naprogramovat lokální jazykový model.

**Vaše výzva:** Nebuďte jen pasivním divákem. Jste jedním z prvních lidí, kteří mají přístup k takto mocné technologii. Použijte Ollama model, který jste si nainstalovali, a zkuste s ním tento týden něco vytvořit. Nechte ho napsat email, vymyslet vtip, nebo shrnout článek. Zjistěte, co dokáže a kde má limity. Budoucnost AI nepíší jen vědci v laboratořích. Píšete ji i vy.
