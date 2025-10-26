export interface ModuleTestQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface ModuleTest {
  moduleNumber: number
  title: string
  description: string
  questions: ModuleTestQuestion[]
}

export const MODULE_TESTS: ModuleTest[] = [
  {
    moduleNumber: 1,
    title: 'Test modulu 1: Úvod do umělé inteligence',
    description:
      'Tento test ověří tvoje znalosti z prvních 10 kapitol. Otázky jsou náročnější než v kapitolách a vyžadují hlubší pochopení materiálu.',
    questions: [
      {
        id: 'm1_q1',
        question:
          'Představte si, že vytváříte AI systém pro rozpoznávání emocí z textu. Který typ umělé inteligence byste použili?',
        options: [
          'Expertní systém založený na pravidlech',
          'Strojové učení s trénovacími daty',
          'Symbolickou AI s logikou prvního řádu',
          'Genetické algoritmy',
        ],
        correctAnswer: 1,
        explanation:
          'Strojové učení je nejlepší volba pro rozpoznávání emocí, protože může se naučit ze vzorů v datech. Expertní systémy by vyžadovaly manuální definici všech pravidel, což je pro emoce velmi složité.',
        difficulty: 'medium',
      },
      {
        id: 'm1_q2',
        question:
          'Proč je Turingův test kritizován jako nedostatečný pro měření skutečné inteligence?',
        options: [
          'Je příliš jednoduchý na projití',
          'Měří pouze schopnost napodobovat lidské chování, ne skutečné porozumění',
          'Nevyžaduje matematické schopnosti',
          'Je zastaralý a nikdo ho už nepoužívá',
        ],
        correctAnswer: 1,
        explanation:
          'Hlavní kritika Turingova testu je, že měří pouze schopnost systému napodobovat lidské odpovědi, nikoliv skutečné porozumění nebo inteligenci. Systém může "projít" testem, aniž by skutečně chápal, o čem mluví (tzv. "Chinese Room" argument).',
        difficulty: 'hard',
      },
      {
        id: 'm1_q3',
        question:
          'Která z následujících AI aplikací vyžaduje "silnou AI" (AGI) na rozdíl od "slabé AI"?',
        options: [
          'Chatbot pro zákaznickou podporu',
          'Systém pro rozpoznávání obličejů',
          'Autonomní robot schopný samostatně se učit jakýkoliv úkol',
          'Systém pro doporučování filmů',
        ],
        correctAnswer: 2,
        explanation:
          'Silná AI (AGI - Artificial General Intelligence) by byla schopná učit se a vykonávat jakýkoliv úkol jako člověk. Všechny ostatní možnosti jsou příklady slabé AI zaměřené na konkrétní úkoly.',
        difficulty: 'medium',
      },
      {
        id: 'm1_q4',
        question: 'Jaký je klíčový rozdíl mezi supervizovaným a nesupervizovaným učením?',
        options: [
          'Supervizované učení je rychlejší',
          'Supervizované učení potřebuje označená trénovací data, nesupervizované ne',
          'Nesupervizované učení je přesnější',
          'Supervizované učení se používá pouze pro obrázky',
        ],
        correctAnswer: 1,
        explanation:
          'Klíčový rozdíl je v trénovacích datech. Supervizované učení potřebuje data s označenými správnými odpověďmi (labels), zatímco nesupervizované učení hledá vzory v neoznačených datech.',
        difficulty: 'easy',
      },
      {
        id: 'm1_q5',
        question: 'Proč je diverzita v trénovacích datech důležitá pro spravedlivou AI?',
        options: [
          'Zrychluje trénování modelu',
          'Snižuje velikost modelu',
          'Zabraňuje systematickým chybám a předsudkům vůči určitým skupinám',
          'Zlepšuje grafický výstup',
        ],
        correctAnswer: 2,
        explanation:
          'Diverzita v trénovacích datech je klíčová pro spravedlivou AI. Pokud model trénujeme pouze na omezeném vzorku populace, může se naučit systematické chyby a diskriminovat určité skupiny lidí.',
        difficulty: 'medium',
      },
      {
        id: 'm1_q6',
        question: 'Která historická událost je považována za "AI winter" (zimní období AI)?',
        options: [
          'Vynález počítače',
          'Období v 70. a 80. letech, kdy zájem a financování AI dramaticky poklesly',
          'Éra expertních systémů',
          'Vynález neuronových sítí',
        ],
        correctAnswer: 1,
        explanation:
          'AI winter označuje období v 70. a 80. letech 20. století, kdy nadšení a hype kolem AI nenaplnily očekávání, což vedlo k dramatickému poklesu financování a zájmu o výzkum AI.',
        difficulty: 'easy',
      },
      {
        id: 'm1_q7',
        question: 'Co je "feature" (příznak) v kontextu strojového učení?',
        options: [
          'Chyba v kódu',
          'Měřitelná vlastnost nebo charakteristika vstupních dat',
          'Výstup modelu',
          'Typ neuronové sítě',
        ],
        correctAnswer: 1,
        explanation:
          'Feature (příznak) je měřitelná vlastnost nebo charakteristika vstupních dat, kterou model používá k učení. Např. pro rozpoznávání psů mohou být features velikost, barva, tvar uší atd.',
        difficulty: 'easy',
      },
      {
        id: 'm1_q8',
        question: 'Jaký je hlavní důvod, proč deep learning zažil boom v posledních letech?',
        options: [
          'Objevení nových algoritmů, které dříve neexistovaly',
          'Dostupnost obrovských objemů dat a výpočetního výkonu (GPU)',
          'Snížení ceny paměti RAM',
          'Popularita sociálních sítí',
        ],
        correctAnswer: 1,
        explanation:
          'Deep learning potřebuje obrovské množství dat a výpočetního výkonu. Teprve s příchodem velkých datasetů a dostupných GPU se deep learning stal prakticky použitelný a začal přinášet průlomové výsledky.',
        difficulty: 'medium',
      },
      {
        id: 'm1_q9',
        question: 'Která z následujících aplikací AI představuje nejvážnější etické dilema?',
        options: [
          'AI pro automatické titulky ve videích',
          'AI pro doporučování hudby',
          'AI pro predikci recidivy v kriminálním systému',
          'AI pro překládání jazyků',
        ],
        correctAnswer: 2,
        explanation:
          'AI pro predikci recidivy představuje vážné etické dilema, protože může ovlivnit životy lidí (délku trestu, podmínky) a může obsahovat systematické předsudky. Chyby v takovém systému mají daleko závažnější důsledky než u doporučování hudby.',
        difficulty: 'hard',
      },
      {
        id: 'm1_q10',
        question: 'Co znamená "explainability" (vysvětlitelnost) v kontextu AI?',
        options: [
          'Schopnost AI mluvit lidským hlasem',
          'Možnost pochopit a vysvětlit, proč AI udělala určité rozhodnutí',
          'Rychlost zpracování dat',
          'Přesnost modelu',
        ],
        correctAnswer: 1,
        explanation:
          'Explainability (vysvětlitelnost) je schopnost pochopit a vysvětlit, jak a proč AI systém dospěl k určitému rozhodnutí. To je kritické zejména v oblastech jako zdravotnictví nebo justice, kde potřebujeme vědět, proč AI doporučila určitý postup.',
        difficulty: 'medium',
      },
    ],
  },
  // Přidáme testy pro další moduly později
]

export function getModuleTest(moduleNumber: number): ModuleTest | undefined {
  return MODULE_TESTS.find(test => test.moduleNumber === moduleNumber)
}

export function calculateTestScore(
  correctAnswers: number,
  totalQuestions: number,
  timeElapsed: number
): {
  score: number
  percentage: number
  timeBonus: number
  totalXP: number
  stars: number
} {
  const percentage = (correctAnswers / totalQuestions) * 100
  const baseXP = correctAnswers * 50 // 50 XP per correct answer

  // Time bonus: if completed in less than 5 minutes, get bonus XP
  const fiveMinutes = 5 * 60
  let timeBonus = 0
  if (timeElapsed < fiveMinutes) {
    timeBonus = Math.floor(((fiveMinutes - timeElapsed) / fiveMinutes) * 200)
  }

  const totalXP = baseXP + timeBonus

  // Stars: 1 = 50-69%, 2 = 70-89%, 3 = 90-100%
  let stars = 0
  if (percentage >= 50) stars = 1
  if (percentage >= 70) stars = 2
  if (percentage >= 90) stars = 3

  return {
    score: correctAnswers,
    percentage,
    timeBonus,
    totalXP,
    stars,
  }
}
