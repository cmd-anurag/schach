/*
  Warnings:

  - Changed the type of `gameType` on the `FinishedGames` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "FinishedGames" DROP COLUMN "gameType",
ADD COLUMN     "gameType" "GameType" NOT NULL;
