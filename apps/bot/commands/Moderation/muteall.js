import { ApplicationCommandType, ApplicationCommandOptionType, PermissionFlagsBits, EmbedBuilder } from "discord.js";

export default {
 name: "muteall",
 description: "🎤 Mute or unmute all members connected to your voice channel",
 type: ApplicationCommandType.ChatInput,
 cooldown: 5000,
 dm_permission: false,
 usage: "/muteall <mute | unmute>",
 default_member_permissions: [PermissionFlagsBits.MuteMembers],
 options: [
  {
   name: "option",
   description: "Mute or unmute",
   type: ApplicationCommandOptionType.String,
   choices: [
    {
     name: "Mute All",
     value: "mute",
    },
    {
     name: "Unmute all",
     value: "unmute",
    },
   ],
   required: true,
  },
 ],
 run: async (client, interaction, _guildSettings) => {
  try {
   const { channel } = interaction.member.voice;

   if (!channel) {
    return client.errorMessages.createSlashError(interaction, "You need to be connected in a voice channel, in order to execute this command.");
   }

   const type = interaction.options.getString("option");

   // Check if the channel has members before trying to mute/unmute
   if (channel.members.size === 0) {
    return client.errorMessages.createSlashError(interaction, "There are no members in the voice channel to mute or unmute.");
   }

   if (type === "mute") {
    channel.members.forEach((member) => {
     if (member.voice.channel) {
      member.voice.setMute(true);
     }
    });

    const embed = new EmbedBuilder().setDescription(`All members of the channel \`${channel.name}\` have been silenced!`).setColor(0xc92a2a);

    return interaction.followUp({
     embeds: [embed],
    });
   }

   if (type === "unmute") {
    channel.members.forEach((member) => {
     if (member.voice.channel) {
      member.voice.setMute(false);
     }
    });

    const embed = new EmbedBuilder().setDescription(`The sound of all members of the channel \`${channel.name}\` has become active again!`).setColor(0x4cb03f);

    return interaction.followUp({
     embeds: [embed],
    });
   }
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
