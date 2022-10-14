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

export const DEFAULTS: Omit<
  PrintTree_Argument,
  "path" | "levelX" | "levelY" | "xLevelsOfLastNodeAncestors"
> = Object.freeze({
  forEach,
  printNode,
  connectors,
  getSubNodes,
  getNodePrefix,
  parentNode: null,
  maxDepth: Infinity,
  sortNodes: () => {},
  indentationLength: 4,
  shouldDescend: () => true,
  printRootNode: () => console.log("."),
});

type PrintTreeWrapperArgument = Partial<PrintTree_Argument> & {
  printRootNode: () => void;
};

export function printTree(userArgument: PrintTreeWrapperArgument) {
  const printTreeArgument: PrintTree_Argument & { printRootNode: () => void } =
    {
      ...DEFAULTS,
      // overriding default properties
      ...userArgument,

      // properties that the user is not allowed to change
      path: [],
      levelX: 1,
      levelY: 2, // 2, because of printing the head node
      xLevelsOfLastNodeAncestors: [],
    };

  validatePrintTreeArgument(printTreeArgument);

  printTreeArgument.printRootNode();

  __printTree__(printTreeArgument);
}
