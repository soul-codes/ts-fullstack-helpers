import {
  Schema,
  BaseSchema,
  ValidationResult,
  RecurseValidation,
  inferVoidType
} from "./Base";

interface StringifiedOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export type StringifiedSchemaValue<
  Parsed extends Schema
> = Parsed["@nativeType"];

export type StringifiedSchemaError<Parsed extends Schema> =
  | { errorCode: "type"; foundType: string }
  | { errorCode: "parse"; parseError: string }
  | {
      errorCode: "value";
      valueError: Parsed["@errorType"];
    };

export class StringifiedSchema<
  Parsed extends Schema,
  Optional extends boolean = false
> extends BaseSchema<
  "stringified",
  StringifiedSchemaValue<Parsed>,
  StringifiedSchemaError<Parsed>,
  StringifiedOptions<Optional>
> {
  constructor(
    readonly parsed: Parsed,
    options: StringifiedOptions<Optional> = {}
  ) {
    super(options);
  }

  get typeName() {
    return "stringified" as "stringified";
  }

  validate(
    value: any,
    recurse: RecurseValidation
  ): ValidationResult<
    StringifiedSchemaValue<Parsed>,
    StringifiedSchemaError<Parsed>
  > {
    const type = typeof value;
    if (type !== "string") {
      return value == null && this.options.optional
        ? { ok: true, value: void 0 as inferVoidType<Optional> }
        : { ok: false, error: { errorCode: "type", foundType: typeof value } };
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(value);
    } catch (error) {
      return {
        ok: false,
        error: {
          errorCode: "parse",
          parseError: String(error)
        }
      };
    }

    const result = recurse(parsed, this.parsed);
    if (!result.ok) {
      return {
        ok: false,
        error: {
          errorCode: "value" as "value",
          valueError: result.error
        }
      };
    }

    return result;
  }
}

export function stringified<Parsed extends Schema>(
  parsed: Parsed,
  options?: StringifiedOptions<false>
): StringifiedSchema<Parsed, false>;
export function stringified<Parsed extends Schema>(
  parsed: Parsed,
  options: StringifiedOptions<true>
): StringifiedSchema<Parsed, true>;
export function stringified<Parsed extends Schema>(
  parsed: Parsed,
  options?: StringifiedOptions<boolean>
): StringifiedSchema<Parsed, boolean> {
  return new StringifiedSchema(parsed, options);
}

/* */
