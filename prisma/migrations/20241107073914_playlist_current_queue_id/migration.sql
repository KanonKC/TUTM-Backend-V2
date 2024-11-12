-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "currentQueueId" TEXT,
    "latestQueueId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Playlist_currentQueueId_fkey" FOREIGN KEY ("currentQueueId") REFERENCES "Queue" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Playlist_latestQueueId_fkey" FOREIGN KEY ("latestQueueId") REFERENCES "Queue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("createdAt", "currentQueueId", "id", "type") SELECT "createdAt", "currentQueueId", "id", "type" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE UNIQUE INDEX "Playlist_currentQueueId_key" ON "Playlist"("currentQueueId");
CREATE UNIQUE INDEX "Playlist_latestQueueId_key" ON "Playlist"("latestQueueId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
