import React, { useState, useRef, useEffect } from 'react';
import { InputModalProps } from '../types';

export function InputModal({
  isOpen,
  title,
  placeholder,
  onConfirm,
  onCancel,
}: InputModalProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
      setInputValue('');
    }
  };

  const handleCancel = () => {
    setInputValue('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000]">
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg min-w-[320px] shadow-xl">
        <h3 className="text-lg font-medium text-slate-50 mb-4">{title}</h3>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-900 mb-6"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleConfirm();
            }
          }}
          autoFocus
        />
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-50 text-slate-900 hover:bg-slate-200 h-9 px-4 py-2"
          >
            OK
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 