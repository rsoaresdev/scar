import prismaClient from "@scar/database";
import { Logger } from "@scar/util/functions/util";
import { EmbedBuilder } from "discord.js";

export async function guildDelete(client, guild) {
 if (!guild.available) return;

 try {
  // Create embed
  const logEmbed = new EmbedBuilder()
   .setThumbnail(
    guild.iconURL({
     dynamic: true,
    })
   )
   .setTitle("<:dnd:915585399131361280> Guilds Log")
   .setDescription(`<t:${Math.floor(Date.now() / 1000)}:D> (<t:${Math.floor(Date.now() / 1000)}:T>)\n\n> **Name:** \`${guild.name}\`\n> **ID:** \`${guild.id}\`\n> **Owner:** \`${guild.ownerId}\`\n> **Member Count:** \`${guild.memberCount}\``)
   .setFooter({
    text: `${guild.client.guilds.cache.size} servers`,
   })
   .setColor(0xff4444);

  // Get and send to 'log guilds' channel
  await guild.client.channels.fetch("915580197787549726").then((x) => x.send({ embeds: [logEmbed] }));

  const guildExists = await prismaClient.guild.findUnique({
   where: {
    guildId: guild.id,
   },
  });

  if (guildExists) {
   await prismaClient.guild.delete({
    where: {
     guildId: guild.id,
    },
   });
  }
 } catch (error) {
  Logger("error", `Failed to create guild ${error}`);
 }
}
