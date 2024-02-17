-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_user_id_fkey";

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("discord_id") ON DELETE CASCADE ON UPDATE CASCADE;
