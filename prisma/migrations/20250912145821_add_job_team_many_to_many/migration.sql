-- CreateTable
CREATE TABLE "public"."job_teams" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_teams_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "job_teams_jobId_teamId_key" ON "public"."job_teams"("jobId", "teamId");

-- AddForeignKey
ALTER TABLE "public"."job_teams" ADD CONSTRAINT "job_teams_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "public"."jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."job_teams" ADD CONSTRAINT "job_teams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."teams"("id") ON DELETE CASCADE ON UPDATE CASCADE;
