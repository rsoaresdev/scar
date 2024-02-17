import { rangeRandomizer } from "@scar/util/functions/util";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

export default {
 name: "rate",
 description: "📈 Rate something",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: true,
 usage: "/rate (thing)",
 options: [
  {
   name: "thing",
   description: "Thing to rate",
   type: ApplicationCommandOptionType.String,
   max_length: 256,
   required: true,
  },
 ],
 run: async (client, interaction) => {
  try {
   const thing = interaction.options.getString("thing");
   const rate = rangeRandomizer(1, 100);

   let color;
   if (rate <= 100 && rate >= 90) {
    color = 0x57f287;
   } else if (rate >= 50 && rate <= 89) {
    color = 0xffff00;
   } else if (rate >= 0 && rate <= 49) {
    color = 0xed4245;
   }

   const embed = new EmbedBuilder()
    .setTitle("📈 Rating")
    .setDescription(`>>> **I rate ${thing} a ${rate}/100!**`)
    .setTimestamp()
    .setColor(color)
    .setThumbnail(interaction.member.user.displayAvatarURL({ size: 256 }))
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
