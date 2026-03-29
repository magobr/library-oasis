/*
  Warnings:

  - You are about to drop the column `amount` on the `Books` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "LoanStatus" ADD VALUE 'AVALIABLE';

-- AlterTable
ALTER TABLE "Books" DROP COLUMN "amount",
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true;
