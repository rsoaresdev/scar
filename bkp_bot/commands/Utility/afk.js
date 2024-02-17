import prismaClient from "@scar/database";
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder, PermissionsBitField } from "discord.js";

export default {
 name: "afk",
 description: "💤 Enable the AFK mode",
 type: ApplicationCommandType.ChatInput,
 cooldown: 5000,
 dm_permission: false,
 usage: "/afk <reason>",
 defer: true,
 ephemeral: true,
 options: [
  {
   name: "reason",
   description: "The reason of the afk",
   required: true,
   type: ApplicationCommandOptionType.String,
   max_length: 500,
  },
 ],
 run: async (client, interaction, _guildSettings) => {
  try {
   const reason = interaction.options.getString("reason");
   const memberUsername = interaction.user.globalName || interaction.user.username || "No username";

   if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
    return client.errorMessages.createSlashError(interaction, "I need `MANAGE_NICKNAMES` permission in order to continue with this command.\nPlease contact a server moderator.");
   }

   const userAfk = await prismaClient.afk.findFirst({
    where: {
     userId: interaction.user.id,
    },
   });

   console.log(userAfk);

   if (!userAfk || !userAfk.isAfk) {
    //? activate the afk

    await prismaClient.afk.upsert({
     where: {
      userId: interaction.user.id,
     },
     update: {
      isAfk: true,
      reason,
      oldNickname: memberUsername,
     },
     create: {
      isAfk: true,
      reason,
      oldNickname: memberUsername,
      user: {
       connectOrCreate: {
        where: {
         discordId: interaction.user.id,
        },
        create: {
         discordId: interaction.user.id,
         name: interaction.user.username,
         global_name: memberUsername,
         discriminator: interaction.user.discriminator,
        },
       },
      },
     },
    });

    const embed = new EmbedBuilder()
     .setColor(0x469450)
     .setTimestamp()
     .setTitle("AFK activated!")
     .setDescription("Your nickname has been changed.\nWhen someone mentions it, you will be warned that you are AFK.\nFor your convenience, your AFK will be deactivated when you write in chat again.")
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({
       size: 256,
      }),
     });

    if (reason) {
     embed.setFields({
      name: "Reason",
      value: reason,
      inline: false,
     });
    }

    if (interaction.user.id === interaction.guild.ownerId) {
     // Is the guild owner
     const embed = new EmbedBuilder()
      .setColor(0x469450)
      .setTimestamp()
      .setTitle("AFK activated!")
      .setDescription("> I have activated your AFK and when someone mentions it I will inform you that you are AFK\n\n> However, due to Discord limitations, **it is not possible to change the nickname of the server owner!**")
      .setFooter({
       text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
       iconURL: interaction.member.user.displayAvatarURL({
        size: 256,
       }),
      });

     return interaction.followUp({
      embeds: [embed],
      ephemeral: true,
     });
    } else if (!interaction.member.manageable) {
     // User cannot be manageable

     const embed = new EmbedBuilder()
      .setColor(0x469450)
      .setTimestamp()
      .setTitle("AFK activated!")
      .setDescription("> I have activated your AFK and when someone mentions it I will inform you that you are AFK\n\n> However, due to Discord limitations, **I can't change nicknames to roles above the bot's role!**")
      .setFooter({
       text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
       iconURL: interaction.member.user.displayAvatarURL({
        size: 256,
       }),
      });

     return interaction.followUp({
      embeds: [embed],
      ephemeral: true,
     });
    } else {
     interaction.member.setNickname(`[AFK] ${memberUsername}`);
    }

    await interaction.followUp({
     embeds: [embed],
     ephemeral: true,
    });
   } else {
    //? afk already active
    return client.errorMessages.createSlashError(interaction, "Your AFK is already activated!");
   }
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
