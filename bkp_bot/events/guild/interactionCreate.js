/* eslint-disable complexity */

import prismaClient from "@scar/database";
import { cacheGet, cacheSet } from "@scar/database/redis";
import { createUser } from "@scar/util/database";
import { formatDuration } from "@scar/util/functions/util";
import { EmbedBuilder, PermissionsBitField, ChannelType, ButtonBuilder, ActionRowBuilder, ButtonStyle } from "discord.js";

export async function interactionCreate(client, interaction) {
 try {
  if (!interaction.guild || !interaction.guild.available) return;
  if (!interaction.member.user) await interaction.guild.members.fetch(interaction.member.user.id);

  if (interaction.isChatInputCommand()) {
   const command = client.slashCommands.get(interaction.commandName);
   if (!command) return;

   client.config.displayCommandUsage && client.debugger("info", `Command used: ${interaction.commandName} by ${interaction.member.user.username} (${interaction.member.user.id})`);

   const shouldDefer = command.defer ?? true;
   const shouldBeEphemeral = command.ephemeral ?? false;
   if (shouldDefer) await interaction.deferReply({ ephemeral: shouldBeEphemeral });

   const key = `timeout-${interaction.member.user.id}-${interaction.commandName}`;
   const { cooldown } = command;
   if (cooldown) {
    const time = JSON.parse(await cacheGet(key));
    if (time && time.time + cooldown > Date.now()) {
     const timeLeft = time.time + cooldown - Date.now();
     const embed = new EmbedBuilder()
      .setTitle("Slow down!")
      .setDescription(`You are on cooldown! Please wait \`${formatDuration(timeLeft)}\` before using this command again!`)
      .setColor(0xef4444)
      .setTimestamp()
      .setFooter({
       text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
       iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
      });
     return interaction.followUp({ ephemeral: true, embeds: [embed] });
    } else {
     await cacheSet(key, { userId: interaction.member.user.id, time: Date.now() }, cooldown);
    }
   }

   const guildSettings = await prismaClient.guild.upsert({
    where: {
     guildId: interaction.guild.id,
    },
    update: {},
    create: {
     guildId: interaction.guild.id,
    },
    include: {
     guildDisabledCommands: true,
     guildDisabledCategories: true,
    },
   });

   const canManageGuild = interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild);
   const canManageCategories = interaction.member.permissions.has(PermissionsBitField.Flags.Administrator);

   const commandDisabled = guildSettings.guildDisabledCommands.some((cmd) => cmd.commandName === interaction.commandName);
   const categoryDisabled = guildSettings.guildDisabledCategories.some((cat) => cat.categoryName === command.category);

   if (commandDisabled) {
    const embed = new EmbedBuilder()
     .setTitle("Command disabled")
     .setDescription(`The command \`${interaction.commandName}\` is disabled in this server!${canManageGuild || canManageCategories ? "\n\n**Note:** You can enable it again in the dashboard!" : ""}`)
     .setColor(0xef4444)
     .setTimestamp()
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });

    return interaction.followUp({ ephemeral: true, embeds: [embed] });
   }

   if (categoryDisabled) {
    const embed = new EmbedBuilder()
     .setTitle("Command category disabled")
     .setDescription(`The category \`${command.category}\` is disabled in this server!${canManageGuild || canManageCategories ? "\n\n**Note:** You can enable it again in the dashboard!" : ""}`)
     .setColor(0xef4444)
     .setTimestamp()
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });

    return interaction.followUp({ ephemeral: true, embeds: [embed] });
   }

   await createUser(interaction.member.user);

   client.slashCommands.get(interaction.commandName).run(client, interaction, guildSettings);
   // Logs it in the command log
   interaction.client.channels.cache.get("915582512774926407").send({
    embeds: [
     new EmbedBuilder()
      .setDescription(`<t:${Math.floor(Date.now() / 1000)}:D> (<t:${Math.floor(Date.now() / 1000)}:T>)`)
      .addFields(
       {
        name: "Server",
        value: `> \`${interaction.guild.name}\`\n> \`${interaction.guild.id}\``,
        inline: false,
       },
       {
        name: "Requested by",
        value: `> \`${interaction.user.globalName || interaction.user.username}\` (\`${interaction.user.id}\`)`,
        inline: false,
       },
       {
        name: "Command",
        value: `\`\`\`${interaction}\`\`\``,
        inline: true,
       }
      )
      .setColor(0x2b2d31),
    ],
   });
  } else if (interaction.isButton()) {
   if (interaction.customId === "create-ticket") {
    // Search for any open tickets of the member
    try {
     const ticketsEnabled = await prismaClient.tickets.findFirst({
      where: {
       guildId: interaction.guild.id,
      },
     });

     if (ticketsEnabled) {
      const ticketFound = interaction.guild.channels.cache.find((channel) => channel.name === `ticket-${interaction.user.username.toLowerCase() || "no-username"}`);

      // If it finds a ticket that is already open, it returns an error
      if (ticketFound) {
       return client.replyErrorMessages.createSlashError(interaction, `You already have a ticket open at: ${ticketFound}`);
      }

      // No open tickets found. Continue...
      // Check if the bot has permission to 'Manage Channels'
      if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
       return client.replyErrorMessages.createSlashError(interaction, "I need `MANAGE_CHANNELS` permission to create a ticket");
      }

      // Create a ticket channel
      const ticketsData = await prismaClient.tickets.findFirst({
       where: {
        guildId: interaction.guild.id,
       },
      });

      const { openCategory, firstMessage } = ticketsData || {};
      const categoryOpenTicketsFromDatabase = openCategory ?? null;
      const message = firstMessage ?? null;

      const searchCategory = interaction.guild.channels.cache.find((category) => category.id === categoryOpenTicketsFromDatabase);
      let categoryToOpen = null;

      if (!searchCategory) {
       await prismaClient.tickets.update({
        where: {
         guildId: interaction.guild.id,
        },
        data: {
         openCategory: null,
        },
       });
      } else {
       // Change ticket channel category
       categoryToOpen = categoryOpenTicketsFromDatabase;
      }

      const channel = await interaction.guild.channels.create({
       name: `ticket-${interaction.user.globalName || interaction.user.username || "no-username"}`,
       type: ChannelType.GuildText,
       parent: categoryToOpen,
       permissionOverwrites: [
        ...interaction.guild.roles.cache
         .filter((r) => r.permissions.has(PermissionsBitField.Flags.ManageMessages))
         .map((r) => ({
          id: r.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
         })),
        {
         id: interaction.guild.id,
         deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
         id: interaction.user.id,
         allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
         id: interaction.client.user.id,
         allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
       ],
      });

      const embed = new EmbedBuilder().setDescription(`Your ticket was created on: ${channel}`).setColor(0x5865f2);

      // Send opening message in the ticket HUD channel
      interaction.reply({
       embeds: [embed],
       ephemeral: true,
      });

      // Create button to close the ticket
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("close-ticket").setLabel("Close your ticket").setStyle(ButtonStyle.Danger));

      const placeholders = {
       "{userId}": interaction.user.id,
       "{userMention}": `<@${interaction.user.id}>`,
       "{guildName}": interaction.guild.name,
       "{guildMemberCount}": interaction.guild.memberCount,
      };

      const embedSendTicket = new EmbedBuilder().setDescription(`${message ? message.replace(/{userId}|{userMention}|{guildName}|{guildMemberCount}/g, (match) => placeholders[match]) : "The Staff Team will help you soon! To close the ticket, press the button below."}`).setColor(0x5865f2);

      // Send opening message in the ticket channel
      channel
       .send({
        content: `${interaction.user}`,
        embeds: [embedSendTicket],
        components: [row],
       })
       .then((msg) => {
        msg.pin(); // Pin message
       })
       .catch(console.log);
     } else {
      return client.replyErrorMessages.createSlashError(interaction, "The tickets system is not enabled in this server.");
     }
    } catch (err) {
     client.debugger("error", err);
    }
   }
   if (interaction.customId === "close-ticket") {
    try {
     const data = await prismaClient.tickets.findFirst({
      where: {
       guildId: interaction.guild.id,
      },
     });

     const categoryClose = data && data.closeCategory ? data.closeCategory : null;

     // Check if the server has any ticket closure category defined
     if (!data) {
      // Create embeds
      const embed = new EmbedBuilder().setDescription("The ticket will be closed in a few seconds. Please wait.").setColor(0x5865f2);

      // Sends a message informing that the channel will be deleted in a moment
      await interaction.reply({
       embeds: [embed],
      });

      setTimeout(async () => {
       if (interaction.channel) {
        await interaction.channel.delete();
       }
      }, 5000);
     } else {
      // Check if the ticket is already closed
      if (interaction.channel.parentId === categoryClose && interaction.channel.name.startsWith("closed-")) {
       return client.replyErrorMessages.createSlashError(interaction, "The channel is already closed!\nTo delete it, press the `Delete the ticket permanently` button");
      }

      const targetCategory = interaction.guild.channels.cache.find((category) => category.id === categoryClose);

      if (!targetCategory) {
       await prismaClient.tickets.update({
        where: {
         guildId: interaction.guild.id,
        },
        data: {
         closeCategory: null,
        },
       });
      } else {
       // Change ticket channel category
       await interaction.channel.setParent(categoryClose);
      }

      const permissions = [
       ...interaction.guild.roles.cache
        .filter((r) => r.permissions.has(PermissionsBitField.Flags.ManageMessages))
        .map((r) => ({
         id: r.id,
         allow: [PermissionsBitField.Flags.ViewChannel],
         deny: [PermissionsBitField.Flags.ManageMessages],
        })),
       {
        id: interaction.guild.id,
        deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.ManageMessages],
       },
       {
        id: interaction.client.user.id,
        allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
       },
      ];

      await interaction.channel.permissionOverwrites.set(permissions);

      // Get old channel name and change it to "closed-..."
      const nameOld = interaction.channel.name;
      const nameNew = nameOld.replace(/ticket/g, "closed");
      await interaction.channel.setName(nameNew);

      // Send a message with a permanently delete ticket button
      const embed = new EmbedBuilder().setDescription("This ticket has been terminated!").setColor(0x5865f2);

      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("permanently-delete-ticket").setLabel("Delete the ticket permanently").setStyle(ButtonStyle.Danger));

      await interaction.reply({
       embeds: [embed],
       components: [row],
      });
     }
    } catch (err) {
     client.debugger("error", err);
    }
   }
   if (interaction.customId === "permanently-delete-ticket") {
    try {
     // Check if bot has permission to manage channels
     if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return client.replyErrorMessages.createSlashError(interaction, "I need `MANAGE_CHANNELS` permission to ban members");
     }

     // Delete channel
     if (interaction.channel) {
      await interaction.channel.delete();
     }
    } catch (err) {
     client.debugger("error", err);
    }
   }
  } else if (interaction.isModalSubmit()) {
   const modal = client.modals.get(interaction.customId);
   if (!modal) return;

   client.config.displayModalUsage && client.debugger("info", `Modal used: ${interaction.customId} by ${interaction.member.user.username} (${interaction.member.user.id})`);

   const guildSettings = await prismaClient.guild.upsert({
    where: {
     guildId: interaction.guild.id,
    },
    update: {},
    create: {
     guildId: interaction.guild.id,
    },
   });

   await createUser(interaction.member.user);

   await modal.run(client, interaction, guildSettings);
  } else if (interaction.isAutocomplete()) {
   const command = client.slashCommands.get(interaction.commandName);
   if (!command) return;
   if (command.autocomplete && typeof command.autocomplete === "function") await command.autocomplete(client, interaction);
  }
 } catch (err) {
  client.debugger("error", err);
 }
}
