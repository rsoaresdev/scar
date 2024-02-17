import prismaClient from "@scar/database";
import { cacheGet, cacheSet } from "@scar/database/redis";
import { formatDuration, rangeRandomizer } from "@scar/util/functions/util";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

export default {
 name: "work",
 description: "💵 Works and receives money",
 type: ApplicationCommandType.ChatInput,
 cooldown: 0,
 dm_permission: false,
 usage: "/work",

 run: async (client, interaction, guildSettings) => {
  try {
   const amountToAdd = rangeRandomizer(10, 120);

   const key = `work-${interaction.user.id}`;
   const time = JSON.parse(await cacheGet(key));

   if (time && time.time + 300000 > Date.now()) {
    const timeLeft = time.time + 300000 - Date.now();
    return client.errorMessages.createSlashError(interaction, `You are on cooldown for \`${formatDuration(timeLeft)}\`! Please wait before work again.`);
   }

   await prismaClient.user.update({
    where: {
     discordId: interaction.user.id,
    },
    data: {
     balanceWallet: {
      increment: amountToAdd,
     },
    },
   });

   await cacheSet(key, { userId: interaction.member.user.id, time: Date.now() }, 300000);

   const job = client.config.jobs[Math.floor(Math.random() * client.config.jobs.length)];

   const embed = new EmbedBuilder()
    .setDescription(`>>> You work as \`${job}\` and earn \`${amountToAdd}\` scarcoins.`)
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
