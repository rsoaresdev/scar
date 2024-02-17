/* eslint-disable no-eval */
import { ApplicationCommandType, ApplicationCommandOptionType, EmbedBuilder } from "discord.js";

async function executeCode(client, interaction, guildSettings) {
 const code = interaction.options.getString("code");

 try {
  const result = await eval(code);
  const type = typeof result;

  const embed = new EmbedBuilder()
   .setFields(
    {
     name: "Code",
     value: `\`\`\`js\n${code}\n\`\`\``,
     inline: false,
    },
    {
     name: "Result",
     value: `\`\`\`js\n${result}\n\`\`\``,
     inline: false,
    },
    {
     name: "Type",
     value: `\`\`\`js\n${type}\n\`\`\``,
     inline: false,
    }
   )
   .setColor(guildSettings?.embedColor || client.config.defaultColor);

  return interaction.followUp({ embeds: [embed] });
 } catch (err) {
  const embed = new EmbedBuilder()
   .setFields(
    {
     name: "Code",
     value: `\`\`\`js\n${code}\n\`\`\``,
     inline: false,
    },
    {
     name: "Exception",
     value: `\`\`\`js\n${err}\n\`\`\``,
     inline: false,
    }
   )
   .setColor(guildSettings?.embedColor || client.config.defaultColor);

  return interaction.followUp({ embeds: [embed] });
 }
}

export default {
 name: "eval",
 description: "👑 Execute arbitrary code",
 type: ApplicationCommandType.ChatInput,
 cooldown: 1000,
 dm_permission: false,
 defer: false,
 usage: "/eval <code>",
 options: [
  {
   name: "code",
   description: "The arbitrary code to execute.",
   required: true,
   type: ApplicationCommandOptionType.String,
   max_length: 4096,
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   await interaction.deferReply({ ephemeral: true });

   if (interaction.user.id === client.config.ownerId) {
    return await executeCode(client, interaction, guildSettings);
   } else {
    return client.errorMessages.createSlashError(interaction, "You can't execute this command.");
   }
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
