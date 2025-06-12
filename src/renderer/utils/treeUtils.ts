import { Node, Edge } from 'reactflow';
import { TreeNode, NodeMetadata } from '../types';

export const createDefaultMetadata = (name: string): NodeMetadata => ({
  name,
  startDate: '',
  endDate: '',
  dependencies: []
});

export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toISOString();
  } catch {
    return dateStr;
  }
};

// Clean up dependency references to removed nodes
export const cleanupDependencies = (nodes: Node[], removedNodeIds: Set<string>): Node[] => {
  return nodes.map((node) => {
    const { metadata } = node.data;
    if (metadata?.dependencies) {
      // Remove dependencies that point to removed nodes
      const cleanedDependencies = metadata.dependencies.filter(
        (depId: string) => !removedNodeIds.has(depId)
      );
      
      // Only update if dependencies changed
      if (cleanedDependencies.length !== metadata.dependencies.length) {
        return {
          ...node,
          data: {
            ...node.data,
            metadata: {
              ...metadata,
              dependencies: cleanedDependencies,
            },
          },
        };
      }
    }
    return node;
  });
};

export function convertTreeToFlow(
  tree: TreeNode | null,
  existingNodes?: Node[]
): { nodes: Node[]; edges: Edge[] } {
  if (!tree) return { nodes: [], edges: [] };

  const existingPositions = new Map<string, { x: number; y: number }>();
  if (existingNodes) {
    existingNodes.forEach((node) => {
      const name = node.data.metadata?.name || node.data.label;
      if (name) {
        existingPositions.set(name, node.position);
      }
    });
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];
  let nodeId = 0;

  function traverse(node: TreeNode, parentId?: string, x = 0, y = 0, level = 0) {
    const currentId = `node-${nodeId}`;
    nodeId += 1;

    const existingPos = existingPositions.get(node.metadata.name);
    const position = existingPos || { x: x * 200, y: y * 100 };

    nodes.push({
      id: currentId,
      type: 'custom',
      position,
      data: {
        label: node.name,
        metadata: node.metadata,
        onAddChild: () => {},
        onRemoveNode: () => {},
        onEditNode: () => {},
      },
    });

    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${currentId}`,
        source: parentId,
        target: currentId,
      });
    }

    if (node.children) {
      const childrenCount = node.children.length;
      const startX = x - (childrenCount - 1) / 2;

      node.children.forEach((child, index) => {
        traverse(child, currentId, startX + index, level + 1, level + 1);
      });
    }

    return currentId;
  }

  traverse(tree);
  return { nodes, edges };
}

export function convertFlowToForest(nodes: Node[], edges: Edge[]): TreeNode[] {
  const nodeMap = new Map<string, TreeNode>();
  const childrenMap = new Map<string, string[]>();

  nodes.forEach((node) => {
    nodeMap.set(node.id, {
      name: node.data.metadata.name,
      metadata: node.data.metadata,
      children: [],
    });
  });

  const hierarchicalEdges = edges.filter((edge) => !edge.id.includes('dep-'));
  hierarchicalEdges.forEach((edge) => {
    if (!childrenMap.has(edge.source)) {
      childrenMap.set(edge.source, []);
    }
    childrenMap.get(edge.source)!.push(edge.target);
  });

  const hasParent = new Set(hierarchicalEdges.map((e) => e.target));
  const rootIds = nodes
    .filter((node) => !hasParent.has(node.id))
    .map((node) => node.id);

  function buildTree(nodeId: string): TreeNode {
    const node = nodeMap.get(nodeId)!;
    const childIds = childrenMap.get(nodeId) || [];

    if (childIds.length > 0) {
      node.children = childIds.map((childId) => buildTree(childId));
    }

    return node;
  }

  return rootIds.map((rootId) => buildTree(rootId));
} 