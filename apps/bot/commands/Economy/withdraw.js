import prismaClient from "@scar/database";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default {
 name: "withdraw",
 description: "💵 Withdraw money on bank",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: false,
 usage: "/withdraw specific <amount> | /withdraw all",
 options: [
  {
   name: "all",
   description: "💵 Withdraw all money on bank",
   type: ApplicationCommandOptionType.Subcommand,
   usage: "/withdraw all",
  },
  {
   name: "specific",
   description: "💵 Withdraw some amount of money on bank",
   type: ApplicationCommandOptionType.Subcommand,
   usage: "/withdraw specific",
   options: [
    {
     name: "amount",
     description: "Insert the amount to withdraw",
     type: ApplicationCommandOptionType.Integer,
     required: true,
     minValue: 10,
    },
   ],
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   const subcommand = interaction.options.getSubcommand();

   if (subcommand === "all") {
    const userData = await prismaClient.user.findFirst({
     where: {
      discordId: interaction.user.id,
     },
    });

    const userBalance = userData.balanceBank;

    await prismaClient.user.update({
     where: {
      discordId: interaction.user.id,
     },
     data: {
      balanceBank: {
       decrement: userBalance,
      },
      balanceWallet: {
       increment: userBalance,
      },
     },
    });

    const embed = new EmbedBuilder()
     .setDescription(`>>> You withdraw \`${userBalance}\` scarcoins.`)
     .setTimestamp()
     .setColor(guildSettings?.embedColor || client.config.defaultColor)
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    return interaction.followUp({ embeds: [embed] });
   } else if (subcommand === "specific") {
    const amountToWithdraw = interaction.options.getInteger("amount");

    const userData = await prismaClient.user.findFirst({
     where: {
      discordId: interaction.user.id,
     },
    });

    if (userData.balanceBank < amountToWithdraw) {
     return client.errorMessages.createSlashError(interaction, "You don't have enough money **in your bank** to withdraw.");
    }

    await prismaClient.user.update({
     where: {
      discordId: interaction.user.id,
     },
     data: {
      balanceBank: {
       decrement: amountToWithdraw,
      },
      balanceWallet: {
       increment: amountToWithdraw,
      },
     },
    });

    const embed = new EmbedBuilder()
     .setDescription(`>>> You withdraw \`${amountToWithdraw}\` scarcoins.`)
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
