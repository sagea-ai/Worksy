-- AlterTable
ALTER TABLE "public"."jobs" ADD COLUMN     "teamSummoned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "teamSummonedAt" TIMESTAMP(3);
