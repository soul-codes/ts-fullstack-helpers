import { BaseSchema, inferVoidType } from "./Base";

export interface EnumOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export class EnumSchema<
  Values extends string | boolean | number,
  Optional extends boolean = false
> extends BaseSchema<
  "enum",
  Values | inferVoidType<Optional>,
  { errorCode: "mismatch"; allowedValues: Values[] },
  EnumOptions<Optional>
> {
  constructor(readonly values: Values[], options: EnumOptions<Optional> = {}) {
    super(options);
  }

  get typeName() {
    return "enum" as "enum";
  }

  validate(value: Values) {
    if (
      !this.values.includes(value) &&
      !(value == null && this.options.optional)
    )
      return {
        ok: false as false,
        error: {
          errorCode: "mismatch" as "mismatch",
          allowedValues: this.values
        }
      };

    return {
      ok: true as true,
      value: value == null ? (null as any) : value
    };
  }
}

export function choiceOf<Values extends string | number | boolean>(
  values: Values[],
  options?: EnumOptions<false>
): EnumSchema<Values, false>;
export function choiceOf<Values extends string | number | boolean>(
  values: Values[],
  options: EnumOptions<true>
): EnumSchema<Values, true>;
export function choiceOf<Values extends string | number | boolean>(
  values: Values[],
  options: EnumOptions<boolean> = {}
): EnumSchema<Values, boolean> {
  return new EnumSchema(values, options);
}

export function exactly<Value extends string | number | boolean>(
  value: Value,
  options?: EnumOptions<false>
): EnumSchema<Value, false>;
export function exactly<Value extends string | number | boolean>(
  value: Value,
  options: EnumOptions<true>
): EnumSchema<Value, true>;
export function exactly<Value extends string | number | boolean>(
  value: Value,
  options: EnumOptions<boolean> = {}
): EnumSchema<Value, boolean> {
  return new EnumSchema([value], options);
}
