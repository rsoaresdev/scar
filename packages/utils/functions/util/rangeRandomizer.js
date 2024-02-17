/**
 * Generate a random number within a specified range, inclusive of both minimum and maximum values.
 *
 * @param {number} min - The minimum value of the range.
 * @param {number} max - The maximum value of the range.
 * @returns {number} - A randomly generated number within the specified range.
 */
export function rangeRandomizer(min, max) {
 // Check if min and max are numbers
 if (typeof min !== "number" || typeof max !== "number") {
  throw new Error("Os valores mínimo e máximo devem ser números.");
 }

 // Round to integers
 min = Math.round(min);
 max = Math.round(max);

 // Check if min is less than max
 if (min >= max) {
  // If min and max are equal, return either of them
  if (min === max) {
   return min;
  }
  throw new Error("[rangeRandomizer] The minimum value must be lower than the maximum value.");
 }

 // Calculate the interval between min and max
 const range = max - min;

 // Generate a random number in the range and add it to min
 const randomNumber = Math.random() * range + min;

 // Round to the nearest integer
 const roundedNumber = Math.round(randomNumber);

 return roundedNumber;
}
