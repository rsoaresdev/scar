import prismaClient from "@scar/database";
import { rangeRandomizer } from "@scar/util/functions/util";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default {
 name: "coinflip",
 description: "💵 Flip coin (heads or tails) and earn some money",
 type: ApplicationCommandType.ChatInput,
 cooldown: 120000,
 dm_permission: false,
 usage: "/flip <coin> <bet>",
 options: [
  {
   name: "coin",
   description: "💵 Flip coin (heads or tails) and earn some money",
   type: ApplicationCommandOptionType.Subcommand,
   usage: "/flip coin",
   options: [
    {
     name: "choice",
     description: "Heads or Tails",
     type: ApplicationCommandOptionType.String,
     choices: [
      {
       name: "Heads",
       value: "Heads",
      },
      {
       name: "Tails",
       value: "Tails",
      },
     ],
     required: true,
    },
    {
     name: "bet",
     description: "Choose the amount to bet",
     type: ApplicationCommandOptionType.Integer,
     required: true,
     min_value: 300,
    },
   ],
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   const chosenOption = interaction.options.getString("choice");
   const betAmount = interaction.options.getInteger("bet");

   const randomPercent = rangeRandomizer(40, 100);
   const coinsInflated = Math.floor(betAmount * (randomPercent / 100));

   const randomValueGenerated = rangeRandomizer(1, 2);
   /**
    * @returns 1 - Heads
    * @returns 2 - Tails
    */

   const isHeads = chosenOption === "Heads";
   const isCorrectGuess = (isHeads && randomValueGenerated === 1) || (!isHeads && randomValueGenerated === 2);

   const userData = await prismaClient.user.findFirst({
    where: {
     discordId: interaction.user.id,
    },
   });

   if (userData.balanceWallet < 300) {
    return client.errorMessages.createSlashError(interaction, "You don't have enough scarcoins to make this bet.");
   }

   if (betAmount > userData.balanceWallet) {
    return client.errorMessages.createSlashError(interaction, "Your don't have enough scarcoins.");
   }

   if (isCorrectGuess) {
    // Add money
    await prismaClient.user.update({
     where: {
      discordId: interaction.user.id,
     },
     data: {
      balanceWallet: {
       // Add 500 scarcoins.
       increment: coinsInflated,
      },
     },
    });

    const embed = new EmbedBuilder()
     .setDescription(`>>> Congratulations! You guessed it right. You **win** ${coinsInflated} scarcoins!`)
     .setTimestamp()
     .setColor(guildSettings?.embedColor || client.config.defaultColor)
     .setFooter({
      text: `Better luck next time. • Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    return interaction.followUp({ embeds: [embed] });
   } else {
    // Remove money
    await prismaClient.user.update({
     where: {
      discordId: interaction.user.id,
     },
     data: {
      balanceWallet: {
       // Remove bet scarcoins.
       decrement: betAmount,
      },
     },
    });
    const embed = new EmbedBuilder()
     .setDescription(`>>> Oops! Your guess was incorrect. You **lose** ${betAmount} scarcoins.`)
     .setTimestamp()
     .setColor(guildSettings?.embedColor || client.config.defaultColor)
     .setFooter({
      text: `Better luck next time. • Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    return interaction.followUp({ embeds: [embed] });
   }
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
