-- CreateTable
CREATE TABLE "invest" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amountInvested" INTEGER NOT NULL,
    "claimed" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invest_user_id_key" ON "invest"("user_id");

-- AddForeignKey
ALTER TABLE "invest" ADD CONSTRAINT "invest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE CASCADE ON UPDATE CASCADE;
