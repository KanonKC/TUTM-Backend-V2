/*
  Warnings:

  - Added the required column `channelTitle` to the `YoutubeVideo` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_YoutubeVideo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "channelTitle" TEXT NOT NULL,
    "description" TEXT,
    "thumbnail" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isCleared" BOOLEAN NOT NULL DEFAULT false,
    "totalPlayed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_YoutubeVideo" ("createdAt", "description", "duration", "id", "isCleared", "thumbnail", "title", "totalPlayed", "youtubeId") SELECT "createdAt", "description", "duration", "id", "isCleared", "thumbnail", "title", "totalPlayed", "youtubeId" FROM "YoutubeVideo";
DROP TABLE "YoutubeVideo";
ALTER TABLE "new_YoutubeVideo" RENAME TO "YoutubeVideo";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
