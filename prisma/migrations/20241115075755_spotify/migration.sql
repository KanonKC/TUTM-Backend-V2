/*
  Warnings:

  - You are about to drop the column `spotifyTrackId` on the `Queue` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeVideoId` on the `Queue` table. All the data in the column will be lost.
  - Added the required column `queueId` to the `SpotifyTrack` table without a default value. This is not possible if the table is not empty.
  - Added the required column `queueId` to the `YoutubeVideo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Queue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL DEFAULT 'youtube-video',
    "playlistId" TEXT NOT NULL,
    "playedCount" INTEGER NOT NULL DEFAULT 0,
    "order" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" DATETIME NOT NULL,
    CONSTRAINT "Queue_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Queue" ("createdAt", "id", "order", "playedCount", "playlistId", "type", "updateAt") SELECT "createdAt", "id", "order", "playedCount", "playlistId", "type", "updateAt" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
CREATE UNIQUE INDEX "Queue_playlistId_order_key" ON "Queue"("playlistId", "order");
CREATE TABLE "new_SpotifyTrack" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "spotifyUri" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "thumbnail" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "queueId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SpotifyTrack_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_SpotifyTrack" ("artist", "createdAt", "duration", "id", "spotifyUri", "thumbnail", "title") SELECT "artist", "createdAt", "duration", "id", "spotifyUri", "thumbnail", "title" FROM "SpotifyTrack";
DROP TABLE "SpotifyTrack";
ALTER TABLE "new_SpotifyTrack" RENAME TO "SpotifyTrack";
CREATE UNIQUE INDEX "SpotifyTrack_queueId_key" ON "SpotifyTrack"("queueId");
CREATE TABLE "new_YoutubeVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "queueId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "YoutubeVideo_queueId_fkey" FOREIGN KEY ("queueId") REFERENCES "Queue" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_YoutubeVideo" ("channelTitle", "createdAt", "description", "duration", "id", "thumbnail", "title", "youtubeId") SELECT "channelTitle", "createdAt", "description", "duration", "id", "thumbnail", "title", "youtubeId" FROM "YoutubeVideo";
DROP TABLE "YoutubeVideo";
ALTER TABLE "new_YoutubeVideo" RENAME TO "YoutubeVideo";
CREATE UNIQUE INDEX "YoutubeVideo_queueId_key" ON "YoutubeVideo"("queueId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
