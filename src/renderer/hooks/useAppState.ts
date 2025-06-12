import { useState, useCallback } from 'react';
import { TreeNode } from '../types';

export const useAppState = () => {
  const [currentTree, setCurrentTree] = useState<TreeNode | null>(null);
  const [showDependencies, setShowDependencies] = useState(false);

  const handleClear = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all nodes?')) {
      setCurrentTree(null);
    }
  }, []);

  const toggleDependencies = useCallback(() => {
    setShowDependencies((prev) => !prev);
  }, []);

  return {
    currentTree,
    setCurrentTree,
    showDependencies,
    handleClear,
    toggleDependencies,
  };
}; 