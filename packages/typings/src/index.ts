/**
 * Makes a string/number/boolean literal an exact type. Not usually
 * needed when assigning a literal to a constant but will be needed
 * when returning exact values without type annotation on the return
 * type, or when creating an ad-hoc object.
 * @param value
 */
export function exact<T extends string | number | boolean>(value: T) {
  return value;
}

/**
 * Extracts the item type from an array type.
 */
export type ArrayItem<T extends Array<any>> = T extends Array<infer Item>
  ? Item
  : never;

/**
 * Describes a type that may be wrapped in a promise.
 */
export type MaybePromise<T> = T | Promise<T>;

/**
 * Extracts the resolved type of a promise, or return other
 * types verbatim.
 */
export type Resolve<T> = T extends Promise<infer Resolved> ? Resolved : T;

/**
 * Represents every falsy value.
 */
export type Falsy = 0 | null | false | void | undefined | "";

/**
 * Represents a value that could also be an array.
 */
export type MaybeArray<T> = T | Array<T>;

/**
 * Extracts the item type of a MaybeArray: if the type isn't an array,
 * it is returned as is.
 */
export type MaybeArrayItem<T> = T extends Array<infer Item> ? Item : T;
