import {
  allOf,
  any,
  anyOf,
  array,
  boolean,
  choiceOf,
  number,
  shape,
  string,
  stringified
} from "../src";

type TRUE = { true: true };
type FALSE = { false: false };
const TRUE: TRUE = { true: true };
const FALSE: FALSE = { false: false };

type isMatched<Expected, Test> = ((a: Expected) => void) extends ((
  b: Test
) => void)
  ? TRUE
  : FALSE;

/**
 * Sanity check on isMatch
 */
{
  (): isMatched<number, number | boolean> => FALSE;
  (): isMatched<number | boolean, number> => TRUE;
  (): isMatched<number | boolean, boolean> => TRUE;
  (): isMatched<number, number | void> => FALSE;
  (): isMatched<number | void, number> => TRUE;
  (): isMatched<number | void, void> => TRUE;
}

/**
 * required number
 */
{
  const x = number();
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => TRUE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => FALSE;
}

/**
 * optional number
 */
{
  const x = number({ optional: true });
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => TRUE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * required string
 */
{
  const x = string();
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => TRUE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => FALSE;
}

/**
 * optional string
 */
{
  const x = string({ optional: true });
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => TRUE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * required boolean
 */
{
  const x = boolean();
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, boolean> => TRUE;
  (): isMatched<Check, void> => FALSE;
}

/**
 * optional boolean
 */
{
  const x = boolean({ optional: true });
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, boolean> => TRUE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * required enum
 */
{
  const x = choiceOf(["a", "b", "c", 10]);
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, "a"> => TRUE;
  (): isMatched<Check, "b"> => TRUE;
  (): isMatched<Check, "c"> => TRUE;
  (): isMatched<Check, 10> => TRUE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => FALSE;
}

/**
 * optional enum
 */
{
  const x = choiceOf(["a", "b", "c", 10], { optional: true });
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, "a"> => TRUE;
  (): isMatched<Check, "b"> => TRUE;
  (): isMatched<Check, "c"> => TRUE;
  (): isMatched<Check, 10> => TRUE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * required array
 */
{
  const x = array(string());
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, number[]> => FALSE;
  (): isMatched<Check, string[]> => TRUE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => FALSE;
}

/**
 * optional array
 */
{
  const x = array(string(), { optional: true });
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, number[]> => FALSE;
  (): isMatched<Check, string[]> => TRUE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * required shape
 */
{
  const x = shape({ foo: string(), bar: number({ optional: true }) });
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, { foo: string; bar: number }> => TRUE;
  (): isMatched<Check, { foo: string; bar: void }> => TRUE;
  (): isMatched<Check, { foo: string }> => TRUE;
  (): isMatched<Check, { foo: void; bar: string }> => FALSE;
  (): isMatched<Check, { bar: string }> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => FALSE;
}

/**
 * optional shape
 */
{
  const x = shape(
    { foo: string(), bar: number({ optional: true }) },
    { optional: true }
  );
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, { foo: string; bar: number }> => TRUE;
  (): isMatched<Check, { foo: string; bar: void }> => TRUE;
  (): isMatched<Check, { foo: string }> => TRUE;
  (): isMatched<Check, { foo: void; bar: string }> => FALSE;
  (): isMatched<Check, { bar: string }> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * union
 */
{
  const x = anyOf([string(), shape({ foo: string() })]);
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => TRUE;
  (): isMatched<Check, { foo: string }> => TRUE;
  (): isMatched<Check, { foo: number }> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => FALSE;
}

/**
 * union with optional value
 */
{
  const x = anyOf([string({ optional: true }), shape({ foo: string() })]);
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => TRUE;
  (): isMatched<Check, { foo: string }> => TRUE;
  (): isMatched<Check, { foo: number }> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * intersection
 */
{
  const x = allOf([
    shape({ foo: string() }),
    shape({ bar: string({ optional: true }) })
  ]);
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, { foo: string }> => TRUE;
  (): isMatched<Check, { foo: string; bar: string }> => TRUE;
  (): isMatched<Check, { bar: string }> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => FALSE;
}

/**
 * intersection with optional value
 */
{
  const x = allOf(
    [shape({ foo: string() }), shape({ bar: string({ optional: true }) })],
    { optional: true }
  );
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => FALSE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, { foo: string }> => TRUE;
  (): isMatched<Check, { foo: string; bar: string }> => TRUE;
  (): isMatched<Check, { bar: string }> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * stringified
 */
{
  const x = stringified(number());
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => TRUE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, { foo: string }> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => FALSE;
}

/**
 * optional stringified
 */
{
  const x = stringified(number(), { optional: true });
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => TRUE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, { foo: string }> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * optional stringified content
 */
{
  const x = stringified(number({ optional: true }));
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => TRUE;
  (): isMatched<Check, string> => FALSE;
  (): isMatched<Check, { foo: string }> => FALSE;
  (): isMatched<Check, boolean> => FALSE;
  (): isMatched<Check, void> => TRUE;
}

/**
 * any
 */
{
  const x = any();
  type Check = typeof x["@nativeType"];
  (): isMatched<Check, number> => TRUE;
  (): isMatched<Check, string> => TRUE;
  (): isMatched<Check, { foo: string }> => TRUE;
  (): isMatched<Check, { foo: string; bar: string }> => TRUE;
  (): isMatched<Check, { bar: string[] }> => TRUE;
  (): isMatched<Check, boolean> => TRUE;
  (): isMatched<Check, void> => TRUE;
}
