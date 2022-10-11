import { PrintTree_Argument } from "./interface";

interface ValidateInteger_Argument {
  min?: number;
  max?: number;
  number: number;
  name: string;
}

export function validateInteger(arg: ValidateInteger_Argument) {
  const { number, name } = arg;

  if (!Number.isInteger(number))
    throw new Error(`"${name}" must be an integer.`);

  if (arg.min) {
    const { min } = arg;
    if (number < min) throw new Error(`"${name}" must be greater than ${min}.`);
  }

  if (arg.max) {
    const { max } = arg;
    if (number > max) throw new Error(`"${name}" must be less than ${max}.`);
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
    number: arg.numOfHLinesBeforeNode,
  });
}
