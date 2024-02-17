import prismaClient from "@scar/database";
import { GiveawaysManager } from "discord-giveaways";

/**
 * Creates a new giveaway manager.
 *
 * @param {object} client - The Discord client.
 * @returns {GiveawaysManager} The giveaway manager.
 */

export default function giveaway(client) {
 const Giveaways = class extends GiveawaysManager {
  async getAllGiveaways() {
   const giveawaysData = await prismaClient.giveaways.findMany({
    select: { data: true },
   });

   // Check if giveawaysData is defined and not empty
   if (!giveawaysData || giveawaysData.length === 0) {
    return [];
   }

   // Filter out undefined values and extract data property
   const dataArray = giveawaysData.filter((giveaway) => giveaway && giveaway.data).map((giveaway) => giveaway.data);

   return dataArray;
  }

  async saveGiveaway(messageId, giveawayData) {
   return await prismaClient.giveaways.create({
    data: {
     messageId,
     data: giveawayData,
     guild: {
      connectOrCreate: {
       where: { guildId: giveawayData.guildId },
       create: { guildId: giveawayData.guildId },
      },
     },
    },
   });
  }

  async editGiveaway(messageId, giveawayData) {
   return await prismaClient.giveaways.update({
    where: { messageId },
    data: {
     data: giveawayData,
    },
   });
  }

  async deleteGiveaway(messageId) {
   return await prismaClient.giveaways.delete({
    where: { messageId },
   });
  }

  async refreshStorage() {
   // This should make all shard refreshing their cache with the updated database
   return client.shard.broadcastEval(() => this.giveawaysManager.getAllGiveaways());
  }
 };

 const manager = new Giveaways(client, {
  default: {
   embedColor: "#ab4b52",
   embedColorEnd: "15859772",
   botsCanWin: false,
   // exemptPermissions: ["MANAGE_MESSAGES", "ADMINISTRATOR"],
   reaction: client.config.emojis.giveaway,
  },
 });
 return manager;
}
