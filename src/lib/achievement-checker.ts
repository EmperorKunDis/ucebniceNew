import { prisma } from './prisma'
import { BADGES, BadgeId } from './gamification'

/**
 * Zkontroluje a přidá achievementy pro uživatele na základě jejich aktivity
 * @param userId - ID uživatele
 * @returns Pole nově přidaných badge IDs
 */
export async function checkAndAwardAchievements(userId: string): Promise<BadgeId[]> {
  try {
    // Získej všechny achievementy které uživatel už má
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      include: { achievement: true },
    })

    const existingBadgeIds = new Set(userAchievements.map(ua => ua.achievement.badgeId))
    const newBadges: BadgeId[] = []

    // Získej statistiky uživatele
    const [
      _completedChapters,
      allQuestionAnswers,
      allProjects,
      allTestAttempts,
      chapterCompletions,
    ] = await Promise.all([
      prisma.chapterCompletion.count({
        where: { userId },
      }),
      prisma.questionAnswer.findMany({
        where: { userId, correct: true },
      }),
      prisma.projectSubmission.count({
        where: { userId },
      }),
      prisma.moduleTestAttempt.findMany({
        where: { userId, completed: true },
      }),
      prisma.chapterCompletion.findMany({
        where: { userId },
      }),
    ])

    const correctQuestions = allQuestionAnswers.length
    // Count chapters with specific achievements
    const answeredQuestionsCount = chapterCompletions.filter(c => c.answeredQuestions).length
    const submittedProjectsCount = chapterCompletions.filter(c => c.submittedProject).length
    const perfectChapters = chapterCompletions.filter(
      c => c.completedChapter && c.answeredQuestions && c.submittedProject
    ).length
    const perfectModuleTests = allTestAttempts.filter(a => a.moduleStars === 3).length

    // Helper funkce pro přidání achievementu
    const awardBadge = (badgeKey: BadgeId) => {
      if (!existingBadgeIds.has(BADGES[badgeKey].id)) {
        newBadges.push(badgeKey)
      }
    }

    // Zkontroluj achievementy pro otázky
    if (correctQuestions >= 50) {
      awardBadge('QUESTION_MASTER')
    }

    // Zkontroluj achievementy pro projekty
    if (allProjects >= 1) {
      awardBadge('PROJECT_STARTER')
    }
    if (allProjects >= 10) {
      awardBadge('PROJECT_ENTHUSIAST')
    }

    // Zkontroluj achievementy pro hvězdičky (nový systém s nezávislými hvězdičkami)
    if (answeredQuestionsCount >= 1) {
      awardBadge('FIRST_STAR_TWO')
    }
    if (submittedProjectsCount >= 1) {
      awardBadge('FIRST_STAR_THREE')
    }
    if (perfectChapters >= 5) {
      awardBadge('FIVE_PERFECT_CHAPTERS')
    }
    if (perfectChapters >= 40) {
      awardBadge('ALL_THREE_STARS')
    }

    // Zkontroluj achievementy pro modulové testy
    for (const attempt of allTestAttempts) {
      const percentage = (attempt.score / attempt.totalQuestions) * 100

      if (percentage >= 90) {
        awardBadge('TEST_ACE')
      }

      if (attempt.score === attempt.totalQuestions && attempt.timeElapsed < 5 * 60) {
        awardBadge('SPEED_DEMON')
      }

      if (attempt.moduleStars === 3) {
        awardBadge('MODULE_MASTER')
      }
    }

    if (perfectModuleTests >= 4) {
      awardBadge('ALL_MODULES_PERFECT')
    }

    // Přidej nové achievementy do databáze
    if (newBadges.length > 0) {
      // Pro každý nový badge, najdi nebo vytvoř Achievement a pak vytvoř UserAchievement
      for (const badgeKey of newBadges) {
        const badge = BADGES[badgeKey]

        // Najdi nebo vytvoř Achievement záznam
        let achievement = await prisma.achievement.findUnique({
          where: { badgeId: badge.id },
        })

        if (!achievement) {
          achievement = await prisma.achievement.create({
            data: {
              badgeId: badge.id,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              xpReward: badge.xpReward,
              rarity: badge.rarity,
            },
          })
        }

        // Vytvoř UserAchievement záznam
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: achievement.id,
          },
        })
      }

      // Přidej XP reward za nové achievementy
      const totalXpReward = newBadges.reduce((sum, badgeKey) => sum + BADGES[badgeKey].xpReward, 0)

      if (totalXpReward > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { xp: { increment: totalXpReward } },
        })
      }
    }

    return newBadges
  } catch (error) {
    console.error('Error checking achievements:', error)
    return []
  }
}
