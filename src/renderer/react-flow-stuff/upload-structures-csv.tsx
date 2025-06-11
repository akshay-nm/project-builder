import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useState } from 'react';
import { useEstimateStore } from './store';
import { EstimateStoreState } from './store';
import { useShallow } from 'zustand/react/shallow';
import { useParams } from 'next/navigation';
import { Minus, Plus, Trash, XIcon } from 'lucide-react';
import { PREDEFINED_UNITS, PredefinedUnit } from '@/components/get-units-by-measure';
import { withToasts } from '@/app/with-toasts';
import { AddMeasurementUnitForm, measurementUnitFormSchema } from '@/components/forms/add-measurement-unit-form';
import { MeasurementUnit } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ImportFromCsv, SampleSCVDownload } from '@/components/csv';
import { z } from 'zod';
import { AddItemForm } from '@/components/forms/add-item-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '@/api/items';
import { QueryKey } from '@/query-keys';
import { measurementUnitsApi } from '@/api/measurement-units';
export const UploadStructureCSV = () => {
  const updateSidebarOpen = useEstimateStore(useShallow((state) => state.setIsUploadStructureCSVOpen));
  const params = useParams();

  return (
    <div className="flex flex-col w-full h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="px-4 py-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Upload structures and activities</div>
        <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-700" onClick={() => updateSidebarOpen(params.project as string, false)}>
          <XIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="items" className="flex flex-col flex-grow w-full space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="units">Units</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="flex-grow">
          <ProjectItems />
        </TabsContent>

        <TabsContent value="units" className="flex-grow">
          <ProjectUnits />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const projectPlanSelector = (state: EstimateStoreState, projectId: string) => state.projectPlans[projectId];
const DownloadSampleStructuresAndActivitiesCSV = () => {
  return (
    <SampleSCVDownload
      fields={['serialNumber', 'type', 'name', 'startDate', 'endDate', 'parentStructureSerialNumber', 'parentActivitySerialNumber']}
      fileName="sample-structures-and-activities.csv"
    />
  );
};

const structureFormSchema = z.object({
  serialNumber: z.string(),
  type: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
});

const activityFormSchema = z.object({
  serialNumber: z.string(),
  type: z.string(),
  name: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  parentStructureSerialNumber: z.string(),
  parentActivitySerialNumber: z.string(),
});

const UploadStructuresAndActivitiesCSV = () => {
  const params = useParams();
  return (
    <ImportFromCsv
      onUpload={withToasts(async (rows: any[]) => {
        console.log('import from csv', { rows });
        // parse the rows and convert them to required format
        const structureRows = rows.filter((row) => row.type === 'structure');
        const activityRows = rows.filter((row) => row.type === 'activity');

        const validatedStructureRows = await Promise.all(
          structureRows.map((row) => {
            const parsedRow = {
              sequence: row.serialNumber,
              type: row.type,
              name: row.name,
              startDate: row.startDate,
              endDate: row.endDate,
              project: params.project as string,
            };
            return structureFormSchema.parseAsync(parsedRow);
          }),
        );

        const validatedActivityRows = await Promise.all(
          activityRows.map((row) => {
            const parsedRow = {
              sequence: row.serialNumber,
              type: row.type,
              name: row.name,
              startDate: row.startDate,
              endDate: row.endDate,
              project: params.project as string,
            };
            return structureFormSchema.parseAsync(parsedRow);
          }),
        );
      })}
      dialogTitle="Upload Items CSV"
    />
  );
};

const ProjectItems = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const itemsQuery = useQuery({
    queryKey: [QueryKey.ITEMS, { project: params.project as string }],
    queryFn: () =>
      itemsApi.get({
        project: params.project as string,
        limit: 1000,
      }),
  });
  const items = itemsQuery.data?.data ?? [];
  const [isAddingItem, setIsAddingItem] = useState(false);
  const { mutateAsync: addItem, isPending: isSavingItem } = useMutation({
    mutationFn: async (data: any) => {
      await itemsApi.create(data);
      await queryClient.invalidateQueries({ queryKey: [QueryKey.ITEMS] });
    },
  });
  const { mutateAsync: deleteItem, isPending: isDeletingItem } = useMutation({
    mutationFn: async (itemId: string) => {
      await itemsApi.removeById(itemId);
      await queryClient.invalidateQueries({ queryKey: [QueryKey.ITEMS] });
    },
  });
  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <div className="flex gap-2 justify-between">
        <DownloadSampleStructuresAndActivitiesCSV />
        <UploadStructuresAndActivitiesCSV />
      </div>
      <Card className="flex-grow">
        <CardTitle className="text-md font-semibold text-gray-800 text-center mt-3">All Items</CardTitle>
        <CardContent className="p-4 flex flex-col gap-2 max-h-[calc(100vh-250px)] overflow-y-auto">
          <div className="overflow-x-auto rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item._id}>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.name}</td>
                    <td className="px-4 py-2 flex justify-end">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => deleteItem(item._id)}
                        disabled={isDeletingItem}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {items.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">No items found. Start by adding a new item.</div>}
          </div>
        </CardContent>
      </Card>

      <Collapsible open={isAddingItem} onOpenChange={setIsAddingItem}>
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full hover:bg-white text-blue-500 hover:border-blue-600 hover:text-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
          >
            {isAddingItem ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {isAddingItem ? 'Close' : 'Add new item'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <AddItemForm onSubmit={withToasts(addItem)} isSubmitting={isSavingItem} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
const DownloadSampleUnitsCSV = () => {
  return <SampleSCVDownload fields={['description', 'measurementType', 'baseUnit', 'symbol', 'conversionFactor']} fileName="sample-units.csv" />;
};

const UploadUnitsCSV = () => {
  const params = useParams();
  const queryClient = useQueryClient();
  const { mutateAsync: addCustomUnit, isPending: isSavingCustomUnit } = useMutation({
    mutationFn: async (data: any) => {
      await measurementUnitsApi.create(data);
      await queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENT_UNITS] });
    },
  });
  return (
    <ImportFromCsv
      onUpload={withToasts(async (rows: any[]) => {
        // parse the rows and convert them to required format
        const validatedRows = await Promise.all(
          rows.map((row) => {
            const parsedRow = {
              description: row.description.toLowerCase(),
              measurementType: row.measurementType.toLowerCase(),
              baseUnit: row.baseUnit.toLowerCase(),
              symbol: row.symbol.toLowerCase(),
              conversionFactor: row.conversionFactor,
              project: params.project as string,
            };
            const predefinedUnit = PREDEFINED_UNITS.find((unit) => unit.symbol === parsedRow.symbol && unit.measurementType === parsedRow.measurementType);
            if (predefinedUnit) {
              throw new Error('Predefined unit already exists');
            }
            return measurementUnitFormSchema.parseAsync(parsedRow);
          }),
        );
        // save the units
        for (const row of validatedRows) addCustomUnit(row as any);
      })}
      dialogTitle="Upload Units CSV"
    />
  );
};

const ProjectUnits = () => {
  const params = useParams();
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));
  const measurementUnitsQuery = useQuery({
    queryKey: [QueryKey.MEASUREMENT_UNITS, { project: params.project as string }],
    queryFn: () => measurementUnitsApi.get({ project: params.project as string, limit: 1000 }),
  });
  const customUnits = measurementUnitsQuery.data?.data ?? [];
  const measurementTypeWiseUnits: Record<string, MeasurementUnit[]> = {};
  const queryClient = useQueryClient();
  const { mutateAsync: addCustomUnit, isPending: isSavingCustomUnit } = useMutation({
    mutationFn: async (data: any) => {
      await measurementUnitsApi.create(data);
      await queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENT_UNITS] });
    },
  });
  const { mutateAsync: deleteCustomUnit, isPending: isDeletingCustomUnit } = useMutation({
    mutationFn: async (unitId: string) => {
      await measurementUnitsApi.removeById(unitId);
      await queryClient.invalidateQueries({ queryKey: [QueryKey.MEASUREMENT_UNITS] });
    },
  });

  const measurementTypeWisePredefinedUnits: Record<string, PredefinedUnit[]> = {};
  PREDEFINED_UNITS.forEach((unit) => {
    if (!measurementTypeWisePredefinedUnits[unit.measurementType]) {
      measurementTypeWisePredefinedUnits[unit.measurementType] = [];
    }
    measurementTypeWisePredefinedUnits[unit.measurementType].push(unit);
  });

  const [isAddingCustomUnit, setIsAddingCustomUnit] = useState(false);
  return (
    <Tabs defaultValue="custom" className="flex flex-col w-full h-full gap-2">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="custom">Custom</TabsTrigger>
        <TabsTrigger value="predefined">Predefined</TabsTrigger>
      </TabsList>

      <TabsContent value="custom" className="flex-grow flex flex-col gap-4">
        <div className="flex gap-2 justify-between">
          <DownloadSampleUnitsCSV />
          <UploadUnitsCSV />
        </div>
        <Card className="flex-grow">
          <CardTitle className="text-md font-semibold text-gray-800 text-center mt-3">All Custome Units</CardTitle>

          <CardContent className="p-4 flex flex-col gap-4">
            {/* Units Table */}

            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                      Symbol
                    </th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                      Measurement Type
                    </th>
                    <th scope="col" className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(measurementTypeWiseUnits).flatMap(([measurementType, units]) =>
                    units.map((unit) => (
                      <tr key={unit._id}>
                        <td className="px-4 py-2 text-sm text-gray-700">{unit.symbol}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{measurementType}</td>
                        <td className="px-4 py-2 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => deleteCustomUnit(unit._id)}
                            disabled={isDeletingCustomUnit}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    )),
                  )}

                  {/* Empty State if no units */}
                  {Object.values(measurementTypeWiseUnits).flat().length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No custom units found. Start by adding one!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Add New Unit Button */}
          </CardContent>
        </Card>
        <Collapsible open={isAddingCustomUnit} onOpenChange={setIsAddingCustomUnit}>
          <CollapsibleTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full hover:bg-white text-blue-500 hover:border-blue-600 hover:text-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
            >
              {isAddingCustomUnit ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {isAddingCustomUnit ? 'Close' : 'Add New Unit'}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="pt-2">
            <AddMeasurementUnitForm onSubmit={withToasts((data) => addCustomUnit(params.project as string, data))} />
          </CollapsibleContent>
        </Collapsible>
      </TabsContent>

      <TabsContent value="predefined" className="flex-grow">
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto ">
          <Accordion type="single" collapsible>
            {Object.entries(measurementTypeWisePredefinedUnits).map(([measurementType, units]) => (
              <AccordionItem key={measurementType} value={measurementType}>
                {/* Accordion Heading */}
                <AccordionTrigger className="px-4 py-2 text-md font-semibold text-gray-700">{measurementType}</AccordionTrigger>

                {/* Accordion Content */}
                <AccordionContent className="px-4 py-2">
                  {units.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {units.map((unit) => (
                        <div key={unit.symbol} className="flex items-center justify-between p-2 rounded-md hover:bg-gray-100">
                          <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-700">{unit.symbol}</div>
                            <div className="text-xs text-gray-500">{unit.unit}</div>
                          </div>

                          <PredefinedUnitStatusIndicator unit={unit} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground text-center py-4">No predefined units available.</div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const updateStandardUnitsSelector = (state: EstimateStoreState) => state.updateStandardUnits;

const PredefinedUnitStatusIndicator = ({ unit }: { unit: PredefinedUnit }) => {
  const params = useParams();
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));
  const updateStandardUnits = useEstimateStore(useShallow(updateStandardUnitsSelector));
  const isEnabled = projectPlan.units.standard[unit.measurementType]?.includes(unit.symbol);
  const togglePredefinedUnit = () => {
    if (isEnabled) {
      updateStandardUnits(params.project as string, {
        ...projectPlan.units.standard,
        [unit.measurementType]: projectPlan.units.standard[unit.measurementType].filter((s) => s !== unit.symbol),
      });
    } else {
      updateStandardUnits(params.project as string, {
        ...projectPlan.units.standard,
        [unit.measurementType]: [...projectPlan.units.standard[unit.measurementType], unit.symbol],
      });
    }
  };
  return (
    <Button
      variant={isEnabled ? 'destructive' : 'outline'}
      size="sm"
      className={!isEnabled ? 'border-blue-500 text-blue-500 hover:border-blue-600 hover:text-blue-600' : ''}
      onClick={withToasts(() => togglePredefinedUnit())}
    >
      {isEnabled ? 'Disable' : 'Enable'}
    </Button>
  );
};
