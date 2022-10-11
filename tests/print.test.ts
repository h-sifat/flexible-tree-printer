import { connectors } from "../src";
import printTree from "../src/print";
import { PrintTree_Argument } from "../src/interface";

const argMethods = Object.freeze({
  forEach: jest.fn(),
  printNode: jest.fn(),
  sortNodes: jest.fn(),
  getSubNodes: jest.fn(),
  getNodePrefix: jest.fn(),
  shouldDescendIntoSubNode: jest.fn(),
} as const);

const arg: PrintTree_Argument = Object.freeze({
  path: [],
  xLevel: 1,
  yLevel: 1,
  connectors,
  ...argMethods,
  parentNode: null,
  maxLevel: Infinity,
  indentationLength: 4,
  xLevelsOfLastNodeAncestors: [],
});

beforeEach(() => {
  Object.values(argMethods).forEach((method) => method.mockReset());
});

it(`stops printing if xLevel becomes greater than maxLevel`, () => {
  printTree({ ...arg, maxLevel: 2, xLevel: 3 });

  // no method should have been called
  Object.values(argMethods).forEach((method) => {
    expect(method).not.toHaveBeenCalled();
  });
});

it(`doesn't returns if the subNodes array is empty`, () => {
  argMethods.getSubNodes.mockReturnValueOnce([]);

  printTree(arg);

  expect(argMethods.getSubNodes).toHaveBeenCalledTimes(1);
  const getSubNodesCallArgs = argMethods.getSubNodes.mock.lastCall![0];
  expect(getSubNodesCallArgs).toMatchObject({
    path: arg.path,
    xLevel: arg.xLevel,
    yLevel: arg.yLevel,
    parentNode: arg.parentNode,
  });

  // as the getSubNodes returned an empty printTree should return, thus not
  // calling any other methods
  for (const method in argMethods)
    if (method !== "getSubNodes")
      // @ts-ignore
      expect(argMethods[method]).not.toHaveBeenCalled();
});

it(`doesn't descend into a node if the shouldDescendIntoSubNode returns false`, () => {
  const fakeSubNodes = [{ name: "A", value: 1 }];
  argMethods.getSubNodes.mockReturnValueOnce(fakeSubNodes);
  argMethods.shouldDescendIntoSubNode.mockReturnValueOnce(false);

  printTree(arg);

  expect(argMethods.getSubNodes).toHaveBeenCalledTimes(1);
  expect(argMethods.shouldDescendIntoSubNode).toHaveBeenCalledTimes(1);

  const shouldDescendIntoSubNode =
    argMethods.shouldDescendIntoSubNode.mock.lastCall![0];
  expect(shouldDescendIntoSubNode).toMatchObject({
    path: arg.path,
    xLevel: arg.xLevel,
    yLevel: arg.yLevel,
    subNodes: fakeSubNodes,
    parentNode: arg.parentNode,
  });

  for (const method in argMethods)
    if (!["getSubNodes", "shouldDescendIntoSubNode"].includes(method))
      // @ts-ignore
      expect(argMethods[method]).not.toHaveBeenCalled();
});

it(`calls the sortNodes before looping over nodes and printing them`, () => {
  const fakeSubNodes = [{ name: "A", value: 1 }];

  argMethods.getSubNodes.mockReturnValueOnce(fakeSubNodes);
  argMethods.shouldDescendIntoSubNode.mockReturnValueOnce(true);

  printTree(arg);

  expect(argMethods.getSubNodes).toHaveBeenCalledTimes(1);
  expect(argMethods.shouldDescendIntoSubNode).toHaveBeenCalledTimes(1);
  expect(argMethods.sortNodes).toHaveBeenCalledTimes(1);
  expect(argMethods.sortNodes).toHaveBeenCalledWith(fakeSubNodes);
  expect(argMethods.forEach).toHaveBeenCalledTimes(1);

  {
    const [subNodes, callback] = argMethods.forEach.mock.lastCall!;
    expect(subNodes).toEqual(fakeSubNodes);
    expect(callback).toEqual(expect.any(Function));
  }

  expect(argMethods.printNode).not.toHaveBeenCalled();
  expect(argMethods.getNodePrefix).not.toHaveBeenCalled();
});

describe("inside the loop it should call the getNodePrefix function", () => {
  const fakeSubNodes = [{ name: "A", value: 1 }];

  argMethods.getSubNodes.mockReturnValueOnce(fakeSubNodes);
  argMethods.shouldDescendIntoSubNode.mockReturnValueOnce(true);

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
    xLevel: arg.xLevel,
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
    xLevel: arg.xLevel + 1,
    yLevel: arg.yLevel + 1,
    parentNode: expectedPrintNodeCallArg.node.value,
  });
});
