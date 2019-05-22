export type RecurseValidation = (
  value: any,
  schema: ISchema<any, any, any>
) => ValidationResult<any, any>;

export type inferEmptyType<Optional extends boolean> = Optional extends false
  ? never
  : undefined | void | null;

export type ValidationResult<Value, Error> =
  | { ok: false; error: Error }
  | { ok: true; value: Value };

export type Schema = ISchema<any, any, any>;

export interface ISchema<TypeName, NativeType, ErrorType> {
  readonly options: {};
  readonly typeName: TypeName;
  readonly "@nativeType": NativeType;
  readonly "@errorType": ErrorType;
  validate(
    value: any,
    recurse: RecurseValidation
  ): ValidationResult<NativeType, ErrorType>;
}

type KeyOf<T> = T extends object ? keyof T : never;

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

  abstract validate(
    value: any,
    recurse: RecurseValidation
  ): { ok: false; error: ErrorType } | { ok: true; value: NativeType };

  /**
   * Identity function that restricts the input argument to a valid property name
   * of the schema's result type.
   * @param key
   */
  keyName<T extends KeyOf<NativeType>>(key: T) {
    return key;
  }

  /**
   * Returns the same schema back with a nominal value type of your choice.
   * This nominal value type should be comparable to the inferred value type.
   * Use this method to enforce documentation of the schema's value type as
   * a named type, class or interface.
   */
  tsName<T extends NativeType>(): BaseSchema<TypeName, T, ErrorType, Options> {
    return this as any;
  }
}
