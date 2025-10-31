/*
  Warnings:

  - You are about to drop the `categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_skills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."skills" DROP CONSTRAINT "skills_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_skills" DROP CONSTRAINT "user_skills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_skills" DROP CONSTRAINT "user_skills_userId_fkey";

-- AlterTable
ALTER TABLE "public"."user_profiles" ADD COLUMN     "selectedSkills" TEXT[];

-- DropTable
DROP TABLE "public"."categories";

-- DropTable
DROP TABLE "public"."skills";

-- DropTable
DROP TABLE "public"."user_skills";
