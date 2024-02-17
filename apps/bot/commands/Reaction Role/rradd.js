import prismaClient from "@scar/database";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField, parseEmoji } from "discord.js";

export default {
 name: "rradd",
 description: "🍂 Add a reaction role to the panel (/rrpanel)",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: false,
 usage: "/rradd <role> <emoji>",
 options: [
  {
   name: "role",
   description: "Select a role",
   type: ApplicationCommandOptionType.Role,
   required: true,
  },
  {
   name: "emoji",
   description: "Select one emoji",
   type: ApplicationCommandOptionType.String,
   required: true,
  },
 ],

 run: async (client, interaction, guildSettings) => {
  try {
   const role = interaction.options.getRole("role");
   const string = interaction.options.getString("emoji");

   // Check if user has 'Administrator' permission
   if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return client.errorMessages.createSlashError(interaction, "You don't have permission to use this command. You need `Administrator` permission");
   }

   if (!string.trim().match(/<?(?:(a):)?(\w{1,32}):(\d{17,19})?>?/)) {
    return client.errorMessages.createSlashError(interaction, "Not a valid emoji!");
   }

   if (role.comparePositionTo(interaction.guild.members.me.roles.highest) >= 0) {
    return client.errorMessages.createSlashError(interaction, "This role is higher or equal as mine, choose another role or move me up.");
   }

   const parsedEmoji = parseEmoji(string);

   const data = await prismaClient.reactionRole.findUnique({
    where: {
     guildId: interaction.guild.id,
    },
   });

   if (data) {
    data.roles[parsedEmoji.name] = [
     role.id,
     {
      id: parsedEmoji.id,
      raw: string,
     },
    ];

    await prismaClient.reactionRole.update({
     where: {
      guildId: interaction.guild.id,
     },
     data: {
      roles: data.roles,
     },
    });
   } else {
    await prismaClient.reactionRole.create({
     data: {
      guildId: interaction.guild.id,
      message: "0",
      roles: {
       [parsedEmoji.name]: [
        role.id,
        {
         id: parsedEmoji.id,
         raw: string,
        },
       ],
      },
     },
    });
   }

   const embed = new EmbedBuilder()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTitle("A new reaction role was added!")
    .setDescription("> Execute `/rrpanel` to view!\n💡 **Must-know:** *The bot must be above the role to be provided.*");

   return interaction.followUp({
    embeds: [embed],
   });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
