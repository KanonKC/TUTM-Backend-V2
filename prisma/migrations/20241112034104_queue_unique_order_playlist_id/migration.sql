/*
  Warnings:

  - A unique constraint covering the columns `[playlistId,order]` on the table `Queue` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Queue_playlistId_order_key" ON "Queue"("playlistId", "order");
