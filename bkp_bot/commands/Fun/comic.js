import { load } from "cheerio";
import { ApplicationCommandType, EmbedBuilder, ApplicationCommandOptionType } from "discord.js";

export default {
 name: "comic",
 description: "📚 Get a comic from xkcd, phd or garfield",
 type: ApplicationCommandType.ChatInput,
 cooldown: 3000,
 dm_permission: true,
 usage: "/comic <comic>",
 options: [
  {
   name: "garfield",
   description: "💬 Check out the latest garfield comic",
   type: ApplicationCommandOptionType.Subcommand,
  },
 ],
 run: async (client, interaction, guildSettings) => {
  try {
   const command = interaction.options.getSubcommand();

   if (command === "garfield") {
    const date = new Date();
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const day = date.getUTCDate();
    console.log(year, month, day);

    const request = await fetch(`https://www.gocomics.com/garfield/${year}/${month}/${day}`);
    const text = await request.text();

    if (!text) {
     return client.errorMessages.createSlashError(interaction, "No results found. Try again in a few hours.");
    }

    const $ = load(text);
    const image = $(".item-comic-image img").attr("src");

    if (!image) {
     return client.errorMessages.createSlashError(interaction, "No results found. Try again in a few hours.");
    }

    const embed = new EmbedBuilder()
     .setTitle(`📚 Garfield by Jim Davis (${year}/${month}/${day})`)
     .setImage(image)
     .setColor(guildSettings?.embedColor || client.config.defaultColor)
     .setTimestamp()
     .setFooter({
      text: `Requested by ${interaction.member.user.globalName || interaction.member.user.username}`,
      iconURL: interaction.member.user.displayAvatarURL({ size: 256 }),
     });
    return interaction.followUp({ embeds: [embed] });
   }
  } catch (err) {
   client.errorMessages.internalError(interaction, err);
  }
 },
};
