import { ApplicationCommandType, ApplicationCommandOptionType, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export default {
 name: "github",
 description: "🎭 Shows a GitHub profile of a particular user",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: false,
 usage: "/github",
 options: [
  {
   name: "profile",
   description: "Enter the username of the GitHub user profile.",
   required: true,
   type: ApplicationCommandOptionType.String,
   max_length: 39,
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   const profile = interaction.options.getString("profile");

   const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("🔗 Profile Link").setURL(`https://github.com/${profile}`).setStyle(ButtonStyle.Link));

   const response = await fetch(`https://api.github.com/users/${profile}`)
    .then((res) => res.json())
    .catch((err) => {
     client.errorMessages.internalError(interaction, err);
    });

   if (response.message == "Not Found") {
    return client.errorMessages.createSlashError(interaction, "GitHub profile not found.");
   }

   const embed = new EmbedBuilder()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTimestamp()
    .setTitle(`🔎 ${response.name}'s Github Profile`)
    .setThumbnail(response.avatar_url)
    .setDescription(`> ${response.bio ?? "No bio"}`)
    .setFields(
     {
      name: "Public Repositories",
      value: response.public_repos?.toLocaleString() ?? "No repositories",
      inline: true,
     },
     {
      name: "Followers",
      value: response.followers?.toLocaleString() ?? "No followers",
      inline: true,
     },
     {
      name: "Following",
      value: response.following?.toLocaleString() ?? "No following",
      inline: true,
     },
     {
      name: "Email",
      value: response.email ?? "No email",
      inline: true,
     },
     {
      name: "Company",
      value: response.company ?? "No company",
      inline: true,
     },
     {
      name: "Location",
      value: response.location ?? "No location",
      inline: true,
     }
    )
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    });

   await interaction.followUp({
    embeds: [embed],
    components: [row],
   });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
