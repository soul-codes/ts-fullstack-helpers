import { BaseSchema, ValidationResult } from "./Base";

export class UnknownSchema extends BaseSchema<"unknown", unknown, any, {}> {
  get typeName() {
    return "unknown" as "unknown";
  }
  validate(value: any): ValidationResult<unknown, never> {
    return { ok: true as true, value: value };
  }
}

export function unknown() {
  return new UnknownSchema({});
}
