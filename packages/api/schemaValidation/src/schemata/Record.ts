import {
  ISchema,
  BaseSchema,
  inferEmptyType,
  RecurseValidation,
  ValidationResult
} from "./Base";

type Schema = ISchema<string, any, any>;

export interface RecordOptions<Optional extends boolean = false> {
  minEntries?: number;
  maxEntries?: number;
  optional?: Optional;
}

export type RecordSchemaValue<Item extends Schema, Optional extends boolean> =
  | Record<string, Item["@nativeType"]>
  | inferEmptyType<Optional>;

export type RecordSchemaError<Item extends Schema> =
  | { errorCode: "type"; foundType: string }
  | ({
      errorCode: "entryCount";
      entryCount: number;
    } & (
      | { minEntries: number }
      | { maxEntries: number }
      | { minEntries: number; maxEntries: number }
    ))
  | {
      errorCode: "children";
      childErrors: {
        index: number;
        error: Item["@errorType"];
      }[];
    };

export class RecordSchema<
  Item extends Schema,
  Optional extends boolean = false
> extends BaseSchema<
  "record",
  RecordSchemaValue<Item, Optional>,
  RecordSchemaError<Item>,
  RecordOptions<Optional>
> {
  constructor(readonly item: Item, options: RecordOptions<Optional>) {
    super(options);
  }

  get typeName() {
    return "record" as "record";
  }

  validate(
    value: unknown,
    recurse: RecurseValidation
  ): ValidationResult<
    RecordSchemaValue<Item, Optional>,
    RecordSchemaError<Item>
  > {
    if (typeof value !== "object" || !value) {
      return value == null && this.options.optional
        ? { ok: true, value: void 0 as inferEmptyType<Optional> }
        : {
            ok: false,
            error: { errorCode: "type" as "type", foundType: typeof value }
          };
    }

    const keys = Object.keys(value);
    const { length } = keys;
    const { minEntries, maxEntries } = this.options;
    if (
      (typeof minEntries === "number" && length < minEntries) ||
      (typeof maxEntries === "number" && length > maxEntries)
    ) {
      return {
        ok: false,
        error: {
          errorCode: "entryCount" as "entryCount",
          entryCount: length,
          ...({
            minEntries,
            maxEntries
          } as
            | { minEntries: number }
            | { maxEntries: number }
            | { minEntries: number; maxEntries: number })
        }
      };
    }

    const problems: {
      index: number;
      error: Item["@errorType"];
    }[] = [];
    const parsed: Record<string, Item["@nativeType"]> = Object.create(null);
    const { item } = this;
    for (let i = 0, length = keys.length; i < length; i++) {
      const key = keys[i];
      const result = recurse((value as Record<string, unknown>)[key], item);
      if (result.ok) {
        parsed[key] = result.value;
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

export function record<Item extends Schema>(
  item: Item
): RecordSchema<Item, false>;
export function record<Item extends Schema>(
  item: Item,
  options: RecordOptions<false>
): RecordSchema<Item, false>;
export function record<Item extends Schema>(
  item: Item,
  options: RecordOptions<true>
): RecordSchema<Item, true>;
export function record<Item extends Schema>(
  item: Item,
  options: RecordOptions<boolean> = {}
): RecordSchema<Item, boolean> {
  return new RecordSchema(item, options);
}
