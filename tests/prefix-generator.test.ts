import { it, expect, test } from 'vitest';
import { connectors } from "../src";
import getNodePrefix from "../src/prefix-generator";

const defaultArgs = Object.freeze({
  connectors,
  indentationLength: 4,
  numOfHLinesBeforeNode: 2,
  xLevelsOfLastNodeAncestors: [],
});

const SPACE_OFFSET = Object.freeze([
  connectors.space,
  connectors.space,
  connectors.space,
]);

const NODE_PREFIX = Object.freeze([
  connectors.hLine,
  connectors.hLine,
  connectors.space,
]);

const testSuite = [
  {
    arg: { ...defaultArgs, levelX: 1, isLastNode: false },
    prefix: [connectors.tee, ...NODE_PREFIX],
  },
  {
    arg: { ...defaultArgs, levelX: 1, isLastNode: true },
    prefix: [connectors.elbow, ...NODE_PREFIX],
  },
  {
    arg: { ...defaultArgs, levelX: 2, isLastNode: false },
    prefix: [connectors.vLine, ...SPACE_OFFSET, connectors.tee, ...NODE_PREFIX],
  },
  {
    arg: { ...defaultArgs, levelX: 2, isLastNode: true },
    prefix: [
      // level 1
      connectors.vLine,
      ...SPACE_OFFSET,

      // level 2
      connectors.elbow,
      ...NODE_PREFIX,
    ],
  },

  {
    arg: {
      ...defaultArgs,
      levelX: 3,
      isLastNode: false,
      xLevelsOfLastNodeAncestors: [2],
    },
    prefix: [
      // level 1
      connectors.vLine,
      ...SPACE_OFFSET,

      // level 2
      connectors.space,
      ...SPACE_OFFSET,

      // level 3
      connectors.tee,
      ...NODE_PREFIX,
    ],
  },

  {
    arg: {
      ...defaultArgs,
      levelX: 3,
      isLastNode: true,
      xLevelsOfLastNodeAncestors: [2],
    },
    prefix: [
      // level 1
      connectors.vLine,
      ...SPACE_OFFSET,

      // level 2
      connectors.space,
      ...SPACE_OFFSET,

      // level 3
      connectors.elbow,
      ...NODE_PREFIX,
    ],
  },
];

Object.freeze(testSuite);

for (const { prefix: expectedPrefix, arg } of testSuite) {
  let testCase = `lvl ${arg.levelX} ` + `${arg.isLastNode ? "last " : ""}node`;

  if (arg.xLevelsOfLastNodeAncestors.length)
    testCase += ` with last node ancestor on levels ${arg.xLevelsOfLastNodeAncestors}`;
  testCase += `: "${expectedPrefix.join("")}"`;

  it(testCase, () => {
    const prefix = getNodePrefix(arg);
    expect(prefix).toEqual(expectedPrefix);
  });
}

test.each([
  {
    arg: {
      ...defaultArgs,
      levelX: 1,
      isLastNode: false,
      numOfHLinesBeforeNode: 3,
    },
    prefix: [
      connectors.tee,
      connectors.hLine,
      connectors.hLine,
      connectors.hLine,
    ],
  },
  {
    arg: {
      ...defaultArgs,
      levelX: 1,
      isLastNode: false,
      numOfHLinesBeforeNode: 1,
    },
    prefix: [
      connectors.tee,
      connectors.hLine,
      connectors.space,
      connectors.space,
    ],
  },
  {
    arg: {
      ...defaultArgs,
      levelX: 1,
      isLastNode: true,
      numOfHLinesBeforeNode: 0,
    },
    prefix: [
      connectors.elbow,
      connectors.space,
      connectors.space,
      connectors.space,
    ],
  },
])(
  "the number of horizontal lines immediately before a node can be changed",
  ({ arg, prefix: expectedPrefix }) => {
    const prefix = getNodePrefix(arg);
    expect(prefix).toEqual(expectedPrefix);
  }
);
