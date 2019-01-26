import { BaseSchema } from "./Base";

export class AnySchema extends BaseSchema<"any", any, any, {}> {
  get typeName() {
    return "any" as "any";
  }
  validate(value: any) {
    return { ok: true as true, value: value };
  }
}

export function any() {
  return new AnySchema({});
}
