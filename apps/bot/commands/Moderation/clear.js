/* eslint-disable array-callback-return */
import { ApplicationCommandType, ApplicationCommandOptionType, PermissionsBitField, EmbedBuilder } from "discord.js";

export default {
 name: "clear",
 description: "🧹 Deletes messages",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: false,
 usage: "/clear <amount> [user]",
 defer: true,
 ephemeral: true,
 options: [
  {
   name: "amount",
   description: "Number of messages to delete",
   required: true,
   max_value: 100,
   min_value: 1,
   type: ApplicationCommandOptionType.Integer,
  },
  {
   name: "user",
   description: "Select a target to delete their messages",
   required: false,
   type: ApplicationCommandOptionType.User,
  },
 ],

 run: async (client, interaction, guildSettings) => {
  try {
   const amount = interaction.options.getInteger("amount");
   const target = interaction.options.getUser("user");

   // Check if user has 'Manage Messages' permission
   if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
    return client.errorMessages.createSlashError(interaction, "You don't have permission to use this command. You need `Manage Messages` permission");
   }

   const messages = await interaction.channel.messages.fetch({
    limit: amount,
   });

   const res = new EmbedBuilder().setColor(guildSettings?.embedColor || client.config.defaultColor).setFooter({
    text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
    iconURL: interaction.member.user.displayAvatarURL({
     size: 256,
    }),
   });

   if (target) {
    const filtered = [];

    (await messages).filter((msg) => {
     if (msg.author.id === target.id && amount > 1) {
      filtered.push(msg);
     }
    });

    await interaction.channel.bulkDelete(filtered).then(async (messages) => {
     res.setDescription(`🧹 **|** Successfully deleted \`${messages.size}\` messages from ${target}`);
    });

    await interaction.followUp({ embeds: [res] });
   } else {
    await interaction.channel.bulkDelete(amount, true).then((messages) => {
     res.setDescription(`🧹 **|** Successfully deleted \`${messages.size}\` messages from ${interaction.channel}`);
    });

    return interaction.followUp({ embeds: [res] });
   }
  } catch (err) {
   // Handle internal errors
   client.errorMessages.internalError(interaction, err);
  }
 },
};
