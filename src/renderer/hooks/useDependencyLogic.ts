import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';

export const useDependencyLogic = (nodes: Node[], edges: Edge[]) => {
  const getAvailableNodes = useCallback((currentNodeId: string) => {
    const currentNode = nodes.find(n => n.id === currentNodeId);
    if (!currentNode) return [];

    const isCurrentNodeRoot = !edges.filter(edge => !edge.id.includes('dep-')).some(edge => edge.target === currentNodeId);
    
    if (isCurrentNodeRoot) {
      return nodes
        .filter(node => node.id !== currentNodeId)
        .map(node => ({
          id: node.id,
          name: node.data.metadata?.name || node.data.label || 'Unnamed'
        }));
    }

    const ancestors = new Set<string>();
    const findAncestors = (nodeId: string) => {
      const parentEdge = edges.filter(edge => !edge.id.includes('dep-')).find(edge => edge.target === nodeId);
      if (parentEdge) {
        ancestors.add(parentEdge.source);
        findAncestors(parentEdge.source);
      }
    };
    findAncestors(currentNodeId);

    const descendants = new Set<string>();
    const findDescendants = (nodeId: string) => {
      const childEdges = edges.filter(edge => !edge.id.includes('dep-') && edge.source === nodeId);
      childEdges.forEach(edge => {
        descendants.add(edge.target);
        findDescendants(edge.target);
      });
    };
    findDescendants(currentNodeId);

    return nodes
      .filter(node => {
        const nodeId = node.id;
        
        if (nodeId === currentNodeId) return false;
        if (ancestors.has(nodeId)) return false;
        if (descendants.has(nodeId)) return false;
        
        return true;
      })
      .map(node => ({
        id: node.id,
        name: node.data.metadata?.name || node.data.label || 'Unnamed'
      }));
  }, [nodes, edges]);

  return { getAvailableNodes };
}; 