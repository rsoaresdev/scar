/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `afk` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "afk_user_id_key" ON "afk"("user_id");
