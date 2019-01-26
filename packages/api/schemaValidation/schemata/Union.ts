import {
  ISchema,
  BaseSchema,
  RecurseValidation,
  ValidationResult
} from "./Base";

type Schema = ISchema<any, any, any>;

export type UnionSchemaValue<Types extends Schema[]> = ArrayItem<
  Types
>["@nativeType"];

export type UnionSchemaError<Types extends Schema[]> = {
  errorCode: "type";
  childErrors: (ArrayItem<Types>["@errorType"])[];
};

export class UnionSchema<Types extends Schema[]> extends BaseSchema<
  "union",
  UnionSchemaValue<Types>,
  UnionSchemaError<Types>,
  {}
> {
  constructor(readonly types: Types) {
    super({});
  }

  get typeName() {
    return "union" as "union";
  }

  validate(
    value: any,
    recurse: RecurseValidation
  ): ValidationResult<UnionSchemaValue<Types>, UnionSchemaError<Types>> {
    const errors: (ArrayItem<Types>["@errorType"])[] = [];
    for (let i = 0; i < this.types.length; i++) {
      const type = this.types[i];
      const result = recurse(value, type);
      if (result.ok) return { ok: true, value: result.value };
      errors.push(result.error as any);
    }
    return {
      ok: false,
      error: { errorCode: "type" as "type", childErrors: errors }
    };
  }
}

export function anyOf<Types extends Schema>(types: Types[]) {
  return new UnionSchema([...types]);
}

type ArrayItem<T extends Array<any>> = T extends Array<infer Item>
  ? Item
  : never;
