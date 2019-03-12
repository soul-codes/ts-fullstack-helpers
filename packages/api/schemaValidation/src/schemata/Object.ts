import {
  inferEmptyType,
  ISchema,
  BaseSchema,
  RecurseValidation,
  ValidationResult
} from "./Base";
import { string } from "./String";

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
    if (type !== "object" || !type)
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
