import { ApplicationCommandType, EmbedBuilder, ChannelType } from "discord.js";

export default {
 name: "serverinfo",
 description: "🗄️ View information about the current server",
 type: ApplicationCommandType.ChatInput,
 cooldown: 5000,
 dm_permission: false,
 usage: "/serverinfo",

 run: async (client, interaction, guildSettings) => {
  try {
   const textChannels = await interaction.guild.channels.cache.filter((x) => x.type === ChannelType.GuildText).size;
   const voiceChannels = await interaction.guild.channels.cache.filter((x) => x.type === ChannelType.GuildVoice).size;
   const categoriesCount = await interaction.guild.channels.cache.filter((x) => x.type === ChannelType.GuildCategory).size;
   const roleCount = await interaction.guild.roles.cache.size;
   const members = await interaction.guild.members.fetch();

   const embed = new EmbedBuilder()
    .setTitle(interaction.guild.name)
    .setThumbnail(
     interaction.guild.iconURL({
      animated: true,
      size: 4096,
     })
    )
    .setImage(
     interaction.guild.bannerURL({
      size: 1024,
     })
    )
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setDescription(`**ID:** \`${interaction.guild.id}\`\n**Server Owner:** <@${interaction.guild.ownerId}>\n**Creation Date:** <t:${Math.round(interaction.guild.createdAt / 1000)}:f> (<t:${Math.round(interaction.guild.createdAt / 1000)}:R>)`)
    .setFields(
     {
      name: "**Members**",
      value: `> **Total:** ${interaction.guild.memberCount}\n> **Humans:** ${members.filter((m) => !m.user.bot).size}\n> **Bots:** ${members.filter((m) => m.user.bot).size} \`(${Math.round((members.filter((m) => m.user.bot).size / interaction.guild.memberCount) * 100).toFixed(1)}%)\``,
      inline: true,
     },
     {
      name: "**Channels**",
      value: `> **Categories:** ${categoriesCount}\n> **Text channels:** ${textChannels}\n> **Voice channels:** ${voiceChannels}`,
      inline: true,
     },
     {
      name: "**Roles**",
      value: `> ${roleCount}`,
      inline: true,
     },
     {
      name: "**Boosts**",
      value: `> **Level:** ${interaction.guild.premiumSubscriptionCount || 0}`,
      inline: true,
     }
    );

   interaction.followUp({
    embeds: [embed],
   });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
