import { ISchema, BaseSchema, RecurseValidation } from "./Base";

type Schema = ISchema<any, any, any>;

export class UnionSchema<Types extends Schema[]> extends BaseSchema<
  "union",
  ArrayItem<Types>["@nativeType"],
  {
    errorCode: "type";
    childErrors: (ArrayItem<Types>["@errorType"])[];
  },
  {}
> {
  constructor(readonly types: Types) {
    super({});
  }

  get typeName() {
    return "union" as "union";
  }

  validate(value: any, recurse: RecurseValidation) {
    const errors: (ArrayItem<Types>["@errorType"])[] = [];
    for (let i = 0; i < this.types.length; i++) {
      const type = this.types[i];
      const error = recurse(value, type);
      if (!error) return null;
      errors.push(error as any);
    }
    return { errorCode: "type" as "type", childErrors: errors };
  }
}

export function anyOf<Types extends Schema>(types: Types[]) {
  return new UnionSchema([...types]);
}

type ArrayItem<T extends Array<any>> = T extends Array<infer Item>
  ? Item
  : never;
