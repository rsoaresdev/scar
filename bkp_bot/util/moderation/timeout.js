import { formatDuration } from "@scar/util/functions/util";
import { EmbedBuilder, PermissionsBitField } from "discord.js";
import ms from "ms";

export async function timeoutMember(client, interaction, color) {
 try {
  const user = interaction.options.getMember("user");
  const reason = interaction.options.getString("reason") || "No reason provided";
  const duration = interaction.options.getString("duration");

  const timeInMs = ms(duration);

  if (!user) {
   return client.errorMessages.createSlashError(interaction, "You need to provide a user to kick");
  }

  if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
   return client.errorMessages.createSlashError(interaction, "You need `MODERATE_MEMBERS` permission to kick members");
  }

  if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
   return client.errorMessages.createSlashError(interaction, "I need `MODERATE_MEMBERS` permission to kick members");
  }

  if (user.id === interaction.member.user.id) {
   return client.errorMessages.createSlashError(interaction, "You can't timeout yourself");
  }

  if (user.id === client.user.id) {
   return client.errorMessages.createSlashError(interaction, "You can't timeout me");
  }

  if (user.roles.highest.comparePositionTo(interaction.member.roles.highest) >= 0) {
   return client.errorMessages.createSlashError(interaction, "This user has higher or equal roles than you");
  }

  if (user.roles.highest.comparePositionTo(interaction.guild.members.me.roles.highest) >= 0) {
   return client.errorMessages.createSlashError(interaction, "This user has higher or equal roles than me");
  }

  if (!timeInMs) {
   return client.errorMessages.createSlashError(interaction, "Invalid time provided");
  }

  if (!timeInMs > 2419200000) {
   return client.errorMessages.createSlashError(interaction, "The timeout duration should be less than 8 hours");
  }

  await user.timeout(timeInMs, reason);

  const embed = new EmbedBuilder()
   .setColor(color)
   .setTimestamp()
   .setTitle("🔨 Member Timeout")
   .setDescription(`> **${user}** has been timeout from the server for \`${formatDuration(timeInMs)}\` (<t:${Math.round((Date.now() + timeInMs) / 1000)}:R>)\n> **Reason:** ${reason}`)
   .setFooter({
    text: `Moderated by ${interaction.member.user.globalName || interaction.member.user.username}`,
    iconURL: interaction.member.user.displayAvatarURL({
     size: 256,
    }),
   });

  interaction.followUp({ embeds: [embed] });
 } catch (err) {
  client.errorMessages.internalError(interaction, err);
 }
}
