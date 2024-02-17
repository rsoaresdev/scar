import fs from "node:fs/promises";
import { basename } from "node:path";
import { dirname } from "node:path";
import path from "node:path";
import { fileURLToPath } from "node:url";

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
 * Loads all events from the /events folder
 *
 * @param {object} client - The Discord client
 * @returns {Promise<void>} Promise that resolves when all events are loaded
 * @throws {Error} Error that is thrown if an event could not be loaded
 */
export default async function loadEvents(client) {
 try {
  const loadTime = performance.now();

  const currentModuleFilePath = fileURLToPath(import.meta.url);
  const currentModuleFolderPath = dirname(currentModuleFilePath);

  const events = await readFilesRecursively(path.join(currentModuleFolderPath, "..", "..", "events"));

  for (const file of events) {
   await import("file://" + file).then((e) => {
    const eventName = basename(file, ".js");
    client.config.displayEventList && client.debugger("info", `Loaded event ${eventName} from ${file.replace(process.cwd(), "")}`);
    // client.on(eventName, (...args) => eventName.execute(...args));
    // client.on(eventName, (...args) => e[eventName](...args));
    client.on(eventName, e[eventName].bind(null, client));
   });
  }

  client.debugger("event", `Loaded ${events.length} events from /events in ${client.performance(loadTime)}`);
 } catch (error) {
  client.debugger("error", `Error loading events: ${error.message}`);
 }
}
