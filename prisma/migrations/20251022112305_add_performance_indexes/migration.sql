-- CreateIndex
CREATE INDEX "CognitiveGlitchAttempt_userId_idx" ON "CognitiveGlitchAttempt"("userId");

-- CreateIndex
CREATE INDEX "CognitiveGlitchAttempt_challengeId_idx" ON "CognitiveGlitchAttempt"("challengeId");

-- CreateIndex
CREATE INDEX "CognitiveGlitchAttempt_attemptedAt_idx" ON "CognitiveGlitchAttempt"("attemptedAt");

-- CreateIndex
CREATE INDEX "CompletedLesson_userId_idx" ON "CompletedLesson"("userId");

-- CreateIndex
CREATE INDEX "CompletedLesson_lessonId_idx" ON "CompletedLesson"("lessonId");

-- CreateIndex
CREATE INDEX "CompletedLesson_completedAt_idx" ON "CompletedLesson"("completedAt");

-- CreateIndex
CREATE INDEX "Lesson_chapterId_idx" ON "Lesson"("chapterId");

-- CreateIndex
CREATE INDEX "Lesson_difficulty_idx" ON "Lesson"("difficulty");

-- CreateIndex
CREATE INDEX "Lesson_order_idx" ON "Lesson"("order");

-- CreateIndex
CREATE INDEX "LessonProgress_userId_idx" ON "LessonProgress"("userId");

-- CreateIndex
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

-- CreateIndex
CREATE INDEX "LessonProgress_lastUpdated_idx" ON "LessonProgress"("lastUpdated");

-- CreateIndex
CREATE INDEX "User_xp_idx" ON "User"("xp");

-- CreateIndex
CREATE INDEX "User_level_idx" ON "User"("level");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "UserAchievement_userId_idx" ON "UserAchievement"("userId");

-- CreateIndex
CREATE INDEX "UserAchievement_achievementId_idx" ON "UserAchievement"("achievementId");

-- CreateIndex
CREATE INDEX "UserAchievement_unlockedAt_idx" ON "UserAchievement"("unlockedAt");
