import React, { useCallback, useState, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { TreeProps, NodeMetadata } from '../types';
import { CustomNode, NodeEditForm, InputModal, ConfirmDialog } from './';
import { convertTreeToFlow, convertFlowToForest, createDefaultMetadata, formatDate } from '../utils/treeUtils';
import { useDependencyLogic } from '../hooks/useDependencyLogic';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export function Chart({ rawTree, onTreeChange, onGetTreeData }: TreeProps) {
  const [nodeEditForm, setNodeEditForm] = useState<{
    isOpen: boolean;
    nodeId: string;
    nodeData: NodeMetadata;
  }>({ 
    isOpen: false, 
    nodeId: '', 
    nodeData: { name: '', startDate: '', endDate: '', dependencies: [] } 
  });

  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    title: string;
    placeholder: string;
    onConfirm: (value: string) => void;
  }>({ isOpen: false, title: '', placeholder: '', onConfirm: () => {} });

  const [showConfirmDialog, setShowConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, message: '', onConfirm: () => {} });

  const { nodes: initialNodes, edges: initialEdges } = convertTreeToFlow(rawTree);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const { getAvailableNodes } = useDependencyLogic(nodes, edges);

  useEffect(() => {
    if (!rawTree || nodes.length === 0) {
      const { nodes: newNodes, edges: newEdges } = convertTreeToFlow(rawTree);
      setNodes(newNodes);
      setEdges(newEdges);
    } else {
      const currentRootNodes = nodes.filter(
        (n) => !edges.some((e) => e.target === n.id)
      );
      
      if (currentRootNodes.length > 1) {
        return;
      }
      
      const { nodes: newNodes, edges: newEdges } = convertTreeToFlow(rawTree, nodes);
      if (newNodes.length !== nodes.length) {
        setNodes(newNodes);
        setEdges(newEdges);
      }
    }
  }, [rawTree, setNodes, setEdges]);

  const removeNode = useCallback(
    (nodeId: string) => {
      setShowConfirmDialog({
        isOpen: true,
        message: 'Are you sure you want to remove this node and all its children?',
        onConfirm: () => {
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

          setNodes(remainingNodes);
          setEdges(remainingEdges);

          if (remainingNodes.length === 0) {
            onTreeChange?.(null);
          } else {
            const forest = convertFlowToForest(remainingNodes, remainingEdges);
            const rootNodes = remainingNodes.filter(
              (n) => !remainingEdges.some((e) => e.target === n.id)
            );
            if (rootNodes.length === 1) {
              onTreeChange?.(forest.length > 0 ? forest[0] : null);
            }
          }

          setShowConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
        },
      });
    },
    [edges, nodes, onTreeChange, setEdges, setNodes],
  );

  const editNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node) {
        const nodeData = node.data.metadata || createDefaultMetadata(node.data.label || 'Unnamed');
        setNodeEditForm({ isOpen: true, nodeId, nodeData });
      }
    },
    [nodes],
  );

  const saveNodeData = useCallback((nodeData: NodeMetadata) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeEditForm.nodeId
          ? { ...node, data: { ...node.data, metadata: nodeData } }
          : node,
      ),
    );
    
    setEdges((currentEdges) => {
      const hierarchicalEdges = currentEdges.filter((edge) => !edge.id.includes('dep-'));
      
      const newDependencyEdges: Edge[] = nodeData.dependencies.map((depNodeId) => ({
        id: `dep-${depNodeId}-${nodeEditForm.nodeId}`,
        source: depNodeId,
        target: nodeEditForm.nodeId,
        style: { 
          stroke: '#10b981',
          strokeWidth: 2,
          strokeDasharray: '5,5'
        },
        markerEnd: 'arrowclosed',
      }));
      
      return [...hierarchicalEdges, ...newDependencyEdges];
    });
    
    setNodeEditForm({ 
      isOpen: false, 
      nodeId: '', 
      nodeData: { name: '', startDate: '', endDate: '', dependencies: [] } 
    });

    setTimeout(() => {
      const updatedNodes = nodes.map((node) =>
        node.id === nodeEditForm.nodeId
          ? { ...node, data: { ...node.data, metadata: nodeData } }
          : node,
      );
      if (updatedNodes.length > 0) {
        const forest = convertFlowToForest(updatedNodes, edges);
        const rootNodes = updatedNodes.filter(
          (n) => !edges.some((e) => e.target === n.id && !e.id.includes('dep-'))
        );
        if (rootNodes.length === 1) {
          onTreeChange?.(forest.length > 0 ? forest[0] : null);
        }
      }
    }, 0);
  }, [nodeEditForm.nodeId, nodes, edges, onTreeChange, setNodes, setEdges]);

  const addChildNode = useCallback(
    (parentId: string) => {
      setInputModal({
        isOpen: true,
        title: 'Add Child Node',
        placeholder: 'Enter child node name',
        onConfirm: (childName: string) => {
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

          const forest = convertFlowToForest(updatedNodes, updatedEdges);
          const rootNodes = updatedNodes.filter(
            (n) => !updatedEdges.some((e) => e.target === n.id)
          );
          if (rootNodes.length === 1) {
            onTreeChange?.(forest.length > 0 ? forest[0] : null);
          }

          setInputModal({ isOpen: false, title: '', placeholder: '', onConfirm: () => {} });
        },
      });
    },
    [nodes, edges, onTreeChange, removeNode, editNode, setNodes, setEdges],
  );

  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onAddChild: addChildNode,
          onRemoveNode: removeNode,
          onEditNode: editNode,
        },
      })),
    );
  }, [addChildNode, removeNode, editNode, setNodes]);

  const addRootNode = useCallback(() => {
    setInputModal({
      isOpen: true,
      title: 'Add Root Node',
      placeholder: 'Enter root node name',
      onConfirm: (rootName: string) => {
        const newRootId = `node-${Date.now()}`;
        const rootCount = nodes.filter((n) => !edges.some((e) => e.target === n.id)).length;
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
          },
        };

        setNodes((prev) => [...prev, newRoot]);
        setInputModal({ isOpen: false, title: '', placeholder: '', onConfirm: () => {} });
      },
    });
  }, [addChildNode, removeNode, editNode, edges, nodes, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

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
    const rootIds = nodes
      .filter((node) => !hasParent.has(node.id))
      .map((node) => node.id);

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
        children: childIds.map(childId => buildNodeData(childId)).filter(Boolean),
      };
    }

    const treeData = rootIds.map(rootId => buildNodeData(rootId)).filter(Boolean);
    return treeData.length === 1 ? treeData[0] : treeData;
  }, [nodes, edges]);

  return (
    <div className="h-full w-full flex flex-col border border-slate-800 bg-slate-950">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={addRootNode}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 h-9 px-4 py-2"
          >
            <span className="mr-2">+</span>
            Add Node
          </button>
          
          <button
            type="button"
            onClick={() => {
              const treeData = getTreeData();
              if (onGetTreeData) {
                onGetTreeData(treeData);
              } else {
                console.log('Tree Data:', JSON.stringify(treeData, null, 2));
                alert('Tree data logged to console. Check developer tools.');
              }
            }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
            disabled={nodes.length === 0}
          >
            <span className="mr-2">↓</span>
            Export
          </button>
          
          {nodes.length === 0 && (
            <span className="text-slate-500 text-sm ml-4">
              Start by adding a node
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <NodeEditForm
        isOpen={nodeEditForm.isOpen}
        nodeData={nodeEditForm.nodeData}
        availableNodes={getAvailableNodes(nodeEditForm.nodeId)}
        onSave={saveNodeData}
        onCancel={() => setNodeEditForm({ 
          isOpen: false, 
          nodeId: '', 
          nodeData: { name: '', startDate: '', endDate: '', dependencies: [] } 
        })}
      />

      <ConfirmDialog
        isOpen={showConfirmDialog.isOpen}
        message={showConfirmDialog.message}
        onConfirm={showConfirmDialog.onConfirm}
        onCancel={() => setShowConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} })}
      />

      <InputModal
        isOpen={inputModal.isOpen}
        title={inputModal.title}
        placeholder={inputModal.placeholder}
        onConfirm={inputModal.onConfirm}
        onCancel={() => setInputModal({ isOpen: false, title: '', placeholder: '', onConfirm: () => {} })}
      />
    </div>
  );
} 