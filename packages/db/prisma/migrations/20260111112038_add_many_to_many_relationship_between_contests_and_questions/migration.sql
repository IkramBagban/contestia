-- CreateTable
CREATE TABLE "QuestionsInContests" (
    "contestId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionsInContests_pkey" PRIMARY KEY ("contestId","questionId")
);

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- AddForeignKey
ALTER TABLE "QuestionsInContests" ADD CONSTRAINT "QuestionsInContests_contestId_fkey" FOREIGN KEY ("contestId") REFERENCES "Contest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionsInContests" ADD CONSTRAINT "QuestionsInContests_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
