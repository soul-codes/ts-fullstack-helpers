import { BaseSchema } from "./Base";

export class AnySchema extends BaseSchema<"any", any, any, {}> {
  get typeName() {
    return "any" as "any";
  }
  validate() {
    return null;
  }
}

export function any() {
  return new AnySchema({});
}
