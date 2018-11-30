type ArrayItem<T extends Array<any>> = T extends Array<infer Item>
  ? Item
  : never;

type RecurseValidation = (
  value: any,
  schema: ISchema<any, any, any>
) => any | null;

export type inferVoidType<Optional extends boolean> = Optional extends false
  ? never
  : undefined;

export interface ISchema<TypeName, NativeType, ErrorType> {
  readonly options: {};
  readonly typeName: TypeName;
  readonly "@nativeType": NativeType;
  readonly "@errorType": ErrorType;
  validate(value: any, recurse: RecurseValidation): ErrorType | null;
}

interface StringOptions<Optional extends boolean = false> {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  optional?: Optional;
}

export abstract class BaseSchema<
  TypeName extends string,
  NativeType,
  ErrorType,
  Options
> implements ISchema<TypeName, NativeType, ErrorType> {
  constructor(readonly options: Options) {}

  abstract get typeName(): TypeName;

  get "@nativeType"(): NativeType {
    return null as any;
  }

  get "@errorType"(): ErrorType {
    return null as any;
  }

  abstract validate(value: any, recurse: RecurseValidation): ErrorType | null;

  /**
   * Returns the same schema back with a nominal value type of your choice.
   * This nominal value type should be comparable to the inferred value type.
   * Use this method to enforce documentation of the schema's value type as
   * a named type, class or interface.
   */
  tsName<T extends NativeType>(): ISchema<TypeName, T, ErrorType> &
    (NativeType extends T ? ISchema<TypeName, T, ErrorType> : this) {
    return this as any;
  }
}

export class StringSchema<Optional extends boolean = false> extends BaseSchema<
  "string",
  string | inferVoidType<Optional>,
  | ({
      errorCode: "length";
      length: number;
    } & (
      | { minLength: number }
      | { maxLength: number }
      | { minLength: number; maxLength: number }))
  | { errorCode: "type"; foundType: string }
  | { errorCode: "pattern" },
  StringOptions<Optional>
> {
  get typeName() {
    return "string" as "string";
  }

  validate(value: string) {
    const type = typeof value;
    if (type !== "string")
      return value == null && this.options.optional
        ? null
        : { errorCode: "type" as "type", foundType: type };

    const { length } = value;
    const { minLength, maxLength } = this.options;
    if (
      (typeof minLength == "number" && length < minLength) ||
      (typeof maxLength === "number" && length > maxLength)
    ) {
      return {
        errorCode: "length" as "length",
        length,
        ...({
          minLength,
          maxLength
        } as
          | { minLength: number }
          | { maxLength: number }
          | { minLength: number; maxLength: number })
      };
    }

    const { pattern } = this.options;
    if (pattern && !pattern.test(value)) {
      return {
        errorCode: "pattern" as "pattern"
      };
    }

    return null;
  }
}

interface NumberOptions<Optional extends boolean = false> {
  min?: number;
  max?: number;
  optional?: Optional;
}

export class NumberSchema<Optional extends boolean = false> extends BaseSchema<
  "number",
  number | inferVoidType<Optional>,
  | ({
      errorCode: "range";
    } & ({ min: number } | { max: number } | { min: number; max: number }))
  | { errorCode: "type"; foundType: string },
  NumberOptions<Optional>
> {
  get typeName() {
    return "number" as "number";
  }

  validate(value: number) {
    const type = typeof value;
    if (type !== "number")
      return value == null && this.options.optional
        ? null
        : { errorCode: "type" as "type", foundType: type };

    const { min, max } = this.options;
    if (
      (typeof min === "number" && value < min) ||
      (typeof max === "number" && value > max)
    ) {
      return {
        errorCode: "range" as "range",
        ...({
          min,
          max
        } as { min: number } | { max: number } | { min: number; max: number })
      };
    }

    return null;
  }
}

interface BooleanOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export class BooleanSchema<Optional extends boolean = false> extends BaseSchema<
  "boolean",
  boolean | inferVoidType<Optional>,
  { errorCode: "type"; foundType: string },
  BooleanOptions<Optional>
> {
  get typeName() {
    return "boolean" as "boolean";
  }

  validate(value: any) {
    const type = typeof value;
    if (type !== "boolean")
      return value == null && this.options.optional
        ? null
        : { errorCode: "type" as "type", foundType: type };
    return null;
  }
}

interface EnumOptions<Optional extends boolean = false> {
  optional?: Optional;
}

export class EnumSchema<
  Values extends string | boolean | number,
  Optional extends boolean = false
> extends BaseSchema<
  "enum",
  Values | inferVoidType<Optional>,
  { errorCode: "mismatch"; allowedValues: Values[] },
  EnumOptions<Optional>
> {
  constructor(readonly values: Values[], options: EnumOptions<Optional> = {}) {
    super(options);
  }

  get typeName() {
    return "enum" as "enum";
  }

  validate(value: Values) {
    if (!this.values.includes(value))
      return value == null && this.options.optional
        ? null
        : {
            errorCode: "mismatch" as "mismatch",
            allowedValues: this.values
          };
    return null;
  }
}

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

