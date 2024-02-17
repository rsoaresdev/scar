/* eslint-disable complexity */
import prismaClient from "@scar/database";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, codeBlock } from "discord.js";

export default {
 name: "balance",
 description: "💵 Checks out the money of a particular member",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: false,
 usage: "/balance [user]",
 options: [
  {
   name: "user",
   description: "Select a user",
   required: false,
   type: ApplicationCommandOptionType.User,
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   const user = interaction.options.getUser("user") || interaction.user;

   const userData = await prismaClient.user.findFirst({
    where: {
     discordId: user.id,
    },
   });

   if (user.bot) {
    return client.errorMessages.createSlashError(interaction, "Bots don't have a bank account!");
   }

   const embed = new EmbedBuilder()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setTitle(`💰 ${user.globalName || user.username}'s Balance`)
    .setFields([
     {
      name: "👝 Wallet",
      value: codeBlock(userData ? userData.balanceWallet : 0),
      inline: true,
     },
     {
      name: "🏦 Bank",
      value: codeBlock(userData ? userData.balanceBank : 0),
      inline: true,
     },
    ])
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    });

   return interaction.followUp({ embeds: [embed] });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
