import { BaseSchema, inferVoidType } from "./Base";

export interface BooleanOptions<Optional extends boolean = false> {
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

export function boolean(options?: BooleanOptions<false>): BooleanSchema<false>;
export function boolean(options: BooleanOptions<true>): BooleanSchema<true>;
export function boolean(
  options: BooleanOptions<boolean> = {}
): BooleanSchema<boolean> {
  return new BooleanSchema(options);
}
