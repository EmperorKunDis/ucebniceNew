import 'dotenv/config'
import { PrismaClient, ShopItemCategory, QuestType, QuestCategory } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🎮 Seeding Duolingo features...')

  // ═══════════════════════════════════════════════════════════
  // SHOP ITEMS
  // ═══════════════════════════════════════════════════════════
  console.log('🛒 Seeding shop items...')

  const shopItems = [
    {
      key: 'streak_freeze',
      name: 'Streak Freeze',
      description: 'Ochrání tvůj streak na jeden vynechaný den',
      category: ShopItemCategory.STREAK,
      price: 200,
      icon: '🧊',
      effectData: { type: 'streak_freeze', duration: 1 },
      maxPerWeek: 2,
      order: 1,
    },
    {
      key: 'heart_refill',
      name: 'Heart Refill',
      description: 'Okamžitě doplní všech 5 srdcí',
      category: ShopItemCategory.HEART,
      price: 350,
      icon: '❤️',
      effectData: { type: 'heart_refill', amount: 5 },
      maxPerWeek: null,
      order: 2,
    },
    {
      key: 'double_xp_1h',
      name: 'Double XP (1 hodina)',
      description: 'Získej 2× XP po dobu 1 hodiny',
      category: ShopItemCategory.XP_BOOST,
      price: 300,
      icon: '⚡',
      effectData: { type: 'xp_multiplier', multiplier: 2, durationMinutes: 60 },
      maxPerWeek: 3,
      order: 3,
    },
    {
      key: 'double_xp_1d',
      name: 'Double XP (1 den)',
      description: 'Získej 2× XP po celý den',
      category: ShopItemCategory.XP_BOOST,
      price: 800,
      icon: '🌟',
      effectData: { type: 'xp_multiplier', multiplier: 2, durationMinutes: 1440 },
      maxPerWeek: 1,
      order: 4,
    },
    {
      key: 'unlimited_hearts_1h',
      name: 'Neomezená srdce (1 hodina)',
      description: 'Neomezená srdce po dobu 1 hodiny',
      category: ShopItemCategory.HEART,
      price: 450,
      icon: '💝',
      effectData: { type: 'unlimited_hearts', durationMinutes: 60 },
      maxPerWeek: 3,
      order: 5,
    },
    {
      key: 'unlimited_hearts_1d',
      name: 'Neomezená srdce (1 den)',
      description: 'Neomezená srdce po celý den',
      category: ShopItemCategory.HEART,
      price: 1200,
      icon: '💖',
      effectData: { type: 'unlimited_hearts', durationMinutes: 1440 },
      maxPerWeek: 1,
      order: 6,
    },
  ]

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    })
  }
  console.log(`✅ Created ${shopItems.length} shop items`)

  // ═══════════════════════════════════════════════════════════
  // QUESTS
  // ═══════════════════════════════════════════════════════════
  console.log('🎯 Seeding quests...')

  const quests = [
    // Daily Quests
    {
      type: QuestType.DAILY,
      category: QuestCategory.LESSONS_COMPLETED,
      title: 'Pilný student',
      description: 'Dokonči 3 lekce',
      targetValue: 3,
      xpReward: 20,
      gemReward: 5,
      icon: '📚',
    },
    {
      type: QuestType.DAILY,
      category: QuestCategory.XP_EARNED,
      title: 'XP Sběratel',
      description: 'Získej 100 XP',
      targetValue: 100,
      xpReward: 30,
      gemReward: 10,
      icon: '⭐',
    },
    {
      type: QuestType.DAILY,
      category: QuestCategory.EXERCISES_PERFECT,
      title: 'Bezchybný',
      description: '10 správných odpovědí v řadě',
      targetValue: 10,
      xpReward: 50,
      gemReward: 15,
      icon: '🎯',
    },
    {
      type: QuestType.DAILY,
      category: QuestCategory.HEARTS_PRESERVED,
      title: 'Opatrný student',
      description: 'Dokonči 5 cvičení bez ztráty srdce',
      targetValue: 5,
      xpReward: 40,
      gemReward: 10,
      icon: '❤️',
    },
    // Weekly Quests
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.LESSONS_COMPLETED,
      title: 'Týdenní maratón',
      description: 'Dokonči 15 lekcí',
      targetValue: 15,
      xpReward: 150,
      gemReward: 50,
      icon: '📖',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.XP_EARNED,
      title: 'XP Master',
      description: 'Získej 500 XP',
      targetValue: 500,
      xpReward: 200,
      gemReward: 75,
      icon: '🏆',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.STREAK_MAINTAINED,
      title: 'Věrný student',
      description: 'Udrž streak 7 dní v řadě',
      targetValue: 7,
      xpReward: 100,
      gemReward: 30,
      icon: '🔥',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.FRIENDS_ENCOURAGED,
      title: 'Sociální motýl',
      description: 'Povzbuď 3 přátele',
      targetValue: 3,
      xpReward: 50,
      gemReward: 20,
      icon: '💪',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.REVIEW_SESSIONS,
      title: 'Opakování matka moudrosti',
      description: 'Dokonči 5 opakování',
      targetValue: 5,
      xpReward: 75,
      gemReward: 25,
      icon: '🧠',
    },
    {
      type: QuestType.WEEKLY,
      category: QuestCategory.CHAPTERS_COMPLETED,
      title: 'Průzkumník',
      description: 'Dokonči 3 kapitoly',
      targetValue: 3,
      xpReward: 250,
      gemReward: 100,
      icon: '🗺️',
    },
  ]

  for (const quest of quests) {
    // Create unique identifier for quest
    const existingQuest = await prisma.quest.findFirst({
      where: {
        type: quest.type,
        category: quest.category,
        title: quest.title,
      },
    })

    if (!existingQuest) {
      await prisma.quest.create({
        data: quest,
      })
    }
  }
  console.log(`✅ Created ${quests.length} quests`)

  // ═══════════════════════════════════════════════════════════
  // UPDATE EXISTING ACHIEVEMENTS WITH NEW FIELDS
  // ═══════════════════════════════════════════════════════════
  console.log('🏅 Updating achievements with gem rewards...')

  const achievementUpdates = [
    { badgeId: 'first_chapter', gemReward: 10, category: 'learning' },
    { badgeId: 'five_chapters', gemReward: 25, category: 'learning' },
    { badgeId: 'ten_chapters', gemReward: 50, category: 'learning' },
    { badgeId: 'twenty_chapters', gemReward: 100, category: 'learning' },
    { badgeId: 'all_chapters', gemReward: 500, category: 'learning' },
    { badgeId: 'first_perfect', gemReward: 20, category: 'learning' },
    { badgeId: 'streak_3', gemReward: 5, category: 'streak' },
    { badgeId: 'streak_7', gemReward: 20, category: 'streak' },
    { badgeId: 'streak_14', gemReward: 40, category: 'streak' },
    { badgeId: 'streak_30', gemReward: 100, category: 'streak' },
    { badgeId: 'streak_100', gemReward: 500, category: 'streak' },
    { badgeId: 'xp_1000', gemReward: 10, category: 'mastery' },
    { badgeId: 'xp_10000', gemReward: 50, category: 'mastery' },
    { badgeId: 'xp_50000', gemReward: 200, category: 'mastery' },
    { badgeId: 'level_5', gemReward: 20, category: 'mastery' },
    { badgeId: 'level_10', gemReward: 50, category: 'mastery' },
    { badgeId: 'level_25', gemReward: 200, category: 'mastery' },
  ]

  for (const update of achievementUpdates) {
    await prisma.achievement.updateMany({
      where: { badgeId: update.badgeId },
      data: { gemReward: update.gemReward, category: update.category },
    })
  }
  console.log(`✅ Updated achievements`)

  console.log('✨ Duolingo features seed completed!')
}

main()
  .catch(e => {
    console.error('Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
