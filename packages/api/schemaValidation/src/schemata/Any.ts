import { BaseSchema, ValidationResult } from "./Base";

export class AnySchema extends BaseSchema<"any", any, any, {}> {
  get typeName() {
    return "any" as "any";
  }
  validate(value: any): ValidationResult<any, never> {
    return { ok: true as true, value: value };
  }
}

export function any() {
  return new AnySchema({});
}
