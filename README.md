# flexible-tree-printer

The most flexible console tree printer like the unix `tree` command that you
can customize to suit your specific needs. This library uses the **UMD** module
system so it supports all JavaScript environments.

## Usages

```js
const { printTree } = require("flexible-tree-printer");

const categories = {
  study: {
    academic: { Math: null, English: null },
    programming: {
      DSA: null,
      "Number Theory": {},
      Backend: { "Node.Js": {}, Sqlite: {} },
    },
  },
  work: { personal_projects: null, job: {} },
};

printTree({ parentNode: categories });
```

Running the above snippet produces the following result:

```
.
├── study
│   ├── academic
│   │   ├── Math
│   │   └── English
│   └── programming
│       ├── DSA
│       ├── Number Theory
│       └── Backend
│           ├── Node.Js
│           └── Sqlite
└── work
    ├── personal_projects
    └── job
```

## Install

```bash
npm install flexible-tree-printer
```

## Features

Almost every behavior of the `printTree` function is customizable. It allows

1. custom indentation length (default 4)
1. setting max depth
1. custom sort function
1. printing slowly, step by step on your demand
1. retrieving sub nodes on demand, so the tree object doesn't have be to ready
   before printing
1. conditional rendering of nodes (may be a node is too deep and you don't want
   to descend anymore)
1. changing connector characters (`├, └, ─, , │`)
1. changing how every line gets printed. In fact, it doesn't even know where
   it's printing! The console? a file? or something else? It's up to you to
   decide.

It has no external dependency thus it's very lite-weight (only `5.02KiB` at time
of writing this).

## Interface

The `printTree` function has the following interface. It takes an object as
its only argument.

```typescript
interface PrintTree_Argument<Type = any> {
  maxDepth?: number;
  parentNode?: Type;
  printNode?: PrintNode;
  connectors?: Connectors;
  forEach?: ForEach<Type>;
  printRootNode: () => void;
  printRootNode: () => void;
  indentationLength?: number;
  getNodePrefix?: GetNodePrefix;
  numOfHLinesBeforeNode?: number;
  getSubNodes?: GetSubNodes<Type>;
  sortNodes?: (nodes?: Node<Type>[]) => void;
  shouldDescendIntoSubNode?: ShouldDescendInSubNode;
}
```

Don't fret after seeing the long list of properties. All are optional and a
default for every one of them is already provided for you. Though if you just
provide an empty object it'll just print a dot `"."` (the root node).

The library also exposes two other objects besides the `printTree` function in
case you find them useful. They are the `connectors` and the `DEFAULT_ARGUMENT`.

### connectors

The `connectors` object contains all the characters used for making the tree
branches.

```js
{
  tee: "├",
  elbow: "└",
  hLine: "─",
  space: " ",
  vLine: "│",
}
```

### DEFAULTS

This object contains all the default properties for the print tree argument.

## Options

Before we start, we need to know that printing a single line increases the
`levelY` by **one**, and descending into a sub node increases the `levelX` by
the **`indentationLength`** (default 4 characters e.g., `"├── "` or `"└── "`).
The `maxDepth` property refers to the max allowed `levelX` thus the max number
of sub nodes to descend into from the **root** node.

```
   .-----> level X ----------------->
   |
Y--+-[1 ][2 ][3 ]----------
1  | .
2  | ├── study
3  | │   ├── academic
4  | │   │   ├── Math
5  | │   │   └── English
6  | │   └── programming
7  | └── work
8  |     ├── personal_projects
9  |     └── job
   |
   +-[1 ][2 ][3 ]----------
```

### `parentNode`

The object to print. Default: `null`.

### `maxDepth`

Specifies the max number of sub nodes from the root node to descend into. The
default value is `Infinity`.

### `connectors`

An object containing characters to build the tree structure.

**Example**

```js
const connectors = {
  tee: "+",
  elbow: "*",
  hLine: "-",
  space: ".",
  vLine: "|",
};

printTree({
  connectors,
  maxDepth: 3,
  parentNode: categories,
});
```

The above snippet will produce:

```
.
+--.study
|...+--.academic
|...*--.programming
*--.work
....+--.personal_projects
....*--.job
```

**Tip:** If you just want to change only one or two character then borrow the
others form the exported one.

```js
const { connectors } = require("flexible-tree-printer");

const myConnectors = {
  ...connectors,
  elbow: "+",
};
```

### `indentationLength`

Specifies the number of characters to use before every node. The
**default** is **4** characters.

**Example:**

```js
printTree({ maxDepth: 1, indentationLength: 20, parentNode: categories });
```

will produce:

```
.
├────────────────── study
└────────────────── work
```

### `numOfHLinesBeforeNode`

Specifies the number of `connectors.hLine` before a node. It must be less than
the `indentationLength` otherwise a error is thrown. The default is
`indentationLength - 2`.

**Example:**

```js
const { connectors } = require("flexible-tree-printer");

const myConnectors = {
  ...connectors,
  hLine: "~",
  space: ".",
};

// default numOfHLinesBeforeNode
printTree({
  maxDepth: 1,
  indentationLength: 20,
  parentNode: categories,
  connectors: myConnectors,
});

// .
// ├~~~~~~~~~~~~~~~~~~.study
// └~~~~~~~~~~~~~~~~~~.work

// numOfHLinesBeforeNode: 10
printTree({
  maxDepth: 1,
  indentationLength: 20,
  parentNode: categories,
  connectors: myConnectors,
  numOfHLinesBeforeNode: 10,
});

// .
// ├~~~~~~~~~~.........study
// └~~~~~~~~~~.........work
```

