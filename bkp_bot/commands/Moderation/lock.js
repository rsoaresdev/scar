import { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder, ChannelType } from "discord.js";

export default {
 name: "lock",
 description: "🔒 Locks a channel",
 type: ApplicationCommandType.ChatInput,
 cooldown: 5000,
 dm_permission: false,
 usage: "/lock <channel>",
 default_member_permissions: [PermissionFlagsBits.ManageChannels],
 options: [
  {
   name: "channel",
   description: "Channel to lock",
   type: ApplicationCommandOptionType.Channel,
   required: true,
   channelTypes: [ChannelType.GuildText],
  },
 ],
 run: async (client, interaction, _guildSettings) => {
  try {
   const channel = interaction.options.getChannel("channel");

   // interaction.guild.id - @everyone
   await channel.permissionOverwrites.edit(interaction.guild.id, {
    SendMessages: false,
   });

   const embed = new EmbedBuilder().setDescription(`🔒 \`${channel.name}\` locked!`).setColor(0xc92a2a);

   return interaction.followUp({
    embeds: [embed],
   });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
