import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState } from 'reactflow';
import { NodeMetadata } from '../types';
import { convertTreeToFlow } from '../utils/treeUtils';

interface ModalState {
  isOpen: boolean;
  title: string;
  placeholder: string;
  onConfirm: (value: string) => void;
}

interface ConfirmDialogState {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
}

interface NodeEditState {
  isOpen: boolean;
  nodeId: string;
  nodeData: NodeMetadata;
}

export const useChartState = (rawTree: any) => {
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [nodeEditForm, setNodeEditForm] = useState<NodeEditState>({
    isOpen: false,
    nodeId: '',
    nodeData: { name: '', startDate: '', endDate: '', dependencies: [] },
  });
  const [inputModal, setInputModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    placeholder: '',
    onConfirm: () => {},
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
  });

  const { nodes: initialNodes, edges: initialEdges } = convertTreeToFlow(rawTree);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const handleNodeSelect = useCallback((nodeId: string, selected: boolean) => {
    setSelectedNodes((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(nodeId);
      } else {
        newSet.delete(nodeId);
      }
      return newSet;
    });
  }, []);

  const resetModals = useCallback(() => {
    setNodeEditForm({
      isOpen: false,
      nodeId: '',
      nodeData: { name: '', startDate: '', endDate: '', dependencies: [] },
    });
    setInputModal({ isOpen: false, title: '', placeholder: '', onConfirm: () => {} });
    setShowConfirmDialog({ isOpen: false, message: '', onConfirm: () => {} });
  }, []);

  const openInputModal = useCallback((title: string, placeholder: string, onConfirm: (value: string) => void) => {
    setInputModal({ isOpen: true, title, placeholder, onConfirm });
  }, []);

  const openConfirmDialog = useCallback((message: string, onConfirm: () => void) => {
    setShowConfirmDialog({ isOpen: true, message, onConfirm });
  }, []);

  const openNodeEdit = useCallback((nodeId: string, nodeData: NodeMetadata) => {
    setNodeEditForm({ isOpen: true, nodeId, nodeData });
  }, []);

  return {
    // State
    selectedNodes,
    setSelectedNodes,
    nodeEditForm,
    inputModal,
    showConfirmDialog,
    nodes,
    edges,
    
    // State setters
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    
    // Actions
    handleNodeSelect,
    resetModals,
    openInputModal,
    openConfirmDialog,
    openNodeEdit,
  };
}; 