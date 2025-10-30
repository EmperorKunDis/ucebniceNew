import { PrismaClient } from '@prisma/client'
import { chapters } from '../src/data/chapters'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed lessons for all chapters
  for (const chapter of chapters) {
    await prisma.lesson.upsert({
      where: {
        chapterId: chapter.id,
      },
      update: {
        title: chapter.title,
        description: chapter.description,
        xpReward: 100,
        difficulty: 'střední',
        order: chapter.number,
      },
      create: {
        chapterId: chapter.id,
        title: chapter.title,
        description: chapter.description,
        xpReward: 100,
        difficulty: 'střední',
        order: chapter.number,
      },
    })
  }

  console.log(`Seeded ${chapters.length} lessons`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
