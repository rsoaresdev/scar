const timeout = new Map();
import prismaClient from "@scar/database";
import { formatDuration } from "@scar/util/functions/util";
import { EmbedBuilder } from "discord.js";

export default {
 id: "suggestion",
 run: async (client, interaction) => {
  await interaction.deferReply({ ephemeral: true });
  const suggestion = interaction.fields.getTextInputValue("suggestion");
  if (suggestion.length < 5 || suggestion.length > 500) {
   const embed = new EmbedBuilder()
    .setTitle("Your suggestion must be between 5 and 500 characters!")
    .setDescription("Please make sure your suggestion is between 5 and 500 characters!")
    .setColor(0xef4444)
    .setTimestamp()
    .setFooter({
     text: `Suggested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    });

   return interaction.followUp({ ephemeral: true, embeds: [embed] });
  }

  const key = `suggest-${interaction.member.user.id}`;

  if (timeout.has(key) && timeout.get(key).time > Date.now()) {
   const { time } = timeout.get(key);
   const duration = formatDuration(time - Date.now());

   const embed = new EmbedBuilder()
    .setTitle("You are on cooldown!")
    .setDescription(`You are on cooldown for \`${duration}\`! Please wait before suggesting again!`)
    .setColor(0xef4444)
    .setTimestamp()
    .setFooter({
     text: `Suggested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({
      size: 256,
     }),
    });

   return interaction.followUp({ ephemeral: true, embeds: [embed] });
  }

  timeout.set(key, { time: Date.now() + 60000 });
  setTimeout(() => {
   timeout.delete(key);
  }, 60000);

  const embed = new EmbedBuilder()
   .setTitle("📝 Thank you for your suggestion!")
   .setDescription(`**Suggestion**: ${suggestion}`)
   .setColor(0x3b82f6)
   .setTimestamp()
   .setFooter({
    text: `Suggested by ${interaction.member.user.globalName || interaction.member.user.username}`,
    iconURL: interaction.member.user.displayAvatarURL({
     size: 256,
    }),
   });

  await prismaClient.suggestions.create({
   data: {
    message: suggestion,
    userId: interaction.member.user.id,
    guildId: interaction.guild.id,
   },
  });

  const embedToAdmins = new EmbedBuilder() // prettier
   .setTitle("📝 New suggestion")
   .setDescription(`>>> ${suggestion}`)
   .setColor(0x10b981)
   .setTimestamp()
   .setFooter({
    text: `Suggested by ${interaction.member.user.globalName || interaction.member.user.username}`,
    iconURL: interaction.member.user.displayAvatarURL({
     size: 256,
    }),
   });

  await interaction.client.channels.fetch("1184618699899019344").then((x) => x.send({ embeds: [embedToAdmins] }));

  return interaction.followUp({ ephemeral: true, embeds: [embed] });
 },
};
