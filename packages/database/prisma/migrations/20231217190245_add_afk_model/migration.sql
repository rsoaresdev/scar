-- CreateTable
CREATE TABLE "afk" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "isAfk" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,
    "duration" TEXT NOT NULL,
    "oldNickname" TEXT NOT NULL,

    CONSTRAINT "afk_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "afk" ADD CONSTRAINT "afk_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE CASCADE ON UPDATE CASCADE;
