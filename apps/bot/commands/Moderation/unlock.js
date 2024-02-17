import { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder, ChannelType } from "discord.js";

export default {
 name: "unlock",
 description: "🔓 Unlocks a channel",
 type: ApplicationCommandType.ChatInput,
 cooldown: 5000,
 dm_permission: false,
 usage: "/unlock <channel>",
 default_member_permissions: [PermissionFlagsBits.ManageChannels],
 options: [
  {
   name: "channel",
   description: "Channel to unlock",
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
    SendMessages: null,
   });

   const embed = new EmbedBuilder().setDescription(`🔓 \`${channel.name}\` unlocked!`).setColor(0x4cb03f);

   return interaction.followUp({
    embeds: [embed],
   });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
