/*
  Warnings:

  - You are about to drop the column `output` on the `Testcase` table. All the data in the column will be lost.
  - Added the required column `funcName` to the `Question` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedOutput` to the `Testcase` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `input` on the `Testcase` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "funcName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Testcase" DROP COLUMN "output",
ADD COLUMN     "expectedOutput" JSONB NOT NULL,
ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "input",
ADD COLUMN     "input" JSONB NOT NULL;
