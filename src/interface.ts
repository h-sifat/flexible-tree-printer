export type Connectors = Readonly<{
  tee: string;
  elbow: string;
  hLine: string;
  vLine: string;
  space: string;
}>;

// ============
export interface PrintTree_Argument<Type = any> {
  xLevel: number;
  yLevel: number;
  maxLevel: number;
  parentNode: Type;
  printNode: PrintNode;
  connectors: Connectors;
  forEach: ForEach<Type>;
  path: Readonly<string[]>;
  indentationLength: number;
  getNodePrefix: GetNodePrefix;
  getSubNodes: GetSubNodes<Type>;
  numOfHLinesBeforeNode?: number;
  sortNodes: (nodes: Node<Type>[]) => void;
  xLevelsOfLastNodeAncestors: Readonly<number[]>;
  shouldDescendIntoSubNode: ShouldDescendInSubNode;
}

// ============
export interface Node<Type> {
  value: Type;
  name: string;
}

type GetChildren_Argument = Pick<
  PrintTree_Argument,
  "path" | "parentNode" | "xLevel" | "yLevel"
>;
export type GetSubNodes<Type> = (arg: GetChildren_Argument) => Node<Type>[];

// ============
type ShouldDescendInSubNode = (
  arg: GetChildren_Argument & { subNodes: Node<any>[] }
) => boolean;

// ============
export type GetNodePrefix_Argument = Pick<
  PrintTree_Argument,
  | "xLevel"
  | "connectors"
  | "indentationLength"
  | "numOfHLinesBeforeNode"
  | "xLevelsOfLastNodeAncestors"
> & { isLastNode: boolean };
export type GetNodePrefix = (arg: GetNodePrefix_Argument) => string[];

// ============
export type PrintNode_Argument = GetNodePrefix_Argument &
  Pick<PrintTree_Argument, "parentNode" | "path" | "yLevel"> & {
    node: Node<any>;
    nodePrefix: string[];
  };
export type PrintNode = (arg: PrintNode_Argument) => void;

// ============
export type ForEachCallback<Type> = (
  item: Type,
  index: number,
  array: Type[]
) => void;
export type ForEach<Type> = (
  array: Type[],
  callback: ForEachCallback<Type>
) => void;
