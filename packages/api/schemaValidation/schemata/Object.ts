import { inferVoidType, ISchema, BaseSchema, RecurseValidation } from "./Base";

type Schema = ISchema<string, any, any>;

type inferObjectShapeProblem<Shape extends { [key: string]: Schema }> = {
  [key in keyof Shape]?: Shape[key]["@errorType"]
};

type KeepOptional<T extends { [key: string]: Schema }> = {
  [P in keyof T]: T[P] extends ISchema<any, infer NativeType, any>
    ? undefined extends NativeType
      ? P
      : never
    : never
}[keyof T];

type KeepRequired<T extends { [key: string]: Schema }> = {
  [P in keyof T]: T[P] extends ISchema<any, infer NativeType, any>
    ? undefined extends NativeType
      ? never
      : P
    : never
}[keyof T];

export type inferObjectNativeType<Shape extends { [key: string]: Schema }> = {
  [key in KeepOptional<Shape>]?: Shape[key]["@nativeType"]
} &
  { [key in KeepRequired<Shape>]: Shape[key]["@nativeType"] };

export interface ObjectOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export class ObjectSchema<
  Shape extends { [key: string]: Schema },
  Optional extends boolean = false
> extends BaseSchema<
  "object",
  inferObjectNativeType<Shape> | inferVoidType<Optional>,
  | { errorCode: "type"; foundType: string }
  | {
      errorCode: "children";
      childErrors: inferObjectShapeProblem<Shape>;
    },
  ObjectOptions<Optional>
> {
  constructor(readonly shape: Shape, options: ObjectOptions<Optional> = {}) {
    super(options);
  }

  get typeName() {
    return "object" as "object";
  }

  validate(value: any, recurse: RecurseValidation) {
    const type = typeof value;
    if (type !== "object" || !type)
      return value == null && this.options.optional
        ? null
        : { errorCode: "type" as "type", foundType: type };

    let hasProblems = false;
    const problems = Object.create(null) as inferObjectShapeProblem<Shape>;
    const { shape } = this;
    for (const key in shape) {
      const prop = Object.prototype.hasOwnProperty.call(value, key)
        ? value[key]
        : void 0;
      const schema = shape[key];
      const problem = recurse(prop, schema);
      if (problem) {
        hasProblems = true;
        problems[key] = problem as any;
      }
    }

    return hasProblems
      ? { errorCode: "children" as "children", childErrors: problems }
      : null;
  }
}

export function shape<Shape extends { [key: string]: Schema }>(
  shape: Shape,
  options?: ObjectOptions<false>
): ObjectSchema<Shape, false>;
export function shape<Shape extends { [key: string]: Schema }>(
  shape: Shape,
  options?: ObjectOptions<true>
): ObjectSchema<Shape, true>;
export function shape<Shape extends { [key: string]: Schema }>(
  shape: Shape,
  options: ObjectOptions<boolean> = {}
): ObjectSchema<Shape, boolean> {
  return new ObjectSchema(shape, options);
}
