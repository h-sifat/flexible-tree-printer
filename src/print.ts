import { PrintTree_Argument } from "./interface";

export default function printTree(arg: PrintTree_Argument) {
  const {
    path,
    forEach,
    maxLevel,
    printNode,
    sortNodes,
    connectors,
    getSubNodes,
    getNodePrefix,
    indentationLength,
    parentNode = null,
    numOfHLinesBeforeNode,
    shouldDescendIntoSubNode,
    xLevelsOfLastNodeAncestors,
  } = arg;

  let { xLevel, yLevel } = arg;

  if (xLevel > maxLevel) return;

  const getSubNodesArgument = { path, parentNode, xLevel, yLevel };
  const subNodes = getSubNodes(getSubNodesArgument);

  if (!subNodes.length) return;

  {
    const shouldDescend = shouldDescendIntoSubNode({
      subNodes,
      ...getSubNodesArgument,
    });

    if (!shouldDescend) return;
  }

  sortNodes(subNodes);

  forEach(subNodes, (node, index) => {
    const currentPath = Object.freeze([...path, node.name]);
    const isLastNode = index === subNodes.length - 1;

    const getNodePrefixArgument = {
      xLevel,
      connectors,
      isLastNode,
      indentationLength,
      numOfHLinesBeforeNode,
      xLevelsOfLastNodeAncestors,
    };

    const prefix = getNodePrefix(getNodePrefixArgument);

    printNode({
      node,
      yLevel,
      path: currentPath,
      nodePrefix: prefix,
      parentNode: parentNode,
      ...getNodePrefixArgument,
    });

    yLevel++;

    printTree({
      ...arg,
      yLevel,
      path: currentPath,
      xLevel: xLevel + 1,
      parentNode: node.value,
      xLevelsOfLastNodeAncestors: isLastNode
        ? Object.freeze([...xLevelsOfLastNodeAncestors, xLevel])
        : xLevelsOfLastNodeAncestors,
    });
  });
}
