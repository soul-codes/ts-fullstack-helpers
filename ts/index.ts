export function exact<T extends string | number | boolean>(value: T) {
  return value;
}

const RANDOM_CHAR =
  "abcdefghijklmnopqrstuvwxyzACBCDEFGHIJKLMNOPQRSTUVWYZ1234567890";

export function randomId(length: number) {
  return new Array(length)
    .fill(0)
    .map(() => RANDOM_CHAR[Math.floor(Math.random() * RANDOM_CHAR.length)])
    .join("");
}
