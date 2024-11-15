/*
  Warnings:

  - You are about to drop the column `isCleared` on the `YoutubeVideo` table. All the data in the column will be lost.
  - You are about to drop the column `totalPlayed` on the `YoutubeVideo` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "SpotifyTrack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spotifyUri" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'youtube-video',
    "youtubeVideoId" TEXT,
    "spotifyTrackId" TEXT,
    "playlistId" TEXT NOT NULL,
    "playedCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "Queue_youtubeVideoId_fkey" FOREIGN KEY ("youtubeVideoId") REFERENCES "YoutubeVideo" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Queue_spotifyTrackId_fkey" FOREIGN KEY ("spotifyTrackId") REFERENCES "SpotifyTrack" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Queue_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Queue" ("createdAt", "id", "order", "playedCount", "playlistId", "updateAt", "youtubeVideoId") SELECT "createdAt", "id", "order", "playedCount", "playlistId", "updateAt", "youtubeVideoId" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
CREATE UNIQUE INDEX "Queue_playlistId_order_key" ON "Queue"("playlistId", "order");
CREATE TABLE "new_YoutubeVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_YoutubeVideo" ("channelTitle", "createdAt", "description", "duration", "id", "thumbnail", "title", "youtubeId") SELECT "channelTitle", "createdAt", "description", "duration", "id", "thumbnail", "title", "youtubeId" FROM "YoutubeVideo";
DROP TABLE "YoutubeVideo";
ALTER TABLE "new_YoutubeVideo" RENAME TO "YoutubeVideo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
