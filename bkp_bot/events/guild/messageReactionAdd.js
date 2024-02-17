import prismaClient from "@scar/database";
import { Logger } from "@scar/util/functions/util";
import { PermissionsBitField } from "discord.js";

async function processReaction(data, message, member) {
 if (!member || member.bot) {
  return;
 }

 const emojiName = message.emoji.name;

 if (!Object.keys(data.roles).includes(emojiName)) {
  return;
 }

 if (message.partial) {
  await message.fetch();
 }

 const { guild } = message.message;
 if (!guild) return;

 // Check if the bot has permission to 'Manage Roles'
 if (guild.members.me.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
  const userRoles = data.roles[emojiName];
  guild.members.cache.get(member.id).roles.add(...userRoles);
 }
}

export async function messageReactionAdd(client, messageReaction, user) {
 try {
  const { message } = messageReaction;

  if (!message) return;

  const data = await prismaClient.reactionRole.findFirst({
   where: {
    message: message.id,
   },
  });

  if (data) {
   await processReaction(data, messageReaction, user);
  }
 } catch (err) {
  Logger("error", `[messageReactionAdd]: ${err}`);
 }
}
