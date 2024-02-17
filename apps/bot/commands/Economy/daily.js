import prismaClient from "@scar/database";
import { cacheGet, cacheSet } from "@scar/database/redis";
import { formatDuration } from "@scar/util/functions/util";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

export default {
 name: "daily",
 description: "💵 Receive the daily wage",
 type: ApplicationCommandType.ChatInput,
 cooldown: 0,
 dm_permission: false,
 usage: "/daily",

 run: async (client, interaction, guildSettings) => {
  try {
   const key = `daily-${interaction.user.id}`;
   const time = JSON.parse(await cacheGet(key));

   if (time && time.time + 86400000 > Date.now()) {
    const timeLeft = time.time + 86400000 - Date.now();
    return client.errorMessages.createSlashError(interaction, `You are on cooldown for \`${formatDuration(timeLeft)}\`! Please wait before collect your daily wage again.`);
   }

   await prismaClient.user.update({
    where: {
     discordId: interaction.user.id,
    },
    data: {
     balanceWallet: {
      increment: 700,
     },
    },
   });

   await cacheSet(key, { userId: interaction.member.user.id, time: Date.now() }, 86400000);

   const embed = new EmbedBuilder()
    .setDescription(">>> You collect `700` scarcoins.")
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
