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
  shouldDescendIntoSubNode: () => true,
  printRootNode: () => console.log("."),
});

type PrintTreeWrapperArgument = Partial<PrintTree_Argument> & {
  printRootNode: () => void;
};

export function printTree(userArgument: PrintTreeWrapperArgument) {
  const printTreeArgument: PrintTree_Argument & { printRootNode: () => void } =
    {
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

  printTreeArgument.printRootNode();

  __printTree__(printTreeArgument);
}
