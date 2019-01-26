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
        ? { ok: true as true, value: null as any }
        : {
            ok: false as false,
            error: { errorCode: "type" as "type", foundType: type }
          };

    const { length } = value;
    const { minLength, maxLength } = this.options;
    if (
      (typeof minLength == "number" && length < minLength) ||
      (typeof maxLength === "number" && length > maxLength)
    ) {
      return {
        ok: false as false,
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
        ok: false as false,
        error: {
          errorCode: "pattern" as "pattern"
        }
      };
    }

    return { ok: true as true, value: value };
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
