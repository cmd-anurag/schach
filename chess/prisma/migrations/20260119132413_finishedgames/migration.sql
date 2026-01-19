-- CreateEnum
CREATE TYPE "GameResult" AS ENUM ('WHITE', 'BLACK', 'DRAW');

-- CreateTable
CREATE TABLE "FinishedGames" (
    "gameID" TEXT NOT NULL,
    "whiteId" INTEGER NOT NULL,
    "blackId" INTEGER NOT NULL,
    "timeWhite" INTEGER NOT NULL DEFAULT 0,
    "timeBlack" INTEGER NOT NULL DEFAULT 0,
    "increment" INTEGER NOT NULL DEFAULT 0,
    "result" "GameResult" NOT NULL,
    "reason" TEXT NOT NULL,
    "moves" TEXT[],
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinishedGames_pkey" PRIMARY KEY ("gameID")
);

-- AddForeignKey
ALTER TABLE "FinishedGames" ADD CONSTRAINT "FinishedGames_whiteId_fkey" FOREIGN KEY ("whiteId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGames" ADD CONSTRAINT "FinishedGames_blackId_fkey" FOREIGN KEY ("blackId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
