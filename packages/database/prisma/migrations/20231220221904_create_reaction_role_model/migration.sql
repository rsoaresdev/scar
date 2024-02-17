-- AlterTable
ALTER TABLE "guild_leave_message" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '> We''re sorry to see you go!',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '👋 Goodbye {user}!';

-- AlterTable
ALTER TABLE "guild_welcome_message" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '> Welcome to **{guild}** We hope you enjoy your stay here!',
ADD COLUMN     "title" TEXT NOT NULL DEFAULT '🎉 Welcome to the server {user}!';

-- CreateTable
CREATE TABLE "reaction_role" (
    "id" TEXT NOT NULL,
    "guild_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "roles" JSONB NOT NULL,

    CONSTRAINT "reaction_role_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reaction_role_guild_id_key" ON "reaction_role"("guild_id");

-- AddForeignKey
ALTER TABLE "reaction_role" ADD CONSTRAINT "reaction_role_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("guild_id") ON DELETE CASCADE ON UPDATE CASCADE;
