import fs from "node:fs/promises";
import { dirname } from "node:path";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GlobalFonts } from "@napi-rs/canvas";

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
   } else if (item.endsWith(".ttf")) {
    files.push(itemPath); // Add .ttf files to the list
   }
  }
 };
 await read(folderPath);
 return files;
}

/**
 * Loads all fonts from the /util/images/fonts folder
 *
 * @param {object} client - The Discord client
 * @returns {Promise<void>} Promise that resolves when all fonts are loaded
 * @throws {Error} Error that is thrown if a font could not be loaded
 */
export default async function loadFonts(client) {
 try {
  const loadTime = performance.now();

  const currentModuleFilePath = fileURLToPath(import.meta.url);
  const currentModuleFolderPath = dirname(currentModuleFilePath);

  const fonts = await readFilesRecursively(path.join(currentModuleFolderPath, "..", "images", "fonts"));

  for (const font of fonts) {
   GlobalFonts.registerFromPath(font, font.split("/").pop().replace(".ttf", ""));
  }
  client.debugger("event", `Loaded ${fonts.length} fonts in ${client.performance(loadTime)}`);
 } catch (error) {
  client.debugger("error", `Error loading fonts: ${error.message}`);
 }
}
