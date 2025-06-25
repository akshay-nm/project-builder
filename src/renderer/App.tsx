import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import { Chart } from './Chart';
import { useAppState } from './hooks/useAppState';
import { useFileOperations } from './hooks/useFileOperations';
import Sidebar from './components/Sidebar';
import UpdateHistory from './components/UpdateHistory';
// Types for labour data
type EngineerType = 'Degree' | 'Diploma';
type SkilledLabourType =
  | 'Mason'
  | 'Carpenter'
  | 'Bar bender'
  | 'Tier'
  | 'Painter'
  | 'Polisher'
  | 'Welder'
  | 'Plumber'
  | 'Glazier';
type UnskilledLabourType =
  | 'Male'
  | 'Bhisty'
  | 'Mazdoor(male)'
  | 'Mazdoor(female)';
type LabourType = EngineerType | SkilledLabourType | UnskilledLabourType;
type LabourData = Record<LabourType, number>;

// Types for stage passing
type Activity = {
  id: string;
  name: string;
  description: string;
  isSelected: boolean;
  isInProgress: boolean;
};

type Asset = {
  id: string;
  name: string;
  type: string;
  activities: Activity[];
};

type StagePassingData = {
  selectedAssetId: string | null;
  assets: Asset[];
};

// Types for material registers
type ReceivedEntry = {
  id: string;
  invoiceBillNo: string;
  date: string;
  supplierName: string;
  supplierEmail: string;
  supplierNo: string;
  quantity: number;
  unit: string;
};

type IssuedEntry = {
  id: string;
  assetName: string;
  date: string;
  quantity: number;
  unit: string;
};

type MaterialRegisterData = {
  materialName: string;
  receivedEntries: ReceivedEntry[];
  issuedEntries: IssuedEntry[];
};

