import {
  BaseSchema,
  inferEmptyType,
  ISchema,
  RecurseValidation,
  ValidationResult
} from "./Base";

type Schema = ISchema<string, any, any>;
type SchemaShape = { [key: string]: Schema };

type inferObjectShapeProblem<Shape extends SchemaShape> = {
  [key in keyof Shape]?: Shape[key]["@errorType"]
};

type KeepOptional<T extends SchemaShape> = {
  [P in keyof T]: T[P] extends ISchema<any, infer NativeType, any>
    ? undefined extends NativeType
      ? P
      : never
    : never
}[keyof T];

type KeepRequired<T extends SchemaShape> = {
  [P in keyof T]: T[P] extends ISchema<any, infer NativeType, any>
    ? undefined extends NativeType
      ? never
      : P
    : never
}[keyof T];

export type inferObjectNativeType<Shape extends SchemaShape> = {
  [key in KeepOptional<Shape>]?: Shape[key]["@nativeType"]
} &
  { [key in KeepRequired<Shape>]: Shape[key]["@nativeType"] };

export interface ObjectOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export type ObjectSchemaValue<
  Shape extends SchemaShape,
  Optional extends boolean
> = inferObjectNativeType<Shape> | inferEmptyType<Optional>;
export type ObjectSchemaError<Shape extends SchemaShape> =
  | { errorCode: "type"; foundType: string }
  | {
      errorCode: "children";
      childErrors: inferObjectShapeProblem<Shape>;
    };

export class ObjectSchema<
  Shape extends SchemaShape,
  Optional extends boolean = false
> extends BaseSchema<
  "object",
  ObjectSchemaValue<Shape, Optional>,
  ObjectSchemaError<Shape>,
  ObjectOptions<Optional>
> {
  constructor(readonly shape: Shape, options: ObjectOptions<Optional> = {}) {
    super(options);
  }

  get typeName() {
    return "object" as "object";
  }

  validate(
    value: any,
    recurse: RecurseValidation
  ): ValidationResult<
    ObjectSchemaValue<Shape, Optional>,
    ObjectSchemaError<Shape>
  > {
    const type = typeof value;
    if (type !== "object" || !value)
      return value == null && this.options.optional
        ? { ok: true, value: void 0 as inferEmptyType<Optional> }
        : {
            ok: false,
            error: { errorCode: "type" as "type", foundType: type }
          };

    let hasProblems = false;
    const problems = Object.create(null) as inferObjectShapeProblem<Shape>;
    const parsed = Object.create(null) as inferObjectNativeType<Shape>;
    const { shape } = this;
    for (const key in shape) {
      const prop = Object.prototype.hasOwnProperty.call(value, key)
        ? value[key]
        : void 0;
      const schema = shape[key];
      const result = recurse(prop, schema);
      if (result.ok) {
        (parsed as any)[key] = result.value;
      } else {
        hasProblems = true;
        problems[key] = result.error as ObjectSchemaError<Shape>;
      }
    }

    return hasProblems
      ? {
          ok: false,
          error: { errorCode: "children" as "children", childErrors: problems }
        }
      : { ok: true, value: parsed };
  }
}

export function shape<Shape extends SchemaShape>(
  shape: Shape,
  options?: ObjectOptions<false>
): ObjectSchema<Shape, false>;
export function shape<Shape extends SchemaShape>(
  shape: Shape,
  options?: ObjectOptions<true>
): ObjectSchema<Shape, true>;
export function shape<Shape extends SchemaShape>(
  shape: Shape,
  options: ObjectOptions<boolean> = {}
): ObjectSchema<Shape, boolean> {
  return new ObjectSchema(shape, options);
}

/**
 * Creates a strictly typed partial shape schema: this is one single key-value
 * pair that can build a shape schema using `computedShape`. You can use this
 * method to generate a key-value fragment of the shape schema where the key is
 * of an unknown but specific.
 * @param key
 * @param schema
 */
export function partialShape<Key extends string, Value extends Schema>(
  key: Key,
  schema: Value
) {
  return { [key]: schema } as { [key in Key]: Value };
}

/**
 * Create a shape schema whose value type is dynamically computed based on the
 * composition of partial shapes.
 * @param partials
 */
export function computedShape<
  T1 extends { [key: string]: Schema } = {},
  T2 extends { [key: string]: Schema } = {},
  T3 extends { [key: string]: Schema } = {},
  T4 extends { [key: string]: Schema } = {},
  T5 extends { [key: string]: Schema } = {},
  T6 extends { [key: string]: Schema } = {},
  T7 extends { [key: string]: Schema } = {},
  T8 extends { [key: string]: Schema } = {},
  T9 extends { [key: string]: Schema } = {},
  T10 extends { [key: string]: Schema } = {},
  T11 extends { [key: string]: Schema } = {},
  T12 extends { [key: string]: Schema } = {},
  T13 extends { [key: string]: Schema } = {},
  T14 extends { [key: string]: Schema } = {},
  T15 extends { [key: string]: Schema } = {},
  T16 extends { [key: string]: Schema } = {}
>(
  partials: [
    T1,
    T2?,
    T3?,
    T4?,
    T5?,
    T6?,
    T7?,
    T8?,
    T9?,
    T10?,
    T11?,
    T12?,
    T13?,
    T14?,
    T15?,
    T16?
  ]
): ObjectSchema<
  T1 &
    T2 &
    T3 &
    T4 &
    T5 &
    T6 &
    T7 &
    T8 &
    T9 &
    T10 &
    T11 &
    T12 &
    T13 &
    T14 &
    T15 &
    T16,
  false
>;
export function computedShape<T extends { [key: string]: Schema }>(ts: T[]) {
  return shape(Object.assign({}, ...ts));
}
