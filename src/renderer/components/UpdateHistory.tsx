import { useState, useEffect } from 'react';

// Types matching the main application structure
type LabourData = {
  Degree: number;
  Diploma: number;
  Mason: number;
  Carpenter: number;
  'Bar bender': number;
  Tier: number;
  Painter: number;
  Polisher: number;
  Welder: number;
  Plumber: number;
  Glazier: number;
  Male: number;
  Bhisty: number;
  'Mazdoor(male)': number;
  'Mazdoor(female)': number;
};

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

type DailyUpdate = {
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
};

interface UpdateHistoryProps {
  updates: DailyUpdate[];
  onUpdateSelect: (update: DailyUpdate) => void;
}

function UpdateHistory({
  updates = [],
  onUpdateSelect = () => {},
}: UpdateHistoryProps) {
  const [filteredUpdates, setFilteredUpdates] = useState<DailyUpdate[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<DailyUpdate | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'activities' | 'labour'>(
    'date',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [activeDetailTab, setActiveDetailTab] = useState('labour');

  // Enhanced mock data for demonstration
  const mockUpdates: DailyUpdate[] = [
    {
      id: '1',
      date: '2024-01-15',
      timestamp: '2024-01-15T10:30:00.000Z',
      sections: {
        labour: {
          Degree: 2,
          Diploma: 3,
          Mason: 5,
          Carpenter: 4,
          'Bar bender': 3,
          Tier: 2,
          Painter: 2,
          Polisher: 1,
          Welder: 2,
          Plumber: 3,
          Glazier: 1,
          Male: 8,
          Bhisty: 2,
          'Mazdoor(male)': 12,
          'Mazdoor(female)': 6,
        },
        stagePassing: {
          selectedAssetId: 'foundation',
          assets: [
            {
              id: 'foundation',
              name: 'Foundation Work',
              type: 'Structural',
              activities: [
                {
                  id: 'exc',
                  name: 'Excavation',
                  description: 'Site excavation completed',
                  isSelected: true,
                  isInProgress: false,
                },
                {
                  id: 'footing',
                  name: 'Footing Construction',
                  description: 'Foundation footing in progress',
                  isSelected: true,
                  isInProgress: true,
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
              id: 'structural',
              name: 'Structural Work',
              type: 'Structural',
              activities: [
                {
                  id: 'column',
                  name: 'Column Construction',
                  description: 'RCC column construction',
                  isSelected: false,
                  isInProgress: true,
                },
                {
                  id: 'beam',
                  name: 'Beam Construction',
                  description: 'RCC beam construction',
                  isSelected: false,
                  isInProgress: false,
                },
              ],
            },
          ],
        },
        inProgress: [
          {
            id: 'structural',
            name: 'Structural Work',
            type: 'Structural',
            activities: [
              {
                id: 'column',
                name: 'Column Construction',
                description: 'RCC column construction',
                isSelected: false,
                isInProgress: true,
              },
            ],
          },
        ],
        completed: [
          {
            id: 'foundation',
            name: 'Foundation Work',
            type: 'Structural',
            activities: [
              {
                id: 'exc',
                name: 'Excavation',
                description: 'Site excavation completed',
                isSelected: true,
                isInProgress: false,
              },
            ],
          },
        ],
        materialRegister: {
          materialName: 'Cement',
          receivedEntries: [
            {
              id: '1',
              invoiceBillNo: 'INV-2024-001',
              date: '2024-01-15',
              supplierName: 'ABC Materials Ltd.',
              supplierEmail: 'orders@abcmaterials.com',
              supplierNo: '+91-9876543210',
              quantity: 100,
              unit: 'bags',
            },
          ],
          issuedEntries: [
            {
              id: '1',
              assetName: 'Foundation Work',
              date: '2024-01-15',
              quantity: 25,
              unit: 'bags',
            },
          ],
        },
      },
    },
    {
      id: '2',
      date: '2024-01-16',
      timestamp: '2024-01-16T09:15:00.000Z',
      sections: {
        labour: {
          Degree: 3,
          Diploma: 2,
          Mason: 6,
          Carpenter: 5,
          'Bar bender': 4,
          Tier: 3,
          Painter: 1,
          Polisher: 2,
          Welder: 3,
          Plumber: 2,
          Glazier: 2,
          Male: 10,
          Bhisty: 3,
          'Mazdoor(male)': 15,
          'Mazdoor(female)': 8,
        },
        stagePassing: {
          selectedAssetId: 'structural',
          assets: [
            {
              id: 'foundation',
              name: 'Foundation Work',
              type: 'Structural',
              activities: [
                {
                  id: 'exc',
                  name: 'Excavation',
                  description: 'Site excavation completed',
                  isSelected: true,
                  isInProgress: false,
                },
                {
                  id: 'footing',
                  name: 'Footing Construction',
                  description: 'Foundation footing completed',
                  isSelected: true,
                  isInProgress: false,
                },
                {
                  id: 'waterproof',
                  name: 'Waterproofing',
                  description: 'Foundation waterproofing completed',
                  isSelected: true,
                  isInProgress: false,
                },
              ],
            },
            {
              id: 'structural',
              name: 'Structural Work',
              type: 'Structural',
              activities: [
                {
                  id: 'column',
                  name: 'Column Construction',
                  description: 'RCC column construction in progress',
                  isSelected: true,
                  isInProgress: true,
                },
                {
                  id: 'beam',
                  name: 'Beam Construction',
                  description: 'RCC beam construction',
                  isSelected: false,
                  isInProgress: false,
                },
              ],
            },
          ],
        },
        inProgress: [
          {
            id: 'structural',
            name: 'Structural Work',
            type: 'Structural',
            activities: [
              {
                id: 'column',
                name: 'Column Construction',
                description: 'RCC column construction',
                isSelected: true,
                isInProgress: true,
              },
            ],
          },
        ],
        completed: [
          {
            id: 'foundation',
            name: 'Foundation Work',
            type: 'Structural',
            activities: [
              {
                id: 'exc',
                name: 'Excavation',
                description: 'Site excavation completed',
                isSelected: true,
                isInProgress: false,
              },
              {
                id: 'footing',
                name: 'Footing Construction',
                description: 'Foundation footing completed',
                isSelected: true,
                isInProgress: false,
              },
              {
                id: 'waterproof',
                name: 'Waterproofing',
                description: 'Foundation waterproofing completed',
                isSelected: true,
                isInProgress: false,
              },
            ],
          },
        ],
        materialRegister: {
          materialName: 'Steel Bars',
          receivedEntries: [
            {
              id: '2',
              invoiceBillNo: 'INV-2024-002',
              date: '2024-01-16',
              supplierName: 'Steel Industries Corp',
              supplierEmail: 'sales@steelindustries.com',
              supplierNo: '+91-9988776655',
              quantity: 50,
              unit: 'tons',
            },
          ],
          issuedEntries: [
            {
              id: '2',
              assetName: 'Structural Work',
              date: '2024-01-16',
              quantity: 12,
              unit: 'tons',
            },
          ],
        },
      },
    },
  ];

  // Use provided updates or fall back to mock data
  const allUpdates = updates.length > 0 ? updates : mockUpdates;

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...allUpdates];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (update) =>
          update.sections.materialRegister.materialName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          update.date.includes(searchTerm) ||
          update.sections.stagePassing.assets.some(
            (asset) =>
              asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              asset.activities.some((activity) =>
                activity.name.toLowerCase().includes(searchTerm.toLowerCase()),
              ),
          ),
      );
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter((update) => update.date >= dateFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date': {
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        }
        case 'activities': {
          const aActivities = a.sections.completed.reduce(
            (sum, asset) => sum + asset.activities.length,
            0,
          );
          const bActivities = b.sections.completed.reduce(
            (sum, asset) => sum + asset.activities.length,
            0,
          );
          comparison = aActivities - bActivities;
          break;
        }
        case 'labour': {
          const aLabour = Object.values(a.sections.labour).reduce(
            (sum, count) => sum + count,
            0,
          );
          const bLabour = Object.values(b.sections.labour).reduce(
            (sum, count) => sum + count,
            0,
          );
          comparison = aLabour - bLabour;
          break;
        }
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredUpdates(filtered);
  }, [allUpdates, searchTerm, dateFilter, sortBy, sortOrder]);

  const handleViewDetails = (update: DailyUpdate) => {
    setSelectedUpdate(update);
    setIsDetailModalOpen(true);
    onUpdateSelect?.(update);
  };

  const handleExportUpdate = (update: DailyUpdate) => {
    const dataStr = JSON.stringify(update, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `daily-update-${update.date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const dataStr = JSON.stringify(filteredUpdates, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `all-updates-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getLabourSummary = (labour: LabourData) => {
    const engineers = labour.Degree + labour.Diploma;
    const skilled =
      labour.Mason +
      labour.Carpenter +
      labour['Bar bender'] +
      labour.Tier +
      labour.Painter +
      labour.Polisher +
      labour.Welder +
      labour.Plumber +
      labour.Glazier;
    const unskilled =
      labour.Male +
      labour.Bhisty +
      labour['Mazdoor(male)'] +
      labour['Mazdoor(female)'];
    return {
      engineers,
      skilled,
      unskilled,
      total: engineers + skilled + unskilled,
    };
  };

  const getActivityCounts = (assets: Asset[]) => {
    const completed = assets.reduce(
      (sum, asset) =>
        sum +
        asset.activities.filter(
          (activity) => activity.isSelected && !activity.isInProgress,
        ).length,
      0,
    );
    const inProgress = assets.reduce(
      (sum, asset) =>
        sum +
        asset.activities.filter((activity) => activity.isInProgress).length,
      0,
    );
    return { completed, inProgress, total: completed + inProgress };
  };

  const getActivityStatusClass = (activity: Activity) => {
    if (activity.isSelected && !activity.isInProgress) {
      return 'bg-emerald-500';
    }
    if (activity.isInProgress) {
      return 'bg-orange-500';
    }
    return 'bg-slate-500';
  };

  const getActivityStatusText = (activity: Activity) => {
    if (activity.isSelected && !activity.isInProgress) {
      return 'Completed';
    }
    if (activity.isInProgress) {
      return 'In Progress';
    }
    return 'Pending';
  };

  const tabs = [
    { id: 'labour', label: 'Labour', icon: '👷' },
    { id: 'stage-passing', label: 'Stage Passing', icon: '📋' },
    { id: 'in-progress', label: 'In-Progress', icon: '🚧' },
    { id: 'completed', label: 'Completed', icon: '✅' },
    { id: 'material-registers', label: 'Material Registers', icon: '📦' },
  ];

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-emerald-400">
          📋 Update History
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-400">
            {filteredUpdates.length} updates found
          </span>
          {filteredUpdates.length > 0 && (
            <button
              type="button"
              onClick={handleExportAll}
              className="px-3 py-1 text-xs font-medium text-blue-300 bg-blue-900/30 border border-blue-700 rounded hover:bg-blue-900/50"
            >
              📄 Export All
            </button>
          )}
        </div>
      </div>

      {/* Enhanced Filters and Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search by material, asset, activity, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value as 'date' | 'activities' | 'labour')
          }
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="date">Sort by Date</option>
          <option value="activities">Sort by Activities</option>
          <option value="labour">Sort by Labour Count</option>
        </select>
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-50 hover:bg-slate-700"
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            setDateFilter('');
            setSortBy('date');
            setSortOrder('desc');
          }}
          className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-md hover:bg-slate-700"
        >
          Clear
        </button>
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg mb-2">No updates found</p>
            <p className="text-sm">
              Try adjusting your search criteria or date filter
            </p>
          </div>
        ) : (
          filteredUpdates.map((update) => {
            const labourSummary = getLabourSummary(update.sections.labour);
            const activityCounts = getActivityCounts(
              update.sections.stagePassing.assets,
            );
            const materialBalance =
              update.sections.materialRegister.receivedEntries.reduce(
                (sum, entry) => sum + entry.quantity,
                0,
              ) -
              update.sections.materialRegister.issuedEntries.reduce(
                (sum, entry) => sum + entry.quantity,
                0,
              );

            return (
              <div
                key={update.id}
                className="bg-slate-800 rounded-lg border border-slate-600 p-4 hover:border-emerald-500/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-lg font-semibold text-slate-50">
                      {formatDate(update.date)}
                    </div>
                    <div className="text-sm text-slate-400">
                      {formatTime(update.timestamp)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(update)}
                      className="px-3 py-1 text-xs font-medium text-emerald-300 bg-emerald-900/30 border border-emerald-700 rounded hover:bg-emerald-900/50 transition-colors"
                    >
                      👁️ View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handleExportUpdate(update)}
                      className="px-3 py-1 text-xs font-medium text-blue-300 bg-blue-900/30 border border-blue-700 rounded hover:bg-blue-900/50 transition-colors"
                    >
                      📄 Export
                    </button>
                  </div>
                </div>

                {/* Enhanced Summary Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div className="bg-slate-700/50 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400">👷 Labour</span>
                      <span className="text-emerald-400 font-medium">
                        {labourSummary.total}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      E:{labourSummary.engineers} S:{labourSummary.skilled} U:
                      {labourSummary.unskilled}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400">📋 Activities</span>
                      <span className="text-emerald-400 font-medium">
                        {activityCounts.total}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Done:{activityCounts.completed} Progress:
                      {activityCounts.inProgress}
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400">🚧 In Progress</span>
                      <span className="text-orange-400 font-medium">
                        {update.sections.inProgress.reduce(
                          (sum, asset) => sum + asset.activities.length,
                          0,
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {update.sections.inProgress.length} assets
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400">✅ Completed</span>
                      <span className="text-emerald-400 font-medium">
                        {update.sections.completed.reduce(
                          (sum, asset) => sum + asset.activities.length,
                          0,
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {update.sections.completed.length} assets
                    </div>
                  </div>
                  <div className="bg-slate-700/50 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-400">📦 Material</span>
                      <span className="text-emerald-400 font-medium">
                        {update.sections.materialRegister.materialName || 'N/A'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Balance: {materialBalance}{' '}
                      {update.sections.materialRegister.receivedEntries[0]
                        ?.unit || ''}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Enhanced Detail Modal */}
      {isDetailModalOpen && selectedUpdate && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg min-w-[700px] max-w-[1000px] max-h-[90vh] shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-6 pb-0 flex-shrink-0">
              <h3 className="text-xl font-medium text-emerald-400">
                📋 Daily Update - {formatDate(selectedUpdate.date)}
              </h3>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded hover:bg-slate-800"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            {/* Tab Headers */}
            <div className="flex border-b border-slate-700 px-6 mt-4 flex-shrink-0 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeDetailTab === tab.id
                      ? 'border-emerald-400 text-emerald-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Labour Tab */}
                {activeDetailTab === 'labour' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-50">
                        👷 Daily Labour Summary
                      </h4>
                      <div className="text-sm text-slate-400">
                        Total:{' '}
                        {Object.values(selectedUpdate.sections.labour).reduce(
                          (sum, count) => sum + count,
                          0,
                        )}{' '}
                        workers
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Engineers */}
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h5 className="font-medium text-emerald-400 mb-3 flex items-center">
                          <span className="mr-2">🎓</span>
                          Engineers (
                          {selectedUpdate.sections.labour.Degree +
                            selectedUpdate.sections.labour.Diploma}
                          )
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-300">Degree:</span>
                            <span className="text-slate-100">
                              {selectedUpdate.sections.labour.Degree}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Diploma:</span>
                            <span className="text-slate-100">
                              {selectedUpdate.sections.labour.Diploma}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Skilled Labour */}
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h5 className="font-medium text-blue-400 mb-3 flex items-center">
                          <span className="mr-2">🔧</span>
                          Skilled Labour (
                          {selectedUpdate.sections.labour.Mason +
                            selectedUpdate.sections.labour.Carpenter +
                            selectedUpdate.sections.labour['Bar bender'] +
                            selectedUpdate.sections.labour.Tier +
                            selectedUpdate.sections.labour.Painter +
                            selectedUpdate.sections.labour.Polisher +
                            selectedUpdate.sections.labour.Welder +
                            selectedUpdate.sections.labour.Plumber +
                            selectedUpdate.sections.labour.Glazier}
                          )
                        </h5>
                        <div className="space-y-2 text-sm">
                          {(
                            [
                              'Mason',
                              'Carpenter',
                              'Bar bender',
                              'Tier',
                              'Painter',
                              'Polisher',
                              'Welder',
                              'Plumber',
                              'Glazier',
                            ] as const
                          ).map((type) => (
                            <div key={type} className="flex justify-between">
                              <span className="text-slate-300">{type}:</span>
                              <span className="text-slate-100">
                                {selectedUpdate.sections.labour[type]}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Unskilled Labour */}
                      <div className="bg-slate-800 rounded-lg p-4">
                        <h5 className="font-medium text-orange-400 mb-3 flex items-center">
                          <span className="mr-2">👷‍♂️</span>
                          Unskilled Labour (
                          {selectedUpdate.sections.labour.Male +
                            selectedUpdate.sections.labour.Bhisty +
                            selectedUpdate.sections.labour['Mazdoor(male)'] +
                            selectedUpdate.sections.labour['Mazdoor(female)']}
                          )
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-300">Male:</span>
                            <span className="text-slate-100">
                              {selectedUpdate.sections.labour.Male}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">Bhisty:</span>
                            <span className="text-slate-100">
                              {selectedUpdate.sections.labour.Bhisty}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">
                              Mazdoor (Male):
                            </span>
                            <span className="text-slate-100">
                              {selectedUpdate.sections.labour['Mazdoor(male)']}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-300">
                              Mazdoor (Female):
                            </span>
                            <span className="text-slate-100">
                              {
                                selectedUpdate.sections.labour[
                                  'Mazdoor(female)'
                                ]
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage Passing Tab */}
                {activeDetailTab === 'stage-passing' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-50">
                        📋 Stage Passing Activities
                      </h4>
                      <div className="text-sm text-slate-400">
                        {selectedUpdate.sections.stagePassing.selectedAssetId &&
                          `Selected: ${selectedUpdate.sections.stagePassing.assets.find((a) => a.id === selectedUpdate.sections.stagePassing.selectedAssetId)?.name}`}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedUpdate.sections.stagePassing.assets.map(
                        (asset) => (
                          <div
                            key={asset.id}
                            className="bg-slate-800 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="font-medium text-emerald-400">
                                {asset.name} ({asset.type})
                              </h5>
                              <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">
                                {
                                  asset.activities.filter((a) => a.isSelected)
                                    .length
                                }
                                /{asset.activities.length} selected
                              </span>
                            </div>
                            <div className="space-y-2">
                              {asset.activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="flex items-center justify-between p-2 bg-slate-700/50 rounded"
                                >
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <span
                                        className={`w-3 h-3 rounded-full ${getActivityStatusClass(activity)}`}
                                      />
                                      <span className="text-slate-200 font-medium">
                                        {activity.name}
                                      </span>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-1 ml-5">
                                      {activity.description}
                                    </p>
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {getActivityStatusText(activity)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* In-Progress Tab */}
                {activeDetailTab === 'in-progress' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-50">
                        🚧 In-Progress Activities
                      </h4>
                      <div className="text-sm text-slate-400">
                        {selectedUpdate.sections.inProgress.reduce(
                          (sum, asset) => sum + asset.activities.length,
                          0,
                        )}{' '}
                        activities in progress
                      </div>
                    </div>

                    {selectedUpdate.sections.inProgress.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <div className="text-3xl mb-2">🚧</div>
                        <p>No activities in progress</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedUpdate.sections.inProgress.map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-slate-800 rounded-lg p-4"
                          >
                            <h5 className="font-medium text-orange-400 mb-3">
                              {asset.name} ({asset.type})
                            </h5>
                            <div className="space-y-2">
                              {asset.activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="flex items-center space-x-3 p-2 bg-orange-900/20 rounded border border-orange-700/50"
                                >
                                  <span className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                                  <div className="flex-1">
                                    <div className="text-slate-200 font-medium">
                                      {activity.name}
                                    </div>
                                    <p className="text-slate-400 text-sm">
                                      {activity.description}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Completed Tab */}
                {activeDetailTab === 'completed' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-50">
                        ✅ Completed Activities
                      </h4>
                      <div className="text-sm text-slate-400">
                        {selectedUpdate.sections.completed.reduce(
                          (sum, asset) => sum + asset.activities.length,
                          0,
                        )}{' '}
                        activities completed
                      </div>
                    </div>

                    {selectedUpdate.sections.completed.length === 0 ? (
                      <div className="text-center py-8 text-slate-400">
                        <div className="text-3xl mb-2">✅</div>
                        <p>No activities completed</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedUpdate.sections.completed.map((asset) => (
                          <div
                            key={asset.id}
                            className="bg-slate-800 rounded-lg p-4"
                          >
                            <h5 className="font-medium text-emerald-400 mb-3">
                              {asset.name} ({asset.type})
                            </h5>
                            <div className="space-y-2">
                              {asset.activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="flex items-center space-x-3 p-2 bg-emerald-900/20 rounded border border-emerald-700/50"
                                >
                                  <span className="w-3 h-3 bg-emerald-500 rounded-full" />
                                  <div className="flex-1">
                                    <div className="text-slate-200 font-medium">
                                      {activity.name}
                                    </div>
                                    <p className="text-slate-400 text-sm">
                                      {activity.description}
                                    </p>
                                  </div>
                                  <span className="text-emerald-400 text-xs">
                                    ✓ Done
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Material Registers Tab */}
                {activeDetailTab === 'material-registers' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-slate-50">
                        📦 Material Registers
                      </h4>
                      <div className="text-sm text-slate-400">
                        Material:{' '}
                        {selectedUpdate.sections.materialRegister
                          .materialName || 'Not specified'}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Received Materials */}
                      <div className="bg-slate-800 rounded-lg overflow-hidden">
                        <div className="bg-green-900/20 border-b border-slate-700 px-4 py-3">
                          <h5 className="font-medium text-slate-50 flex items-center">
                            <span className="mr-2">📥</span>
                            Received Materials (
                            {
                              selectedUpdate.sections.materialRegister
                                .receivedEntries.length
                            }
                            )
                          </h5>
                        </div>
                        <div className="p-4">
                          {selectedUpdate.sections.materialRegister
                            .receivedEntries.length === 0 ? (
                            <p className="text-slate-400 text-center py-4">
                              No materials received
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {selectedUpdate.sections.materialRegister.receivedEntries.map(
                                (entry) => (
                                  <div
                                    key={entry.id}
                                    className="bg-slate-700/50 rounded p-3"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <div className="font-medium text-slate-200">
                                          Invoice: {entry.invoiceBillNo}
                                        </div>
                                        <div className="text-sm text-slate-400">
                                          {new Date(
                                            entry.date,
                                          ).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium text-emerald-400">
                                          {entry.quantity} {entry.unit}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-sm text-slate-300">
                                      <div>Supplier: {entry.supplierName}</div>
                                      <div>Email: {entry.supplierEmail}</div>
                                      <div>Phone: {entry.supplierNo}</div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Issued Materials */}
                      <div className="bg-slate-800 rounded-lg overflow-hidden">
                        <div className="bg-red-900/20 border-b border-slate-700 px-4 py-3">
                          <h5 className="font-medium text-slate-50 flex items-center">
                            <span className="mr-2">📤</span>
                            Issued Materials (
                            {
                              selectedUpdate.sections.materialRegister
                                .issuedEntries.length
                            }
                            )
                          </h5>
                        </div>
                        <div className="p-4">
                          {selectedUpdate.sections.materialRegister
                            .issuedEntries.length === 0 ? (
                            <p className="text-slate-400 text-center py-4">
                              No materials issued
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {selectedUpdate.sections.materialRegister.issuedEntries.map(
                                (entry) => (
                                  <div
                                    key={entry.id}
                                    className="bg-slate-700/50 rounded p-3"
                                  >
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <div className="font-medium text-slate-200">
                                          {entry.assetName}
                                        </div>
                                        <div className="text-sm text-slate-400">
                                          {new Date(
                                            entry.date,
                                          ).toLocaleDateString()}
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium text-red-400">
                                          {entry.quantity} {entry.unit}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Material Balance Summary */}
                    <div className="bg-slate-800 rounded-lg p-4">
                      <h5 className="font-medium text-slate-50 mb-3">
                        📊 Material Balance
                      </h5>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-sm text-slate-400">
                            Total Received
                          </div>
                          <div className="text-lg font-medium text-emerald-400">
                            {selectedUpdate.sections.materialRegister.receivedEntries.reduce(
                              (sum, entry) => sum + entry.quantity,
                              0,
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">
                            Total Issued
                          </div>
                          <div className="text-lg font-medium text-red-400">
                            {selectedUpdate.sections.materialRegister.issuedEntries.reduce(
                              (sum, entry) => sum + entry.quantity,
                              0,
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-400">Balance</div>
                          <div className="text-lg font-medium text-blue-400">
                            {selectedUpdate.sections.materialRegister.receivedEntries.reduce(
                              (sum, entry) => sum + entry.quantity,
                              0,
                            ) -
                              selectedUpdate.sections.materialRegister.issuedEntries.reduce(
                                (sum, entry) => sum + entry.quantity,
                                0,
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex gap-2 justify-end p-6 pt-0 border-t border-slate-700 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleExportUpdate(selectedUpdate)}
                className="px-4 py-2 bg-blue-600 text-blue-50 rounded hover:bg-blue-700 transition-colors"
              >
                📄 Export Update
              </button>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UpdateHistory;
