import { validatePrintTreeArgument } from "../src/util";

const defaultArgs = Object.freeze({
  indentationLength: 4,
  numOfHLinesBeforeNode: 3,
});

it.each([
  {
    arg: { ...defaultArgs, indentationLength: -123.34 },
    case: "indentationLength is not a positive integer",
  },
  {
    arg: { indentationLength: 4, numOfHLinesBeforeNode: 2.32 },
    case: "numOfHLinesBeforeNode is not a positive integer",
  },
  {
    arg: { ...defaultArgs, indentationLength: 1 },
    case: "indentationLength is less than 2",
  },
  {
    arg: { indentationLength: 4, numOfHLinesBeforeNode: 4 },
    case: "numOfHLinesBeforeNode is equal to indentationLength",
  },
  {
    arg: { indentationLength: 4, numOfHLinesBeforeNode: 5 },
    case: "numOfHLinesBeforeNode is greater than indentationLength",
  },
])(`throws error if $case`, ({ arg }) => {
  expect.assertions(1);
  try {
    validatePrintTreeArgument(arg);
  } catch (ex) {
    expect(1).toBe(1);
  }
});
