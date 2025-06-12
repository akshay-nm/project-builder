import React, { useState, useEffect } from 'react';
import { NodeEditFormProps, NodeMetadata } from '../types';

export function NodeEditForm({
  isOpen,
  nodeData,
  availableNodes,
  onSave,
  onCancel,
}: NodeEditFormProps) {
  const [formData, setFormData] = useState<NodeMetadata>(nodeData);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    setFormData(nodeData);
  }, [nodeData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSave(formData);
    }
  };

  const handleDependencyToggle = (nodeId: string) => {
    setFormData((prev) => ({
      ...prev,
      dependencies: prev.dependencies.includes(nodeId)
        ? prev.dependencies.filter((id) => id !== nodeId)
        : [...prev.dependencies, nodeId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000]">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg min-w-[400px] max-w-[500px] shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-slate-50 mb-6">Edit Node</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="node-name"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Name *
            </label>
            <input
              id="node-name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              placeholder="Enter node name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="start-date"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            />
          </div>

          <div>
            <label
              htmlFor="end-date"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dependencies
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Root nodes can select any node. Other nodes cannot select
              ancestors or descendants.
            </p>

            {/* Custom Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <span>
                  {formData.dependencies.length === 0
                    ? 'Select dependencies...'
                    : `${formData.dependencies.length} selected`}
                </span>
                <span
                  className={`transform transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                >
                  ▼
                </span>
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-30 overflow-y-auto rounded-md border border-slate-700 bg-slate-800 shadow-lg">
                  {availableNodes.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-slate-400">
                      No eligible nodes available
                    </div>
                  ) : (
                    availableNodes.map((node) => (
                      <label
                        key={node.id}
                        className="flex items-center px-3 py-2 hover:bg-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.dependencies.includes(node.id)}
                          onChange={() => handleDependencyToggle(node.id)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-red-600 focus:ring-red-500 focus:ring-offset-slate-900 mr-3"
                        />
                        <span className="text-slate-300 text-sm">
                          {node.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Dependencies Display */}
            {formData.dependencies.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-emerald-400 mb-1">
                  Selected dependencies:
                </p>
                <div className="flex flex-wrap gap-1">
                  {formData.dependencies.map((depId) => {
                    const depNode = availableNodes.find((n) => n.id === depId);
                    return depNode ? (
                      <span
                        key={depId}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-red-900/30 text-red-300 border border-red-700"
                      >
                        {depNode.name}
                        <button
                          type="button"
                          onClick={() => handleDependencyToggle(depId)}
                          className="ml-1 hover:text-red-100"
                        >
                          ×
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-6">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-50 text-slate-900 hover:bg-slate-200 h-9 px-4 py-2"
            >
              Save
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
