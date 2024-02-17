import prismaClient from "@scar/database";
import { formatDuration, rangeRandomizer } from "@scar/util/functions/util";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default {
 name: "invest",
 description: "💵 Invests a certain amount of money",
 type: ApplicationCommandType.ChatInput,
 cooldown: 2000,
 dm_permission: false,
 usage: "/invest start <amount> | /invest check",
 options: [
  {
   name: "start",
   description: "💵 Starts an investment",
   type: ApplicationCommandOptionType.Subcommand,
   usage: "/invest start <amount>",
   options: [
    {
     name: "amount",
     description: "Choose the amount to invest",
     type: ApplicationCommandOptionType.Integer,
     required: true,
     minValue: 500,
    },
   ],
  },
  {
   name: "check",
   description: "💵 Checks the status of the current investment",
   type: ApplicationCommandOptionType.Subcommand,
   usage: "/invest check",
  },
 ],

 run: async (client, interaction, guildSettings) => {
  const timeout = 60 * 60 * 1000; // 60 minutos * 60 segundos * 1000 milissegundos
  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "start") {
   const amountToInvest = interaction.options.getInteger("amount");

   try {
    const userData = await prismaClient.user.findFirst({
     where: {
      discordId: interaction.user.id,
     },
    });

    if (userData.balanceWallet < amountToInvest) {
     return client.errorMessages.createSlashError(interaction, "You don't have enough money **in your wallet** to invest.");
    }
    const userDataInvest = await prismaClient.invest.findFirst({
     where: {
      userId: interaction.user.id,
     },
    });

    if (!userDataInvest || userDataInvest.claimed) {
     //? Start invest
     await prismaClient.invest.upsert({
      where: {
       userId: interaction.user.id,
      },
      update: {
       amountInvested: amountToInvest,
       claimed: false,
      },
      create: {
       amountInvested: amountToInvest,
       claimed: false,
       user: {
        connectOrCreate: {
         where: {
          discordId: interaction.user.id,
         },
         create: {
          discordId: interaction.user.id,
          name: interaction.user.username,
          global_name: interaction.user.globalName || interaction.user.username || "No username",
          discriminator: interaction.user.discriminator,
         },
        },
       },
      },
     });

     const stock = client.config.stocks[Math.floor(Math.random() * client.config.stocks.length)];

     const embed = new EmbedBuilder()
      .setDescription(`>>> You invested \`${amountToInvest}\` scarcoins in \`${stock}\`, come back again in 1h to claim your reward.`)
      .setTimestamp()
      .setColor(guildSettings?.embedColor || client.config.defaultColor)
      .setFooter({
       text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
       iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
      });

     return interaction.followUp({ embeds: [embed] });
    } else if (Date.now() < Date.parse(userDataInvest.startedAt) + timeout) {
     //? Investment on going
     client.errorMessages.createSlashError(interaction, `Your investment is still in progress, check again in \`${formatDuration(timeout - (Date.now() - Date.parse(userDataInvest.startedAt)))}\``);
    } else {
     //? Investment finished, waiting to claim
     const embed = new EmbedBuilder()
      .setDescription(">>> Your investment is ready to claim! Execute: `/invest check`")
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
  } else if (subcommand === "check") {
   try {
    const rand = rangeRandomizer(1, 5);

    const userData = await prismaClient.user.findFirst({
     where: {
      discordId: interaction.user.id,
     },
    });

    const userDataInvest = await prismaClient.invest.findFirst({
     where: {
      userId: interaction.user.id,
     },
    });

    if (!userDataInvest || userDataInvest.claimed) {
     //? Investment not started, yet
     client.errorMessages.createSlashError(interaction, "You haven't started any investment yet, run: `/invest start <amount>`");
    } else if (Date.now() < Date.parse(userDataInvest.startedAt) + timeout) {
     //? Investment on going
     client.errorMessages.createSlashError(interaction, `Your investment is still in progress, check again in \`${formatDuration(timeout - (Date.now() - Date.parse(userDataInvest.startedAt)))}\``);
    } else if (rand === 1) {
     //? Investment finished, lose money

     //? Deduct from 50% to 100% of amount invested
     const randomPercent = rangeRandomizer(50, 100);
     const amountToDecrement = Math.floor((randomPercent / 100) * userDataInvest.amountInvested);
     const newBalance = Math.max(0, userData.balanceWallet - amountToDecrement);

     // Update the user balance
     await prismaClient.user.update({
      where: {
       discordId: interaction.user.id,
      },
      data: {
       balanceWallet: newBalance,
      },
     });

     // Change the claimed status to true
     await prismaClient.invest.update({
      where: {
       userId: interaction.user.id,
      },
      data: {
       claimed: true,
      },
     });

     const embed = new EmbedBuilder()
      .setDescription(`>>> Unfortunately, you have lost your investment. You lost: \`${amountToDecrement}\` scarcoins.`)
      .setTimestamp()
      .setColor(guildSettings?.embedColor || client.config.defaultColor)
      .setFooter({
       text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
       iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
      });

     return interaction.followUp({ embeds: [embed] });
    } else {
     //? Increment from 60% to 100% of amount invested
     const randomPercent = rangeRandomizer(60, 100);
     const amountToAdd = Math.floor((randomPercent / 100) * userDataInvest.amountInvested);

     // Update the user balance
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

     // Change the claimed status to true
     await prismaClient.invest.update({
      where: {
       userId: interaction.user.id,
      },
      data: {
       claimed: true,
      },
     });

     //? Investment finished, earn money
     const embed = new EmbedBuilder()
      .setDescription(`>>> 🥳 Congratulations! Your investment has yielded a return of \`${amountToAdd}\` scarcoins.`)
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
  }
 },
};