### `getSubNodes`

A function that returns all the sub nodes of the given parent. It has the
following interface. It returns a `Node<Type>[]` array. We can use this function
to retrieve sub nodes on demand, for example reading a directory.

```typescript
interface Node<Type> {
  value: Type;
  name: string;
}

interface GetSubNode_Argument<Type> {
  levelX: number;
  levelY: number;
  parentNode: Type;
  path: Readonly<string[]>;
}

type GetSubNodes<Type> = (arg: GetSubNode_Argument<Type>) => Node<Type>[];
```

**Example** (the default `getSubNodes` function):

```js
function getSubNodes(arg) {
  const { parentNode } = arg;
  // @TODO for the reader
  if(/* parentNode is not a plain object*/) return []
  return Object.entries(parentNode)
    .map(([name, value]) => ({ name, value }));
}

// -------- example ------------
const parentNode = {
  study: null,
  work: { job: null, personal_projects: {} },
};

getSubNodes({parentNode});
/* should return the following array:
 * [
 *   { name: 'study', value: null },
 *   { name: 'work', value: { job: null, personal_projects: {} } }
 * ]
 * */
```

### `shouldDescendIntoSubNode`

With this method we can decide whether we want to descend into a sub node or
not. For example, if the number of sub nodes is more than 2000 then we may not
want to print all that nodes.

The **interface** of this function is:

```typescript
type ShouldDescendInSubNode = (
  arg: GetSubNode_Argument & { subNodes: Node<any>[] }
) => boolean;
```

It takes the same argument as `getSubNodes` with an extra property `subNodes`.
It the array generated by the `getSubNodes` function.

**Example**:

```js
function shouldDescendIntoSubNode({ subNodes }) {
  return subNodes.length < 2000;
}
```

### `sortNodes`

A custom sort function used to sort the `subNodes` array generated by the
`getSubNodes` function. It takes same argument as the `shouldDescendIntoSubNode`
function.

**Interface**:

```typescript
type ShouldDescendInSubNode = (
  arg: GetSubNode_Argument & { subNodes: Node<any>[] }
) => void;
```

**Example**: Sort nodes based on the length of their name.

```js
function sortNodes({ subNodes }) {
  subNodes.sort((nodeA, nodeB) => nodeA.name.length - nodeB.name.length);
}
```

### `forEach`

You can customize the looping behavior with this function.

**Interface:**

```typescript
export type ForEachCallback<Type> = (
  item: Type,
  index: number,
  array: Type[]
) => void;

export type ForEach<Type> = (
  array: Type[],
  callback: ForEachCallback<Type>
) => void;
```

**Example:** Printing nodes slowly

```js
function forEach(array, callback) {
  let index = 0;

  const intervalId = setInterval(() => {
    if (index < array.length) callback(array[index], index, array);
    else clearInterval(intervalId);

    index++;
  }, 1000);
}
```

### `getNodePrefix`

This function is the **main component** of the `printTree` function and you
probably don't want to change the default. It is still replaceable in case the
need arises. It generates the prefix before every node and returns a character
array.

So, if a line is: `"│ │ └── English"` then the "English" node's prefix is:
`"│ │ └── "`.

**Interface:**

```typescript
type GetNodePrefix_Argument = {
  levelX: number;
  connectors: object;
  isLastNode: boolean;
  indentationLength: number;
  numOfHLinesBeforeNode?: number;
  xLevelsOfLastNodeAncestors: number[];
};

type GetNodePrefix = (arg: GetNodePrefix_Argument) => string[];
```

Here `xLevelsOfLastNodeAncestors` property is a number array where it contains
all the `X` levels of ancestor's which are the last node of their parent.

**Example**

```
.
└── study
.   └── academic
.   .   ├── Math
.   .   └── English
-------------------
1   2   3   level X ->
```

For the nodes "English" and "Math", their ancestors "study" (level 2) and the
"root" (level 1) node are the last child of their parent. So for these nodes, we
should not fill these levels with the `"│"` (`connectors.vLine`) character.
Otherwise the tree would look like:

```
.
└── study
│   └── academic
│   │   ├── Math
│   │   └── English
-------------------
1   2   3   level X ->
```

### `printNode`

The `printNode` function is responsible for printing every line of the tree. We
can use this function to change the way we want to print a line.

**Interface:**

```typescript
type PrintNode_Argument = {
  levelX: number;
  levelY: number;
  path: string[];
  node: Node<any>;
  parentNode: any;
  connectors: object;
  isLastNode: boolean;
  nodePrefix: string[];
  indentationLength: number;
  numOfHLinesBeforeNode?: number;
  xLevelsOfLastNodeAncestors: number[];
};

type PrintNode = (arg: PrintNode_Argument) => void;
```

**The Default Implementation:**

```js
function printNode({ nodePrefix, node }) {
  const line = nodePrefix.join("") + node.name;
  console.log(line);
}
```

### `printRootNode`

Allows you to change how the root node should be printed. The default
implementation is:

```js
const printRootNode = () => console.log(".");
```

**Example:**

```js
printTree({ printRootNode: () => console.log("*") });

// it will just print the root node
// *
```
