import { useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { convertTreeToFlow } from '../utils/treeUtils';

interface UseChartEffectsProps {
  rawTree: any;
  showDependencies: boolean;
  selectedNodes: Set<string>;
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setSelectedNodes: (nodes: Set<string>) => void;
  addChildNode: (parentId: string) => void;
  removeNode: (nodeId: string) => void;
  editNode: (nodeId: string) => void;
  handleNodeSelect: (nodeId: string, selected: boolean) => void;
}

export const useChartEffects = ({
  rawTree,
  showDependencies,
  selectedNodes,
  nodes,
  edges,
  setNodes,
  setEdges,
  setSelectedNodes,
  addChildNode,
  removeNode,
  editNode,
  handleNodeSelect,
}: UseChartEffectsProps) => {
  // Clear selections when dependency mode is turned off
  useEffect(() => {
    if (!showDependencies) {
      setSelectedNodes(new Set());
    }
  }, [showDependencies, setSelectedNodes]);

  // Update edges to show dependencies
  useEffect(() => {
    setEdges((currentEdges) => {
      const hierarchicalEdges = currentEdges.filter((edge) => !edge.id.includes('dep-'));

      if (!showDependencies) {
        return hierarchicalEdges;
      }

      const dependencyEdges: Edge[] = [];
      selectedNodes.forEach((nodeId) => {
        const node = nodes.find((n) => n.id === nodeId);
        if (node?.data.metadata?.dependencies) {
          node.data.metadata.dependencies.forEach((depNodeId: string) => {
            dependencyEdges.push({
              id: `dep-${depNodeId}-${nodeId}`,
              source: depNodeId,
              target: nodeId,
              style: {
                stroke: '#dc2626',
                strokeWidth: 2,
                strokeDasharray: '2,4',
              },
              animated: true,
            });
          });
        }
      });

      return [...hierarchicalEdges, ...dependencyEdges];
    });
  }, [showDependencies, selectedNodes, nodes, setEdges]);

  // Sync with external tree changes
  useEffect(() => {
    // Only reset nodes if rawTree is null AND we currently have no nodes
    // This prevents overriding manually added nodes
    if (!rawTree && nodes.length === 0) {
      const { nodes: newNodes, edges: newEdges } = convertTreeToFlow(rawTree);
      setNodes(newNodes);
      setEdges(newEdges);
      return;
    }

    // If rawTree exists and is different, sync with it
    // But ONLY if we're not in dependency visualization mode to prevent interference
    // Also ensure we have a stable state before syncing
    if (rawTree && nodes.length > 0 && !showDependencies) {
      const hierarchicalEdges = edges.filter((edge) => !edge.id.includes('dep-'));
      const currentRootNodes = nodes.filter((n) => !hierarchicalEdges.some((e) => e.target === n.id));

      // Don't sync if we have multiple root nodes (indicates manual editing)
      if (currentRootNodes.length > 1) {
        return;
      }

      // Only sync if the tree structure actually changed
      const { nodes: newNodes, edges: newEdges } = convertTreeToFlow(rawTree, nodes);
      const hasStructuralChange = newNodes.length !== nodes.length || 
                                  newEdges.filter(e => !e.id.includes('dep-')).length !== hierarchicalEdges.length;
      
      if (hasStructuralChange) {
        setNodes(newNodes);
        setEdges(newEdges);
      }
    }
  }, [rawTree]);

  // Update node data with callbacks and selection state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onAddChild: addChildNode,
          onRemoveNode: removeNode,
          onEditNode: editNode,
          showDependencyMode: showDependencies,
          isSelected: selectedNodes.has(node.id),
          onNodeSelect: handleNodeSelect,
        },
      })),
    );
  }, [addChildNode, removeNode, editNode, showDependencies, selectedNodes, handleNodeSelect, setNodes]);
}; 