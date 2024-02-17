import prismaClient from "@scar/database";
import { ApplicationCommandType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

const BUTTON_PICKAXE = "pickaxe";

export default {
 name: "shop",
 description: "💵 Open the shop GUI",
 type: ApplicationCommandType.ChatInput,
 cooldown: 0,
 dm_permission: false,
 usage: "/shop",

 run: async (client, interaction, guildSettings) => {
  try {
   const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setEmoji("⛏️").setCustomId(BUTTON_PICKAXE).setStyle(ButtonStyle.Secondary));

   const embed = new EmbedBuilder()
    .setTitle("💳 Online shop")
    .setDescription("Use the buttons below to buy items")
    .setFields({
     name: "⛏️ Pickaxe",
     value: "`You need a pickaxe to use the dig command.`\n> Price: `120 scarcoins`",
     inline: false,
    })
    .setTimestamp()
    .setColor(guildSettings?.embedColor || client.config.defaultColor)
    .setFooter({
     text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
     iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
    });

   return interaction.followUp({ embeds: [embed], components: [row] }).then((msg) => {
    const filter = (x) => x.isButton() && x.user.id === interaction.user.id;

    const collector = msg.createMessageComponentCollector({
     filter,
     time: 180000,
    });

    collector.on("collect", async (collected) => {
     try {
      const confirmation = collected.customId;
      collected.deferUpdate();

      const userInventory = await prismaClient.inventory.findFirst({
       where: {
        user: {
         discordId: interaction.user.id,
        },
       },
      });

      if (confirmation === BUTTON_PICKAXE) {
       const userData = await prismaClient.user.findFirst({
        where: {
         discordId: interaction.user.id,
        },
       });
       if (userData.balanceWallet < 300) {
        return client.errorMessages.createSlashError(interaction, "You don't have enough scarcoins **on your wallet** to buy this item.");
       }
       if (!userInventory) {
        // Data doesn't exist
        await prismaClient.inventory.create({
         data: {
          user: {
           connectOrCreate: {
            where: {
             discordId: interaction.user.id,
            },
            create: {
             discordId: interaction.user.id,
             name: interaction.user.username,
             global_name: interaction.user.globalName || interaction.user.username,
             discriminator: interaction.user.discriminator,
            },
           },
          },
          hasPickaxe: true,
         },
        });

        // Deduct scarcoins
        await prismaClient.user.update({
         where: {
          discordId: interaction.user.id,
         },
         data: {
          balanceWallet: {
           decrement: 120,
          },
         },
        });

        const embed = new EmbedBuilder()
         .setDescription(">>> Thank you for buying a `Pickaxe` from my store! Happy mining. ⛏️")
         .setTimestamp()
         .setColor(guildSettings?.embedColor || client.config.defaultColor)
         .setFooter({
          text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
          iconURL: interaction.member.user.displayAvatarURL({
           size: 256,
          }),
         });
        return interaction.followUp({ embeds: [embed] });
       } else if (!userInventory.hasPickaxe) {
        // Data exists but doesn't have a pickaxe
        await prismaClient.inventory.updateMany({
         where: {
          userId: interaction.user.id,
         },
         data: {
          hasPickaxe: true,
         },
        });
        // Deduct scarcoins
        await prismaClient.user.update({
         where: {
          discordId: interaction.user.id,
         },
         data: {
          balanceWallet: {
           decrement: 120,
          },
         },
        });
        const embed = new EmbedBuilder()
         .setDescription(">>> Thank you for buying a `Pickaxe` from my store! Happy mining. ⛏️")
         .setTimestamp()
         .setColor(guildSettings?.embedColor || client.config.defaultColor)
         .setFooter({
          text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
          iconURL: interaction.member.user.displayAvatarURL({
           size: 256,
          }),
         });
        return interaction.followUp({ embeds: [embed] });
       } else {
        // Data exists, and already has the pickaxe
        return client.errorMessages.createSlashError(interaction, "You already have a pickaxe, use it!");
       }
      }
     } catch (error) {
      console.error("Error in button collector:", error);
     }
    });
   });
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
