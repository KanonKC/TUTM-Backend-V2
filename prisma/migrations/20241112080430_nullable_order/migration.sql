-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeVideoId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "playedCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "Queue_youtubeVideoId_fkey" FOREIGN KEY ("youtubeVideoId") REFERENCES "YoutubeVideo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Queue_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Queue" ("createdAt", "id", "order", "playedCount", "playlistId", "updateAt", "youtubeVideoId") SELECT "createdAt", "id", "order", "playedCount", "playlistId", "updateAt", "youtubeVideoId" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
CREATE UNIQUE INDEX "Queue_playlistId_order_key" ON "Queue"("playlistId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
