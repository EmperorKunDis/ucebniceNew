export interface Question {
  id: string
  question: string
  options: string[]
  correctAnswer: number // Index of the correct option
  explanation: string
  xpReward: number
}

export interface ChapterQuestions {
  chapterId: string
  questions: Question[]
}

export const CHAPTER_QUESTIONS: ChapterQuestions[] = [
  {
    chapterId: '01',
    questions: [
      {
        id: 'q1',
        question: 'Co je terminál?',
        options: [
          'Program pro úpravu textu',
          'Rozhraní pro zadávání příkazů pomocí textu',
          'Webový prohlížeč',
          'Grafický editor',
        ],
        correctAnswer: 1,
        explanation:
          'Terminál je textové rozhraní, které umožňuje komunikovat s počítačem pomocí příkazů.',
        xpReward: 10,
      },
      {
        id: 'q2',
        question: 'Jaký příkaz použijete pro zobrazení aktuálního adresáře?',
        options: ['ls', 'cd', 'pwd', 'mkdir'],
        correctAnswer: 2,
        explanation: 'Příkaz pwd (print working directory) vypíše cestu k aktuálnímu adresáři.',
        xpReward: 10,
      },
      {
        id: 'q3',
        question: 'Co dělá příkaz "cd .."?',
        options: [
          'Vytvoří nový adresář',
          'Přesune se o adresář výše',
          'Vypíše obsah adresáře',
          'Smaže adresář',
        ],
        correctAnswer: 1,
        explanation: 'Příkaz "cd .." se přesune o jednu úroveň výše v adresářové struktuře.',
        xpReward: 10,
      },
    ],
  },
  {
    chapterId: '02',
    questions: [
      {
        id: 'q1',
        question: 'Co je to IDE?',
        options: [
          'Programovací jazyk',
          'Integrované vývojové prostředí',
          'Databázový systém',
          'Operační systém',
        ],
        correctAnswer: 1,
        explanation:
          'IDE (Integrated Development Environment) je vývojové prostředí, které spojuje editor kódu, debugger a další nástroje.',
        xpReward: 10,
      },
      {
        id: 'q2',
        question: 'Který z následujících je populární IDE pro Python?',
        options: ['Notepad', 'MS Word', 'VS Code', 'Excel'],
        correctAnswer: 2,
        explanation:
          'Visual Studio Code (VS Code) je velmi populární editor/IDE pro Python a další jazyky.',
        xpReward: 10,
      },
      {
        id: 'q3',
        question: 'K čemu slouží rozšíření (extensions) v VS Code?',
        options: [
          'Zvětšují velikost obrazovky',
          'Přidávají nové funkce a podporu pro různé jazyky',
          'Šetří energii baterie',
          'Zrychlují internet',
        ],
        correctAnswer: 1,
        explanation:
          'Extensions v VS Code přidávají další funkce, podporu pro jazyky, témata a nástroje.',
        xpReward: 10,
      },
    ],
  },
  {
    chapterId: '03',
    questions: [
      {
        id: 'q1',
        question: 'Co je to Git?',
        options: ['Programovací jazyk', 'Verzovací systém', 'Webový prohlížeč', 'Databáze'],
        correctAnswer: 1,
        explanation: 'Git je verzovací systém, který sleduje změny v kódu a umožňuje spolupráci.',
        xpReward: 10,
      },
      {
        id: 'q2',
        question: 'Jaký příkaz použijete pro vytvoření nového Git repozitáře?',
        options: ['git start', 'git init', 'git create', 'git new'],
        correctAnswer: 1,
        explanation: 'Příkaz "git init" inicializuje nový Git repozitář v aktuálním adresáři.',
        xpReward: 10,
      },
      {
        id: 'q3',
        question: 'Co znamená "commit" v Gitu?',
        options: [
          'Smazání souborů',
          'Uložení změn do historie',
          'Stažení kódu',
          'Vytvoření nového souboru',
        ],
        correctAnswer: 1,
        explanation: 'Commit ukládá změny do historie Git repozitáře se zprávou popisující změny.',
        xpReward: 10,
      },
    ],
  },
  {
    chapterId: '04',
    questions: [
      {
        id: 'q1',
        question: 'Co je virtuální prostředí v Pythonu?',
        options: [
          'Virtuální realita pro programátory',
          'Izolované prostředí pro Python projekty s vlastními závislostmi',
          'Online editor kódu',
          'Grafické rozhraní',
        ],
        correctAnswer: 1,
        explanation:
          'Virtuální prostředí izoluje Python projekt a jeho závislosti od ostatních projektů.',
        xpReward: 10,
      },
      {
        id: 'q2',
        question: 'Jaký příkaz vytvoří virtuální prostředí?',
        options: ['pip install venv', 'python -m venv myenv', 'create venv', 'new environment'],
        correctAnswer: 1,
        explanation:
          'Příkaz "python -m venv myenv" vytvoří nové virtuální prostředí s názvem myenv.',
        xpReward: 10,
      },
      {
        id: 'q3',
        question: 'K čemu slouží pip?',
        options: [
          'Kompilace Pythonu',
          'Instalace Python balíčků',
          'Debugování kódu',
          'Vytváření grafů',
        ],
        correctAnswer: 1,
        explanation:
          'pip je správce balíčků pro Python, který umožňuje instalovat a spravovat knihovny.',
        xpReward: 10,
      },
    ],
  },
  {
    chapterId: '05',
    questions: [
      {
        id: 'q1',
        question: 'Který datový typ není základní v Pythonu?',
        options: ['int', 'float', 'string', 'array'],
        correctAnswer: 3,
        explanation: 'V Pythonu není základní typ "array", ale list. Array je v modulu numpy.',
        xpReward: 10,
      },
      {
        id: 'q2',
        question: 'Co vrátí výraz: type(3.14)?',
        options: ['int', 'float', 'str', 'decimal'],
        correctAnswer: 1,
        explanation: '3.14 je číslo s desetinnou čárkou, tedy typ float.',
        xpReward: 10,
      },
      {
        id: 'q3',
        question: 'Která struktura se používá pro podmíněné větvení?',
        options: ['for', 'while', 'if', 'def'],
        correctAnswer: 2,
        explanation: 'Klíčové slovo "if" se používá pro podmíněné větvení kódu.',
        xpReward: 10,
      },
    ],
  },
]

// Helper function to get questions for a chapter
export function getChapterQuestions(chapterId: string): Question[] {
  const chapter = CHAPTER_QUESTIONS.find(ch => ch.chapterId === chapterId)
  return chapter?.questions || []
}

// Helper function to calculate total XP for all questions in a chapter
export function getChapterQuestionsXP(chapterId: string): number {
  const questions = getChapterQuestions(chapterId)
  return questions.reduce((total, q) => total + q.xpReward, 0)
}

// Helper function to check if answer is correct
export function checkAnswer(
  chapterId: string,
  questionId: string,
  answerIndex: number
): { correct: boolean; explanation: string; xpReward: number } {
  const questions = getChapterQuestions(chapterId)
  const question = questions.find(q => q.id === questionId)

  if (!question) {
    return { correct: false, explanation: 'Otázka nenalezena', xpReward: 0 }
  }

  const correct = question.correctAnswer === answerIndex

  return {
    correct,
    explanation: question.explanation,
    xpReward: correct ? question.xpReward : 0,
  }
}
