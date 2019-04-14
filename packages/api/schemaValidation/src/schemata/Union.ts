import {
  ISchema,
  BaseSchema,
  RecurseValidation,
  ValidationResult,
  inferEmptyType
} from "./Base";

type Schema = ISchema<any, any, any>;

export type UnionSchemaValue<
  Types extends Schema[],
  Optional extends boolean = false
> = ArrayItem<Types>["@nativeType"] | inferEmptyType<Optional>;

export interface UnionOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export type UnionSchemaError<Types extends Schema[]> = {
  errorCode: "type";
  childErrors: (ArrayItem<Types>["@errorType"])[];
};

export class UnionSchema<
  Types extends Schema[],
  Optional extends boolean = false
> extends BaseSchema<
  "union",
  UnionSchemaValue<Types, Optional>,
  UnionSchemaError<Types>,
  UnionOptions<Optional>
> {
  constructor(readonly types: Types, readonly options: UnionOptions<Optional>) {
    super(options);
  }

  get typeName() {
    return "union" as "union";
  }

  validate(
    value: any,
    recurse: RecurseValidation
  ): ValidationResult<UnionSchemaValue<Types>, UnionSchemaError<Types>> {
    if (value == null && this.options.optional) {
      return { ok: true, value: void 0 as inferEmptyType<Optional> };
    }

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

export function anyOf<Types extends Schema>(
  types: Types[]
): UnionSchema<Types[], false>;
export function anyOf<Types extends Schema>(
  types: Types[],
  options: UnionOptions<false>
): UnionSchema<Types[], false>;
export function anyOf<Types extends Schema>(
  types: Types[],
  options: UnionOptions<true>
): UnionSchema<Types[], true>;

export function anyOf<Types extends Schema>(
  types: Types[],
  options?: UnionOptions<boolean>
): UnionSchema<Types[], boolean> {
  return new UnionSchema([...types], options || { optional: false });
}

type ArrayItem<T extends Array<any>> = T extends Array<infer Item>
  ? Item
  : never;
