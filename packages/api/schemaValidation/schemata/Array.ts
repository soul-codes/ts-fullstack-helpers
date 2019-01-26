import { ISchema, BaseSchema, inferVoidType, RecurseValidation } from "./Base";

type Schema = ISchema<string, any, any>;

export interface ArrayOptions<Optional extends boolean = false> {
  minLength?: number;
  maxLength?: number;
  optional?: Optional;
}

export class ArraySchema<
  Item extends Schema,
  Optional extends boolean = false
> extends BaseSchema<
  "array",
  Array<Item["@nativeType"]> | inferVoidType<Optional>,
  | { errorCode: "type"; foundType: string }
  | ({
      errorCode: "length";
      length: number;
    } & (
      | { minLength: number }
      | { maxLength: number }
      | { minLength: number; maxLength: number }))
  | {
      errorCode: "children";
      childErrors: {
        index: number;
        error: Item["@errorType"];
      }[];
    },
  ArrayOptions<Optional>
> {
  constructor(readonly item: Item, options: ArrayOptions<Optional>) {
    super(options);
  }

  get typeName() {
    return "array" as "array";
  }

  validate(value: any, recurse: RecurseValidation) {
    if (!Array.isArray(value)) {
      return value == null && this.options.optional
        ? null
        : { errorCode: "type" as "type", foundType: typeof value };
    }

    const { length } = value;
    const { minLength, maxLength } = this.options;
    if (
      (typeof minLength === "number" && length < minLength) ||
      (typeof maxLength === "number" && length > maxLength)
    ) {
      return {
        errorCode: "length" as "length",
        length,
        ...({
          minLength,
          maxLength
        } as
          | { minLength: number }
          | { maxLength: number }
          | { minLength: number; maxLength: number })
      };
    }

    const problems: {
      index: number;
      error: Item["@errorType"];
    }[] = [];
    const { item } = this;
    for (let i = 0, length = value.length; i < length; i++) {
      const problem = recurse(value[i], item);
      if (problem) {
        problems.push({ index: i, error: problem } as any);
      }
    }

    return problems.length
      ? { errorCode: "children" as "children", childErrors: problems }
      : null;
  }
}

export function array<Item extends Schema>(
  item: Item
): ArraySchema<Item, false>;
export function array<Item extends Schema>(
  item: Item,
  options: ArrayOptions<false>
): ArraySchema<Item, false>;
export function array<Item extends Schema>(
  item: Item,
  options: ArrayOptions<true>
): ArraySchema<Item, true>;
export function array<Item extends Schema>(
  item: Item,
  options: ArrayOptions<boolean> = {}
): ArraySchema<Item, boolean> {
  return new ArraySchema(item, options);
}
