/**
 * Seed Advanced Chapters (41-50) - LLM Course
 */

import { prisma } from '../src/lib/prisma'

const ADVANCED_CHAPTERS = [
  {
    chapterNumber: 41,
    title: 'Prompt Engineering Fundamentals',
    description: `Naučíš se jak efektivně komunikovat s LLM modely. Pochopíš strukturu promptů, 
    zero-shot vs few-shot learning, chain-of-thought prompting a jak psát systémové prompty.`,
    estimatedHours: 5,
    projectDescription:
      'Vytvořit sadu optimalizovaných promptů pro různé úlohy (sumarizace, extrakce, generování).',
  },
  {
    chapterNumber: 42,
    title: 'Embeddings a Vektorové Databáze',
    description: `Pochopíš co jsou embeddings a jak reprezentují význam textu. Naučíš se pracovat 
    s vektorovými databázemi jako Pinecone, Chroma a Weaviate. Implementuješ similarity search.`,
    estimatedHours: 6,
    projectDescription: 'Vytvořit semantic search engine pro prohledávání vlastních dokumentů.',
  },
  {
    chapterNumber: 43,
    title: 'RAG (Retrieval-Augmented Generation)',
    description: `Propojíš embeddings s LLM pro vytvoření systému který odpovídá na otázky 
    z vlastních dat. Naučíš se chunking strategie, retrieval techniky a reranking.`,
    estimatedHours: 6,
    projectDescription: 'Q&A systém nad vlastní knowledge base (např. dokumentace firmy).',
  },
  {
    chapterNumber: 44,
    title: 'Fine-tuning Modelů',
    description: `Kdy a proč fine-tunovat místo RAG? Naučíš se připravit data, použít 
    techniky jako LoRA/QLoRA pro efektivní fine-tuning a evaluovat výsledky.`,
    estimatedHours: 5,
    projectDescription: 'Fine-tuning modelu na specifickou doménu (např. právní texty, kód).',
  },
  {
    chapterNumber: 45,
    title: 'Agenti a Tool-Use',
    description: `LLM jako mozek autonomního agenta. Naučíš se function calling, ReAct pattern, 
    plánování a jak vytvořit multi-agent systémy.`,
    estimatedHours: 6,
    projectDescription: 'AI asistent který používá externí nástroje (web search, kalkulačka, API).',
  },
  {
    chapterNumber: 46,
    title: 'Multi-modal LLM',
    description: `Práce s modely které rozumí více než jen textu - obrázky (GPT-4V, LLaVA), 
    audio (Whisper), video. Implementace multi-modal aplikací.`,
    estimatedHours: 5,
    projectDescription: 'Aplikace která analyzuje obrázky a odpovídá na otázky o nich.',
  },
  {
    chapterNumber: 47,
    title: 'LLM v Produkci',
    description: `Jak nasadit LLM aplikaci do produkce. API design, caching, rate limiting, 
    fallbacks, monitoring, optimalizace nákladů a latence.`,
    estimatedHours: 5,
    projectDescription: 'Production-ready API wrapper s cachingem, rate limitem a monitoringem.',
  },
  {
    chapterNumber: 48,
    title: 'Evaluace a Benchmarking',
    description: `Jak měřit kvalitu LLM? Metriky (BLEU, ROUGE, perplexity), human evaluation, 
    A/B testing, regression testing pro prompt changes.`,
    estimatedHours: 4,
    projectDescription: 'Evaluační framework pro měření kvality vlastního LLM systému.',
  },
  {
    chapterNumber: 49,
    title: 'Safety a Alignment',
    description: `Bezpečnost LLM aplikací. Prompt injection, jailbreaks, guardrails, 
    content filtering, RLHF, constitutional AI.`,
    estimatedHours: 4,
    projectDescription: 'Implementace bezpečnostních vrstev pro chatbot (guardrails, filtering).',
  },
  {
    chapterNumber: 50,
    title: 'Vlastní AI Asistent od A do Z',
    description: `Závěrečný projekt - kompletní AI asistent který kombinuje všechny 
    naučené techniky: RAG, tools, multi-modal, production deployment.`,
    estimatedHours: 8,
    projectDescription: 'Plně funkční AI asistent s vlastní knowledge base, nástroji a webovým UI.',
  },
]

async function seedAdvancedChapters() {
  console.log('🚀 Seeding advanced chapters (41-50)...')

  for (const chapter of ADVANCED_CHAPTERS) {
    await prisma.advancedChapter.upsert({
      where: { chapterNumber: chapter.chapterNumber },
      update: {
        title: chapter.title,
        description: chapter.description,
        estimatedHours: chapter.estimatedHours,
        projectDescription: chapter.projectDescription,
        content: {
          sections: [
            { type: 'intro', title: 'Úvod' },
            { type: 'theory', title: 'Teorie' },
            { type: 'practice', title: 'Praktická část' },
            { type: 'project', title: 'Projekt' },
          ],
          // Full content will be added later
        },
        prerequisites: chapter.chapterNumber === 41 ? [] : [chapter.chapterNumber - 1],
      },
      create: {
        chapterNumber: chapter.chapterNumber,
        title: chapter.title,
        description: chapter.description,
        estimatedHours: chapter.estimatedHours,
        projectDescription: chapter.projectDescription,
        difficulty: 'advanced',
        content: {
          sections: [
            { type: 'intro', title: 'Úvod' },
            { type: 'theory', title: 'Teorie' },
            { type: 'practice', title: 'Praktická část' },
            { type: 'project', title: 'Projekt' },
          ],
        },
        prerequisites: chapter.chapterNumber === 41 ? [] : [chapter.chapterNumber - 1],
      },
    })

    console.log(`  ✅ Chapter ${chapter.chapterNumber}: ${chapter.title}`)
  }

  console.log('✨ Advanced chapters seeded!')
}

// Run if called directly
seedAdvancedChapters().catch(e => {
  console.error('Error seeding advanced chapters:', e)
  process.exit(1)
})

export { seedAdvancedChapters }
