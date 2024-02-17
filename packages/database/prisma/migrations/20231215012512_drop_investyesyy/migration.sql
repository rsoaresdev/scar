/*
  Warnings:

  - You are about to drop the `invests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "invests" DROP CONSTRAINT "invests_user_id_fkey";

-- DropTable
DROP TABLE "invests";
