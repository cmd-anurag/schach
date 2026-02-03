-- CreateTable
CREATE TABLE "UserStats" (
    "userID" INTEGER NOT NULL,
    "totalGames" INTEGER NOT NULL DEFAULT 0,
    "gamesWhite" INTEGER NOT NULL DEFAULT 0,
    "gamesBlack" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "losses" INTEGER NOT NULL DEFAULT 0,
    "draws" INTEGER NOT NULL DEFAULT 0,
    "bullet" INTEGER NOT NULL DEFAULT 0,
    "blitz" INTEGER NOT NULL DEFAULT 0,
    "rapid" INTEGER NOT NULL DEFAULT 0,
    "classical" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserStats_pkey" PRIMARY KEY ("userID")
);

-- CreateIndex
CREATE INDEX "FinishedGames_whiteID_idx" ON "FinishedGames"("whiteID");

-- CreateIndex
CREATE INDEX "FinishedGames_blackID_idx" ON "FinishedGames"("blackID");

-- CreateIndex
CREATE INDEX "FinishedGames_endedAt_idx" ON "FinishedGames"("endedAt");

-- CreateIndex
CREATE INDEX "FinishedGames_whiteID_endedAt_idx" ON "FinishedGames"("whiteID", "endedAt");

-- CreateIndex
CREATE INDEX "FinishedGames_blackID_endedAt_idx" ON "FinishedGames"("blackID", "endedAt");

-- AddForeignKey
ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
