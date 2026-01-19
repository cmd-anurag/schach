/*
  Warnings:

  - You are about to drop the column `blackId` on the `FinishedGames` table. All the data in the column will be lost.
  - You are about to drop the column `whiteId` on the `FinishedGames` table. All the data in the column will be lost.
  - Added the required column `blackID` to the `FinishedGames` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whiteID` to the `FinishedGames` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FinishedGames" DROP CONSTRAINT "FinishedGames_blackId_fkey";

-- DropForeignKey
ALTER TABLE "FinishedGames" DROP CONSTRAINT "FinishedGames_whiteId_fkey";

-- AlterTable
ALTER TABLE "FinishedGames" DROP COLUMN "blackId",
DROP COLUMN "whiteId",
ADD COLUMN     "blackID" INTEGER NOT NULL,
ADD COLUMN     "whiteID" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "FinishedGames" ADD CONSTRAINT "FinishedGames_whiteID_fkey" FOREIGN KEY ("whiteID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinishedGames" ADD CONSTRAINT "FinishedGames_blackID_fkey" FOREIGN KEY ("blackID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
