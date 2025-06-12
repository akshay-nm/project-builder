export interface NodeMetadata {
  name: string;
  startDate: string;
  endDate: string;
  dependencies: string[];
}

export interface TreeNode {
  name: string;
  children?: TreeNode[];
  metadata: NodeMetadata;
}

export interface CustomNodeData {
  label: string;
  metadata: NodeMetadata;
  onAddChild: (nodeId: string) => void;
  onRemoveNode: (nodeId: string) => void;
  onEditNode: (nodeId: string) => void;
  showDependencyMode?: boolean;
  isSelected?: boolean;
  onNodeSelect?: (nodeId: string, selected: boolean) => void;
}

export interface TreeProps {
  rawTree: TreeNode | null;
  onTreeChange?: (tree: TreeNode | null) => void;
  onGetTreeData?: (treeData: any) => void;
  showDependencies?: boolean;
}

export interface NodeEditFormProps {
  isOpen: boolean;
  nodeData: NodeMetadata;
  availableNodes: Array<{ id: string; name: string }>;
  onSave: (data: NodeMetadata) => void;
  onCancel: () => void;
}

export interface InputModalProps {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onConfirm: (value: string) => void;
  onCancel: () => void;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
} 