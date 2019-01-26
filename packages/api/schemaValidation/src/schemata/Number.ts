import { BaseSchema, inferVoidType, ValidationResult } from "./Base";

export interface NumberOptions<Optional extends boolean = false> {
  min?: number;
  max?: number;
  optional?: Optional;
}

export type NumberSchemaValue<Optional extends boolean> =
  | number
  | inferVoidType<Optional>;
export type NumberSchemaError =
  | ({
      errorCode: "range";
    } & ({ min: number } | { max: number } | { min: number; max: number }))
  | { errorCode: "type"; foundType: string };

export class NumberSchema<Optional extends boolean = false> extends BaseSchema<
  "number",
  NumberSchemaValue<Optional>,
  NumberSchemaError,
  NumberOptions<Optional>
> {
  get typeName() {
    return "number" as "number";
  }

  validate(
    value: number
  ): ValidationResult<NumberSchemaValue<Optional>, NumberSchemaError> {
    const type = typeof value;
    if (type !== "number")
      return value == null && this.options.optional
        ? { ok: true as true, value: void 0 as inferVoidType<Optional> }
        : {
            ok: false as false,
            error: { errorCode: "type" as "type", foundType: type }
          };

    const { min, max } = this.options;
    if (
      (typeof min === "number" && value < min) ||
      (typeof max === "number" && value > max)
    ) {
      return {
        ok: false as false,
        error: {
          errorCode: "range" as "range",
          ...({
            min,
            max
          } as { min: number } | { max: number } | { min: number; max: number })
        }
      };
    }

    return { ok: true as true, value: value };
  }
}

export function number(): NumberSchema<false>;
export function number(options: NumberOptions<false>): NumberSchema<false>;
export function number(options: NumberOptions<true>): NumberSchema<true>;
export function number(
  options: NumberOptions<boolean> = {}
): NumberSchema<boolean> {
  return new NumberSchema(options);
}
