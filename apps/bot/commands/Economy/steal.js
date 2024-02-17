import prismaClient from "@scar/database";
import { cacheGet, cacheSet } from "@scar/database/redis";
import { formatDuration, rangeRandomizer } from "@scar/util/functions/util";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default {
 name: "steal",
 description: "💵 Steals money from a member",
 type: ApplicationCommandType.ChatInput,
 cooldown: 0,
 dm_permission: false,
 usage: "/steal <user>",
 options: [
  {
   name: "user",
   description: "The user you want to rob",
   required: true,
   type: ApplicationCommandOptionType.User,
  },
 ],

 run: async (client, interaction, guildSettings) => {
  try {
   const user = interaction.options.getUser("user");

   const userData = await prismaClient.user.findFirst({
    where: {
     discordId: interaction.user.id,
    },
   });

   if (user.bot) {
    return client.errorMessages.createSlashError(interaction, "Bots don't have a bank account, therefore they cannot be stolen!");
   }

   if (user.id == interaction.user.id) {
    return client.errorMessages.createSlashError(interaction, "You cannot steal yourself!");
   }

   if (userData.balanceWallet < 500) {
    return client.errorMessages.createSlashError(interaction, `You need to have \`500\` scarcoins on your **wallet** to be able to steal.\n💡**Tip: You can withdraw ${500 - userData.balanceWallet} scarcoins to continue.**`);
   }

   const key = `steal-${interaction.user.id}`;
   const time = JSON.parse(await cacheGet(key));

   const memberShouldWin = rangeRandomizer(1, 2);

   if (time && time.time + 600000 > Date.now()) {
    const timeLeft = time.time + 600000 - Date.now();
    return client.errorMessages.createSlashError(interaction, `You are on cooldown for \`${formatDuration(timeLeft)}\`! Please wait before steal again.`);
   }

   await cacheSet(key, { userId: interaction.member.user.id, time: Date.now() }, 600000);

   if (memberShouldWin === 1) {
    //? win
    const moneyToSteal = await prismaClient.user.findFirst({
     where: {
      discordId: user.id,
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
       increment: Math.floor(moneyToSteal.balanceWallet * 0.2),
      },
     },
    });

    // Update victim
    await prismaClient.user.update({
     where: {
      discordId: user.id,
     },
     data: {
      balanceWallet: {
       decrement: Math.floor(moneyToSteal.balanceWallet * 0.2),
      },
     },
    });

    const embed = new EmbedBuilder()
     .setDescription(`>>> You have successfully stolen \`${Math.floor(moneyToSteal.balanceWallet * 0.2)}\` scarcoins from ${user}.`)
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
       decrement: Math.floor(moneyToDecrement.balanceWallet * 0.15),
      },
     },
    });

    const embed = new EmbedBuilder()
     .setDescription(`>>> Oops.. you failed to steal ${user}, you lost \`${Math.floor(moneyToDecrement.balanceWallet * 0.15)}\` scarcoins to pay the fine.`)
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
