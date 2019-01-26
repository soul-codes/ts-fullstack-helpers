import { BaseSchema, inferVoidType, ValidationResult } from "./Base";

export interface StringOptions<Optional extends boolean = false> {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  optional?: Optional;
}

export type StringSchemaError =
  | ({
      errorCode: "length";
      length: number;
    } & (
      | { minLength: number }
      | { maxLength: number }
      | { minLength: number; maxLength: number }))
  | { errorCode: "type"; foundType: string }
  | { errorCode: "pattern" };

export type StringSchemaValue<Optional extends boolean> =
  | string
  | inferVoidType<Optional>;

export class StringSchema<Optional extends boolean = false> extends BaseSchema<
  "string",
  StringSchemaValue<Optional>,
  StringSchemaError,
  StringOptions<Optional>
> {
  get typeName() {
    return "string" as "string";
  }

  validate(
    value: string
  ): ValidationResult<StringSchemaValue<Optional>, StringSchemaError> {
    const type = typeof value;
    if (type !== "string")
      return value == null && this.options.optional
        ? {
            ok: true,
            value: void 0 as inferVoidType<Optional>
          }
        : {
            ok: false,
            error: { errorCode: "type" as "type", foundType: type }
          };

    const { length } = value;
    const { minLength, maxLength } = this.options;
    if (
      (typeof minLength == "number" && length < minLength) ||
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

    const { pattern } = this.options;
    if (pattern && !pattern.test(value)) {
      return {
        ok: false,
        error: {
          errorCode: "pattern" as "pattern"
        }
      };
    }

    return {
      ok: true,
      value: value
    };
  }
}

export function string(): StringSchema<false>;
export function string(options: StringOptions<false>): StringSchema<false>;
export function string(options: StringOptions<true>): StringSchema<true>;
export function string(
  options: StringOptions<boolean> = {}
): StringSchema<boolean> {
  return new StringSchema(options);
}
