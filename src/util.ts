import {
  Node,
  ForEachCallback,
  PrintNode_Argument,
  PrintTree_Argument,
  GetSubNode_Argument,
} from "./interface";

interface ValidateInteger_Argument {
  number: any;
  max?: number;
  min?: number;
  name: string;
  maxValueName?: string;
  minValueName?: string;
}

export function validateInteger(arg: ValidateInteger_Argument) {
  const { number, name } = arg;

  if (!Number.isInteger(number))
    throw new Error(`"${name}" must be an integer.`);

  if ("min" in arg) {
    const { min, minValueName = "" } = arg;
    if (number < min!)
      throw new Error(
        `"${name}" must be greater than or equal to ${minValueName} (${min}).`
      );
  }

  if ("max" in arg) {
    const { max, maxValueName = "" } = arg;
    if (number > max!)
      throw new Error(
        `"${name}" must be less than or equal to ${maxValueName} (${max}).`
      );
  }
}

class EPP extends Error {
  code: string;

  constructor(arg: { code: string; message: string }) {
    const { code, message } = arg;
    super(message);

    this.code = code;
  }
}

interface ValidatorSchema {
  [key: string]: string | { type: string; isOptional: boolean };
}

interface OtherValidatorArgument {
  schema: ValidatorSchema;
  name: string;
}

export function validate<Type>(
  object: unknown,
  otherArg: OtherValidatorArgument
): asserts object is Type {
  const { name: objectName, schema } = otherArg;

  if (!is("plain_object", object))
    throw new EPP({
      code: "NOT_PLAIN_OBJECT",
      message: `"${objectName}" must be a plain object.`,
    });

  const allObjectProperties = new Set(Object.keys(object));

  for (const [property, propertySchema] of Object.entries(schema)) {
    const { type: propertyType, isOptional: isPropertyOptional } = (() => {
      if (is("string", propertySchema))
        return {
          type: propertySchema,
          isOptional: false,
        };

      return propertySchema;
    })();

    allObjectProperties.delete(property);

    if (!(property in object)) {
      if (isPropertyOptional) continue;

      throw new EPP({
        code: "MISSING_PROPERTY",
        message: `Missing property "${property}" in ${objectName}`,
      });
    }

    if (!is(<any>propertyType, (object as any)[property]))
      throw new EPP({
        code: "INVALID_PROPERTY",
        message: `"${objectName}.${property}" must be of type ${propertyType}`,
      });
  }

  for (const unknownProperty of allObjectProperties.values())
    throw new EPP({
      code: "UNKNOWN_PROPERTY",
      message: `Unknown property "${unknownProperty}" in ${objectName}`,
    });
}

const printTreeArgumentSchema = Object.freeze({
  path: "array",
  levelX: "number",
  levelY: "number",
  maxDepth: "number",
  forEach: "function",
  parentNode: "object",
  printNode: "function",
  sortNodes: "function",
  getSubNodes: "function",
  getNodePrefix: "function",
  printRootNode: "function",
  shouldDescend: "function",
  connectors: "plain_object",
  indentationLength: "number",
  xLevelsOfLastNodeAncestors: "array",
  numOfHLinesBeforeNode: { type: "number", isOptional: true },
});

export function validatePrintTreeArgument(
  arg: any
): asserts arg is PrintTree_Argument {
  validate<PrintTree_Argument>(arg, {
    name: "printTreeArgument",
    schema: printTreeArgumentSchema,
  });

  validateInteger({
    min: 2,
    name: "indentationLength",
    number: arg.indentationLength,
  });

  if ("numOfHLinesBeforeNode" in arg)
    validateInteger({
      min: 0,
      name: "numOfHLinesBeforeNode",
      max: arg.indentationLength - 1,
      maxValueName: "indentationLength - 1",
      number: arg.numOfHLinesBeforeNode,
    });
}

interface IsTypes {
  undefined: undefined;
  number: number;
  object: object;
  string: string;
  symbol: Symbol;
  array: unknown[];
  boolean: boolean;
  function: Function;
  plain_object: object;
}

export function is<Type extends keyof IsTypes>(
  type: Type,
  value: unknown
): value is IsTypes[Type] {
  switch (type) {
    case "undefined":
    case "boolean":
    case "number":
    case "object":
    case "string":
    case "symbol":
    case "function":
      return typeof value === type;
    case "array":
      return Array.isArray(value);
    case "plain_object":
      return (
        typeof value === "object" && value !== null && !Array.isArray(value)
      );
    default:
      throw new Error(`Unknown type "${type}".`);
  }
}

// Default functions for the print tree function ============================

export function forEach<Type>(array: Type[], callback: ForEachCallback<Type>) {
  for (let index = 0; index < array.length; index++)
    callback(array[index], index, array);
}

export function printNode(arg: PrintNode_Argument) {
  const line = arg.nodePrefix.join("") + arg.node.name;
  console.log(line);
}

export function getSubNodes(arg: GetSubNode_Argument): Node<any>[] {
  {
    const hasNoSubNodes =
      !arg.parentNode ||
      arg.parentNode === null ||
      typeof arg.parentNode !== "object";

    if (hasNoSubNodes) return [];
  }

  return Object.entries(arg.parentNode).map(([name, value]) => ({
    name,
    value,
  }));
}
