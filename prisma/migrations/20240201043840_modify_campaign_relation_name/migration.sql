/*
  Warnings:

  - Added the required column `title` to the `Campaign` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "thumbnail" TEXT,
ADD COLUMN     "title" TEXT NOT NULL;
