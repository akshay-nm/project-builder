import React from 'react';
import ReactFlow, { Controls, Background, NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';

import { TreeProps } from './types';
import { CustomNode, NodeEditForm, InputModal, ConfirmDialog } from './components';
import { useDependencyLogic } from './hooks/useDependencyLogic';
import { useChartState } from './hooks/useChartState';
import { useChartOperations } from './hooks/useChartOperations';
import { useChartEffects } from './hooks/useChartEffects';
import { useTreeExport } from './hooks/useTreeExport';

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

export function Chart({ rawTree, onTreeChange, onGetTreeData, showDependencies = false }: TreeProps) {
  const chartState = useChartState(rawTree);
  const { getAvailableNodes } = useDependencyLogic(chartState.nodes, chartState.edges);
  
  const chartOperations = useChartOperations({
    nodes: chartState.nodes,
    edges: chartState.edges,
    setNodes: chartState.setNodes,
    setEdges: chartState.setEdges,
    onTreeChange,
    openInputModal: chartState.openInputModal,
    openConfirmDialog: chartState.openConfirmDialog,
    openNodeEdit: chartState.openNodeEdit,
    resetModals: chartState.resetModals,
    showDependencies,
    handleNodeSelect: chartState.handleNodeSelect,
  });

  const { handleExport } = useTreeExport({
    nodes: chartState.nodes,
    edges: chartState.edges,
    onGetTreeData,
  });

  useChartEffects({
    rawTree,
    showDependencies,
    selectedNodes: chartState.selectedNodes,
    nodes: chartState.nodes,
    edges: chartState.edges,
    setNodes: chartState.setNodes,
    setEdges: chartState.setEdges,
    setSelectedNodes: chartState.setSelectedNodes,
    addChildNode: chartOperations.addChildNode,
    removeNode: chartOperations.removeNode,
    editNode: chartOperations.editNode,
    handleNodeSelect: chartState.handleNodeSelect,
  });

  const handleSaveNodeData = (nodeData: any) => {
    chartOperations.saveNodeData(chartState.nodeEditForm.nodeId, nodeData);
  };

  return (
    <div className="h-full w-full flex flex-col border border-slate-800 bg-slate-950">
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={chartOperations.addRootNode}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-100 h-9 px-4 py-2"
          >
            <span className="mr-2">+</span>
            Add Node
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
            disabled={chartState.nodes.length === 0}
          >
            <span className="mr-2">↓</span>
            Export
          </button>

          {chartState.nodes.length === 0 && (
            <span className="text-slate-500 text-sm ml-4">Start by adding a node</span>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ReactFlow
          nodes={chartState.nodes}
          edges={chartState.edges}
          onNodesChange={chartState.onNodesChange}
          onEdgesChange={chartState.onEdgesChange}
          onConnect={chartOperations.onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background />
        </ReactFlow>
      </div>

      <NodeEditForm
        isOpen={chartState.nodeEditForm.isOpen}
        nodeData={chartState.nodeEditForm.nodeData}
        availableNodes={getAvailableNodes(chartState.nodeEditForm.nodeId)}
        onSave={handleSaveNodeData}
        onCancel={chartState.resetModals}
      />

      <ConfirmDialog
        isOpen={chartState.showConfirmDialog.isOpen}
        message={chartState.showConfirmDialog.message}
        onConfirm={chartState.showConfirmDialog.onConfirm}
        onCancel={chartState.resetModals}
      />

      <InputModal
        isOpen={chartState.inputModal.isOpen}
        title={chartState.inputModal.title}
        placeholder={chartState.inputModal.placeholder}
        onConfirm={chartState.inputModal.onConfirm}
        onCancel={chartState.resetModals}
      />
    </div>
  );
}

export type { NodeMetadata, TreeNode, TreeProps } from './types';
