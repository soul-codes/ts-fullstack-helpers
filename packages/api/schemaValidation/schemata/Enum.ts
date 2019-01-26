import { BaseSchema, inferVoidType, ValidationResult } from "./Base";

export interface EnumOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export type EnumValue = string | boolean | number;

export type EnumSchemaValue<
  Values extends EnumValue,
  Optional extends boolean
> = Values | inferVoidType<Optional>;

export type EnumSchemaError<Values extends EnumValue> = {
  errorCode: "mismatch";
  allowedValues: Values[];
};

export class EnumSchema<
  Values extends EnumValue,
  Optional extends boolean = false
> extends BaseSchema<
  "enum",
  EnumSchemaValue<Values, Optional>,
  EnumSchemaError<Values>,
  EnumOptions<Optional>
> {
  constructor(readonly values: Values[], options: EnumOptions<Optional> = {}) {
    super(options);
  }

  get typeName() {
    return "enum" as "enum";
  }

  validate(
    value: Values
  ): ValidationResult<
    EnumSchemaValue<Values, Optional>,
    EnumSchemaError<Values>
  > {
    if (
      !this.values.includes(value) &&
      !(value == null && this.options.optional)
    )
      return {
        ok: false,
        error: {
          errorCode: "mismatch" as "mismatch",
          allowedValues: this.values
        }
      };

    return {
      ok: true,
      value: value == null ? (void 0 as inferVoidType<Optional>) : value
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
