import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Import a json file from the same folder as the current module
 *
 * @param {string} name - The name of the json file to import
 * @returns {Promise<object>} - The parsed json file
 * @throws {Error} - Throws an error if the operation fails
 * @example
 * const advices = await ImportJSON("advices");
 * console.log(advices);
 * // => [ { advice: 'If you are afraid of something, you should do it.' }, ... ]
 **/
export function ImportJSON(name) {
 try {
  const currentModuleFilePath = fileURLToPath(import.meta.url);
  const currentModuleFolderPath = path.dirname(currentModuleFilePath);
  const filePath = path.join(currentModuleFolderPath, `${name}.json`);
  const fileContent = readFileSync(filePath, "utf8");

  return JSON.parse(fileContent);
 } catch (error) {
  console.error("Failed to import JSON file: ", error);
  throw error;
 }
}
