import prismaClient from "@scar/database";
import { cacheGet, cacheSet } from "@scar/database/redis";
import { formatDuration, rangeRandomizer } from "@scar/util/functions/util";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

export default {
 name: "crime",
 description: "💵 Commits a crime",
 type: ApplicationCommandType.ChatInput,
 cooldown: 0,
 dm_permission: false,
 usage: "/crime",

 run: async (client, interaction, guildSettings) => {
  try {
   const userData = await prismaClient.user.findFirst({
    where: {
     discordId: interaction.user.id,
    },
   });

   if (userData.balanceWallet < 500) {
    return client.errorMessages.createSlashError(interaction, `You need to have \`500\` scarcoins on your **wallet** to be able to commit a crime.\n💡**Tip: You can withdraw ${500 - userData.balanceWallet} scarcoins to continue.**`);
   }

   const key = `crime-${interaction.user.id}`;
   const time = JSON.parse(await cacheGet(key));

   const memberShouldWin = rangeRandomizer(1, 7);

   if (time && time.time + 600000 > Date.now()) {
    const timeLeft = time.time + 600000 - Date.now();
    return client.errorMessages.createSlashError(interaction, `You are on cooldown for \`${formatDuration(timeLeft)}\`! Please wait before commit a crime again.`);
   }

   await cacheSet(key, { userId: interaction.member.user.id, time: Date.now() }, 600000);

   if (memberShouldWin === 1) {
    const moneyToAdd = rangeRandomizer(20, 150);
    //? win
    // Update requester
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

    const embed = new EmbedBuilder()
     .setDescription(`>>> You have successfully earn \`${moneyToAdd}\` scarcoins after committing a crime.`)
     .setTimestamp()
     .setColor(guildSettings?.embedColor || client.config.defaultColor)
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    return interaction.followUp({ embeds: [embed] });
   } else {
    //? lose
    const moneyToDecrement = await prismaClient.user.findFirst({
     where: {
      discordId: interaction.user.id,
     },
     select: {
      balanceWallet: true,
     },
    });

    // Update requester
    await prismaClient.user.update({
     where: {
      discordId: interaction.user.id,
     },
     data: {
      balanceWallet: {
       decrement: Math.floor(moneyToDecrement.balanceWallet * 0.2),
      },
     },
    });

    const embed = new EmbedBuilder()
     .setDescription(`>>> Oops, you failed to commit the crime, so you lost \`${Math.floor(moneyToDecrement.balanceWallet * 0.2)}\` scarcoins to pay the fine.`)
     .setTimestamp()
     .setColor(guildSettings?.embedColor || client.config.defaultColor)
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    return interaction.followUp({ embeds: [embed] });
   }
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
