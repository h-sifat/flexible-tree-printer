import { it, expect, beforeEach, vi } from "vitest";
import { connectors } from "../src";
import printTree from "../src/print";
import { PrintTree_Argument } from "../src/interface";

const argMethods = Object.freeze({
  forEach: vi.fn(),
  printNode: vi.fn(),
  sortNodes: vi.fn(),
  getSubNodes: vi.fn(),
  getNodePrefix: vi.fn(),
  shouldDescend: vi.fn(),
  printRootNode: vi.fn(),
} as const);

const arg: PrintTree_Argument = Object.freeze({
  path: [],
  levelX: 1,
  levelY: 1,
  connectors,
  ...argMethods,
  parentNode: null,
  maxDepth: Infinity,
  indentationLength: 4,
  xLevelsOfLastNodeAncestors: [],
});

beforeEach(() => {
  Object.values(argMethods).forEach((method) => method.mockReset());
});

it(`stops printing if levelX becomes greater than maxLevel`, () => {
  printTree({ ...arg, maxDepth: 2, levelX: 3 });

  // no method should have been called
  Object.values(argMethods).forEach((method) => {
    expect(method).not.toHaveBeenCalled();
  });
});

it(`doesn't call any other functions if getSubNodes returns an empty array`, () => {
  argMethods.getSubNodes.mockReturnValueOnce([]);

  printTree(arg);

  expect(argMethods.getSubNodes).toHaveBeenCalledTimes(1);
  const getSubNodesCallArgs = argMethods.getSubNodes.mock.lastCall![0];
  expect(getSubNodesCallArgs).toMatchObject({
    path: arg.path,
    levelX: arg.levelX,
    levelY: arg.levelY,
    parentNode: arg.parentNode,
  });

  // as the getSubNodes returned an empty printTree should return, thus not
  // calling any other methods
  for (const method in argMethods)
    if (method !== "getSubNodes")
      // @ts-ignore
      expect(argMethods[method]).not.toHaveBeenCalled();
});

it(`doesn't descend into a node if the shouldDescend returns false`, () => {
  const fakeSubNodes = [{ name: "A", value: 1 }];
  argMethods.getSubNodes.mockReturnValueOnce(fakeSubNodes);
  argMethods.shouldDescend.mockReturnValueOnce(false);

  printTree(arg);

  expect(argMethods.getSubNodes).toHaveBeenCalledTimes(1);
  expect(argMethods.shouldDescend).toHaveBeenCalledTimes(1);

  const shouldDescend = argMethods.shouldDescend.mock.lastCall![0];
  expect(shouldDescend).toMatchObject({
    path: arg.path,
    levelX: arg.levelX,
    levelY: arg.levelY,
    subNodes: fakeSubNodes,
    parentNode: arg.parentNode,
  });

  for (const method in argMethods)
    if (!["getSubNodes", "shouldDescend"].includes(method))
      // @ts-ignore
      expect(argMethods[method]).not.toHaveBeenCalled();
});

it(`calls the sortNodes before looping over nodes and printing them`, () => {
  const fakeSubNodes = [{ name: "A", value: 1 }];

  argMethods.getSubNodes.mockReturnValueOnce(fakeSubNodes);
  argMethods.shouldDescend.mockReturnValueOnce(true);

  printTree(arg);

  expect(argMethods.getSubNodes).toHaveBeenCalledTimes(1);
  expect(argMethods.shouldDescend).toHaveBeenCalledTimes(1);
  expect(argMethods.sortNodes).toHaveBeenCalledTimes(1);

  expect(argMethods.sortNodes).toHaveBeenCalledWith({
    path: [],
    levelX: arg.levelX,
    levelY: arg.levelY,
    subNodes: fakeSubNodes,
    parentNode: arg.parentNode,
  });

  expect(argMethods.forEach).toHaveBeenCalledTimes(1);

  {
    const [subNodes, callback] = argMethods.forEach.mock.lastCall!;
    expect(subNodes).toEqual(fakeSubNodes);
    expect(callback).toEqual(expect.any(Function));
  }

  expect(argMethods.printNode).not.toHaveBeenCalled();
  expect(argMethods.getNodePrefix).not.toHaveBeenCalled();
});

it("inside the loop it should call the getNodePrefix function", () => {
  const fakeSubNodes = [{ name: "A", value: 1 }];

  argMethods.getSubNodes.mockReturnValueOnce(fakeSubNodes);
  argMethods.shouldDescend.mockReturnValueOnce(true);

  printTree(arg);

  const [subNodes, loopCallback] = argMethods.forEach.mock.lastCall!;

  // this will be called in the second iteration. if we return an empty array
  // printTree will return.
  argMethods.getSubNodes.mockReturnValueOnce([]);

  const fakeNodePrefix = [
    connectors.elbow,
    connectors.hLine,
    connectors.hLine,
    connectors.space,
  ];
  argMethods.getNodePrefix.mockReturnValueOnce(fakeNodePrefix);

  // calling the loop callback
  const currentIndex = 0;
  loopCallback(subNodes[currentIndex], currentIndex, subNodes);

  expect(argMethods.getNodePrefix).toHaveBeenCalledTimes(1);
  expect(argMethods.printNode).toHaveBeenCalledTimes(1);

  const getNodePrefixCallArg = argMethods.getNodePrefix.mock.lastCall![0];

  const expectedGetNodePrefixCallArg = Object.freeze({
    levelX: arg.levelX,
    connectors: arg.connectors,
    isLastNode: subNodes.length - 1 === currentIndex,
    indentationLength: arg.indentationLength,
    numOfHLinesBeforeNode: arg.numOfHLinesBeforeNode,
    xLevelsOfLastNodeAncestors: arg.xLevelsOfLastNodeAncestors,
  });

  expect(getNodePrefixCallArg).toMatchObject(expectedGetNodePrefixCallArg);

  const printNodeCallArg = argMethods.printNode.mock.lastCall![0];
  const expectedPrintNodeCallArg = Object.freeze({
    ...expectedGetNodePrefixCallArg,
    nodePrefix: fakeNodePrefix,
    parentNode: arg.parentNode,
    node: fakeSubNodes[currentIndex],
    path: [fakeSubNodes[currentIndex].name],
  });

  expect(printNodeCallArg).toMatchObject(expectedPrintNodeCallArg);

  // because the printTree function is recursive it was called again, but as
  // we returned and empty array it stopped.
  expect(argMethods.getSubNodes).toHaveBeenCalledTimes(2);

  const getSubNodesSecondCallArgs = argMethods.getSubNodes.mock.lastCall![0];

  expect(getSubNodesSecondCallArgs).toEqual({
    path: expectedPrintNodeCallArg.path,
    levelX: arg.levelX + 1,
    levelY: arg.levelY + 1,
    parentNode: expectedPrintNodeCallArg.node.value,
  });
});
