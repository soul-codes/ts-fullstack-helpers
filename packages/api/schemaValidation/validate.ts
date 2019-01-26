import { ISchema } from "./schemata/Base";

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
