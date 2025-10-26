-- CreateTable
CREATE TABLE "ChapterCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 1,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChapterCompletion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "correct" BOOLEAN NOT NULL,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuestionAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectSubmission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "projectUrl" TEXT NOT NULL,
    "description" TEXT,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ChapterCompletion_userId_idx" ON "ChapterCompletion"("userId");

-- CreateIndex
CREATE INDEX "ChapterCompletion_chapterId_idx" ON "ChapterCompletion"("chapterId");

-- CreateIndex
CREATE INDEX "ChapterCompletion_stars_idx" ON "ChapterCompletion"("stars");

-- CreateIndex
CREATE UNIQUE INDEX "ChapterCompletion_userId_chapterId_key" ON "ChapterCompletion"("userId", "chapterId");

-- CreateIndex
CREATE INDEX "QuestionAnswer_userId_idx" ON "QuestionAnswer"("userId");

-- CreateIndex
CREATE INDEX "QuestionAnswer_chapterId_idx" ON "QuestionAnswer"("chapterId");

-- CreateIndex
CREATE INDEX "QuestionAnswer_answeredAt_idx" ON "QuestionAnswer"("answeredAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionAnswer_userId_chapterId_questionId_key" ON "QuestionAnswer"("userId", "chapterId", "questionId");

-- CreateIndex
CREATE INDEX "ProjectSubmission_userId_idx" ON "ProjectSubmission"("userId");

-- CreateIndex
CREATE INDEX "ProjectSubmission_chapterId_idx" ON "ProjectSubmission"("chapterId");

-- CreateIndex
CREATE INDEX "ProjectSubmission_submittedAt_idx" ON "ProjectSubmission"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSubmission_userId_chapterId_key" ON "ProjectSubmission"("userId", "chapterId");
