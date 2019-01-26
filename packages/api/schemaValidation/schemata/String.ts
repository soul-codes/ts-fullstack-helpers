import { BaseSchema, inferVoidType } from "./Base";

export interface StringOptions<Optional extends boolean = false> {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  optional?: Optional;
}

export class StringSchema<Optional extends boolean = false> extends BaseSchema<
  "string",
  string | inferVoidType<Optional>,
  | ({
      errorCode: "length";
      length: number;
    } & (
      | { minLength: number }
      | { maxLength: number }
      | { minLength: number; maxLength: number }))
  | { errorCode: "type"; foundType: string }
  | { errorCode: "pattern" },
  StringOptions<Optional>
> {
  get typeName() {
    return "string" as "string";
  }

  validate(value: string) {
    const type = typeof value;
    if (type !== "string")
      return value == null && this.options.optional
        ? null
        : { errorCode: "type" as "type", foundType: type };

    const { length } = value;
    const { minLength, maxLength } = this.options;
    if (
      (typeof minLength == "number" && length < minLength) ||
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

    const { pattern } = this.options;
    if (pattern && !pattern.test(value)) {
      return {
        errorCode: "pattern" as "pattern"
      };
    }

    return null;
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
