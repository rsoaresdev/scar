import prismaClient from "@scar/database";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default {
 name: "deposit",
 description: "💵 Deposit money on bank",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: false,
 usage: "/deposit specific <amount> | /deposit all",
 options: [
  {
   name: "all",
   description: "💵 Deposit all money on bank",
   type: ApplicationCommandOptionType.Subcommand,
   usage: "/deposit all",
  },
  {
   name: "specific",
   description: "💵 Deposit some amount of money on bank",
   type: ApplicationCommandOptionType.Subcommand,
   usage: "/deposit specific",
   options: [
    {
     name: "amount",
     description: "Insert the amount to deposit",
     type: ApplicationCommandOptionType.Integer,
     required: true,
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

    const userBalance = userData.balanceWallet;

    await prismaClient.user.update({
     where: {
      discordId: interaction.user.id,
     },
     data: {
      balanceWallet: {
       decrement: userBalance,
      },
      balanceBank: {
       increment: userBalance,
      },
     },
    });

    const embed = new EmbedBuilder()
     .setDescription(`>>> You deposit \`${userBalance}\` scarcoins.`)
     .setTimestamp()
     .setColor(guildSettings?.embedColor || client.config.defaultColor)
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    return interaction.followUp({ embeds: [embed] });
   } else if (subcommand === "specific") {
    const amountToDeposit = interaction.options.getInteger("amount");

    const userData = await prismaClient.user.findFirst({
     where: {
      discordId: interaction.user.id,
     },
    });

    if (userData.balanceWallet < amountToDeposit) {
     return client.errorMessages.createSlashError(interaction, "You don't have enough money to deposit.");
    }

    await prismaClient.user.update({
     where: {
      discordId: interaction.user.id,
     },
     data: {
      balanceWallet: {
       decrement: amountToDeposit,
      },
      balanceBank: {
       increment: amountToDeposit,
      },
     },
    });

    const embed = new EmbedBuilder()
     .setDescription(`>>> You deposit \`${amountToDeposit}\` scarcoins.`)
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
