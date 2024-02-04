/*
  Warnings:

  - A unique constraint covering the columns `[duplicateId]` on the table `Campaign` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Campaign_duplicateId_key" ON "Campaign"("duplicateId");
