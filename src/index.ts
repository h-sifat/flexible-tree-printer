import {
  forEach,
  printNode,
  getSubNodes,
  validatePrintTreeArgument,
} from "./util";
import __printTree__ from "./print";
import getNodePrefix from "./prefix-generator";
import type { Connectors, PrintTree_Argument } from "./interface";

export const connectors: Connectors = Object.freeze({
  tee: "├",
  elbow: "└",
  hLine: "─",
  space: " ",
  vLine: "│",
});

export const DEFAULT_ARGUMENT: Omit<
  PrintTree_Argument,
  "path" | "xLevel" | "yLevel" | "xLevelsOfLastNodeAncestors"
> = Object.freeze({
  forEach,
  printNode,
  connectors,
  getSubNodes,
  getNodePrefix,
  parentNode: null,
  maxLevel: Infinity,
  sortNodes: () => {},
  indentationLength: 4,
  numOfHLinesBeforeNode: 2,
  shouldDescendIntoSubNode: () => true,
});

export function printTree(userArgument: Partial<PrintTree_Argument>) {
  const printTreeArgument: PrintTree_Argument = {
    ...DEFAULT_ARGUMENT,
    // overriding default arguments
    ...userArgument,

    // properties that the user is not allowed to change
    path: [],
    xLevel: 1,
    yLevel: 1,
    xLevelsOfLastNodeAncestors: [],
  };

  validatePrintTreeArgument(printTreeArgument);

  console.log(".");

  __printTree__(printTreeArgument);
}
