import { PrintTree_Argument } from "./interface";

export default function printTree(arg: PrintTree_Argument) {
  const {
    path,
    forEach,
    maxDepth,
    printNode,
    sortNodes,
    connectors,
    getSubNodes,
    getNodePrefix,
    indentationLength,
    parentNode = null,
    numOfHLinesBeforeNode,
    shouldDescend,
    xLevelsOfLastNodeAncestors,
  } = arg;

  let { levelX, levelY } = arg;

  if (levelX > maxDepth) return;

  const getSubNodesArgument = { path, parentNode, levelX, levelY };
  const subNodes = getSubNodes(getSubNodesArgument);

  if (!subNodes.length) return;
  if (!shouldDescend({ subNodes, ...getSubNodesArgument })) return;

  sortNodes({ subNodes, ...getSubNodesArgument });

  forEach(subNodes, (node, index) => {
    const currentPath = Object.freeze([...path, node.name]);
    const isLastNode = index === subNodes.length - 1;

    const getNodePrefixArgument = {
      levelX,
      connectors,
      isLastNode,
      indentationLength,
      numOfHLinesBeforeNode,
      xLevelsOfLastNodeAncestors,
    };

    const prefix = getNodePrefix(getNodePrefixArgument);

    printNode({
      node,
      levelY: levelY,
      path: currentPath,
      nodePrefix: prefix,
      parentNode: parentNode,
      ...getNodePrefixArgument,
    });

    levelY++;

    printTree({
      ...arg,
      levelY: levelY,
      path: currentPath,
      levelX: levelX + 1,
      parentNode: node.value,
      xLevelsOfLastNodeAncestors: isLastNode
        ? Object.freeze([...xLevelsOfLastNodeAncestors, levelX])
        : xLevelsOfLastNodeAncestors,
    });
  });
}
