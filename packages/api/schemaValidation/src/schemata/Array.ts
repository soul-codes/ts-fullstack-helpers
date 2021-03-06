import {
  ISchema,
  BaseSchema,
  inferEmptyType,
  RecurseValidation,
  ValidationResult
} from "./Base";

type Schema = ISchema<string, any, any>;

export interface ArrayOptions<Optional extends boolean = false> {
  minLength?: number;
  maxLength?: number;
  optional?: Optional;
}

export type ArraySchemaValue<Item extends Schema, Optional extends boolean> =
  | Array<Item["@nativeType"]>
  | inferEmptyType<Optional>;

export type ArraySchemaError<Item extends Schema> =
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
    };

export class ArraySchema<
  Item extends Schema,
  Optional extends boolean = false
> extends BaseSchema<
  "array",
  ArraySchemaValue<Item, Optional>,
  ArraySchemaError<Item>,
  ArrayOptions<Optional>
> {
  constructor(readonly item: Item, options: ArrayOptions<Optional>) {
    super(options);
  }

  get typeName() {
    return "array" as "array";
  }

  validate(
    value: any,
    recurse: RecurseValidation
  ): ValidationResult<
    ArraySchemaValue<Item, Optional>,
    ArraySchemaError<Item>
  > {
    if (!Array.isArray(value)) {
      return value == null && this.options.optional
        ? { ok: true, value: void 0 as inferEmptyType<Optional> }
        : {
            ok: false,
            error: { errorCode: "type" as "type", foundType: typeof value }
          };
    }

    const { length } = value;
    const { minLength, maxLength } = this.options;
    if (
      (typeof minLength === "number" && length < minLength) ||
      (typeof maxLength === "number" && length > maxLength)
    ) {
      return {
        ok: false,
        error: {
          errorCode: "length" as "length",
          length,
          ...({
            minLength,
            maxLength
          } as
            | { minLength: number }
            | { maxLength: number }
            | { minLength: number; maxLength: number })
        }
      };
    }

    const problems: {
      index: number;
      error: Item["@errorType"];
    }[] = [];
    const parsed: Item["@nativeType"][] = [];
    const { item } = this;
    for (let i = 0, length = value.length; i < length; i++) {
      const result = recurse(value[i], item);
      if (result.ok) {
        parsed.push(result.value);
      } else {
        problems.push({ index: i, error: result.error } as any);
      }
    }

    return problems.length
      ? {
          ok: false,
          error: { errorCode: "children" as "children", childErrors: problems }
        }
      : {
          ok: true,
          value: parsed
        };
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
