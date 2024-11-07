/*
  Warnings:

  - You are about to drop the column `latestQueueId` on the `Playlist` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "firstQueueId" TEXT,
    "currentQueueId" TEXT,
    "lastQueueId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Playlist_firstQueueId_fkey" FOREIGN KEY ("firstQueueId") REFERENCES "Queue" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Playlist_currentQueueId_fkey" FOREIGN KEY ("currentQueueId") REFERENCES "Queue" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Playlist_lastQueueId_fkey" FOREIGN KEY ("lastQueueId") REFERENCES "Queue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("createdAt", "currentQueueId", "firstQueueId", "id", "type") SELECT "createdAt", "currentQueueId", "firstQueueId", "id", "type" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE UNIQUE INDEX "Playlist_firstQueueId_key" ON "Playlist"("firstQueueId");
CREATE UNIQUE INDEX "Playlist_currentQueueId_key" ON "Playlist"("currentQueueId");
CREATE UNIQUE INDEX "Playlist_lastQueueId_key" ON "Playlist"("lastQueueId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
