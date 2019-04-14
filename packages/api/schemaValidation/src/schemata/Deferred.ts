import {
  ISchema,
  BaseSchema,
  RecurseValidation,
  ValidationResult
} from "./Base";

type Schema = ISchema<any, any, any>;

export class DeferredSchema<Type extends Schema> extends BaseSchema<
  "union",
  Type["@nativeType"],
  Type["@errorType"],
  {}
> {
  constructor(readonly deferredType: () => Type) {
    super({});
  }

  get typeName() {
    return "union" as "union";
  }

  validate(
    value: any,
    recurse: RecurseValidation
  ): ValidationResult<Type["@nativeType"], Type["@errorType"]> {
    return recurse(value, this.deferredType());
  }
}

export function deferred<Types extends Schema>(deferredType: () => Types) {
  return new DeferredSchema(deferredType);
}
