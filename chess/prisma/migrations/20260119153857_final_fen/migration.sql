/*
  Warnings:

  - Added the required column `finalFEN` to the `FinishedGames` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FinishedGames" ADD COLUMN     "finalFEN" TEXT NOT NULL;
