import prismaClient from "@scar/database";
import { ApplicationCommandType, PermissionsBitField, EmbedBuilder } from "discord.js";

export default {
 name: "rrpanel",
 description: "🍂 View the server's Reaction Role panel",
 type: ApplicationCommandType.ChatInput,
 cooldown: 120000,
 defer: true,
 ephemeral: true,
 dm_permission: false,
 usage: "/rrpanel",

 run: async (client, interaction, guildSettings) => {
  try {
   // Check if user has 'Administrator' permission
   if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return client.errorMessages.createSlashError(interaction, "You don't have permission to use this command. You need `Administrator` permission");
   }

   const data = await prismaClient.reactionRole.findUnique({
    where: {
     guildId: interaction.guild.id,
    },
   });

   if (!data) {
    return client.errorMessages.createSlashError(interaction, "Give your community the option to receive notifications of new announcements by reacting to the emoji!\n💡 **Tip:** *You can create a new panel using: `/rradd <role> <emoji>`*");
   }

   const mapped = Object.entries(data.roles)
    .map(([, value]) => {
     const role = interaction.guild.roles.cache.get(value[0]);
     return `> ${value[1].raw} - ${role}`;
    })
    .join("\n");

   const embed = new EmbedBuilder()
    .setTitle("Reaction Roles")
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setDescription(`React to receive the role\n\n${mapped}`);

   const message = await interaction.channel.send({
    embeds: [embed],
   });

   await prismaClient.reactionRole.update({
    where: {
     guildId: interaction.guild.id,
    },
    data: {
     message: message.id,
    },
   });

   const reactions = Object.values(data.roles).map((val) => val[1].id || val[1].raw);
   reactions.map((emoji) => message.react(emoji));

   const embedComplete = new EmbedBuilder().setColor(guildSettings?.embedColor || client.config.defaultColor).setDescription("The reaction panel was generated successfully!");

   await interaction.followUp({
    embeds: [embedComplete],
    ephemeral: true,
   });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
