import { BaseSchema, RecurseValidation } from "./Base";
import { ObjectSchema } from "./Object";

type Schema = ObjectSchema<any, any>;

export class IntersectionSchema<Types extends Schema[]> extends BaseSchema<
  "intersection",
  getNativeTypes<unionToIntersection<ArrayItem<Types>>>,
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
    return "intersection" as "intersection";
  }

  validate(value: any, recurse: RecurseValidation) {
    const errors: (ArrayItem<Types>["@errorType"])[] = [];
    for (let i = 0; i < this.types.length; i++) {
      const type = this.types[i];
      const result = recurse(value, type);
      !result.ok && errors.push(result.error as any);
    }
    return errors.length
      ? {
          ok: false as false,
          error: { errorCode: "type" as "type", childErrors: errors }
        }
      : { ok: true as true, value: value };
  }
}

export function allOf<Types extends Schema>(types: Types[]) {
  return new IntersectionSchema([...types]);
}

type unionToIntersection<U> = (U extends any
  ? (k: U) => undefined
  : never) extends ((k: infer I) => undefined)
  ? I
  : never;

type getNativeTypes<T> = T extends Schema ? T["@nativeType"] : never;

type ArrayItem<T extends Array<any>> = T extends Array<infer Item>
  ? Item
  : never;
