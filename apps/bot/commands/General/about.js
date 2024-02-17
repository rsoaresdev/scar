import { ActionRowBuilder, ApplicationCommandType, ButtonStyle, ButtonBuilder, EmbedBuilder } from "discord.js";

export default {
 name: "about",
 description: "🏷️ Learn more about Scar",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: true,
 usage: "/about",
 run: async (client, interaction, guildSettings) => {
  try {
   const embed = new EmbedBuilder() // Prettier
    .setTitle(`🤖 About ${client.user.username}`)
    .setDescription(
     `Experience the pinnacle of server security, comfort, and entertainment • **Moderation, Backups, Giveaways, Ranks, Economy, Logs, Reaction Roles, Tickets, and more!** 🎉
     
     ${client.config.url ? `**If you want to invite Scar to your server, you can do so by clicking [here](${client.config.url})**` : ""}
     `
    )
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    })
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp();

   if (client.config.url) {
    const action = new ActionRowBuilder() // prettier
     .addComponents(
      new ButtonBuilder() // prettier
       .setLabel("Dashboard")
       .setStyle(ButtonStyle.Link)
       .setURL(client.config.url),
      new ButtonBuilder() // prettier
       .setLabel("Invite")
       .setStyle(ButtonStyle.Link)
       .setURL(`${client.config.url}/invite`)
     );

    return interaction.followUp({
     ephemeral: false,
     embeds: [embed],
     components: [action],
    });
   } else {
    return interaction.followUp({ ephemeral: false, embeds: [embed] });
   }
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
