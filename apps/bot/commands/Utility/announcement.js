import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ChannelType, PermissionsBitField } from "discord.js";

export default {
 name: "announcement",
 description: "📢 Broadcasts an announcement, on a specific channel",
 type: ApplicationCommandType.ChatInput,
 cooldown: 5000,
 dm_permission: false,
 usage: "/announcement <channel> <text>",
 options: [
  {
   name: "channel",
   description: "Select the channel to broadcast the announcement",
   type: ApplicationCommandOptionType.Channel,
   required: true,
   channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildText],
  },
  {
   name: "text",
   description: "The text to broadcast. (💡#p# makes a paragraph)",
   required: true,
   type: ApplicationCommandOptionType.String,
   max_length: 4096,
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   const channel = interaction.options.getChannel("channel");
   const text = interaction.options.getString("text");
   const textWithParagraphs = text.replace(/#p#/g, "\n");

   if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    // User doesn't have the required permission
    return client.errorMessages.createSlashError(interaction, "You don't have permission to use this command. You need `Manage Messages` permission");
   }

   if (textWithParagraphs.split(/\r\n|\r|\n/).length > 20) {
    // Too many rows in the broadcast
    return client.errorMessages.createSlashError(interaction, "The broadcasts cannot have more than 20 rows.");
   }

   const broadcastEmbed = new EmbedBuilder()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setDescription(textWithParagraphs)
    .setFooter({
     text: `Broadcasted by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    });

   const broadcastData = await channel.send({
    embeds: [broadcastEmbed],
   });

   const confirmEmbed = new EmbedBuilder()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setDescription(`${client.config.emojis.sparkles} **|** Announcement sent successfully to ${channel}\n> [${client.config.emojis.link} Go to announcement](https://discord.com/channels/${broadcastData.guildId}/${broadcastData.channelId}/${broadcastData.id})`)
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    });

   await interaction.followUp({
    embeds: [confirmEmbed],
    ephemeral: true,
   });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
