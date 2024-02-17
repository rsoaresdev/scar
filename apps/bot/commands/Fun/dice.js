import { rangeRandomizer } from "@scar/util/functions/util";
import { ApplicationCommandType, EmbedBuilder } from "discord.js";

export default {
 name: "dice",
 description: "🎲 Roll a dice",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: true,
 usage: "/dice",
 run: async (client, interaction, guildSettings) => {
  try {
   const dice = rangeRandomizer(1, 6);

   const embed = new EmbedBuilder()
    .setTitle("🎲 Dice")
    .setDescription(`>>> **You rolled a ${dice}!**`)
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
