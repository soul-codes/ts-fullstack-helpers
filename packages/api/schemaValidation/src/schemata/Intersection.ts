import {
  BaseSchema,
  RecurseValidation,
  ValidationResult,
  inferVoidType,
  ISchema
} from "./Base";

type Schema = ISchema<any, any, any>;

export interface IntersectionOptions<Optional extends boolean = false> {
  optional?: Optional;
}
export type IntersectionSchemaValue<
  Types extends Schema[],
  Optional extends boolean
> =
  | getNativeTypes<unionToIntersection<ArrayItem<Types>>>
  | inferVoidType<Optional>;

export type IntersectionSchemaError<Types extends Schema[]> =
  | { errorCode: "type"; foundType: string }
  | {
      errorCode: "children";
      childErrors: (ArrayItem<Types>["@errorType"])[];
    };

export class IntersectionSchema<
  Types extends Schema[],
  Optional extends boolean
> extends BaseSchema<
  "intersection",
  IntersectionSchemaValue<Types, Optional>,
  IntersectionSchemaError<Types>,
  {}
> {
  constructor(
    readonly types: Types,
    readonly options: IntersectionOptions<Optional>
  ) {
    super({});
  }

  get typeName() {
    return "intersection" as "intersection";
  }

  validate(
    value: any,
    recurse: RecurseValidation
  ): ValidationResult<
    IntersectionSchemaValue<Types, Optional>,
    IntersectionSchemaError<Types>
  > {
    const type = typeof value;
    if (type !== "object" || !type)
      return value == null && this.options.optional
        ? { ok: true, value: void 0 as inferVoidType<Optional> }
        : {
            ok: false,
            error: { errorCode: "type", foundType: type }
          };

    const errors: (ArrayItem<Types>["@errorType"])[] = [];
    for (let i = 0; i < this.types.length; i++) {
      const type = this.types[i];
      const result = recurse(value, type);
      !result.ok && errors.push(result.error as any);
    }
    return errors.length
      ? {
          ok: false,
          error: { errorCode: "children", childErrors: errors }
        }
      : { ok: true, value: value };
  }
}

export function allOf<Types extends Schema>(
  types: Types[],
  options?: IntersectionOptions<false>
): IntersectionSchema<Types[], false>;
export function allOf<Types extends Schema>(
  types: Types[],
  options: IntersectionOptions<true>
): IntersectionSchema<Types[], true>;
export function allOf<Types extends Schema>(
  types: Types[],
  options?: IntersectionOptions<boolean>
) {
  return new IntersectionSchema([...types], options || {});
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
