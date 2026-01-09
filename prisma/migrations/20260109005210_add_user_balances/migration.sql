/*
  Warnings:

  - You are about to drop the column `blockradarWalletId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "blockradarWalletId",
ADD COLUMN     "balanceCad" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "balanceUsd" DOUBLE PRECISION NOT NULL DEFAULT 0;