interface ObjectOptions<Optional extends boolean = false> {
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

interface ArrayOptions<Optional extends boolean = false> {
  minLength?: number;
  maxLength?: number;
  optional?: Optional;
}

export class ArraySchema<
  Item extends Schema,
  Optional extends boolean = false
> extends BaseSchema<
  "array",
  Array<Item["@nativeType"]> | inferVoidType<Optional>,
  | { errorCode: "type"; foundType: string }
  | ({
      errorCode: "length";
      length: number;
    } & (
      | { minLength: number }
      | { maxLength: number }
      | { minLength: number; maxLength: number }))
  | {
      errorCode: "children";
      childErrors: {
        index: number;
        error: Item["@errorType"];
      }[];
    },
  ArrayOptions<Optional>
> {
  constructor(readonly item: Item, options: ArrayOptions<Optional>) {
    super(options);
  }

  get typeName() {
    return "array" as "array";
  }

  validate(value: any, recurse: RecurseValidation) {
    if (!Array.isArray(value)) {
      return value == null && this.options.optional
        ? null
        : { errorCode: "type" as "type", foundType: typeof value };
    }

    const { length } = value;
    const { minLength, maxLength } = this.options;
    if (
      (typeof minLength === "number" && length < minLength) ||
      (typeof maxLength === "number" && length > maxLength)
    ) {
      return {
        errorCode: "length" as "length",
        length,
        ...({
          minLength,
          maxLength
        } as
          | { minLength: number }
          | { maxLength: number }
          | { minLength: number; maxLength: number })
      };
    }

    const problems: {
      index: number;
      error: Item["@errorType"];
    }[] = [];
    const { item } = this;
    for (let i = 0, length = value.length; i < length; i++) {
      const problem = recurse(value[i], item);
      if (problem) {
        problems.push({ index: i, error: problem } as any);
      }
    }

    return problems.length
      ? { errorCode: "children" as "children", childErrors: problems }
      : null;
  }
}

export class UnionSchema<
  Types extends ISchema<any, any, any>[]
> extends BaseSchema<
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

type unionToIntersection<U> = (U extends any
  ? (k: U) => undefined
  : never) extends ((k: infer I) => undefined)
  ? I
  : never;

type getNativeTypes<T> = T extends ISchema<any, any, any>
  ? T["@nativeType"]
  : never;

export class IntersectionSchema<
  Types extends ISchema<any, any, any>[]
> extends BaseSchema<
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
      const error = recurse(value, type);
      error && errors.push(error as any);
    }
    return errors.length
      ? { errorCode: "type" as "type", childErrors: errors }
      : null;
  }
}

export class AnySchema extends BaseSchema<"any", any, any, {}> {
  get typeName() {
    return "any" as "any";
  }
  validate() {
    return null;
  }
}

export type Schema = ISchema<string, any, any>;

export function number(): NumberSchema<false>;
export function number(options: NumberOptions<false>): NumberSchema<false>;
export function number(options: NumberOptions<true>): NumberSchema<true>;
export function number(
  options: NumberOptions<boolean> = {}
): NumberSchema<boolean> {
  return new NumberSchema(options);
}

export function string(): StringSchema<false>;
export function string(options: StringOptions<false>): StringSchema<false>;
export function string(options: StringOptions<true>): StringSchema<true>;
export function string(
  options: StringOptions<boolean> = {}
): StringSchema<boolean> {
  return new StringSchema(options);
}

export function boolean(options?: BooleanOptions<false>): BooleanSchema<false>;
export function boolean(options: BooleanOptions<true>): BooleanSchema<true>;
export function boolean(
  options: BooleanOptions<boolean> = {}
): BooleanSchema<boolean> {
  return new BooleanSchema(options);
}

export function choiceOf<Values extends string | number | boolean>(
  values: Values[],
  options?: EnumOptions<false>
): EnumSchema<Values, false>;
export function choiceOf<Values extends string | number | boolean>(
  values: Values[],
  options: EnumOptions<true>
): EnumSchema<Values, true>;
export function choiceOf<Values extends string | number | boolean>(
  values: Values[],
  options: EnumOptions<boolean> = {}
): EnumSchema<Values, boolean> {
  return new EnumSchema(values, options);
}

export function exactly<Value extends string | number | boolean>(
  value: Value,
  options?: EnumOptions<false>
): EnumSchema<Value, false>;
export function exactly<Value extends string | number | boolean>(
  value: Value,
  options: EnumOptions<true>
): EnumSchema<Value, true>;
export function exactly<Value extends string | number | boolean>(
  value: Value,
  options: EnumOptions<boolean> = {}
): EnumSchema<Value, boolean> {
  return new EnumSchema([value], options);
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

export function array<Item extends Schema>(
  item: Item
): ArraySchema<Item, false>;
export function array<Item extends Schema>(
  item: Item,
  options: ArrayOptions<false>
): ArraySchema<Item, false>;
export function array<Item extends Schema>(
  item: Item,
  options: ArrayOptions<true>
): ArraySchema<Item, true>;
export function array<Item extends Schema>(
  item: Item,
  options: ArrayOptions<boolean> = {}
): ArraySchema<Item, boolean> {
  return new ArraySchema(item, options);
}

export function anyOf<Types extends Schema>(types: Types[]) {
  return new UnionSchema([...types]);
}

export function allOf<Types extends Schema>(types: Types[]) {
  return new IntersectionSchema([...types]);
}

export function any() {
  return new AnySchema({});
}

export function validate<Schema extends ISchema<any, any, any>>(
  value: any,
  schema: Schema
): {
  value: Schema["@nativeType"];
  error: Schema["@errorType"] | null;
} {
  const result = innerValidate(value, schema);
  return {
    value,
    error: result as any
  };
}

function innerValidate(value: any, schema: ISchema<any, any, any>): any {
  const result = schema.validate(value, innerValidate);
  if (result)
    return {
      type: schema.typeName,
      validationError: result
    };
  return null;
}
