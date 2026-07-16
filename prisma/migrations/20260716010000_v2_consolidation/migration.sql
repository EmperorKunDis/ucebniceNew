-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "colabUrl" TEXT,
ADD COLUMN     "notebookLmUrl" TEXT,
ADD COLUMN     "projectDescription" TEXT,
ADD COLUMN     "projectRequirements" TEXT,
ADD COLUMN     "projectTitle" TEXT,
ADD COLUMN     "videoFile" TEXT;

-- AlterTable
ALTER TABLE "ChapterProgress" ADD COLUMN     "contentCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contentCompletedAt" TIMESTAMP(3),
ADD COLUMN     "exercisesCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "exercisesCompletedAt" TIMESTAMP(3),
ADD COLUMN     "projectApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "projectApprovedAt" TIMESTAMP(3),
ADD COLUMN     "stars" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "MicroLesson" ADD COLUMN     "sourceKey" TEXT;

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN     "sourceKey" TEXT;

-- CreateTable
CREATE TABLE "MicroLessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "microLessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "lastAccessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MicroLessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "attemptCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "firstCorrectAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "dedupeKey" TEXT,
    "answer" JSONB NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExerciseAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardLedger" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "xpAmount" INTEGER NOT NULL DEFAULT 0,
    "gemAmount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardLedger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMilestone" (
    "id" TEXT NOT NULL,
    "sourceKey" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "testRequired" BOOLEAN NOT NULL DEFAULT true,
    "certificateEligible" BOOLEAN NOT NULL DEFAULT false,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MicroLessonProgress_userId_idx" ON "MicroLessonProgress"("userId");

-- CreateIndex
CREATE INDEX "MicroLessonProgress_microLessonId_idx" ON "MicroLessonProgress"("microLessonId");

-- CreateIndex
CREATE INDEX "MicroLessonProgress_userId_completed_idx" ON "MicroLessonProgress"("userId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "MicroLessonProgress_userId_microLessonId_key" ON "MicroLessonProgress"("userId", "microLessonId");

-- CreateIndex
CREATE INDEX "ExerciseProgress_userId_idx" ON "ExerciseProgress"("userId");

-- CreateIndex
CREATE INDEX "ExerciseProgress_exerciseId_idx" ON "ExerciseProgress"("exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseProgress_userId_completed_idx" ON "ExerciseProgress"("userId", "completed");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseProgress_userId_exerciseId_key" ON "ExerciseProgress"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_idx" ON "ExerciseAttempt"("userId");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_exerciseId_idx" ON "ExerciseAttempt"("exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_userId_exerciseId_idx" ON "ExerciseAttempt"("userId", "exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseAttempt_attemptedAt_idx" ON "ExerciseAttempt"("attemptedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseAttempt_userId_dedupeKey_key" ON "ExerciseAttempt"("userId", "dedupeKey");

-- CreateIndex
CREATE INDEX "RewardLedger_userId_idx" ON "RewardLedger"("userId");

-- CreateIndex
CREATE INDEX "RewardLedger_sourceType_sourceId_idx" ON "RewardLedger"("sourceType", "sourceId");

-- CreateIndex
CREATE INDEX "RewardLedger_createdAt_idx" ON "RewardLedger"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RewardLedger_userId_dedupeKey_key" ON "RewardLedger"("userId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMilestone_sourceKey_key" ON "CourseMilestone"("sourceKey");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMilestone_chapterId_key" ON "CourseMilestone"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseMilestone_order_key" ON "CourseMilestone"("order");

-- CreateIndex
CREATE INDEX "CourseMilestone_isPublished_idx" ON "CourseMilestone"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "MicroLesson_sourceKey_key" ON "MicroLesson"("sourceKey");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_sourceKey_key" ON "Exercise"("sourceKey");

-- AddForeignKey
ALTER TABLE "MicroLessonProgress" ADD CONSTRAINT "MicroLessonProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MicroLessonProgress" ADD CONSTRAINT "MicroLessonProgress_microLessonId_fkey" FOREIGN KEY ("microLessonId") REFERENCES "MicroLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseProgress" ADD CONSTRAINT "ExerciseProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseProgress" ADD CONSTRAINT "ExerciseProgress_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseAttempt" ADD CONSTRAINT "ExerciseAttempt_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RewardLedger" ADD CONSTRAINT "RewardLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMilestone" ADD CONSTRAINT "CourseMilestone_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
