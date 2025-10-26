-- CreateTable
CREATE TABLE "ModuleTestAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "moduleNumber" INTEGER NOT NULL,
    "score" INTEGER NOT NULL,
    "totalQuestions" INTEGER NOT NULL DEFAULT 10,
    "timeElapsed" INTEGER NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "abandoned" BOOLEAN NOT NULL DEFAULT false,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "moduleStars" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    CONSTRAINT "ModuleTestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ModuleTestAttempt_userId_idx" ON "ModuleTestAttempt"("userId");

-- CreateIndex
CREATE INDEX "ModuleTestAttempt_moduleNumber_idx" ON "ModuleTestAttempt"("moduleNumber");

-- CreateIndex
CREATE INDEX "ModuleTestAttempt_score_idx" ON "ModuleTestAttempt"("score");

-- CreateIndex
CREATE INDEX "ModuleTestAttempt_createdAt_idx" ON "ModuleTestAttempt"("createdAt");

-- CreateIndex
CREATE INDEX "ModuleTestAttempt_userId_moduleNumber_idx" ON "ModuleTestAttempt"("userId", "moduleNumber");
