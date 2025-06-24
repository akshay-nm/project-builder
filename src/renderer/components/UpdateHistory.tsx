import { useState, useEffect } from 'react';

// Types for the daily update structure
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

type ActivityData = {
  id: string;
  name: string;
  description: string;
};

type AssetActivity = {
  assetId: string;
  assetName: string;
  assetType: string;
  activities: ActivityData[];
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

type DailyUpdate = {
  date: string;
  timestamp: string;
  sections: {
    labour: {
      data: LabourData;
      summary: {
        totalEngineers: number;
        totalSkilledLabour: number;
        totalUnskilledLabour: number;
        grandTotal: number;
      };
    };
    stagePassing: {
      selectedActivities: AssetActivity[];
      summary: {
        totalActivities: number;
        activeAssets: number;
      };
    };
    materialRegister: {
      materialName: string;
      receivedEntries: ReceivedEntry[];
      issuedEntries: IssuedEntry[];
      summary: {
        totalReceivedEntries: number;
        totalIssuedEntries: number;
      };
    };
  };
};

export default function UpdateHistory() {
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [filteredUpdates, setFilteredUpdates] = useState<DailyUpdate[]>([]);
  const [selectedUpdate, setSelectedUpdate] = useState<DailyUpdate | null>(
    null,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Mock data for demonstration - in a real app this would come from a backend or local storage
  useEffect(() => {
    const mockUpdates: DailyUpdate[] = [
      {
        date: '2024-01-15',
        timestamp: '2024-01-15T10:30:00.000Z',
        sections: {
          labour: {
            data: {
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
            summary: {
              totalEngineers: 5,
              totalSkilledLabour: 23,
              totalUnskilledLabour: 28,
              grandTotal: 56,
            },
          },
          stagePassing: {
            selectedActivities: [
              {
                assetId: 'foundation',
                assetName: 'Foundation Work',
                assetType: 'Structural',
                activities: [
                  {
                    id: 'exc',
                    name: 'Excavation',
                    description: 'Site excavation and earthwork',
                  },
                  {
                    id: 'footing',
                    name: 'Footing Construction',
                    description: 'Foundation footing and base',
                  },
                ],
              },
            ],
            summary: {
              totalActivities: 2,
              activeAssets: 1,
            },
          },
          materialRegister: {
            materialName: 'Cement',
            receivedEntries: [
              {
                id: '1',
                invoiceBillNo: 'INV-2024-001',
                date: '2024-01-15',
                supplierName: 'ABC Materials',
                supplierEmail: 'supplier@abc.com',
                supplierNo: '+1234567890',
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
            summary: {
              totalReceivedEntries: 1,
              totalIssuedEntries: 1,
            },
          },
        },
      },
      {
        date: '2024-01-14',
        timestamp: '2024-01-14T09:15:00.000Z',
        sections: {
          labour: {
            data: {
              Degree: 1,
              Diploma: 2,
              Mason: 4,
              Carpenter: 3,
              'Bar bender': 2,
              Tier: 1,
              Painter: 1,
              Polisher: 0,
              Welder: 1,
              Plumber: 2,
              Glazier: 0,
              Male: 6,
              Bhisty: 1,
              'Mazdoor(male)': 10,
              'Mazdoor(female)': 4,
            },
            summary: {
              totalEngineers: 3,
              totalSkilledLabour: 14,
              totalUnskilledLabour: 21,
              grandTotal: 38,
            },
          },
          stagePassing: {
            selectedActivities: [
              {
                assetId: 'structure',
                assetName: 'Structural Work',
                assetType: 'Structural',
                activities: [
                  {
                    id: 'column',
                    name: 'Column Construction',
                    description: 'RCC column construction',
                  },
                ],
              },
            ],
            summary: {
              totalActivities: 1,
              activeAssets: 1,
            },
          },
          materialRegister: {
            materialName: 'Steel Rebar',
            receivedEntries: [
              {
                id: '2',
                invoiceBillNo: 'INV-2024-002',
                date: '2024-01-14',
                supplierName: 'Steel Corp',
                supplierEmail: 'orders@steelcorp.com',
                supplierNo: '+9876543210',
                quantity: 500,
                unit: 'kg',
              },
            ],
            issuedEntries: [],
            summary: {
              totalReceivedEntries: 1,
              totalIssuedEntries: 0,
            },
          },
        },
      },
    ];

    setUpdates(mockUpdates);
    setFilteredUpdates(mockUpdates);
  }, []);

  // Filter updates based on search term and date filter
  useEffect(() => {
    let filtered = updates;

    if (searchTerm) {
      filtered = filtered.filter(
        (update) =>
          update.sections.materialRegister.materialName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          update.sections.stagePassing.selectedActivities.some((asset) =>
            asset.assetName.toLowerCase().includes(searchTerm.toLowerCase()),
          ) ||
          update.date.includes(searchTerm),
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((update) => update.date >= dateFilter);
    }

    setFilteredUpdates(filtered);
  }, [updates, searchTerm, dateFilter]);

  const handleViewDetails = (update: DailyUpdate) => {
    setSelectedUpdate(update);
    setIsDetailModalOpen(true);
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

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-emerald-400">
          📋 Update History
        </h3>
        <span className="text-sm text-slate-400">
          {filteredUpdates.length} updates found
        </span>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by material, asset, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setSearchTerm('');
            setDateFilter('');
          }}
          className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 border border-slate-600 rounded-md hover:bg-slate-700 transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Updates List */}
      <div className="space-y-4">
        {filteredUpdates.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg mb-2">No updates found</p>
            <p className="text-sm">
              Try adjusting your search criteria or create a new update
            </p>
          </div>
        ) : (
          filteredUpdates.map((update) => (
            <div
              key={`${update.date}-${update.timestamp}`}
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

              {/* Quick Summary */}
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-slate-700/50 rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">👷 Labour</span>
                    <span className="text-emerald-400 font-medium">
                      {update.sections.labour.summary.grandTotal}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">📋 Activities</span>
                    <span className="text-emerald-400 font-medium">
                      {update.sections.stagePassing.summary.totalActivities}
                    </span>
                  </div>
                </div>
                <div className="bg-slate-700/50 rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">📦 Material</span>
                    <span className="text-emerald-400 font-medium">
                      {update.sections.materialRegister.materialName || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedUpdate && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-[1000] p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-lg min-w-[600px] max-w-[800px] shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 pb-0 flex-shrink-0">
              <h3 className="text-xl font-medium text-emerald-400">
                📋 Daily Update - {formatDate(selectedUpdate.date)}
              </h3>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                ✕
              </button>
            </div>

            {/* Tab Headers */}
            <div className="flex border-b border-slate-700 px-6 mt-4 flex-shrink-0">
              <div className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-emerald-400 text-emerald-400">
                <span>👷</span>
                <span>Labour</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-emerald-400 text-emerald-400">
                <span>📋</span>
                <span>Stage Passing</span>
              </div>
              <div className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-emerald-400 text-emerald-400">
                <span>📦</span>
                <span>Material Registers</span>
              </div>
            </div>

            {/* Tab Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                {/* Labour Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-slate-50">
                      👷 Daily Labour Update
                    </h4>
                    <div className="text-sm text-slate-400">
                      Date: {formatDate(selectedUpdate.date)}
                    </div>
                  </div>

                  <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <div className="grid grid-cols-2 gap-px bg-slate-700">
                      <div className="bg-slate-800 px-4 py-3 text-slate-300 font-medium text-sm">
                        Labour Type
                      </div>
                      <div className="bg-slate-800 px-4 py-3 text-slate-300 font-medium text-sm text-center">
                        Quantity
                      </div>
                    </div>

                    {/* Engineers Section */}
                    <div className="grid grid-cols-2 gap-px bg-slate-600">
                      <div className="bg-slate-700 px-4 py-2 text-emerald-300 font-semibold text-sm">
                        👨‍💼 Engineers
                      </div>
                      <div className="bg-slate-700 px-4 py-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-slate-700">
                      <div className="bg-slate-800 px-4 py-3 text-slate-50 text-sm flex items-center">
                        <span className="mr-2">🎓</span>Degree
                      </div>
                      <div className="bg-slate-800 px-4 py-3 text-center text-emerald-400 font-medium">
                        {selectedUpdate.sections.labour.data.Degree}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-px bg-slate-700">
                      <div className="bg-slate-800 px-4 py-3 text-slate-50 text-sm flex items-center">
                        <span className="mr-2">📜</span>Diploma
                      </div>
                      <div className="bg-slate-800 px-4 py-3 text-center text-emerald-400 font-medium">
                        {selectedUpdate.sections.labour.data.Diploma}
                      </div>
                    </div>

                    {/* Skilled Labour Section */}
                    <div className="grid grid-cols-2 gap-px bg-slate-600">
                      <div className="bg-slate-700 px-4 py-2 text-emerald-300 font-semibold text-sm">
                        👷‍♂️ Skilled Labour
                      </div>
                      <div className="bg-slate-700 px-4 py-2" />
                    </div>

                    {[
                      { key: 'Mason', icon: '🧱' },
                      { key: 'Carpenter', icon: '🔨' },
                      { key: 'Bar bender', icon: '⚙️' },
                      { key: 'Tier', icon: '🔗' },
                      { key: 'Painter', icon: '🎨' },
                      { key: 'Polisher', icon: '✨' },
                      { key: 'Welder', icon: '🔥' },
                      { key: 'Plumber', icon: '🔧' },
                      { key: 'Glazier', icon: '🪟' },
                    ].map(({ key, icon }) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 gap-px bg-slate-700"
                      >
                        <div className="bg-slate-800 px-4 py-3 text-slate-50 text-sm flex items-center">
                          <span className="mr-2">{icon}</span>
                          {key}
                        </div>
                        <div className="bg-slate-800 px-4 py-3 text-center text-emerald-400 font-medium">
                          {
                            selectedUpdate.sections.labour.data[
                              key as keyof LabourData
                            ]
                          }
                        </div>
                      </div>
                    ))}

                    {/* Unskilled Labour Section */}
                    <div className="grid grid-cols-2 gap-px bg-slate-600">
                      <div className="bg-slate-700 px-4 py-2 text-emerald-300 font-semibold text-sm">
                        👤 Unskilled Labour
                      </div>
                      <div className="bg-slate-700 px-4 py-2" />
                    </div>

                    {[
                      { key: 'Male', icon: '👨' },
                      { key: 'Bhisty', icon: '🚰' },
                      { key: 'Mazdoor(male)', icon: '👷' },
                      { key: 'Mazdoor(female)', icon: '👷‍♀️' },
                    ].map(({ key, icon }) => (
                      <div
                        key={key}
                        className="grid grid-cols-2 gap-px bg-slate-700"
                      >
                        <div className="bg-slate-800 px-4 py-3 text-slate-50 text-sm flex items-center">
                          <span className="mr-2">{icon}</span>
                          {key}
                        </div>
                        <div className="bg-slate-800 px-4 py-3 text-center text-emerald-400 font-medium">
                          {
                            selectedUpdate.sections.labour.data[
                              key as keyof LabourData
                            ]
                          }
                        </div>
                      </div>
                    ))}

                    {/* Total */}
                    <div className="grid grid-cols-2 gap-px bg-slate-700">
                      <div className="bg-slate-800 px-4 py-3 text-emerald-400 font-medium text-sm">
                        Total Workers
                      </div>
                      <div className="bg-slate-800 px-4 py-3 text-emerald-400 font-medium text-sm text-center">
                        {selectedUpdate.sections.labour.summary.grandTotal}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stage Passing Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-slate-50">
                      📋 Stage Passing Activities
                    </h4>
                    <div className="text-sm text-slate-400">
                      {
                        selectedUpdate.sections.stagePassing.summary
                          .totalActivities
                      }{' '}
                      activities selected
                    </div>
                  </div>

                  {selectedUpdate.sections.stagePassing.selectedActivities
                    .length === 0 ? (
                    <div className="bg-slate-800 rounded-lg p-8 text-center">
                      <div className="text-slate-400 text-lg mb-2">📋</div>
                      <p className="text-slate-400">
                        No activities were selected for this update
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedUpdate.sections.stagePassing.selectedActivities.map(
                        (asset) => (
                          <div
                            key={asset.assetId}
                            className="bg-slate-800 rounded-lg border border-slate-700"
                          >
                            <div className="px-4 py-3 border-b border-slate-700 bg-slate-750">
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-slate-50">
                                  {asset.assetName}
                                </h5>
                                <span className="text-xs text-slate-400 bg-slate-700 px-2 py-1 rounded">
                                  {asset.assetType}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <div className="space-y-2">
                                {asset.activities.map((activity) => (
                                  <div
                                    key={activity.id}
                                    className="flex items-center space-x-3 p-2 bg-slate-700/50 rounded"
                                  >
                                    <div className="w-4 h-4 bg-emerald-500 rounded-sm flex items-center justify-center">
                                      <span className="text-white text-xs">
                                        ✓
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <div className="text-slate-50 font-medium text-sm">
                                        {activity.name}
                                      </div>
                                      <div className="text-slate-400 text-xs">
                                        {activity.description}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <h5 className="font-medium text-slate-50 mb-3">Summary</h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">
                          Total Selected Activities:
                        </span>
                        <span className="ml-2 text-emerald-400 font-medium">
                          {
                            selectedUpdate.sections.stagePassing.summary
                              .totalActivities
                          }
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400">
                          Assets with Activities:
                        </span>
                        <span className="ml-2 text-emerald-400 font-medium">
                          {
                            selectedUpdate.sections.stagePassing.summary
                              .activeAssets
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Material Register Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium text-slate-50">
                      📦 Material Registers
                    </h4>
                    <div className="text-sm text-slate-400">
                      Date: {formatDate(selectedUpdate.date)}
                    </div>
                  </div>

                  {/* Material Name */}
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Material Name
                    </label>
                    <div className="flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-50 opacity-60">
                      {selectedUpdate.sections.materialRegister.materialName ||
                        'No material specified'}
                    </div>
                  </div>

                  {/* Received Section */}
                  <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <div className="bg-green-900/20 border-b border-slate-700 px-4 py-3">
                      <h5 className="font-medium text-slate-50 flex items-center">
                        <span className="mr-2">📥</span>
                        Received Materials (
                        {
                          selectedUpdate.sections.materialRegister
                            .receivedEntries.length
                        }{' '}
                        entries)
                      </h5>
                    </div>

                    {selectedUpdate.sections.materialRegister.receivedEntries
                      .length === 0 ? (
                      <div className="p-4 text-center text-slate-400">
                        No received entries for this material
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        <div className="divide-y divide-slate-700">
                          {selectedUpdate.sections.materialRegister.receivedEntries.map(
                            (entry) => (
                              <div
                                key={entry.id}
                                className="p-4 hover:bg-slate-700/30"
                              >
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                  <div>
                                    <span className="text-slate-400">
                                      Invoice:
                                    </span>
                                    <div className="text-slate-50 font-medium">
                                      {entry.invoiceBillNo}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">
                                      Date:
                                    </span>
                                    <div className="text-slate-50">
                                      {new Date(
                                        entry.date,
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">
                                      Quantity:
                                    </span>
                                    <div className="text-emerald-400 font-medium">
                                      {entry.quantity} {entry.unit}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">
                                      Supplier:
                                    </span>
                                    <div className="text-slate-50">
                                      {entry.supplierName}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-slate-400">
                                      Email:
                                    </span>
                                    <div className="text-slate-50">
                                      {entry.supplierEmail}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">
                                      Phone:
                                    </span>
                                    <div className="text-slate-50">
                                      {entry.supplierNo}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Issued Section */}
                  <div className="bg-slate-800 rounded-lg overflow-hidden">
                    <div className="bg-red-900/20 border-b border-slate-700 px-4 py-3">
                      <h5 className="font-medium text-slate-50 flex items-center">
                        <span className="mr-2">📤</span>
                        Issued Materials (
                        {
                          selectedUpdate.sections.materialRegister.issuedEntries
                            .length
                        }{' '}
                        entries)
                      </h5>
                    </div>

                    {selectedUpdate.sections.materialRegister.issuedEntries
                      .length === 0 ? (
                      <div className="p-4 text-center text-slate-400">
                        No issued entries for this material
                      </div>
                    ) : (
                      <div className="max-h-64 overflow-y-auto">
                        <div className="divide-y divide-slate-700">
                          {selectedUpdate.sections.materialRegister.issuedEntries.map(
                            (entry) => (
                              <div
                                key={entry.id}
                                className="p-4 hover:bg-slate-700/30"
                              >
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <span className="text-slate-400">
                                      Asset:
                                    </span>
                                    <div className="text-slate-50 font-medium">
                                      {entry.assetName}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">
                                      Date:
                                    </span>
                                    <div className="text-slate-50">
                                      {new Date(
                                        entry.date,
                                      ).toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div>
                                    <span className="text-slate-400">
                                      Quantity:
                                    </span>
                                    <div className="text-red-400 font-medium">
                                      {entry.quantity} {entry.unit}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end p-6 pt-0 border-t border-slate-700 flex-shrink-0">
              <button
                type="button"
                onClick={() => handleExportUpdate(selectedUpdate)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-blue-50 hover:bg-blue-700 h-9 px-4 py-2"
              >
                📄 Export Update
              </button>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-slate-600 bg-transparent hover:bg-slate-700 text-slate-300 h-9 px-4 py-2"
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
