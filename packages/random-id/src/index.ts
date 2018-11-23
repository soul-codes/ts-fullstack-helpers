export const NUMBERS = "0123456789";
export const LOWERS = "abcdefghijklmnopqrstuvwxyz";
export const UPPERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
export const ALPHANUMERICS = NUMBERS + LOWERS + UPPERS;
export const SPECIALS = "~!@#$%^&()_+-={}[];',";

/**
 * Generates a single random ID with the specified length and
 * character sample.
 * @param length
 * @param sample
 */
export function randomId(length: number = 16, sample: string = ALPHANUMERICS) {
  let result = "";
  for (var i = 0; i < length; i++)
    result += sample[Math.floor(Math.random() * sample.length)];
  return result;
}

/**
 * Creates a function that generates a random ID of the specified
 * length and character sample.
 * @param length
 * @param sample
 */
export function createRandomIdGenerator(
  length: number = 16,
  sample: string = ALPHANUMERICS
) {
  return () => randomId(length, sample);
}
