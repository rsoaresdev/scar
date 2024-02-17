import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } from "discord.js";

export default {
 name: "ticket",
 description: "🎫 Selects a channel for the ticket panel",
 type: ApplicationCommandType.ChatInput,
 cooldown: 20000,
 dm_permission: false,
 defer: true,
 ephemeral: true,
 usage: "/ticket <channel> <title> <description> <buttonname>",
 options: [
  {
   name: "channel",
   description: "Select a channel",
   type: ApplicationCommandOptionType.Channel,
   channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
   required: true,
  },
  {
   name: "title",
   description: "Enter a title to be displayed in the ticket message",
   type: ApplicationCommandOptionType.String,
   required: true,
   max_length: 50,
  },
  {
   name: "description",
   description: "Enter a description to be displayed in the ticket message",
   type: ApplicationCommandOptionType.String,
   required: true,
   max_length: 2000,
  },
  {
   name: "buttonname",
   description: "Enter a name to be displayed in the button",
   type: ApplicationCommandOptionType.String,
   required: true,
   max_length: 80,
  },
 ],

 run: async (client, interaction, guildSettings) => {
  try {
   // Check if user has 'Administrator' permission
   if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return client.errorMessages.createSlashError(interaction, "You don't have permission to use this command. You need `Administrator` permission");
   }

   const channel = interaction.options.getChannel("channel");
   const string = interaction.options.getString("description");
   const title = interaction.options.getString("title");
   const buttonname = interaction.options.getString("buttonname");

   const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("create-ticket").setLabel(buttonname).setStyle(ButtonStyle.Primary));

   const ticketPanelEmbed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(string)
    .setColor(guildSettings?.embedColor || client.config.defaultColor);

   channel.send({
    embeds: [ticketPanelEmbed],
    components: [row],
   });

   const embed = new EmbedBuilder().setColor(guildSettings?.embedColor || client.config.defaultColor).setDescription("> The ticket system has been set up successfully");
   return interaction.followUp({
    embeds: [embed],
    ephemeral: true,
   });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
