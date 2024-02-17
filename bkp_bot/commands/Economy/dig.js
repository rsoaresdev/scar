import prismaClient from "@scar/database";
import { cacheGet, cacheSet } from "@scar/database/redis";
import { formatDuration, rangeRandomizer } from "@scar/util/functions/util";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

export default {
 name: "dig",
 description: "💵 Mine and make money!",
 type: ApplicationCommandType.ChatInput,
 cooldown: 0,
 dm_permission: false,
 usage: "/dig",

 run: async (client, interaction, guildSettings) => {
  try {
   const userInventory = await prismaClient.inventory.findFirst({
    where: {
     user: {
      discordId: interaction.user.id,
     },
    },
   });

   if (!userInventory.hasPickaxe) {
    return client.errorMessages.createSlashError(interaction, "You need a pickaxe in your inventory. Buy one using the `/shop` command.");
   }

   const key = `dig-${interaction.user.id}`;
   const time = JSON.parse(await cacheGet(key));

   const pickaxeShouldBreak = rangeRandomizer(1, 7);

   if (time && time.time + 120000 > Date.now()) {
    const timeLeft = time.time + 120000 - Date.now();
    return client.errorMessages.createSlashError(interaction, `You are on cooldown for \`${formatDuration(timeLeft)}\`! Please wait before dig again.`);
   }

   if (pickaxeShouldBreak === 1) {
    // Remove item from inventory
    await prismaClient.inventory.updateMany({
     where: {
      userId: interaction.user.id,
     },
     data: {
      hasPickaxe: false,
     },
    });

    const embed = new EmbedBuilder()
     .setDescription(">>> Your pickaxe **broke** trying to mine!\nPlease, buy a new one.")
     .setTimestamp()
     .setColor(0xef4444)
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    return interaction.followUp({ embeds: [embed] });
   }

   // mineração completa
   //adiciona dinheiro aleatorio com trabalho aleatorio

   const moneyToAdd = rangeRandomizer(130, 400);

   await prismaClient.user.update({
    where: {
     discordId: interaction.user.id,
    },
    data: {
     balanceWallet: {
      increment: moneyToAdd,
     },
    },
   });

   const ore = client.config.ore[Math.floor(Math.random() * client.config.ore.length)];

   await cacheSet(key, { userId: interaction.member.user.id, time: Date.now() }, 120000);

   const embed = new EmbedBuilder()
    .setDescription(`>>> You've mined ${ore} and won \`${moneyToAdd}\` scarcoins. Congratulations!`)
    .setTimestamp()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
    });
   return interaction.followUp({ embeds: [embed] });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
