import { useCallback } from 'react';
import { Node, Edge, addEdge, Connection } from 'reactflow';
import { NodeMetadata, TreeNode } from '../types';
import { convertFlowToForest, createDefaultMetadata, cleanupDependencies } from '../utils/treeUtils';

interface UseChartOperationsProps {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  onTreeChange?: (tree: TreeNode | null) => void;
  openInputModal: (title: string, placeholder: string, onConfirm: (value: string) => void) => void;
  openConfirmDialog: (message: string, onConfirm: () => void) => void;
  openNodeEdit: (nodeId: string, nodeData: NodeMetadata) => void;
  resetModals: () => void;
  showDependencies: boolean;
  handleNodeSelect: (nodeId: string, selected: boolean) => void;
}

export const useChartOperations = ({
  nodes,
  edges,
  setNodes,
  setEdges,
  onTreeChange,
  openInputModal,
  openConfirmDialog,
  openNodeEdit,
  resetModals,
  showDependencies,
  handleNodeSelect,
}: UseChartOperationsProps) => {
  const updateTree = useCallback(
    (updatedNodes: Node[], updatedEdges: Edge[]) => {
      if (updatedNodes.length === 0) {
        onTreeChange?.(null);
        return;
      }

      const forest = convertFlowToForest(updatedNodes, updatedEdges);
      // Only consider hierarchical edges when determining root nodes
      const hierarchicalEdges = updatedEdges.filter((edge) => !edge.id.includes('dep-'));
      const rootNodes = updatedNodes.filter((n) => !hierarchicalEdges.some((e) => e.target === n.id));

      if (rootNodes.length === 1 && forest.length > 0) {
        onTreeChange?.(forest[0]);
      } else if (rootNodes.length === 0 && forest.length > 0) {
        // No root nodes found but forest exists, use first tree
        onTreeChange?.(forest[0]);
      } else {
        // Multiple root nodes or no forest, set to null for now
        // This allows the app to handle multiple trees if needed
        onTreeChange?.(forest.length > 0 ? forest[0] : null);
      }
    },
    [onTreeChange],
  );

  const removeNode = useCallback(
    (nodeId: string) => {
      openConfirmDialog('Are you sure you want to remove this node and all its children?', () => {
        const nodesToRemove = new Set([nodeId]);
        const edgesToRemove = new Set<string>();

        const findDescendants = (id: string) => {
          edges.forEach((edge) => {
            if (edge.source === id && !edge.id.includes('dep-')) {
              nodesToRemove.add(edge.target);
              edgesToRemove.add(edge.id);
              findDescendants(edge.target);
            }
          });
        };

        findDescendants(nodeId);

        edges.forEach((edge) => {
          if (edge.target === nodeId || edge.source === nodeId) {
            edgesToRemove.add(edge.id);
          }
        });

        const remainingNodes = nodes.filter((node) => !nodesToRemove.has(node.id));
        const remainingEdges = edges.filter((edge) => !edgesToRemove.has(edge.id));

        // Clean up dependency references in remaining nodes
        const cleanedNodes = cleanupDependencies(remainingNodes, nodesToRemove);

        setNodes(cleanedNodes);
        setEdges(remainingEdges);
        updateTree(cleanedNodes, remainingEdges);
        resetModals();
      });
    },
    [edges, nodes, setEdges, setNodes, updateTree, resetModals, openConfirmDialog],
  );

  const editNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        const nodeData = node.data.metadata || createDefaultMetadata(node.data.label || 'Unnamed');
        openNodeEdit(nodeId, nodeData);
      }
    },
    [nodes, openNodeEdit],
  );

  const saveNodeData = useCallback(
    (nodeId: string, nodeData: NodeMetadata) => {
      // Update the nodes with new metadata
      setNodes((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, metadata: nodeData } } : node)),
      );

      // Update the tree state with a slight delay to ensure state is updated
      setTimeout(() => {
        // Get fresh state for tree update
        setNodes((currentNodes) => {
          const updatedNodes = currentNodes.map((node) =>
            node.id === nodeId ? { ...node, data: { ...node.data, metadata: nodeData } } : node,
          );
          
          // Only update tree if we have valid nodes
          if (updatedNodes.length > 0) {
            setEdges((currentEdges) => {
              updateTree(updatedNodes, currentEdges);
              return currentEdges;
            });
          }
          
          return updatedNodes;
        });
      }, 10);

      resetModals();
    },
    [updateTree, resetModals, setNodes, setEdges],
  );

  const addChildNode = useCallback(
    (parentId: string) => {
      openInputModal('Add Child Node', 'Enter child node name', (childName: string) => {
        const newNodeId = `node-${Date.now()}`;
        const parentNode = nodes.find((n) => n.id === parentId);
        if (!parentNode) return;

        const newNode: Node = {
          id: newNodeId,
          type: 'custom',
          position: {
            x: parentNode.position.x + (Math.random() - 0.5) * 200,
            y: parentNode.position.y + 150,
          },
          data: {
            label: childName,
            metadata: createDefaultMetadata(childName),
            onAddChild: addChildNode,
            onRemoveNode: removeNode,
            onEditNode: editNode,
            showDependencyMode: showDependencies,
            isSelected: false,
            onNodeSelect: handleNodeSelect,
          },
        };

        const newEdge: Edge = {
          id: `edge-${parentId}-${newNodeId}`,
          source: parentId,
          target: newNodeId,
        };

        const updatedNodes = [...nodes, newNode];
        const updatedEdges = [...edges, newEdge];

        setNodes(updatedNodes);
        setEdges(updatedEdges);
        updateTree(updatedNodes, updatedEdges);
        resetModals();
      });
    },
    [nodes, edges, removeNode, editNode, showDependencies, handleNodeSelect, setNodes, setEdges, updateTree, resetModals, openInputModal],
  );

  const addRootNode = useCallback(() => {
    openInputModal('Add Root Node', 'Enter root node name', (rootName: string) => {
      const newRootId = `node-${Date.now()}`;
      // Only consider hierarchical edges when counting root nodes
      const hierarchicalEdges = edges.filter((edge) => !edge.id.includes('dep-'));
      const rootCount = nodes.filter((n) => !hierarchicalEdges.some((e) => e.target === n.id)).length;
      const x = (rootCount % 3) * 300 + 100;
      const y = Math.floor(rootCount / 3) * 200 + 50;

      const newRoot: Node = {
        id: newRootId,
        type: 'custom',
        position: { x, y },
        data: {
          label: rootName,
          metadata: createDefaultMetadata(rootName),
          onAddChild: addChildNode,
          onRemoveNode: removeNode,
          onEditNode: editNode,
          showDependencyMode: showDependencies,
          isSelected: false,
          onNodeSelect: handleNodeSelect,
        },
      };

      const updatedNodes = [...nodes, newRoot];
      setNodes(updatedNodes);
      
      // Update the tree state after adding root node
      updateTree(updatedNodes, edges);
      resetModals();
    });
  }, [addChildNode, removeNode, editNode, edges, nodes, showDependencies, handleNodeSelect, setNodes, resetModals, openInputModal, updateTree]);

  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return {
    removeNode,
    editNode,
    saveNodeData,
    addChildNode,
    addRootNode,
    onConnect,
    updateTree,
  };
}; 