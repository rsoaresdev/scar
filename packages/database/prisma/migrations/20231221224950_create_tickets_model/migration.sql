-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "firstMessage" TEXT NOT NULL DEFAULT 'The Staff Team will help you soon! To close the ticket, press the button below',
    "openCategory" TEXT,
    "closeCategory" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tickets_guild_id_key" ON "tickets"("guild_id");

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;
