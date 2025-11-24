/*
  Warnings:

  - You are about to drop the `CompletedLesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Lesson` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LessonProgress` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CompletedLesson" DROP CONSTRAINT "CompletedLesson_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CompletedLesson" DROP CONSTRAINT "CompletedLesson_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LessonProgress" DROP CONSTRAINT "LessonProgress_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LessonProgress" DROP CONSTRAINT "LessonProgress_userId_fkey";

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "public"."CompletedLesson";

-- DropTable
DROP TABLE "public"."Lesson";

-- DropTable
DROP TABLE "public"."LessonProgress";

-- CreateTable
CREATE TABLE "public"."Chapter" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "difficulty" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CompletedChapter" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "xpEarned" INTEGER NOT NULL,

    CONSTRAINT "CompletedChapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ChapterProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChapterProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_chapterId_key" ON "public"."Chapter"("chapterId");

-- CreateIndex
CREATE INDEX "Chapter_difficulty_idx" ON "public"."Chapter"("difficulty");

-- CreateIndex
CREATE INDEX "Chapter_order_idx" ON "public"."Chapter"("order");

-- CreateIndex
CREATE INDEX "CompletedChapter_userId_idx" ON "public"."CompletedChapter"("userId");

-- CreateIndex
CREATE INDEX "CompletedChapter_chapterId_idx" ON "public"."CompletedChapter"("chapterId");

-- CreateIndex
CREATE INDEX "CompletedChapter_completedAt_idx" ON "public"."CompletedChapter"("completedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompletedChapter_userId_chapterId_key" ON "public"."CompletedChapter"("userId", "chapterId");

-- CreateIndex
CREATE INDEX "ChapterProgress_userId_idx" ON "public"."ChapterProgress"("userId");

-- CreateIndex
CREATE INDEX "ChapterProgress_chapterId_idx" ON "public"."ChapterProgress"("chapterId");

-- CreateIndex
CREATE INDEX "ChapterProgress_lastUpdated_idx" ON "public"."ChapterProgress"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterProgress_userId_chapterId_key" ON "public"."ChapterProgress"("userId", "chapterId");

-- AddForeignKey
ALTER TABLE "public"."CompletedChapter" ADD CONSTRAINT "CompletedChapter_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CompletedChapter" ADD CONSTRAINT "CompletedChapter_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChapterProgress" ADD CONSTRAINT "ChapterProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ChapterProgress" ADD CONSTRAINT "ChapterProgress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
