/*
  Warnings:

  - A unique constraint covering the columns `[spotifyId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Account" ADD COLUMN "spotifyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_spotifyId_key" ON "Account"("spotifyId");
