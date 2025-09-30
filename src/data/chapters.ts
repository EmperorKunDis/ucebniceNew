export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  hours: string; // např. "1" nebo "12-13"
  textFile: string;
  lectureFile: string;
  videoFile?: string;
  notebookLMUrl?: string;
  colabNotebook?: string;
  aiBasicsHours?: string[]; // mapování na původní hodiny AI Základy
}

export const chapters: Chapter[] = [
  {
    id: "01",
    number: 1,
    title: "Co je umělá inteligence?",
    description: "Úvod do umělé inteligence, základní pojmy a definice",
    hours: "1",
    textFile: "text-k-hodine-01.md",
    lectureFile: "Kapitola01_text-k-hodine-01.md",
    videoFile: "Hodina1.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/c536c80b-b48a-47ef-b291-8c443389b787",
    colabNotebook: "kapitola_01_úvod_do_terminálu_a_příkazové_řádky.ipynb",
    aiBasicsHours: ["1"]
  },
  {
    id: "02",
    number: 2,
    title: "Historie AI",
    description: "Historický vývoj umělé inteligence a klíčové milníky",
    hours: "2",
    textFile: "text-k-hodine-02.md",
    lectureFile: "Kapitola02_text-k-hodine-02.md",
    videoFile: "Hodina2.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/678e7208-8a79-486b-a747-7300fe2aee9d",
    colabNotebook: "kapitola_02_instalace_vývojových_nástrojů.ipynb",
    aiBasicsHours: ["2"]
  },
  {
    id: "03",
    number: 3,
    title: "Budoucnost AI",
    description: "Scénáře budoucího vývoje AI a její dopad na společnost",
    hours: "3",
    textFile: "text-k-hodine-03.md",
    lectureFile: "Kapitola03_text-k-hodine-03.md",
    videoFile: "Hodina3.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/a1f6282b-c815-4ab5-9986-9489dee17379",
    colabNotebook: "kapitola_03_git_a_verzování_kódu.ipynb",
    aiBasicsHours: ["3"]
  },
  {
    id: "04",
    number: 4,
    title: "Příbuzné obory",
    description: "AI vs. datová věda, statistika a kognitivní věda",
    hours: "4",
    textFile: "text-k-hodine-04.md",
    lectureFile: "Kapitola04_text-k-hodine-04.md",
    videoFile: "Hodina4.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/d1fe5ac0-b977-433a-9da3-c674d12e26b2",
    colabNotebook: "kapitola_04_python_instalace_a_virtuální_prostředí.ipynb",
    aiBasicsHours: ["4"]
  },
  {
    id: "05",
    number: 5,
    title: "Lidská vs. strojová inteligence",
    description: "Porovnání kognitivních procesů člověka a stroje",
    hours: "5",
    textFile: "text-k-hodine-05.md",
    lectureFile: "Kapitola05_text-k-hodine-05.md",
    videoFile: "Hodina5.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/18ee9a9f-7493-4bd3-9429-0866091d47c5",
    colabNotebook: "kapitola_05_základy_pythonu_i_datové_typy_a_řízení_toku.ipynb",
    aiBasicsHours: ["5"]
  },
  {
    id: "06",
    number: 6,
    title: "Etika a filozofie AI",
    description: "Etické otázky, zodpovědnost a filozofické aspekty AI",
    hours: "6",
    textFile: "text-k-hodine-06.md",
    lectureFile: "Kapitola06_text-k-hodine-06.md",
    videoFile: "Hodina6.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/af80cb18-a553-4df1-9dc4-23b81e735721",
    colabNotebook: "kapitola_06_základy_pythonu_ii_kolekce_dat.ipynb",
    aiBasicsHours: ["6"]
  },
  {
    id: "07",
    number: 7,
    title: "AI v každodenním životě",
    description: "Praktické aplikace AI ve vyhledávačích, dopravě a medicíně",
    hours: "7",
    textFile: "text-k-hodine-07.md",
    lectureFile: "Kapitola07_text-k-hodine-07.md",
    videoFile: "Hodina7.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/55dc9ce2-0be5-4961-ab56-12796d23952f",
    colabNotebook: "kapitola_07_funkce_a_moduly.ipynb",
    aiBasicsHours: ["7"]
  },
  {
    id: "08",
    number: 8,
    title: "AI ve hrách",
    description: "Tradiční herní AI a moderní přístupy pomocí učení",
    hours: "8",
    textFile: "text-k-hodine-08.md",
    lectureFile: "Kapitola08_text-k-hodine-08.md",
    videoFile: "Hodina8.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/c3289baf-91ca-43db-acdd-62ce686453a7",
    colabNotebook: "kapitola_08_práce_se_soubory_a_výjimky.ipynb",
    aiBasicsHours: ["8"]
  },
  {
    id: "09",
    number: 9,
    title: "Mini projekt",
    description: "Návrh a implementace jednoduchého AI projektu",
    hours: "9",
    textFile: "text-k-hodine-09.md",
    lectureFile: "Kapitola09_text-k-hodine-09.md",
    videoFile: undefined,
    notebookLMUrl: undefined,
    colabNotebook: "kapitola_09_debugging_a_testování_základů.ipynb",
    aiBasicsHours: ["9"]
  },
  {
    id: "10",
    number: 10,
    title: "Shrnutí a opakování",
    description: "Opakování základních pojmů a příprava na další modul",
    hours: "10",
    textFile: "text-k-hodine-10.md",
    lectureFile: "Kapitola10_text-k-hodine-10.md",
    videoFile: undefined,
    notebookLMUrl: undefined,
    colabNotebook: "kapitola_10_projekt_1_cli_todo_aplikace.ipynb",
    aiBasicsHours: ["10"]
  },
  {
    id: "11",
    number: 11,
    title: "Prostor stavů",
    description: "Modelování problémů jako grafu stavů",
    hours: "11",
    textFile: "text-k-hodine-11.md",
    lectureFile: "Kapitola11_text-k-hodine-11.md",
    videoFile: "Hodina11.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/f8e0946d-6b93-4c04-abbf-96b281158e03",
    colabNotebook: "kapitola_11_objektově_orientované_programování_i.ipynb",
    aiBasicsHours: ["11"]
  },
  {
    id: "12",
    number: 12,
    title: "Algoritmy pro hledání",
    description: "BFS, DFS a jejich použití",
    hours: "12-13",
    textFile: "text-k-hodine-12_13.md",
    lectureFile: "Kapitola12_text-k-hodine-12_13.md",
    videoFile: "Hodiny12_13.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/5227f8b9-da1b-4c96-a02e-fbe757ad79ed",
    colabNotebook: "kapitola_12_objektově_orientované_programování_ii.ipynb",
    aiBasicsHours: ["12", "13"]
  },
  {
    id: "13",
    number: 13,
    title: "Heuristiky a A* algoritmus",
    description: "Efektivní hledání pomocí heuristik",
    hours: "14-15",
    textFile: "text-k-hodine-14_15.md",
    lectureFile: "Kapitola13_text-k-hodine-14_15.md",
    videoFile: "Hodiny14_15.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/be1cd0eb-2729-4263-b4dd-d3ce650ee7dc",
    colabNotebook: "kapitola_13_práce_s_api_a_http_requests.ipynb",
    aiBasicsHours: ["14", "15"]
  },
  {
    id: "14",
    number: 14,
    title: "Labyrint a AI",
    description: "Řešení bludišť pomocí AI algoritmů",
    hours: "16-17",
    textFile: "text-k-hodine-16_17.md",
    lectureFile: "Kapitola14_text-k-hodine-16_17.md",
    videoFile: "Hodina16_17.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/7cb8adb2-d13f-4680-8665-ab8e2596c983",
    colabNotebook: "kapitola_14_web_scraping_základy.ipynb",
    aiBasicsHours: ["16", "17"]
  },
  {
    id: "15",
    number: 15,
    title: "Projekt - Řešič problémů",
    description: "Tvorba programu pro řešení konkrétního problému",
    hours: "18-20",
    textFile: "text-k-hodine-18_20.md",
    lectureFile: "Kapitola15_text-k-hodine-18_20.md",
    videoFile: "Hodina18-20.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/b61cb4c1-7e91-476d-93a5-b793d472c4db",
    colabNotebook: "kapitola_15_databáze_sql_základy.ipynb",
    aiBasicsHours: ["18", "19", "20"]
  },
  {
    id: "16",
    number: 16,
    title: "Úvod do pravděpodobnosti",
    description: "Základní pojmy a zákony pravděpodobnosti",
    hours: "21-22",
    textFile: "text-k-hodine-21_22.md",
    lectureFile: "Kapitola16_text-k-hodine-21_22.md",
    videoFile: "Hodina21_22.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/91e2a8f4-1f7a-4b4b-a2dd-1204ac8e20ef",
    colabNotebook: "kapitola_16_orm_sqlalchemy.ipynb",
    aiBasicsHours: ["21", "22"]
  },
  {
    id: "17",
    number: 17,
    title: "Neurčitost a predikce",
    description: "Práce s nejistými daty a predikční modely",
    hours: "23",
    textFile: "text-k-hodine-23_.md",
    lectureFile: "Kapitola17_text-k-hodine-23_.md",
    videoFile: "Hodina23.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/7ee758ad-66a4-4afe-8125-768dd6f31e4c",
    colabNotebook: "kapitola_17_asynchronní_programování.ipynb",
    aiBasicsHours: ["23"]
  },
  {
    id: "18",
    number: 18,
    title: "Bayesova věta",
    description: "Bayesovo uvažování a aktualizace přesvědčení",
    hours: "24-25",
    textFile: "text-k-hodine-24_25.md",
    lectureFile: "Kapitola18_text-k-hodine-24_25.md",
    videoFile: "Hodina24_25.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/3d1c9ea6-c6ec-47aa-8524-22b936f41ff3",
    colabNotebook: "kapitola_18_rest_api_vytvoření_s_fastapi.ipynb",
    aiBasicsHours: ["24", "25"]
  },
  {
    id: "19",
    number: 19,
    title: "Naivní Bayesův klasifikátor",
    description: "Implementace spamového filtru a klasifikace textu",
    hours: "26-27",
    textFile: "text-k-hodine-26_27.md",
    lectureFile: "Kapitola19_text-k-hodine-26_27.md",
    videoFile: "Hodina26_27.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/8bee985b-3d02-40e5-913a-920437df100e",
    colabNotebook: "kapitola_19_autentizace_a_bezpečnost.ipynb",
    aiBasicsHours: ["26", "27"]
  },
  {
    id: "20",
    number: 20,
    title: "Klasifikace v praxi",
    description: "Předzpracování dat a trénování klasifikačního modelu",
    hours: "28-30",
    textFile: "text-k-hodine-28-30.md",
    lectureFile: "Kapitola20_text-k-hodine-28-30.md",
    videoFile: "Hodina28_30.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/f9f55cc8-425d-4564-a35b-c07fc6777184",
    colabNotebook: "kapitola_20_projekt_2_rest_api_pro_blog.ipynb",
    aiBasicsHours: ["28", "29", "30"]
  },
  {
    id: "21",
    number: 21,
    title: "Úvod do strojového učení",
    description: "Učení s učitelem, bez učitele a posilované učení",
    hours: "31",
    textFile: "text-k-hodine-31.md",
    lectureFile: "Kapitola21_text-k-hodine-31.md",
    videoFile: "Hodina31.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/42837336-d7ae-47d3-b6b0-73e14c15ce63",
    colabNotebook: "kapitola_21_docker_základy.ipynb",
    aiBasicsHours: ["31"]
  },
  {
    id: "22",
    number: 22,
    title: "Zpracování dat",
    description: "Čištění dat a příprava pro strojové učení",
    hours: "32",
    textFile: "text-k-hodine-32.md",
    lectureFile: "Kapitola22_text-k-hodine-32.md",
    videoFile: "Hodina32.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/ef3f6ee5-2bd6-44f4-9703-94efaad5cbe9",
    colabNotebook: "kapitola_22_docker_compose.ipynb",
    aiBasicsHours: ["32"]
  },
  {
    id: "23",
    number: 23,
    title: "Formáty dat",
    description: "CSV, JSON, XML a práce s různými formáty",
    hours: "33",
    textFile: "text-k-hodine-33.md",
    lectureFile: "Kapitola23_text-k-hodine-33.md",
    videoFile: "Hodina33.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/c4656e6e-4bce-4c2f-8f82-fcf533edb275",
    colabNotebook: "kapitola_23_cicd_pipeline.ipynb",
    aiBasicsHours: ["33"]
  },
  {
    id: "24",
    number: 24,
    title: "Regrese",
    description: "Lineární regrese a predikce spojitých hodnot",
    hours: "34-35",
    textFile: "text-k-hodine-34_35.md",
    lectureFile: "Kapitola24_text-k-hodine-34_35.md",
    videoFile: "Hodina34_35.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/3cd8dad2-fd83-47ea-ae5b-2b14caf68526",
    colabNotebook: "kapitola_24_cloud_deployment_základy.ipynb",
    aiBasicsHours: ["34", "35"]
  },
  {
    id: "25",
    number: 25,
    title: "KNN klasifikace",
    description: "K-nejbližších sousedů algoritmus",
    hours: "36-37",
    textFile: "text-k-hodine-36_37.md",
    lectureFile: "Kapitola25_text-k-hodine-36_37.md",
    videoFile: "Hodina36_37.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/1cecef9c-a7b0-42f1-874d-335ae5015466",
    colabNotebook: "kapitola_25_mikroslužby_architektura.ipynb",
    aiBasicsHours: ["36", "37"]
  },
  {
    id: "26",
    number: 26,
    title: "Vlastní model",
    description: "Tvorba a vyhodnocení vlastního ML modelu",
    hours: "38-39",
    textFile: "text-k-hodine-38_39.md",
    lectureFile: "Kapitola26_text-k-hodine-38_39.md",
    videoFile: "Hodina38_39.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/f14f1423-d1ab-4cab-bb17-155d7fee8684",
    colabNotebook: "kapitola_26_performance_optimalizace.ipynb",
    aiBasicsHours: ["38", "39"]
  },
  {
    id: "27",
    number: 27,
    title: "Vizualizace dat",
    description: "Grafické zobrazení dat a výsledků modelů",
    hours: "40",
    textFile: "text-k-hodine-40.md",
    lectureFile: "Kapitola27_text-k-hodine-40.md",
    videoFile: "Hodina40.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/06890184-ad8c-417b-aa86-a1709747cae8",
    colabNotebook: "kapitola_27_pokročilé_testování.ipynb",
    aiBasicsHours: ["40"]
  },
  {
    id: "28",
    number: 28,
    title: "Úvod do neuronových sítí",
    description: "Biologická inspirace a základní principy",
    hours: "41-42",
    textFile: "text-k-hodine-41_42.md",
    lectureFile: "Kapitola28_text-k-hodine-41_42.md",
    videoFile: "Hodina41_42.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/484e72de-81d9-47f1-a783-d8786b58ac38",
    colabNotebook: "kapitola_28_design_patterns_v_pythonu.ipynb",
    aiBasicsHours: ["41", "42"]
  },
  {
    id: "29",
    number: 29,
    title: "Perceptron a architektura NN",
    description: "Základní model neuronu a struktura sítí",
    hours: "43",
    textFile: "text-k-hodine-43.md",
    lectureFile: "Kapitola29_text-k-hodine-43.md",
    videoFile: "Hodina43.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/bbc96e23-396f-4b1e-af67-00c55ba9c50b",
    colabNotebook: "kapitola_29_graphql_api.ipynb",
    aiBasicsHours: ["43"]
  },
  {
    id: "30",
    number: 30,
    title: "Funkce aktivace",
    description: "Sigmoid, ReLU, Tanh a jejich použití",
    hours: "44-45",
    textFile: "text-k-hodine-44_45.md",
    lectureFile: "Kapitola30_text-k-hodine-44_45.md",
    videoFile: "Hodina44_45.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/41089af2-d31e-49e9-86f1-6bf615a74d7a",
    colabNotebook: "kapitola_30_projekt_3_mikroslužbová_e_commerce_aplikace.ipynb",
    aiBasicsHours: ["44", "45"]
  },
  {
    id: "31",
    number: 31,
    title: "Zpětná propagace",
    description: "Algoritmus učení neuronových sítí",
    hours: "46-47",
    textFile: "text-k-hodine-46_47.md",
    lectureFile: "Kapitola31_text-k-hodine-46_47.md",
    videoFile: "Hodina46_47.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/06e36365-a01a-4fd5-983f-5b3dd4aa8f58",
    colabNotebook: "kapitola_31_úvod_do_llm_a_ollama.ipynb",
    aiBasicsHours: ["46", "47"]
  },
  {
    id: "32",
    number: 32,
    title: "Dropout",
    description: "Technika prevence přeučení",
    hours: "48",
    textFile: "text-k-hodine-48.md",
    lectureFile: "Kapitola32_text-k-hodine-48.md",
    videoFile: "Hodina48.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/bb18bfaf-3e26-4e88-97f7-e4e865ca60ff",
    colabNotebook: "kapitola_32_ollama_api_integrace.ipynb",
    aiBasicsHours: ["48"]
  },
  {
    id: "33",
    number: 33,
    title: "Konvoluce",
    description: "Konvoluční neuronové sítě pro zpracování obrazu",
    hours: "49",
    textFile: "text-k-hodine-49.md",
    lectureFile: "Kapitola33_text-k-hodine-49.md",
    videoFile: "Hodina49.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/a7a1111d-b3d0-4124-bdc6-b3c1b9a6cbb8",
    colabNotebook: "kapitola_33_langchain_základy.ipynb",
    aiBasicsHours: ["49"]
  },
  {
    id: "34",
    number: 34,
    title: "Teachable Machine",
    description: "Trénování modelů bez programování",
    hours: "50-51",
    textFile: "text-k-hodine-50_51.md",
    lectureFile: "Kapitola34_text-k-hodine-50_51.md",
    videoFile: "Hodina50_51.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/f08304ef-d7ad-454a-87cb-9730e4a9445c",
    colabNotebook: "kapitola_34_langgraph_úvod.ipynb",
    aiBasicsHours: ["50", "51"]
  },
  {
    id: "35",
    number: 35,
    title: "Projekt - Neuronová síť",
    description: "Návrh a implementace vlastní neuronové sítě",
    hours: "52-54",
    textFile: "text-k-hodine-52_54.md",
    lectureFile: "Kapitola35_text-k-hodine-52_54.md",
    videoFile: "Hodina52_54.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/54b7117c-d20f-4bd5-bc27-36a69a212b68",
    colabNotebook: "kapitola_35_rag_retrieval_augmented_generation.ipynb",
    aiBasicsHours: ["52", "53", "54"]
  },
  {
    id: "36",
    number: 36,
    title: "Rizika AI",
    description: "Zneužití dat, autonomní zbraně a sociální nerovnosti",
    hours: "55",
    textFile: "text-k-hodine-55.md",
    lectureFile: "Kapitola36_text-k-hodine-55.md",
    videoFile: "Hodina55.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/1328fbb8-7b0f-4161-9de9-93d3b3ad4fdb",
    colabNotebook: "kapitola_36_agents_a_tools.ipynb",
    aiBasicsHours: ["55"]
  },
  {
    id: "37",
    number: 37,
    title: "AI a trh práce",
    description: "Automatizace, nové profese a přeškolování",
    hours: "56",
    textFile: "text-k-hodine-56.md",
    lectureFile: "Kapitola37_text-k-hodine-56.md",
    videoFile: "Hodina56.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/a6430025-e9b1-4532-b411-b0c3e2632112",
    colabNotebook: "kapitola_37_prompt_engineering_pokročilé.ipynb",
    aiBasicsHours: ["56"]
  },
  {
    id: "38",
    number: 38,
    title: "Etika a odpovědnost",
    description: "Zodpovědnost za chyby AI a transparentnost algoritmů",
    hours: "57",
    textFile: "text-k-hodine-57.md",
    lectureFile: "Kapitola38_text-k-hodine-57.md",
    videoFile: "Hodina57.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/a18b2336-70eb-4cac-9676-e4f2d256308d",
    colabNotebook: "kapitola_38_llm_aplikace_produkční_nasazení.ipynb",
    aiBasicsHours: ["57"]
  },
  {
    id: "39",
    number: 39,
    title: "Budoucnost AI",
    description: "Vize a diskuze o budoucnosti umělé inteligence",
    hours: "58-59",
    textFile: "text-k-hodine-58_59.md",
    lectureFile: "Kapitola39_text-k-hodine-58_59.md",
    videoFile: "Hodina58_59.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/39b7e46d-5017-474a-8120-3c4142fa596b",
    colabNotebook: "kapitola_39_evaluace_a_testování_llm_aplikací.ipynb",
    aiBasicsHours: ["58", "59"]
  },
  {
    id: "40",
    number: 40,
    title: "Závěr a reflexe",
    description: "Shrnutí kurzu a další kroky",
    hours: "60",
    textFile: "text-k-hodine-60.md",
    lectureFile: "Kapitola40_text-k-hodine-60.md",
    videoFile: "Hodina60.mp4",
    notebookLMUrl: "https://notebooklm.google.com/notebook/e8e46a5c-74b4-427f-8b40-5826f92d3055",
    colabNotebook: "kapitola_40_finální_projekt_ai_asistent_s_langgraph.ipynb",
    aiBasicsHours: ["60"]
  }
];

// Pomocné funkce
export function getChapterById(id: string): Chapter | undefined {
  return chapters.find(chapter => chapter.id === id);
}

export function getNextChapter(currentId: string): Chapter | null {
  const currentIndex = chapters.findIndex(ch => ch.id === currentId);
  if (currentIndex === -1 || currentIndex === chapters.length - 1) return null;
  return chapters[currentIndex + 1] ?? null;
}

export function getPreviousChapter(currentId: string): Chapter | null {
  const currentIndex = chapters.findIndex(ch => ch.id === currentId);
  if (currentIndex <= 0) return null;
  return chapters[currentIndex - 1] ?? null;
}

// Cesty k souborům
export const PATHS = {
  texts: '/texty/',
  lectures: '/prednasky/',
  videos: '/videa/',
  colabNotebooks: '/colab_notebooks/'
};