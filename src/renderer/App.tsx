import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Chart } from './Chart';
import { useAppState } from './hooks/useAppState';
import { useFileOperations } from './hooks/useFileOperations';

function Hello() {
  const { currentTree, setCurrentTree, showDependencies, handleClear, toggleDependencies } = useAppState();
  const { handleSave, handleExportTreeData } = useFileOperations();

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-50 overflow-hidden">
      <div className="text-2xl font-bold p-6 text-center bg-slate-900 border-b border-slate-800 flex-shrink-0">
        <p className="text-emerald-400 text-3xl">CPM - Critical Path Method</p>
      </div>
      
      <div className="p-4 flex gap-3 border-b border-slate-800 bg-slate-900/50 flex-shrink-0">
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
          title="Remove all nodes from the chart"
        >
          Clear All
        </button>
        
        <button
          type="button"
          onClick={() => handleSave(currentTree)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white"
          title="Save basic tree structure as tree-data.json"
          disabled={!currentTree}
        >
          Save Tree
        </button>

        <button
          type="button"
          onClick={toggleDependencies}
          className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 border-2 ${
            showDependencies
              ? 'bg-red-600 border-red-500 text-white hover:bg-red-700'
              : 'border-red-600 text-red-400 hover:bg-red-900/20'
          }`}
          title="Toggle dependency visualization mode"
        >
          🔗 {showDependencies ? 'Hide Dependencies' : 'Show Dependencies'}
        </button>

        <div className="flex items-center text-slate-400 text-sm ml-4">
          <span>💾 Tree backup</span>
          <span className="mx-2">•</span>
          <span>📊 Structured export available in chart area</span>
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <Chart
          rawTree={currentTree}
          onTreeChange={setCurrentTree}
          onGetTreeData={handleExportTreeData}
          showDependencies={showDependencies}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Hello />} />
      </Routes>
    </Router>
  );
}
