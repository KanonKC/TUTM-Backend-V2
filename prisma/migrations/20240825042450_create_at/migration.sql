-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "currentIndex" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Playlist" ("currentIndex", "id", "slug", "type") SELECT "currentIndex", "id", "slug", "type" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE UNIQUE INDEX "Playlist_slug_key" ON "Playlist"("slug");
CREATE TABLE "new_Queue" (
    "youtubeVideoId" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "playedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("youtubeVideoId", "playlistId"),
    CONSTRAINT "Queue_youtubeVideoId_fkey" FOREIGN KEY ("youtubeVideoId") REFERENCES "YoutubeVideo" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Queue_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Queue" ("playedCount", "playlistId", "youtubeVideoId") SELECT "playedCount", "playlistId", "youtubeVideoId" FROM "Queue";
DROP TABLE "Queue";
ALTER TABLE "new_Queue" RENAME TO "Queue";
CREATE TABLE "new_YoutubeVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isCleared" BOOLEAN NOT NULL DEFAULT false,
    "totalPlayed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_YoutubeVideo" ("description", "duration", "id", "isCleared", "thumbnail", "title", "totalPlayed", "youtubeId") SELECT "description", "duration", "id", "isCleared", "thumbnail", "title", "totalPlayed", "youtubeId" FROM "YoutubeVideo";
DROP TABLE "YoutubeVideo";
ALTER TABLE "new_YoutubeVideo" RENAME TO "YoutubeVideo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
