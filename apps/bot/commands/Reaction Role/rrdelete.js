import prismaClient from "@scar/database";
import { ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } from "discord.js";

export default {
 name: "rrdelete",
 description: "🍂 Delete ALL the panel of Reaction Roles",
 type: ApplicationCommandType.ChatInput,
 cooldown: 10000,
 dm_permission: false,
 usage: "/rrdelete",

 run: async (client, interaction, guildSettings) => {
  try {
   // Check if user has 'Administrator' permission
   if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return client.errorMessages.createSlashError(interaction, "You don't have permission to use this command. You need `Administrator` permission");
   }

   const confirmButtons = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Yes").setCustomId("yes").setStyle(ButtonStyle.Success), new ButtonBuilder().setLabel("No").setCustomId("no").setStyle(ButtonStyle.Danger));

   const embed = new EmbedBuilder()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setTitle("A new reaction role was added!")
    .setDescription("> This will **permanently delete** your Reaction Role panel!\nDo you want to continue?");

   return interaction
    .followUp({
     embeds: [embed],
     components: [confirmButtons],
    })
    .then((msg) => {
     const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

     const coletor = msg.createMessageComponentCollector({
      filter,
      max: 1,
      time: 60000,
     });

     coletor.on("collect", async (collected) => {
      const menu = collected.customId;
      collected.deferUpdate();

      if (menu === "yes") {
       try {
        const existingData = await prismaClient.reactionRole.findUnique({
         where: {
          guildId: interaction.guild.id,
         },
        });

        if (existingData) {
         const data = await prismaClient.reactionRole.delete({
          where: {
           guildId: interaction.guild.id,
          },
         });

         if (data) {
          const embedPanelDeleted = new EmbedBuilder().setDescription(`${client.config.emojis.success} Panel deleted!`).setColor(guildSettings?.embedColor || client.config.defaultColor);

          return interaction.followUp({
           embeds: [embedPanelDeleted],
           ephemeral: true,
          });
         }

         const embedPanelNotFound = new EmbedBuilder().setDescription(`${client.config.emojis.error} Panel wasn't found, so it wasn't deleted.`).setColor(guildSettings?.embedColor || client.config.defaultColor);
         return interaction.followUp({
          embeds: [embedPanelNotFound],
         });
        } else {
         return client.errorMessages.createSlashError(interaction, "No reaction role panel found, create a new one!");
        }
       } catch (err) {
        client.errorMessages.internalError(interaction, err);
       }
      }

      if (menu === "no") {
       const embedCancelled = new EmbedBuilder().setColor(guildSettings?.embedColor || client.config.defaultColor).setDescription(`${client.config.emojis.success} Interaction canceled, the panel has not been deleted.`);

       return interaction.followUp({
        embeds: [embedCancelled],
       });
      }
     });
    });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