// Material Register Tab Component
function MaterialRegisterTab({
  data,
  onMaterialNameChange,
  onAddReceivedEntry,
  onRemoveReceivedEntry,
  onAddIssuedEntry,
  onRemoveIssuedEntry,
}: {
  data: MaterialRegisterData;
  onMaterialNameChange: (name: string) => void;
  onAddReceivedEntry: (entry: Omit<ReceivedEntry, 'id'>) => void;
  onRemoveReceivedEntry: (id: string) => void;
  onAddIssuedEntry: (entry: Omit<IssuedEntry, 'id'>) => void;
  onRemoveIssuedEntry: (id: string) => void;
}) {
  const [receivedForm, setReceivedForm] = useState({
    invoiceBillNo: '',
    date: new Date().toISOString().split('T')[0],
    supplierName: '',
    supplierEmail: '',
    supplierNo: '',
    quantity: 0,
    unit: '',
  });

  const [issuedForm, setIssuedForm] = useState({
    assetName: '',
    date: new Date().toISOString().split('T')[0],
    quantity: 0,
    unit: '',
  });

  const handleAddReceived = () => {
    if (
      receivedForm.invoiceBillNo &&
      receivedForm.supplierName &&
      receivedForm.quantity > 0
    ) {
      onAddReceivedEntry(receivedForm);
      setReceivedForm({
        invoiceBillNo: '',
        date: new Date().toISOString().split('T')[0],
        supplierName: '',
        supplierEmail: '',
        supplierNo: '',
        quantity: 0,
        unit: '',
      });
    }
  };

  const handleAddIssued = () => {
    if (issuedForm.assetName && issuedForm.quantity > 0) {
      onAddIssuedEntry(issuedForm);
      setIssuedForm({
        assetName: '',
        date: new Date().toISOString().split('T')[0],
        quantity: 0,
        unit: '',
      });
    }
  };

  const totalReceived = data.receivedEntries.reduce(
    (sum, entry) => sum + entry.quantity,
    0,
  );
  const totalIssued = data.issuedEntries.reduce(
    (sum, entry) => sum + entry.quantity,
    0,
  );
  const balance = totalReceived - totalIssued;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-medium text-slate-50">
          📦 Material Registers
        </h4>
        <div className="text-sm text-slate-400">
          Date: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Material Name */}
      <div>
        <label className="block text-slate-300 text-sm font-medium mb-2">
          Material Name
        </label>
        <input
          type="text"
          value={data.materialName}
          onChange={(e) => onMaterialNameChange(e.target.value)}
          placeholder="e.g., Cement, Steel bars, Bricks"
          className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        />
      </div>

      {/* Received Section */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="bg-green-900/20 border-b border-slate-700 px-4 py-3">
          <h5 className="font-medium text-slate-50 flex items-center">
            <span className="mr-2">📥</span>
            Received Materials (Invoice Lines)
          </h5>
        </div>

        {/* Add Received Form */}
        <div className="p-4 border-b border-slate-700 bg-slate-750">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <input
              type="text"
              placeholder="Invoice/Bill No."
              value={receivedForm.invoiceBillNo}
              onChange={(e) =>
                setReceivedForm((prev) => ({
                  ...prev,
                  invoiceBillNo: e.target.value,
                }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="date"
              value={receivedForm.date}
              onChange={(e) =>
                setReceivedForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="text"
              placeholder="Supplier Name"
              value={receivedForm.supplierName}
              onChange={(e) =>
                setReceivedForm((prev) => ({
                  ...prev,
                  supplierName: e.target.value,
                }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="email"
              placeholder="Supplier Email"
              value={receivedForm.supplierEmail}
              onChange={(e) =>
                setReceivedForm((prev) => ({
                  ...prev,
                  supplierEmail: e.target.value,
                }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="text"
              placeholder="Supplier Phone"
              value={receivedForm.supplierNo}
              onChange={(e) =>
                setReceivedForm((prev) => ({
                  ...prev,
                  supplierNo: e.target.value,
                }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={receivedForm.quantity || ''}
              onChange={(e) =>
                setReceivedForm((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <select
              value={receivedForm.unit}
              onChange={(e) =>
                setReceivedForm((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Select Unit</option>
              <option value="pcs">Pieces</option>
              <option value="kg">Kilograms</option>
              <option value="tons">Tons</option>
              <option value="m3">Cubic Meters</option>
              <option value="bags">Bags</option>
              <option value="liters">Liters</option>
            </select>
            <button
              type="button"
              onClick={handleAddReceived}
              className="h-9 bg-green-600 hover:bg-green-700 text-white rounded px-4 text-sm font-medium transition-colors"
            >
              Add Received
            </button>
          </div>
        </div>

        {/* Received Entries List */}
        <div className="max-h-48 overflow-y-auto">
          {data.receivedEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 border-b border-slate-700 hover:bg-slate-750"
            >
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm flex-1">
                  <div>
                    <span className="text-slate-400">Invoice:</span>{' '}
                    {entry.invoiceBillNo}
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span> {entry.date}
                  </div>
                  <div>
                    <span className="text-slate-400">Supplier:</span>{' '}
                    {entry.supplierName}
                  </div>
                  <div>
                    <span className="text-slate-400">Qty:</span>{' '}
                    {entry.quantity} {entry.unit}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveReceivedEntry(entry.id)}
                  className="ml-2 text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {data.receivedEntries.length === 0 && (
            <div className="p-4 text-center text-slate-400 text-sm">
              No received entries yet
            </div>
          )}
        </div>
      </div>

      {/* Issued Section */}
      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <div className="bg-red-900/20 border-b border-slate-700 px-4 py-3">
          <h5 className="font-medium text-slate-50 flex items-center">
            <span className="mr-2">📤</span>
            Issued Materials (Issue Lines)
          </h5>
        </div>

        {/* Add Issued Form */}
        <div className="p-4 border-b border-slate-700 bg-slate-750">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <input
              type="text"
              placeholder="Asset Name"
              value={issuedForm.assetName}
              onChange={(e) =>
                setIssuedForm((prev) => ({
                  ...prev,
                  assetName: e.target.value,
                }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="date"
              value={issuedForm.date}
              onChange={(e) =>
                setIssuedForm((prev) => ({ ...prev, date: e.target.value }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={issuedForm.quantity || ''}
              onChange={(e) =>
                setIssuedForm((prev) => ({
                  ...prev,
                  quantity: parseInt(e.target.value, 10) || 0,
                }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <select
              value={issuedForm.unit}
              onChange={(e) =>
                setIssuedForm((prev) => ({ ...prev, unit: e.target.value }))
              }
              className="h-9 rounded border border-slate-600 bg-slate-900 px-3 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="">Select Unit</option>
              <option value="pcs">Pieces</option>
              <option value="kg">Kilograms</option>
              <option value="tons">Tons</option>
              <option value="m3">Cubic Meters</option>
              <option value="bags">Bags</option>
              <option value="liters">Liters</option>
            </select>
            <button
              type="button"
              onClick={handleAddIssued}
              className="h-9 bg-red-600 hover:bg-red-700 text-white rounded px-4 text-sm font-medium transition-colors"
            >
              Add Issued
            </button>
          </div>
        </div>

        {/* Issued Entries List */}
        <div className="max-h-48 overflow-y-auto">
          {data.issuedEntries.map((entry) => (
            <div
              key={entry.id}
              className="p-3 border-b border-slate-700 hover:bg-slate-750"
            >
              <div className="flex justify-between items-start">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm flex-1">
                  <div>
                    <span className="text-slate-400">Asset:</span>{' '}
                    {entry.assetName}
                  </div>
                  <div>
                    <span className="text-slate-400">Date:</span> {entry.date}
                  </div>
                  <div>
                    <span className="text-slate-400">Qty:</span>{' '}
                    {entry.quantity} {entry.unit}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveIssuedEntry(entry.id)}
                  className="ml-2 text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          {data.issuedEntries.length === 0 && (
            <div className="p-4 text-center text-slate-400 text-sm">
              No issued entries yet
            </div>
          )}
        </div>
      </div>

      {/* Export Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
        <button
          type="button"
          onClick={() => {
            onMaterialNameChange('');
            data.receivedEntries.forEach((entry) =>
              onRemoveReceivedEntry(entry.id),
            );
            data.issuedEntries.forEach((entry) =>
              onRemoveIssuedEntry(entry.id),
            );
          }}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
        >
          🗑️ Clear Materials
        </button>
      </div>
    </div>
  );
}

// Placeholder components for new sections
function Dashboard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('labour');
  const [labourData, setLabourData] = useState<LabourData>({
    // Engineers
    Degree: 0,
    Diploma: 0,
    // Skilled Labour
    Mason: 0,
    Carpenter: 0,
    'Bar bender': 0,
    Tier: 0,
    Painter: 0,
    Polisher: 0,
    Welder: 0,
    Plumber: 0,
    Glazier: 0,
    // Unskilled Labour
    Male: 0,
    Bhisty: 0,
    'Mazdoor(male)': 0,
    'Mazdoor(female)': 0,
  });

  // Mock data for stage passing
  const [stagePassingData, setStagePassingData] = useState<StagePassingData>({
    selectedAssetId: null,
    assets: [
      {
        id: 'foundation',
        name: 'Foundation Work',
        type: 'Structural',
        activities: [
          {
            id: 'exc',
            name: 'Excavation',
            description: 'Site excavation and earthwork',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'footing',
            name: 'Footing Construction',
            description: 'Foundation footing and base',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'backfill',
            name: 'Backfilling',
            description: 'Backfill and compaction',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'waterproof',
            name: 'Waterproofing',
            description: 'Foundation waterproofing',
            isSelected: false,
            isInProgress: false,
          },
        ],
      },
      {
        id: 'structure',
        name: 'Structural Work',
        type: 'Structural',
        activities: [
          {
            id: 'column',
            name: 'Column Construction',
            description: 'RCC column construction',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'beam',
            name: 'Beam Construction',
            description: 'RCC beam construction',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'slab',
            name: 'Slab Construction',
            description: 'RCC slab construction',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'reinforcement',
            name: 'Reinforcement Work',
            description: 'Steel reinforcement placement',
            isSelected: false,
            isInProgress: false,
          },
        ],
      },
      {
        id: 'masonry',
        name: 'Masonry Work',
        type: 'Construction',
        activities: [
          {
            id: 'brickwork',
            name: 'Brickwork',
            description: 'Brick masonry construction',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'blockwork',
            name: 'Block Work',
            description: 'Concrete block masonry',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'pointing',
            name: 'Pointing & Plastering',
            description: 'Wall finishing work',
            isSelected: false,
            isInProgress: false,
          },
        ],
      },
      {
        id: 'electrical',
        name: 'Electrical Work',
        type: 'MEP',
        activities: [
          {
            id: 'conduit',
            name: 'Conduit Installation',
            description: 'Electrical conduit laying',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'wiring',
            name: 'Wiring Work',
            description: 'Electrical wiring installation',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'panel',
            name: 'Panel Installation',
            description: 'Electrical panel setup',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'testing',
            name: 'Testing & Commissioning',
            description: 'Electrical system testing',
            isSelected: false,
            isInProgress: false,
          },
        ],
      },
      {
        id: 'plumbing',
        name: 'Plumbing Work',
        type: 'MEP',
        activities: [
          {
            id: 'piping',
            name: 'Pipe Installation',
            description: 'Water supply and drainage piping',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'fixtures',
            name: 'Fixture Installation',
            description: 'Sanitary fixtures installation',
            isSelected: false,
            isInProgress: false,
          },
          {
            id: 'pressure',
            name: 'Pressure Testing',
            description: 'Plumbing system pressure test',
            isSelected: false,
            isInProgress: false,
          },
        ],
      },
    ],
  });

  // Material registers state
  const [materialRegisterData, setMaterialRegisterData] =
    useState<MaterialRegisterData>({
      materialName: '',
      receivedEntries: [],
      issuedEntries: [],
    });

  // Saved daily updates state
  const [savedUpdates, setSavedUpdates] = useState<
    Array<{
      id: string;
      date: string;
      timestamp: string;
      sections: {
        labour: LabourData;
        stagePassing: {
          selectedAssetId: string | null;
          assets: Asset[];
        };
        inProgress: Asset[];
        completed: Asset[];
        materialRegister: MaterialRegisterData;
      };
    }>
  >([]);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleLabourQuantityChange = (
    labourType: LabourType,
    quantity: number,
  ) => {
    setLabourData((prev) => ({
      ...prev,
      [labourType]: quantity,
    }));
  };

  // Stage passing handlers
  const handleAssetSelection = (assetId: string) => {
    setStagePassingData((prev) => ({
      ...prev,
      selectedAssetId: assetId,
    }));
  };

  const handleActivityToggle = (assetId: string, activityId: string) => {
    setStagePassingData((prev) => ({
      ...prev,
      assets: prev.assets.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              activities: asset.activities.map((activity) =>
                activity.id === activityId
                  ? { ...activity, isSelected: !activity.isSelected }
                  : activity,
              ),
            }
          : asset,
      ),
    }));
  };

  const handleActivityInProgressToggle = (
    assetId: string,
    activityId: string,
  ) => {
    setStagePassingData((prev) => ({
      ...prev,
      assets: prev.assets.map((asset) =>
        asset.id === assetId
          ? {
              ...asset,
              activities: asset.activities.map((activity) =>
                activity.id === activityId
                  ? { ...activity, isInProgress: !activity.isInProgress }
                  : activity,
              ),
            }
          : asset,
      ),
    }));
  };

  // Material register handlers
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleMaterialNameChange = (name: string) => {
    setMaterialRegisterData((prev) => ({
      ...prev,
      materialName: name,
    }));
  };

  const handleAddReceivedEntry = (entry: Omit<ReceivedEntry, 'id'>) => {
    const newEntry: ReceivedEntry = {
      ...entry,
      id: generateId(),
    };
    setMaterialRegisterData((prev) => ({
      ...prev,
      receivedEntries: [...prev.receivedEntries, newEntry],
    }));
  };

  const handleRemoveReceivedEntry = (id: string) => {
    setMaterialRegisterData((prev) => ({
      ...prev,
      receivedEntries: prev.receivedEntries.filter((entry) => entry.id !== id),
    }));
  };

  const handleAddIssuedEntry = (entry: Omit<IssuedEntry, 'id'>) => {
    const newEntry: IssuedEntry = {
      ...entry,
      id: generateId(),
    };
    setMaterialRegisterData((prev) => ({
      ...prev,
      issuedEntries: [...prev.issuedEntries, newEntry],
    }));
  };

  const handleRemoveIssuedEntry = (id: string) => {
    setMaterialRegisterData((prev) => ({
      ...prev,
      issuedEntries: prev.issuedEntries.filter((entry) => entry.id !== id),
    }));
  };

  const handleExportDailyUpdate = () => {
    const currentDate = new Date().toISOString().split('T')[0];
    const updateId = `update-${Date.now()}`;

    // Create completed activities array from stage passing data
    const completedActivities = stagePassingData.assets
      .map((asset) => ({
        ...asset,
        activities: asset.activities.filter(
          (activity) => activity.isSelected && !activity.isInProgress,
        ),
      }))
      .filter((asset) => asset.activities.length > 0);

    // Create in-progress activities array from stage passing data
    const inProgressActivities = stagePassingData.assets
      .map((asset) => ({
        ...asset,
        activities: asset.activities.filter(
          (activity) => activity.isInProgress,
        ),
      }))
      .filter((asset) => asset.activities.length > 0);

    // Combine all sections into a single daily update
    const dailyUpdate = {
      id: updateId,
      date: currentDate,
      timestamp: new Date().toISOString(),
      sections: {
        labour: labourData,
        stagePassing: stagePassingData,
        inProgress: inProgressActivities,
        completed: completedActivities,
        materialRegister: materialRegisterData,
      },
    };

    // Save to local state
    setSavedUpdates((prev) => [...prev, dailyUpdate]);

    // Export as JSON file
    const dataStr = JSON.stringify(dailyUpdate, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-update-${currentDate}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Close dialog and reset forms
    setIsDialogOpen(false);
    // Optionally reset the form data
    // setLabourData({ Degree: 0, Diploma: 0, ... });
    // setMaterialRegisterData({ materialName: '', receivedEntries: [], issuedEntries: [] });
  };

  const labourSections = {
    Engineers: ['Degree', 'Diploma'] as EngineerType[],
    'Skilled Labour': [
      'Mason',
      'Carpenter',
      'Bar bender',
      'Tier',
      'Painter',
      'Polisher',
      'Welder',
      'Plumber',
      'Glazier',
    ] as SkilledLabourType[],
    'Unskilled Labour': [
      'Male',
      'Bhisty',
      'Mazdoor(male)',
      'Mazdoor(female)',
    ] as UnskilledLabourType[],
  };

  const tabs = [
    { id: 'labour', label: 'Labour', icon: '👷' },
    { id: 'stage-passing', label: 'Stage Passing', icon: '📋' },
    { id: 'in-progress', label: 'In-Progress', icon: '🚧' },
    { id: 'completed', label: 'Completed', icon: '✅' },
    { id: 'material-registers', label: 'Material Registers', icon: '📦' },
  ];

  return (
    <div className="h-full bg-slate-950 text-slate-50 p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-emerald-400 mb-4">
            📝 Daily Project Dashboard
          </h2>
          <p className="text-slate-400 mb-6">
            Create daily updates and view project history
          </p>
          <button
            type="button"
            onClick={handleOpenDialog}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-emerald-50 hover:bg-emerald-700 h-12 px-8 py-3 text-lg"
          >
            ➕ Create New Daily Update
          </button>
        </div>

        {/* Update History */}
        <UpdateHistory
          updates={savedUpdates}
          onUpdateSelect={(update) => {
            console.log('Selected update:', update);
            // You can add additional logic here if needed
          }}
        />
      </div>

      {/* Dashboard Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg min-w-[600px] max-w-[800px] shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 pb-0 flex-shrink-0">
              <h3 className="text-xl font-medium text-emerald-400">
                📝 Dashboard Management
              </h3>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Tab Headers */}
            <div className="flex border-b border-slate-700 px-6 mt-4 flex-shrink-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {activeTab === 'labour' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-50">
                        👷 Daily Labour Update
                      </h4>
                      <div className="text-sm text-slate-400">
                        Date: {new Date().toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-slate-800 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-3 gap-px bg-slate-700">
                        <div className="bg-slate-800 px-4 py-3 text-slate-300 font-medium text-sm">
                          Labour Type
                        </div>
                        <div className="bg-slate-800 px-4 py-3 text-slate-300 font-medium text-sm text-center">
                          Quantity
                        </div>
                        <div className="bg-slate-800 px-4 py-3 text-slate-300 font-medium text-sm text-center">
                          Action
                        </div>
                      </div>

                      {Object.entries(labourSections).map(
                        ([sectionName, labourTypes]) => (
                          <div key={sectionName}>
                            {/* Section Header */}
                            <div className="grid grid-cols-3 gap-px bg-slate-600">
                              <div className="bg-slate-700 px-4 py-2 text-emerald-300 font-semibold text-sm">
                                {sectionName === 'Engineers' && '👨‍💼'}{' '}
                                {sectionName === 'Skilled Labour' && '👷‍♂️'}{' '}
                                {sectionName === 'Unskilled Labour' && '👤'}{' '}
                                {sectionName}
                              </div>
                              <div className="bg-slate-700 px-4 py-2" />
                              <div className="bg-slate-700 px-4 py-2" />
                            </div>

                            {/* Section Rows */}
                            {labourTypes.map((labourType) => (
                              <div
                                key={labourType}
                                className="grid grid-cols-3 gap-px bg-slate-700"
                              >
                                <div className="bg-slate-800 px-4 py-3 text-slate-50 text-sm flex items-center">
                                  <span className="mr-2">
                                    {/* Engineers */}
                                    {labourType === 'Degree' && '🎓'}
                                    {labourType === 'Diploma' && '📜'}
                                    {/* Skilled Labour */}
                                    {labourType === 'Mason' && '🧱'}
                                    {labourType === 'Carpenter' && '🔨'}
                                    {labourType === 'Bar bender' && '⚙️'}
                                    {labourType === 'Tier' && '🔗'}
                                    {labourType === 'Painter' && '🎨'}
                                    {labourType === 'Polisher' && '✨'}
                                    {labourType === 'Welder' && '🔥'}
                                    {labourType === 'Plumber' && '🔧'}
                                    {labourType === 'Glazier' && '🪟'}
                                    {/* Unskilled Labour */}
                                    {labourType === 'Male' && '👨'}
                                    {labourType === 'Bhisty' && '🚰'}
                                    {labourType === 'Mazdoor(male)' && '👷'}
                                    {labourType === 'Mazdoor(female)' && '👷‍♀️'}
                                  </span>
                                  {labourType}
                                </div>
                                <div className="bg-slate-800 px-4 py-3 flex justify-center">
                                  <input
                                    type="number"
                                    min="0"
                                    value={labourData[labourType]}
                                    onChange={(e) =>
                                      handleLabourQuantityChange(
                                        labourType,
                                        parseInt(e.target.value, 10) || 0,
                                      )
                                    }
                                    className="w-20 h-8 rounded border border-slate-600 bg-slate-900 px-2 text-sm text-slate-50 text-center focus:outline-none focus:ring-2 focus:ring-emerald-400"
                                  />
                                </div>
                                <div className="bg-slate-800 px-4 py-3 flex justify-center">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleLabourQuantityChange(labourType, 0)
                                    }
                                    className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                                  >
                                    Clear
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ),
                      )}

                      <div className="grid grid-cols-3 gap-px bg-slate-700">
                        <div className="bg-slate-800 px-4 py-3 text-emerald-400 font-medium text-sm">
                          Total Workers
                        </div>
                        <div className="bg-slate-800 px-4 py-3 text-emerald-400 font-medium text-sm text-center">
                          {Object.values(labourData).reduce(
                            (sum, qty) => sum + qty,
                            0,
                          )}
                        </div>
                        <div className="bg-slate-800 px-4 py-3" />
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          const resetData: LabourData = {
                            // Engineers
                            Degree: 0,
                            Diploma: 0,
                            // Skilled Labour
                            Mason: 0,
                            Carpenter: 0,
                            'Bar bender': 0,
                            Tier: 0,
                            Painter: 0,
                            Polisher: 0,
                            Welder: 0,
                            Plumber: 0,
                            Glazier: 0,
                            // Unskilled Labour
                            Male: 0,
                            Bhisty: 0,
                            'Mazdoor(male)': 0,
                            'Mazdoor(female)': 0,
                          };
                          setLabourData(resetData);
                        }}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
                      >
                        🗑️ Clear Labour
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'stage-passing' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-50">
                        📋 Stage Passing Activities
                      </h4>
                      <div className="text-sm text-slate-400">
                        Date: {new Date().toLocaleDateString()}
                      </div>
                    </div>

                    {/* Asset Selection */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-3">
                        Select Asset Category
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {stagePassingData.assets.map((asset) => {
                          const selectedCount = asset.activities.filter(
                            (a) => a.isSelected,
                          ).length;
                          const totalCount = asset.activities.length;

                          return (
                            <button
                              key={asset.id}
                              type="button"
                              onClick={() => handleAssetSelection(asset.id)}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                stagePassingData.selectedAssetId === asset.id
                                  ? 'border-emerald-400 bg-emerald-900/20'
                                  : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-slate-50">
                                  {asset.name}
                                </h5>
                                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                                  {asset.type}
                                </span>
                              </div>
                              <div className="text-sm text-slate-400">
                                {selectedCount}/{totalCount} activities selected
                              </div>
                              {selectedCount > 0 && (
                                <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-emerald-400 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${(selectedCount / totalCount) * 100}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Activities Selection */}
                    {stagePassingData.selectedAssetId && (
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-3">
                          Select Activities for Approval
                        </label>
                        {(() => {
                          const selectedAsset = stagePassingData.assets.find(
                            (asset) =>
                              asset.id === stagePassingData.selectedAssetId,
                          );

                          if (!selectedAsset) return null;

                          return (
                            <div className="bg-slate-800 rounded-lg overflow-hidden">
                              <div className="bg-slate-700 px-4 py-3 border-b border-slate-600">
                                <h5 className="font-medium text-slate-50 flex items-center">
                                  <span className="mr-2">
                                    {selectedAsset.type === 'Structural' &&
                                      '🏗️'}
                                    {selectedAsset.type === 'Construction' &&
                                      '🧱'}
                                    {selectedAsset.type === 'MEP' && '⚡'}
                                  </span>
                                  {selectedAsset.name}
                                </h5>
                              </div>

                              <div className="divide-y divide-slate-700">
                                {selectedAsset.activities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="p-4 hover:bg-slate-750"
                                  >
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={activity.isSelected}
                                        onChange={() =>
                                          handleActivityToggle(
                                            selectedAsset.id,
                                            activity.id,
                                          )
                                        }
                                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-400 focus:ring-emerald-400 focus:ring-offset-slate-900"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium text-slate-50">
                                          {activity.name}
                                        </div>
                                        <div className="text-sm text-slate-400 mt-1">
                                          {activity.description}
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Summary and Export */}
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <h5 className="font-medium text-slate-50 mb-3">
                        Summary
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">
                            Total Selected Activities:
                          </span>
                          <span className="ml-2 text-emerald-400 font-medium">
                            {stagePassingData.assets.reduce(
                              (total, asset) =>
                                total +
                                asset.activities.filter((a) => a.isSelected)
                                  .length,
                              0,
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">
                            Assets with Activities:
                          </span>
                          <span className="ml-2 text-emerald-400 font-medium">
                            {
                              stagePassingData.assets.filter((asset) =>
                                asset.activities.some((a) => a.isSelected),
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setStagePassingData((prev) => ({
                            ...prev,
                            selectedAssetId: null,
                            assets: prev.assets.map((asset) => ({
                              ...asset,
                              activities: asset.activities.map((activity) => ({
                                ...activity,
                                isSelected: false,
                              })),
                            })),
                          }));
                        }}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
                      >
                        🗑️ Clear Activities
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'in-progress' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-50">
                        🚧 In-Progress Activities
                      </h4>
                      <div className="text-sm text-slate-400">
                        Date: {new Date().toLocaleDateString()}
                      </div>
                    </div>

                    {/* Asset Selection */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-3">
                        Select Asset Category
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {stagePassingData.assets.map((asset) => {
                          const inProgressCount = asset.activities.filter(
                            (a) => a.isInProgress,
                          ).length;
                          const totalCount = asset.activities.length;

                          return (
                            <button
                              key={asset.id}
                              type="button"
                              onClick={() => handleAssetSelection(asset.id)}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                stagePassingData.selectedAssetId === asset.id
                                  ? 'border-orange-400 bg-orange-900/20'
                                  : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-slate-50">
                                  {asset.name}
                                </h5>
                                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                                  {asset.type}
                                </span>
                              </div>
                              <div className="text-sm text-slate-400">
                                {inProgressCount}/{totalCount} activities in
                                progress
                              </div>
                              {inProgressCount > 0 && (
                                <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-orange-400 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${(inProgressCount / totalCount) * 100}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Activities Selection */}
                    {stagePassingData.selectedAssetId && (
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-3">
                          Select Activities Currently In Progress
                        </label>
                        {(() => {
                          const selectedAsset = stagePassingData.assets.find(
                            (asset) =>
                              asset.id === stagePassingData.selectedAssetId,
                          );

                          if (!selectedAsset) return null;

                          return (
                            <div className="bg-slate-800 rounded-lg overflow-hidden border border-orange-500/30">
                              <div className="bg-orange-900/20 px-4 py-3 border-b border-slate-600">
                                <h5 className="font-medium text-slate-50 flex items-center">
                                  <span className="mr-2">
                                    {selectedAsset.type === 'Structural' &&
                                      '🏗️'}
                                    {selectedAsset.type === 'Construction' &&
                                      '🧱'}
                                    {selectedAsset.type === 'MEP' && '⚡'}
                                  </span>
                                  {selectedAsset.name}
                                  <span className="ml-2 text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                                    {
                                      selectedAsset.activities.filter(
                                        (a) => a.isInProgress,
                                      ).length
                                    }{' '}
                                    in progress
                                  </span>
                                </h5>
                                <p className="text-sm text-slate-400 mt-1">
                                  Activities that are currently being worked on
                                </p>
                              </div>

                              <div className="divide-y divide-slate-700">
                                {selectedAsset.activities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="p-4 hover:bg-slate-750"
                                  >
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={activity.isInProgress}
                                        onChange={() =>
                                          handleActivityInProgressToggle(
                                            selectedAsset.id,
                                            activity.id,
                                          )
                                        }
                                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-orange-400 focus:ring-orange-400 focus:ring-offset-slate-900"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium text-slate-50 flex items-center">
                                          {activity.name}
                                          {activity.isInProgress && (
                                            <span className="ml-2 text-xs bg-orange-500 text-white px-2 py-0.5 rounded">
                                              In Progress
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-sm text-slate-400 mt-1">
                                          {activity.description}
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Summary and Export */}
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <h5 className="font-medium text-slate-50 mb-3">
                        Summary
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">
                            Total In-Progress Activities:
                          </span>
                          <span className="ml-2 text-orange-400 font-medium">
                            {stagePassingData.assets.reduce(
                              (total, asset) =>
                                total +
                                asset.activities.filter((a) => a.isInProgress)
                                  .length,
                              0,
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">
                            Assets with In-Progress:
                          </span>
                          <span className="ml-2 text-orange-400 font-medium">
                            {
                              stagePassingData.assets.filter((asset) =>
                                asset.activities.some((a) => a.isInProgress),
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setStagePassingData((prev) => ({
                            ...prev,
                            selectedAssetId: null,
                            assets: prev.assets.map((asset) => ({
                              ...asset,
                              activities: asset.activities.map((activity) => ({
                                ...activity,
                                isInProgress: false,
                              })),
                            })),
                          }));
                        }}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
                      >
                        🗑️ Clear In-Progress
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'completed' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-50">
                        ✅ Completed Activities
                      </h4>
                      <div className="text-sm text-slate-400">
                        Date: {new Date().toLocaleDateString()}
                      </div>
                    </div>

                    {/* Asset Selection */}
                    <div>
                      <label className="block text-slate-300 text-sm font-medium mb-3">
                        Select Asset Category
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {stagePassingData.assets.map((asset) => {
                          const completedCount = asset.activities.filter(
                            (a) => a.isSelected,
                          ).length;
                          const totalCount = asset.activities.length;

                          return (
                            <button
                              key={asset.id}
                              type="button"
                              onClick={() => handleAssetSelection(asset.id)}
                              className={`p-4 rounded-lg border-2 text-left transition-all ${
                                stagePassingData.selectedAssetId === asset.id
                                  ? 'border-emerald-400 bg-emerald-900/20'
                                  : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-slate-50">
                                  {asset.name}
                                </h5>
                                <span className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300">
                                  {asset.type}
                                </span>
                              </div>
                              <div className="text-sm text-slate-400">
                                {completedCount}/{totalCount} activities
                                completed
                              </div>
                              {completedCount > 0 && (
                                <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-emerald-400 h-2 rounded-full transition-all"
                                    style={{
                                      width: `${(completedCount / totalCount) * 100}%`,
                                    }}
                                  />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Activities Selection */}
                    {stagePassingData.selectedAssetId && (
                      <div>
                        <label className="block text-slate-300 text-sm font-medium mb-3">
                          Mark Activities as Completed
                        </label>
                        {(() => {
                          const selectedAsset = stagePassingData.assets.find(
                            (asset) =>
                              asset.id === stagePassingData.selectedAssetId,
                          );

                          if (!selectedAsset) return null;

                          return (
                            <div className="bg-slate-800 rounded-lg overflow-hidden border border-emerald-500/30">
                              <div className="bg-emerald-900/20 px-4 py-3 border-b border-slate-600">
                                <h5 className="font-medium text-slate-50 flex items-center">
                                  <span className="mr-2">
                                    {selectedAsset.type === 'Structural' &&
                                      '🏗️'}
                                    {selectedAsset.type === 'Construction' &&
                                      '🧱'}
                                    {selectedAsset.type === 'MEP' && '⚡'}
                                  </span>
                                  {selectedAsset.name}
                                  <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded">
                                    {
                                      selectedAsset.activities.filter(
                                        (a) => a.isSelected,
                                      ).length
                                    }{' '}
                                    completed
                                  </span>
                                </h5>
                                <p className="text-sm text-slate-400 mt-1">
                                  Activities that have been finished and are
                                  ready for review
                                </p>
                              </div>

                              <div className="divide-y divide-slate-700">
                                {selectedAsset.activities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="p-4 hover:bg-slate-750"
                                  >
                                    <label className="flex items-start space-x-3 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={activity.isSelected}
                                        onChange={() =>
                                          handleActivityToggle(
                                            selectedAsset.id,
                                            activity.id,
                                          )
                                        }
                                        className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-400 focus:ring-emerald-400 focus:ring-offset-slate-900"
                                      />
                                      <div className="flex-1">
                                        <div className="font-medium text-slate-50 flex items-center">
                                          {activity.name}
                                          {activity.isSelected && (
                                            <span className="ml-2 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">
                                              Completed
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-sm text-slate-400 mt-1">
                                          {activity.description}
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Summary and Export */}
                    <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                      <h5 className="font-medium text-slate-50 mb-3">
                        Summary
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">
                            Total Completed Activities:
                          </span>
                          <span className="ml-2 text-emerald-400 font-medium">
                            {stagePassingData.assets.reduce(
                              (total, asset) =>
                                total +
                                asset.activities.filter((a) => a.isSelected)
                                  .length,
                              0,
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400">
                            Assets with Completed:
                          </span>
                          <span className="ml-2 text-emerald-400 font-medium">
                            {
                              stagePassingData.assets.filter((asset) =>
                                asset.activities.some((a) => a.isSelected),
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
                      <button
                        type="button"
                        onClick={() => {
                          setStagePassingData((prev) => ({
                            ...prev,
                            selectedAssetId: null,
                            assets: prev.assets.map((asset) => ({
                              ...asset,
                              activities: asset.activities.map((activity) => ({
                                ...activity,
                                isSelected: false,
                              })),
                            })),
                          }));
                        }}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
                      >
                        🗑️ Clear Completed
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'material-registers' && (
                  <MaterialRegisterTab
                    data={materialRegisterData}
                    onMaterialNameChange={handleMaterialNameChange}
                    onAddReceivedEntry={handleAddReceivedEntry}
                    onRemoveReceivedEntry={handleRemoveReceivedEntry}
                    onAddIssuedEntry={handleAddIssuedEntry}
                    onRemoveIssuedEntry={handleRemoveIssuedEntry}
                  />
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end p-6 pt-0 border-t border-slate-700 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  handleExportDailyUpdate();
                  handleCloseDialog();
                }}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-emerald-600 text-emerald-50 hover:bg-emerald-700 h-9 px-4 py-2"
              >
                📄 Save & Export Daily Update
              </button>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CPMDiagram() {
  const {
    currentTree,
    setCurrentTree,
    showDependencies,
    handleClear,
    toggleDependencies,
  } = useAppState();
  const { handleSave, handleExportTreeData } = useFileOperations();

  return (
    <div className="h-full flex flex-col bg-slate-950 text-slate-50">
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

function Hello() {
  const [activeSection, setActiveSection] = useState('cpm-diagram');

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'cpm-diagram':
        return <CPMDiagram />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="h-screen flex bg-slate-950 text-slate-50 overflow-hidden">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <div className="text-2xl font-bold p-6 text-center bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <p className="text-emerald-400 text-3xl">Project Management Suite</p>
        </div>

        <div className="flex-1 min-h-0">{renderActiveSection()}</div>
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
