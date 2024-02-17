import { ActionRowBuilder, ApplicationCommandType, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";

export default {
 name: "meme",
 description: "😂 Get a random meme",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: true,
 usage: "/meme",
 run: async (client, interaction, guildSettings) => {
  // get joke from https://meme-api.com/gimme
  try {
   const response = await fetch("https://meme-api.com/gimme");
   const meme = await response.json();

   if (!meme) {
    return client.errorMessages.createSlashError(interaction, "No results found.");
   }

   const embed = new EmbedBuilder()
    .setTitle(meme.title)
    .setImage(meme.url)
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
    });

   const actionRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder() // prettier
     .setStyle(ButtonStyle.Link)
     .setLabel("View on Reddit")
     .setURL(meme.url)
   );

   return interaction.followUp({ embeds: [embed], components: [actionRow] });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
