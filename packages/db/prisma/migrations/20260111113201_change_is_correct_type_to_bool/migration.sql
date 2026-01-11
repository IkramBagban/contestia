/*
  Warnings:

  - Added the required column `isCorrect` to the `Option` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Option" DROP COLUMN "isCorrect",
ADD COLUMN     "isCorrect" BOOLEAN NOT NULL;
