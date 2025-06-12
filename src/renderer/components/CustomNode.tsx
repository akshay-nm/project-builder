import React from 'react';
import { Handle, Position } from 'reactflow';
import { CustomNodeData } from '../types';

interface CustomNodeProps {
  data: CustomNodeData;
  id: string;
}

export function CustomNode({ data, id }: CustomNodeProps) {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    data.onNodeSelect?.(id, e.target.checked);
  };

  return (
    <div className={`bg-slate-800 border rounded-lg p-4 min-w-[160px] shadow-sm hover:shadow-md transition-all ${
      data.showDependencyMode && data.isSelected 
        ? 'border-red-400 bg-red-900/20' 
        : 'border-slate-700'
    }`}>
      <Handle type="target" position={Position.Top} />
      
      {/* Checkbox for dependency mode */}
      {data.showDependencyMode && (
        <div className="absolute -top-2 -right-2 z-10">
          <input
            type="checkbox"
            checked={data.isSelected || false}
            onChange={handleCheckboxChange}
            className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500 focus:ring-offset-slate-900"
            title="Select node to show dependencies"
          />
        </div>
      )}
      
      <div className="text-center">
        <div className="font-medium mb-3 text-slate-50 text-sm">
          {data.metadata.name}
        </div>
        
        <div className="text-xs text-slate-400 mb-4 space-y-1">
          {data.metadata.startDate && (
            <div className="flex items-center justify-center gap-1">
              <span className="text-slate-500">→</span>
              <span>{data.metadata.startDate}</span>
            </div>
          )}
          {data.metadata.endDate && (
            <div className="flex items-center justify-center gap-1">
              <span className="text-slate-500">→</span>
              <span>{data.metadata.endDate}</span>
            </div>
          )}
          {data.metadata.dependencies.length > 0 && (
            <div className="text-slate-500 text-xs">
              {data.metadata.dependencies.length} deps
            </div>
          )}
        </div>

        <div className="flex gap-1 justify-center">
          <button
            type="button"
            onClick={() => data.onAddChild(id)}
            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 hover:text-slate-50 h-6 w-6"
            title="Add Child"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => data.onEditNode(id)}
            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 hover:text-slate-50 h-6 w-6"
            title="Edit Node"
          >
            ⋯
          </button>
          <button
            type="button"
            onClick={() => data.onRemoveNode(id)}
            className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-red-900/50 text-slate-400 hover:text-red-400 h-6 w-6"
            title="Delete Node"
          >
            ×
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
} 