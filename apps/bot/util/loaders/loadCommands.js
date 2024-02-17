/* eslint-disable camelcase */
import fs from "node:fs/promises";
import { dirname } from "node:path";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PermissionsBitField, Collection } from "discord.js";

/**
 * Recursively reads all .js files in a directory and its subdirectories
 * @param {string} folderPath - The path to the folder to read
 * @returns {Promise<string[]>} - Promise that resolves with an array of file paths
 */
async function readFilesRecursively(folderPath) {
 const files = [];
 const read = async (folderPath) => {
  const items = await fs.readdir(folderPath);
  for (const item of items) {
   const itemPath = path.join(folderPath, item);
   const stat = await fs.stat(itemPath);
   if (stat.isDirectory()) {
    await read(itemPath); // Recursively read subdirectory
   } else if (item.endsWith(".js")) {
    files.push(itemPath); // Add .js files to the list
   }
  }
 };
 await read(folderPath);
 return files;
}

/**
 * Loads all slash commands from the /commands folder
 *
 * @param {object} client - The Discord client
 * @returns {Promise<void>} Promise that resolves when all slash commands are loaded
 * @throws {Error} Error that is thrown if a slash command could not be loaded
 */
export default async function loadCommands(client) {
 client.slashCommands = new Collection();
 client.additionalSlashCommands = 0;

 const commandLoadTime = performance.now();

 const currentModuleFilePath = fileURLToPath(import.meta.url);
 const currentModuleFolderPath = dirname(currentModuleFilePath);

 const slashCommandFiles = await readFilesRecursively(path.join(currentModuleFolderPath, "..", "..", "commands"));

 for (const value of slashCommandFiles) {
  try {
   const file = await import("file://" + value);
   const { default: slashCommand } = file;
   // console.log(slashCommand.name);

   if (!slashCommand) {
    client.debugger("error", `Slash command ${value} doesn't have a default export!`);
    continue;
   }

   const { name, description, type, run, options, default_member_permissions } = slashCommand;

   if (!name || !description || !type || !run) {
    client.debugger("error", `Slash command ${value} is missing required properties!`);
    continue;
   }

   // const category = value.split("\\")[value.split("\\").length - 2];
   const category = value.split("/")[value.split("/").length - 2];

   const commandData = {
    ...slashCommand,
    category,
    options: options || [],
   };

   if (default_member_permissions) commandData.default_member_permissions = PermissionsBitField.resolve(default_member_permissions).toString();

   client.slashCommands.set(name, commandData);

   if (options) {
    options.forEach((option) => {
     if (option.type === 1) {
      client.config.displayCommandList && client.debugger("info", `Loaded slash subcommand ${option.name} from ${value.replace(process.cwd(), "")}`);
      client.additionalSlashCommands++;
     }
    });
   }

   client.config.displayCommandList && client.debugger("info", `Loaded slash command ${name} from ${value.replace(process.cwd(), "")}`);
  } catch (error) {
   client.debugger("error", `Error loading slash command ${value}: ${error.message}`);
  }
 }

 client.debugger("event", `Loaded ${client.slashCommands.size + client.additionalSlashCommands} slash commands from /commands in ${client.performance(commandLoadTime)}`);
}
