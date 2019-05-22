import { BaseSchema, inferEmptyType, ValidationResult } from "./Base";

export interface ObjectOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export type ObjectSchemaError = { errorCode: "type"; foundType: string };

export type ObjectSchemaValue<Optional extends boolean> =
  | object
  | inferEmptyType<Optional>;

export class ObjectSchema<Optional extends boolean = false> extends BaseSchema<
  "object",
  ObjectSchemaValue<Optional>,
  ObjectSchemaError,
  ObjectOptions<Optional>
> {
  get typeName() {
    return "object" as "object";
  }

  validate(
    value: any
  ): ValidationResult<ObjectSchemaValue<Optional>, ObjectSchemaError> {
    const type = typeof value;
    if (type !== "object" || !value) {
      return {
        ok: false,
        error: { errorCode: "type" as "type", foundType: type }
      };
    }

    return {
      ok: true,
      value: value || null
    };
  }
}

export function object(options?: ObjectOptions<false>): ObjectSchema<false>;
export function object(options: ObjectOptions<true>): ObjectSchema<true>;
export function object(
  options: ObjectOptions<boolean> = {}
): ObjectSchema<boolean> {
  return new ObjectSchema(options);
}
