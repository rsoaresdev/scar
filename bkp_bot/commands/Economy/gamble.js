import prismaClient from "@scar/database";
import { cacheGet, cacheSet } from "@scar/database/redis";
import { formatDuration, rangeRandomizer } from "@scar/util/functions/util";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

function getEmoji() {
 const ran = rangeRandomizer(1, 9);
 switch (ran) {
  case 1:
   return "\uD83C\uDF52";
  case 2:
   return "\uD83C\uDF4C";
  case 3:
   return "\uD83C\uDF51";
  case 4:
   return "\uD83C\uDF45";
  case 5:
   return "\uD83C\uDF49";
  case 6:
   return "\uD83C\uDF47";
  case 7:
   return "\uD83C\uDF53";
  case 8:
   return "\uD83C\uDF50";
  case 9:
   return "\uD83C\uDF4D";
  default:
   return "\uD83C\uDF52";
 }
}

function calculateReward(amount, var1, var2, var3) {
 if (var1 === var2 && var2 === var3) return 3 * amount;
 if (var1 === var2 || var2 === var3 || var1 === var3) return 2 * amount;
 return 0;
}
export default {
 name: "gamble",
 description: "💵 Try your luck by gambling",
 type: ApplicationCommandType.ChatInput,
 cooldown: 0,
 dm_permission: false,
 usage: "/gamble",
 options: [
  {
   name: "amount",
   description: "Insert the amount to gamble",
   type: ApplicationCommandOptionType.Integer,
   required: true,
   minValue: 10,
  },
 ],

 run: async (client, interaction, guildSettings) => {
  try {
   const betAmount = interaction.options.getInteger("amount");

   const userData = await prismaClient.user.findFirst({
    where: {
     discordId: interaction.user.id,
    },
   });

   if (userData.balanceWallet < betAmount) {
    return client.errorMessages.createSlashError(interaction, "You don't have enough money **on your wallet** to start a gamble session.");
   }

   const key = `daily-${interaction.user.id}`;
   const time = JSON.parse(await cacheGet(key));

   if (time && time.time + 600000 > Date.now()) {
    const timeLeft = time.time + 600000 - Date.now();
    return client.errorMessages.createSlashError(interaction, `You are on cooldown for \`${formatDuration(timeLeft)}\`! Please wait before start a gamble session again.`);
   }

   const slot1 = getEmoji();
   const slot2 = getEmoji();
   const slot3 = getEmoji();

   const str = `
    **Gamble Amount** ${betAmount} scarcoins
    **Multiplier:** 2x
    ╔══════════╗
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()}⠀║
    ╠══════════╣
    ║ ${slot1} ║ ${slot2} ║ ${slot3} ⟸
    ╠══════════╣
    ║ ${getEmoji()} ║ ${getEmoji()} ║ ${getEmoji()}⠀║
    ╚══════════╝
    `;

   const reward = calculateReward(betAmount, slot1, slot2, slot3);
   const result = `${reward > 0 ? `You won: ${reward}` : `You lost: ${betAmount}`} scarcoins`;

   if (reward > 0) {
    await prismaClient.user.update({
     where: {
      discordId: interaction.user.id,
     },
     data: {
      balanceWallet: {
       increment: reward,
      },
     },
    });
   } else {
    await prismaClient.user.update({
     where: {
      discordId: interaction.user.id,
     },
     data: {
      balanceWallet: {
       decrement: betAmount,
      },
     },
    });
   }

   await cacheSet(key, { userId: interaction.member.user.id, time: Date.now() }, 600000);

   const embed = new EmbedBuilder()
    .setDescription(str)
    .setTimestamp()
    .setThumbnail(client.config.emojis.gamble)
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setFooter({
     text: `${result} • Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
    });
   return interaction.followUp({ embeds: [embed] });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
