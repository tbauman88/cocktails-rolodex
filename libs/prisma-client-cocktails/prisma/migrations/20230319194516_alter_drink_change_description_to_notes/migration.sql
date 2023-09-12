/*
  Warnings:

  - You are about to drop the column `description` on the `Drink` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Drink" DROP COLUMN "description",
ADD COLUMN     "notes" TEXT;
