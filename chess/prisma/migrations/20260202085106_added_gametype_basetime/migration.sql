/*
  Warnings:

  - Added the required column `gameType` to the `FinishedGames` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('BULLET', 'BLITZ', 'RAPID', 'CLASSICAL');

-- AlterTable
ALTER TABLE "FinishedGames" ADD COLUMN     "baseTime" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gameType" "GameResult" NOT NULL;
