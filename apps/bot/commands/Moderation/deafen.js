import { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
 name: "deafenall",
 description: "🔇 Deafen or undeafen all members connected to your voice channel",
 type: ApplicationCommandType.ChatInput,
 cooldown: 5000,
 dm_permission: false,
 usage: "/deafenall <deafen | undeafen>",
 default_member_permissions: [PermissionFlagsBits.DeafenMembers],
 options: [
  {
   name: "option",
   description: "Deafen or undeafen",
   type: ApplicationCommandOptionType.String,
   choices: [
    {
     name: "Deafen All",
     value: "deafen",
    },
    {
     name: "Undeafen all",
     value: "undeafen",
    },
   ],
   required: true,
  },
 ],
 run: async (client, interaction, _guildSettings) => {
  try {
   const { channel } = interaction.member.voice;

   if (!channel) {
    return client.errorMessages.createSlashError(interaction, "You need to be connected in a voice channel to execute this command.");
   }

   const type = interaction.options.getString("option");

   // Check if the channel has members before trying to deafen/undeafen
   if (channel.members.size === 0) {
    return client.errorMessages.createSlashError(interaction, "There are no members in the voice channel to deafen or undeafen.");
   }

   if (type === "deafen") {
    channel.members.forEach((member) => {
     if (member.voice.channel) {
      member.voice.setDeaf(true);
     }
    });

    const embed = new EmbedBuilder().setDescription(`All members of the channel \`${channel.name}\` have been deafened!`).setColor(0xc92a2a);

    return interaction.followUp({
     embeds: [embed],
    });
   }

   if (type === "undeafen") {
    channel.members.forEach((member) => {
     if (member.voice.channel) {
      member.voice.setDeaf(false);
     }
    });

    const embed = new EmbedBuilder().setDescription(`The hearing of all members of the channel \`${channel.name}\` has been restored!`).setColor(0x4cb03f);

    return interaction.followUp({
     embeds: [embed],
    });
   }
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
