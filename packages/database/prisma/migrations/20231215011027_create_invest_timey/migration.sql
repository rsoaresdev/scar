/*
  Warnings:

  - Added the required column `investTime` to the `invests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invests" ADD COLUMN     "investTime" TEXT NOT NULL;
