ALTER TABLE "ProjectSubmission"
ADD COLUMN "aiReviewModel" TEXT,
ADD COLUMN "aiReviewPromptVersion" TEXT,
ADD COLUMN "aiReviewLatencyMs" INTEGER,
ADD COLUMN "aiReviewTokenCount" INTEGER,
ADD COLUMN "aiReviewFailureReason" TEXT,
ADD COLUMN "aiManualReviewRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "aiSafetyStatus" TEXT;

CREATE INDEX "ProjectSubmission_aiManualReviewRequired_idx" ON "ProjectSubmission"("aiManualReviewRequired");
