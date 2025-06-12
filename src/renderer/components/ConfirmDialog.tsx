import React from 'react';
import { ConfirmDialogProps } from '../types';

export function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000]">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg min-w-[320px] shadow-xl">
        <h3 className="text-lg font-medium text-slate-50 mb-3">Confirm Action</h3>
        <p className="text-slate-400 text-sm mb-6">{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 text-red-50 hover:bg-red-700 h-9 px-4 py-2"
          >
            Remove
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 