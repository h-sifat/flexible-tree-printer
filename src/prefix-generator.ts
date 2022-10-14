import { GetNodePrefix_Argument } from "./interface";

export default function getNodePrefix(arg: GetNodePrefix_Argument) {
  const { connectors, indentationLength } = arg;
  const SPACE_OFFSET = new Array(indentationLength - 1).fill(connectors.space);

  const prefix: string[] = [];

  for (let level = 1; level < arg.levelX; level++) {
    prefix.push(
      arg.xLevelsOfLastNodeAncestors.includes(level)
        ? connectors.space
        : connectors.vLine
    );

    prefix.push(...SPACE_OFFSET);
  }

  {
    const { isLastNode } = arg;
    prefix.push(isLastNode ? connectors.elbow : connectors.tee);
  }

  {
    const { numOfHLinesBeforeNode: numOfHLines = indentationLength - 2 } = arg;
    for (let i = 0; i < numOfHLines; i++) prefix.push(connectors.hLine);
    for (let i = 0; i < indentationLength - 1 - numOfHLines; i++)
      prefix.push(connectors.space);
  }

  return prefix;
}
