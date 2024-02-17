-- CreateTable
CREATE TABLE "invests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "canInvest" BOOLEAN NOT NULL DEFAULT true,
    "investAmount" INTEGER NOT NULL DEFAULT 0,
    "investEnterprise" TEXT NOT NULL,

    CONSTRAINT "invests_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "invests" ADD CONSTRAINT "invests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
