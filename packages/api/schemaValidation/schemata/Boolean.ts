import { BaseSchema, inferVoidType, ValidationResult } from "./Base";

export interface BooleanOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export type BooleanSchemaError = { errorCode: "type"; foundType: string };

export type BooleanSchemaValue<Optional extends boolean> =
  | boolean
  | inferVoidType<Optional>;

export class BooleanSchema<Optional extends boolean = false> extends BaseSchema<
  "boolean",
  BooleanSchemaValue<Optional>,
  BooleanSchemaError,
  BooleanOptions<Optional>
> {
  get typeName() {
    return "boolean" as "boolean";
  }

  validate(
    value: any
  ): ValidationResult<BooleanSchemaValue<Optional>, BooleanSchemaError> {
    const type = typeof value;
    if (type !== "boolean" && !(value == null && this.options.optional)) {
      return {
        ok: false,
        error: { errorCode: "type" as "type", foundType: type }
      };
    }

    return {
      ok: true,
      value: value == null ? void 0 : value
    };
  }
}

export function boolean(options?: BooleanOptions<false>): BooleanSchema<false>;
export function boolean(options: BooleanOptions<true>): BooleanSchema<true>;
export function boolean(
  options: BooleanOptions<boolean> = {}
): BooleanSchema<boolean> {
  return new BooleanSchema(options);
}
