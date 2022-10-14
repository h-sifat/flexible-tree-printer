export type Connectors = Readonly<{
  tee: string;
  elbow: string;
  hLine: string;
  vLine: string;
  space: string;
}>;

// ============
export interface PrintTree_Argument<Type = any> {
  levelX: number;
  levelY: number;
  maxDepth: number;
  parentNode: Type;
  printNode: PrintNode;
  connectors: Connectors;
  forEach: ForEach<Type>;
  path: Readonly<string[]>;
  indentationLength: number;
  getNodePrefix: GetNodePrefix;
  shouldDescend: ShouldDescend;
  getSubNodes: GetSubNodes<Type>;
  numOfHLinesBeforeNode?: number;
  sortNodes: (arg: ShouldDescend_Argument) => void;
  xLevelsOfLastNodeAncestors: Readonly<number[]>;
}

// ============
export interface Node<Type> {
  value: Type;
  name: string;
}

export type GetSubNode_Argument = Pick<
  PrintTree_Argument,
  "path" | "parentNode" | "levelX" | "levelY"
>;
export type GetSubNodes<Type> = (arg: GetSubNode_Argument) => Node<Type>[];

// ============
type ShouldDescend_Argument = GetSubNode_Argument & { subNodes: Node<any>[] };
type ShouldDescend = (arg: ShouldDescend_Argument) => boolean;

// ============
export type GetNodePrefix_Argument = Pick<
  PrintTree_Argument,
  | "levelX"
  | "connectors"
  | "indentationLength"
  | "numOfHLinesBeforeNode"
  | "xLevelsOfLastNodeAncestors"
> & { isLastNode: boolean };
export type GetNodePrefix = (arg: GetNodePrefix_Argument) => string[];

// ============
export type PrintNode_Argument = GetNodePrefix_Argument &
  Pick<PrintTree_Argument, "parentNode" | "path" | "levelY"> & {
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
