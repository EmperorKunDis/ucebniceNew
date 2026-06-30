import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { chapters } from '../src/data/chapters'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')

  // Seed chapters for all chapters
  for (const chapter of chapters) {
    const moduleNumber = Math.ceil(chapter.number / 5)

    await prisma.chapter.upsert({
      where: {
        chapterId: chapter.id,
      },
      update: {
        title: chapter.title,
        description: chapter.description,
        xpReward: 100,
        difficulty: 'MEDIUM',
        order: chapter.number,
        module: moduleNumber,
      },
      create: {
        chapterId: chapter.id,
        title: chapter.title,
        description: chapter.description,
        xpReward: 100,
        difficulty: 'MEDIUM',
        order: chapter.number,
        module: moduleNumber,
      },
    })
  }

  console.log(`Seeded ${chapters.length} chapters`)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
