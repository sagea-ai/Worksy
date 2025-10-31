-- CreateEnum
CREATE TYPE "public"."JobState" AS ENUM ('NEW', 'ANALYZING', 'DECLINED', 'PROPOSING', 'PROPOSED', 'NEGOTIATING', 'TEAM_SUMMONED', 'ORDER_CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ERROR');

-- CreateEnum
CREATE TYPE "public"."JobPlatform" AS ENUM ('FREELANCER', 'UPWORK', 'FIVERR', 'TOPTAL', 'GURU', 'PEOPLEPERHOUR', 'OTHER');

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "platform" "public"."JobPlatform" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "budget" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "skills" TEXT[],
    "location" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT true,
    "isUrgent" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "clientRating" DOUBLE PRECISION,
    "state" "public"."JobState" NOT NULL DEFAULT 'NEW',
    "userId" TEXT NOT NULL,
    "proposalSubmitted" BOOLEAN NOT NULL DEFAULT false,
    "proposalText" TEXT,
    "proposedBudget" DOUBLE PRECISION,
    "proposedDeadline" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "actualBudget" DOUBLE PRECISION,
    "clientFeedback" TEXT,
    "rating" DOUBLE PRECISION,
    "aiAnalysis" JSONB,
    "buildingPlan" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."job_state_history" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fromState" "public"."JobState",
    "toState" "public"."JobState" NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "changedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_state_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jobs_platform_externalId_key" ON "public"."jobs"("platform", "externalId");

-- AddForeignKey
ALTER TABLE "public"."jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_state_history" ADD CONSTRAINT "job_state_history_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
