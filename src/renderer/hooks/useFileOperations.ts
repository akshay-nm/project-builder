import { useCallback } from 'react';
import { TreeNode } from '../types';

export const useFileOperations = () => {
  const downloadFile = useCallback((data: any, filename: string, successMessage: string) => {
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(successMessage);
  }, []);

  const handleSave = useCallback((currentTree: TreeNode | null) => {
    if (!currentTree) {
      alert('No tree data to save!');
      return;
    }

    downloadFile(currentTree, 'tree-data.json', 'Tree data saved as tree-data.json');
  }, [downloadFile]);

  const handleExportTreeData = useCallback((treeData: any) => {
    if (!treeData) {
      alert('No tree data to export!');
      return;
    }

    downloadFile(treeData, 'tree-structure.json', 'Tree structure exported as tree-structure.json');
  }, [downloadFile]);

  return {
    handleSave,
    handleExportTreeData,
  };
}; 