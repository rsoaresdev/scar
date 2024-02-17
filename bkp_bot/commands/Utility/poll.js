import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, ChannelType, PermissionsBitField } from "discord.js";

export default {
 name: "poll",
 description: "📊 Starts a poll for members to vote",
 type: ApplicationCommandType.ChatInput,
 cooldown: 5000,
 dm_permission: false,
 usage: "/poll <channel> <text>",
 options: [
  {
   name: "channel",
   description: "Select the channel to start the poll",
   type: ApplicationCommandOptionType.Channel,
   required: true,
   channelTypes: [ChannelType.GuildAnnouncement, ChannelType.GuildText],
  },
  {
   name: "description",
   description: "Enter the description. (💡#p# makes a paragraph)",
   required: true,
   type: ApplicationCommandOptionType.String,
   max_length: 2048,
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   const channel = interaction.options.getChannel("channel");
   const description = interaction.options.getString("description");
   const textWithParagraphs = description.replace(/#p#/g, "\n");

   if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    // User doesn't have the required permission
    return client.errorMessages.createSlashError(interaction, "You don't have permission to use this command. You need `Manage Messages` permission");
   }

   if (textWithParagraphs.split(/\r\n|\r|\n/).length > 20) {
    // Too many rows in the poll
    return client.errorMessages.createSlashError(interaction, "The poll cannot have more than 20 rows.");
   }

   const pollEmbed = new EmbedBuilder()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setDescription(textWithParagraphs)
    .setFooter({
     text: `Poll started by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    });

   let pollData;

   await channel
    .send({
     embeds: [pollEmbed],
    })
    .then(async (msg) => {
     pollData = msg;
     await msg.react(client.config.emojis.success).catch(async () => {
      await msg.react("✅");
     });
     await msg.react(client.config.emojis.error).catch(async () => {
      await msg.react("❌");
     });
    });

   const confirmEmbed = new EmbedBuilder()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setDescription(`${client.config.emojis.barchart} **|** Poll started in ${channel}\n> [${client.config.emojis.link} Go to announcement](https://discord.com/channels/${pollData.guildId}/${pollData.channelId}/${pollData.id})`)
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
