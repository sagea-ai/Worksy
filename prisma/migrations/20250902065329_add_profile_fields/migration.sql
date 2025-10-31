-- AlterTable
ALTER TABLE "public"."user_profiles" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "github" TEXT,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "linkedIn" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "projectTypes" TEXT[],
ADD COLUMN     "timezone" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "workDescription" TEXT;
