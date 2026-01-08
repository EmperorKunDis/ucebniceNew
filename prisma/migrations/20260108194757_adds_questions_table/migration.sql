-- CreateTable
CREATE TABLE "public"."Question" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "questionText" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "correctAnswer" INTEGER NOT NULL,
    "explanation" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Question_chapterId_idx" ON "public"."Question"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_chapterId_questionNumber_key" ON "public"."Question"("chapterId", "questionNumber");

-- AddForeignKey
ALTER TABLE "public"."Question" ADD CONSTRAINT "Question_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "public"."Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
