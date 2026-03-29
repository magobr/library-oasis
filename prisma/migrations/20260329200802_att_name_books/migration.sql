/*
  Warnings:

  - You are about to drop the column `available` on the `Books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Books" DROP COLUMN "available",
ADD COLUMN     "avaliable" BOOLEAN NOT NULL DEFAULT true;
