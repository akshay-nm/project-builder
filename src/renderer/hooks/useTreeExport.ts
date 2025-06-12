import { useCallback } from 'react';
import { Node, Edge } from 'reactflow';
import { createDefaultMetadata, formatDate } from '../utils/treeUtils';

interface UseTreeExportProps {
  nodes: Node[];
  edges: Edge[];
  onGetTreeData?: (treeData: any) => void;
}

export const useTreeExport = ({ nodes, edges, onGetTreeData }: UseTreeExportProps) => {
  const getTreeData = useCallback(() => {
    if (nodes.length === 0) return null;

    const childrenMap = new Map<string, string[]>();
    const hierarchicalEdges = edges.filter((edge) => !edge.id.includes('dep-'));

    hierarchicalEdges.forEach((edge) => {
      if (!childrenMap.has(edge.source)) {
        childrenMap.set(edge.source, []);
      }
      childrenMap.get(edge.source)!.push(edge.target);
    });

    const nodeMap = new Map<string, Node>();
    nodes.forEach((node) => {
      nodeMap.set(node.id, node);
    });

    const hasParent = new Set(hierarchicalEdges.map((e) => e.target));
    const rootIds = nodes.filter((node) => !hasParent.has(node.id)).map((node) => node.id);

    function buildNodeData(nodeId: string): any {
      const node = nodeMap.get(nodeId);
      if (!node) return null;

      const metadata = node.data.metadata || createDefaultMetadata(node.data.label || 'Unnamed');
      const childIds = childrenMap.get(nodeId) || [];

      return {
        id: nodeId,
        name: metadata.name,
        startDate: formatDate(metadata.startDate),
        endDate: formatDate(metadata.endDate),
        dependencies: metadata.dependencies || [],
        children: childIds.map((childId) => buildNodeData(childId)).filter(Boolean),
      };
    }

    const treeData = rootIds.map((rootId) => buildNodeData(rootId)).filter(Boolean);
    return treeData.length === 1 ? treeData[0] : treeData;
  }, [nodes, edges]);

  const handleExport = useCallback(() => {
    const treeData = getTreeData();
    if (onGetTreeData) {
      onGetTreeData(treeData);
    } else {
      console.log('Tree Data:', JSON.stringify(treeData, null, 2));
      alert('Tree data logged to console. Check developer tools.');
    }
  }, [getTreeData, onGetTreeData]);

  return {
    getTreeData,
    handleExport,
  };
}; 