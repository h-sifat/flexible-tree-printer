import {
  Node,
  ForEachCallback,
  PrintNode_Argument,
  PrintTree_Argument,
  GetSubNode_Argument,
} from "./interface";

interface ValidateInteger_Argument {
  max?: number;
  min?: number;
  name: string;
  number: number;
  maxValueName?: string;
  minValueName?: string;
}

export function validateInteger(arg: ValidateInteger_Argument) {
  const { number, name } = arg;

  if (!Number.isInteger(number))
    throw new Error(`"${name}" must be an integer.`);

  if (arg.min) {
    const { min, minValueName = "" } = arg;
    if (number < min)
      throw new Error(
        `"${name}" must be greater than or equal to ${minValueName} (${min}).`
      );
  }

  if (arg.max) {
    const { max, maxValueName = "" } = arg;
    if (number > max)
      throw new Error(
        `"${name}" must be less than or equal to ${maxValueName} (${max}).`
      );
  }
}

export function validatePrintTreeArgument(
  arg: any
): asserts arg is PrintTree_Argument {
  validateInteger({
    min: 2,
    name: "indentationLength",
    number: arg.indentationLength,
  });

  validateInteger({
    min: 0,
    name: "numOfHLinesBeforeNode",
    max: arg.indentationLength - 1,
    maxValueName: "indentationLength - 1",
    number: arg.numOfHLinesBeforeNode,
  });
}

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
