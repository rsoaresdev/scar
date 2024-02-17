import prismaClient from "@scar/database";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default {
 name: "pay",
 description: "💵 Pays a certain amount to a member",
 type: ApplicationCommandType.ChatInput,
 cooldown: 0,
 dm_permission: false,
 usage: "/pay <user> <amount>",
 options: [
  {
   name: "user",
   description: "The user you want to pay",
   required: true,
   type: ApplicationCommandOptionType.User,
  },
  {
   name: "amount",
   description: "The amount to pay",
   required: true,
   type: ApplicationCommandOptionType.Integer,
   minValue: 10,
  },
 ],

 run: async (client, interaction, guildSettings) => {
  try {
   const user = interaction.options.getUser("user");
   const amount = interaction.options.getInteger("amount");

   const userData = await prismaClient.user.findFirst({
    where: {
     discordId: interaction.user.id,
    },
   });

   if (user.bot) {
    return client.errorMessages.createSlashError(interaction, "Bots don't have a bank account!");
   }

   if (userData.balanceWallet < amount) {
    return client.errorMessages.createSlashError(interaction, "You don't have enough money **on wallet** to pay.");
   }

   // Deduct amount from main user
   await prismaClient.user.update({
    where: {
     discordId: interaction.user.id,
    },
    data: {
     balanceWallet: {
      decrement: amount,
     },
    },
   });

   // Add money to user 2
   await prismaClient.user.update({
    where: {
     discordId: user.id,
    },
    data: {
     balanceWallet: {
      increment: amount,
     },
    },
   });

   const embed = new EmbedBuilder()
    .setDescription(`>>> You paid \`${amount}\` scarcoins to ${user}.`)
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
