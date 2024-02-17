import prismaClient from "@scar/database";
import { Logger } from "@scar/util/functions/util";
import { EmbedBuilder, ChannelType, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export async function guildCreate(client, guild) {
 if (!guild.available) return;

 try {
  // Create embed
  const logEmbed = new EmbedBuilder()
   .setThumbnail(
    guild.iconURL({
     dynamic: true,
    })
   )
   .setTitle("<:online:915585399097810964> Guilds Log")
   .setDescription(`<t:${Math.floor(Date.now() / 1000)}:D> (<t:${Math.floor(Date.now() / 1000)}:T>)\n\n> **Name:** \`${guild.name}\`\n> **ID:** \`${guild.id}\`\n> **Owner:** \`${guild.ownerId}\`\n> **Member Count:** \`${guild.memberCount}\``)
   .setFooter({
    text: `${guild.client.guilds.cache.size} servers`,
   })
   .setColor(0x4cb03f);

  // Get and send to 'log guilds' channel
  await guild.client.channels.fetch("915580197787549726").then((x) => x.send({ embeds: [logEmbed] }));

  // Get and send new guild.members.message
  const welcomeChannel = guild.channels.cache.find((channel) => channel.type === ChannelType.GuildText && channel.permissionsFor(guild.members.me).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks]));

  if (welcomeChannel) {
   // Create embed
   const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel("Dashboard").setURL("https://scarbot.com").setStyle(ButtonStyle.Link));

   const embedNewServer = new EmbedBuilder().setColor(0x5865f2).setDescription(`Hey! My name is **Scar**.\n\n Thanks for inviting me to your server, it means a lot to us!\nPlease, configure all the bot's systems and commands on the [\`dashboard\`](https://scarbot.com) & see the list of commands [\`here\`](https://scarbot.com/commands)\n\n> Server number: \`${guild.client.guilds.cache.size}\``).setFooter({
    text: "Use it, have fun, and repeat it!",
   });

   // Send message
   await welcomeChannel.send({
    embeds: [embedNewServer],
    components: [row],
   });
  }

  await prismaClient.guild.upsert({
   where: {
    guildId: guild.id,
   },
   update: {},
   create: {
    guildId: guild.id,
   },
  });
 } catch (error) {
  Logger("error", `Failed to create guild ${error}`);
 }
}
