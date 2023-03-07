export type Connectors = Readonly<{
  tee: string;
  elbow: string;
  hLine: string;
  vLine: string;
  space: string;
}>;

// ============
export interface PrintTree_Argument<NodeType = any> {
  levelX: number;
  levelY: number;
  maxDepth: number;
  connectors: Connectors;
  path: Readonly<string[]>;
  indentationLength: number;
  printRootNode: () => void;
  forEach: ForEach<NodeType>;
  parentNode: NodeType | null;
  numOfHLinesBeforeNode?: number;
  printNode: PrintNode<NodeType>;
  getSubNodes: GetSubNodes<NodeType>;
  getNodePrefix: GetNodePrefix<NodeType>;
  shouldDescend: ShouldDescend<NodeType>;
  xLevelsOfLastNodeAncestors: Readonly<number[]>;
  sortNodes: (arg: ShouldDescend_Argument<NodeType>) => void;
}

// ============
export interface Node<Type> {
  value: Type;
  name: string;
}

export type GetSubNode_Argument<NodeType> = Pick<
  PrintTree_Argument<NodeType>,
  "path" | "parentNode" | "levelX" | "levelY"
>;
export type GetSubNodes<Type> = (
  arg: GetSubNode_Argument<Type>
) => Node<Type>[];

// ============
type ShouldDescend_Argument<NodeType> = GetSubNode_Argument<NodeType> & {
  subNodes: Node<NodeType>[];
};
type ShouldDescend<NodeType> = (
  arg: ShouldDescend_Argument<NodeType>
) => boolean;

// ============
export type GetNodePrefix_Argument<NodeType> = Pick<
  PrintTree_Argument<NodeType>,
  | "levelX"
  | "connectors"
  | "indentationLength"
  | "numOfHLinesBeforeNode"
  | "xLevelsOfLastNodeAncestors"
> & { isLastNode: boolean };
export type GetNodePrefix<NodeType> = (
  arg: GetNodePrefix_Argument<NodeType>
) => string[];

// ============
export type PrintNode_Argument<NodeType> = GetNodePrefix_Argument<NodeType> &
  Pick<PrintTree_Argument<NodeType>, "parentNode" | "path" | "levelY"> & {
    node: Node<NodeType>;
    nodePrefix: string[];
  };
export type PrintNode<NodeType> = (arg: PrintNode_Argument<NodeType>) => void;

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
