-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "spotifyAccessToken" TEXT,
    "spotifyRefreshToken" TEXT,
    "spotifyTokenExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Playlist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "ownerId" TEXT,
    "currentQueueId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Playlist_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Playlist_currentQueueId_fkey" FOREIGN KEY ("currentQueueId") REFERENCES "Queue" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Playlist" ("createdAt", "currentQueueId", "id", "type") SELECT "createdAt", "currentQueueId", "id", "type" FROM "Playlist";
DROP TABLE "Playlist";
ALTER TABLE "new_Playlist" RENAME TO "Playlist";
CREATE UNIQUE INDEX "Playlist_currentQueueId_key" ON "Playlist"("currentQueueId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Account_spotifyAccessToken_key" ON "Account"("spotifyAccessToken");
