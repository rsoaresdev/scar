/*
  Warnings:

  - You are about to drop the column `balance` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "balance",
ADD COLUMN     "balanceBank" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "balanceWallet" INTEGER NOT NULL DEFAULT 0;
