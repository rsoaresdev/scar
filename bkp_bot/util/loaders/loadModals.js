import fs from "node:fs/promises";
import { dirname } from "node:path";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Collection } from "discord.js";

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
 * Loads all modals from the /modals folder
 *
 * @param {object} client - The Discord client
 * @returns {Promise<void>} Promise that resolves when all modals are loaded
 * @throws {Error} Error that is thrown if a modal could not be loaded
 */
export default async function loadModals(client) {
 try {
  const loadTime = performance.now();
  client.modals = new Collection();

  const currentModuleFilePath = fileURLToPath(import.meta.url);
  const currentModuleFolderPath = dirname(currentModuleFilePath);

  const modals = await readFilesRecursively(path.join(currentModuleFolderPath, "..", "..", "modals"));

  for (const value of modals) {
   try {
    const file = await import("file://" + value);
    const { default: modal } = file;

    if (!modal) {
     client.debugger("error", `Modal ${value} doesn't have a default export!`);
     continue;
    }

    const { id, run } = modal;

    if (!id || !run) {
     client.debugger("error", `Modal ${value} is missing required properties!`);
     continue;
    }

    client.modals.set(id, modal);

    if (client.config.displayModalList) {
     client.debugger("info", `Loaded modal ${id} from ${value.replace(process.cwd(), "")}`);
    }
   } catch (error) {
    client.debugger("error", `Error loading modal ${value}: ${error.message}`);
   }
  }
  client.debugger("event", `Loaded ${client.modals.size} modals from /modals in ${client.performance(loadTime)}`);
 } catch (error) {
  client.debugger("error", `Error loading modals: ${error.message}`);
 }
}
