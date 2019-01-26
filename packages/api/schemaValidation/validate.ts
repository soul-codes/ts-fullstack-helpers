import { ISchema } from "./schemata/Base";

export function validate<Schema extends ISchema<any, any, any>>(
  value: any,
  schema: Schema
):
  | {
      ok: true;
      value: Schema["@nativeType"];
    }
  | {
      ok: false;
      error: Schema["@errorType"];
    } {
  const result = innerValidate(value, schema);
  return result;
}

function innerValidate(
  value: any,
  schema: ISchema<any, any, any>
): { ok: true; value: any } | { ok: false; error: any } {
  const result = schema.validate(value, innerValidate);
  if (result.ok) {
    return result;
  } else {
    return {
      ok: false,
      error: {
        type: schema.typeName,
        validationError: result
      }
    };
  }
}
