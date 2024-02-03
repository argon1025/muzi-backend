/*
  Warnings:

  - You are about to drop the column `city` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `Campaign` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "city",
DROP COLUMN "description",
ADD COLUMN     "applyCount" INTEGER,
ADD COLUMN     "recruitCount" INTEGER,
ALTER COLUMN "targetPlatforms" DROP NOT NULL,
ALTER COLUMN "category" DROP NOT NULL;
