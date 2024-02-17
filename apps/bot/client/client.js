import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { globalConfig, botConfig, debuggerConfig, dashboardConfig, globalPermissions } from "@scar/config";
import { createErrorEmbed } from "@scar/util/embeds";
import { Logger, chalk } from "@scar/util/functions/util";
import { Client, Partials, GatewayIntentBits, EmbedBuilder } from "discord.js";
import giveaway from "../util/giveaway/core.js";
import loadCommands from "../util/loaders/loadCommands.js";
import loadEvents from "../util/loaders/loadEvents.js";
import loadFonts from "../util/loaders/loadFonts.js";
import loadModals from "../util/loaders/loadModals.js";

const cwd = dirname(fileURLToPath(import.meta.url)).replace("/client", "");
Logger("info", `Current working directory: ${cwd}`);
process.chdir(cwd);

Logger("info", "Starting Scar...");
Logger("info", `Running version v${process.env.npm_package_version} on Node.js ${process.version} on ${process.platform} ${process.arch}`);

const client = new Client({
 intents: [
  // Prettier
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildModeration,
  GatewayIntentBits.GuildMembers,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.GuildEmojisAndStickers,
  GatewayIntentBits.GuildMessageReactions,
  GatewayIntentBits.GuildVoiceStates,
 ],
 partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

client.config = {
 ...botConfig,
 ...globalPermissions,
 ...globalConfig,
 ...debuggerConfig,
 ...dashboardConfig,
};

client.giveawaysManager = giveaway(client);

// Giveaway - giveawayReactionAdded
client.giveawaysManager.on("giveawayReactionAdded", async (giveaway, member, reaction) => {
 try {
  const [isNotAllowed, BonusEntries] = await Promise.all([giveaway.exemptMembers(member), giveaway.checkBonusEntries(member.user)]);

  const embed = new EmbedBuilder()
   .setColor(isNotAllowed ? 0xc92a2a : 0xfcba03)
   .setThumbnail(
    member.guild.iconURL({
     dynamic: true,
    })
   )
   .setAuthor({
    name: isNotAllowed ? "Missing the Requirements" : "Participation in the giveaway confirmed",
   })
   .setDescription(isNotAllowed ? `You are not fulfilling the requirements for [this giveaway](${giveaway.messageURL}), please make sure to fulfill them!\n\nGo back to the Channel: <#${giveaway.channelId}>` : `Your entry for [this giveaway](${giveaway.messageURL}) has been confirmed.\n> **Prize:** \`${giveaway.prize}\`\n> **Winners amount:** \`${giveaway.winnerCount}\`\n> **Your bonus entries:** \`${BonusEntries || 0}\`\n\nGo back to the Channel: <#${giveaway.channelId}>`);

  await member
   .send({
    embeds: [embed],
   })
   .catch(() => {});

  if (isNotAllowed) {
   await reaction.users.remove(member.user);
  }
 } catch (err) {
  console.log(err);
 }
});

// Giveaway - giveawayReactionRemoved
client.giveawaysManager.on("giveawayReactionRemoved", async (giveaway, member) => {
 try {
  const embed = new EmbedBuilder()
   .setColor(0xc25b1f)
   .setThumbnail(
    member.guild.iconURL({
     dynamic: true,
    })
   )
   .setAuthor({
    name: "Giveaway Left!",
   })
   .setDescription(`You left [this giveaway](${giveaway.messageURL}) and aren't participating anymore.\n\nGo back to the Channel: <#${giveaway.channelId}>`);

  await member
   .send({
    embeds: [embed],
   })
   .catch(() => {});
 } catch (err) {
  console.log(err);
 }
});

// Giveaway - giveawayEnded
client.giveawaysManager.on("giveawayEnded", async (giveaway, winners) => {
 winners.forEach(async (winner) => {
  try {
   const embed = new EmbedBuilder()
    .setColor(0x4cb03f)
    .setThumbnail(
     winner.guild.iconURL({
      dynamic: true,
     })
    )
    .setAuthor({
     name: "Giveaway Won!",
    })
    .setDescription(`You won [this giveaway](${giveaway.messageURL}), congrats!\n> **Prize:** \`${giveaway.prize}\`\n\nGo back to the Channel: <#${giveaway.channelId}>`);

   await winner.user
    .send({
     embeds: [embed],
    })
    .catch(() => {});
  } catch (err) {
   console.log(err);
  }
 });
});

// Giveaway - giveawayRerolled
client.giveawaysManager.on("giveawayRerolled", async (giveaway, winners) => {
 winners.forEach(async (winner) => {
  try {
   const embed = new EmbedBuilder()
    .setColor(0x4cb03f)
    .setThumbnail(
     winner.guild.iconURL({
      dynamic: true,
     })
    )
    .setAuthor({
     name: "Giveaway Won!",
    })
    .setDescription(`You won [this giveaway](${giveaway.messageURL}), congrats!\n> **Prize:** \`${giveaway.prize}\`\n\nGo back to the Channel: <#${giveaway.channelId}>`);

   await winner.user
    .send({
     embeds: [embed],
    })
    .catch(() => {});
  } catch (err) {
   console.log(err);
  }
 });
});

client.replyErrorMessages = {
 internalError: (interaction, error) => {
  console.log(error);
  Logger("error", error?.toString() ?? "Unknown error occurred");
  const embed = createErrorEmbed("An error occurred while executing this command. Please try again later.", "Unknown error occurred");
  return interaction.reply({ embeds: [embed], ephemeral: true });
 },
 createSlashError: (interaction, description, title) => {
  const embed = createErrorEmbed(description, title);
  embed.setFooter({
   text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
   iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }),
  });

  return interaction.reply({ embeds: [embed], ephemeral: true });
 },
};

client.errorMessages = {
 internalError: (interaction, error) => {
  console.log(error);
  Logger("error", error?.toString() ?? "Unknown error occurred");
  const embed = createErrorEmbed("An error occurred while executing this command. Please try again later.", "Unknown error occurred");
  return interaction.followUp({ embeds: [embed], ephemeral: true });
 },
 createSlashError: (interaction, description, title) => {
  const embed = createErrorEmbed(description, title);
  embed.setFooter({
   text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
   iconURL: interaction.member.user.displayAvatarURL({ dynamic: true }),
  });

  return interaction.followUp({ embeds: [embed], ephemeral: true });
 },
};

client.debugger = Logger;

client.performance = (time) => {
 const run = Math.floor(performance.now() - time);
 return run > 500 ? chalk.underline.red(`${run}ms`) : chalk.underline(`${run}ms`);
};

await loadCommands(client);
await loadModals(client);
await loadFonts(client);
await loadEvents(client);

Logger("info", "Logging in...");

await client.login(process.env.TOKEN);

export default client;
