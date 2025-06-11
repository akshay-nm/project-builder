'use client';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useMemo, useState } from 'react';
import { useEstimateStore } from './store';
import { EstimateStoreState } from './store';
import { useShallow } from 'zustand/react/shallow';
import { useParams } from 'next/navigation';
import { EyeIcon, EyeOffIcon, Minus, Plus, Trash, TrashIcon, XIcon } from 'lucide-react';
import { PREDEFINED_UNITS, PredefinedUnit } from '@/components/get-units-by-measure';
import { withToasts } from '@/app/with-toasts';
import { AddMeasurementUnitForm } from '@/components/forms/add-measurement-unit-form';
import { Item, MeasurementUnit } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QueryKey } from '@/query-keys';
import { itemsApi } from '@/api/items';
import { measurementUnitsApi } from '@/api/measurement-units';
import { AddItemForm } from '@/components/forms/add-item-form';
import { PageBar, PaginationParams } from '@/components/page-bar';
import { PaginatedResponse } from '@/api/common';
import { Input } from '@/components/ui/input';
import { useDebounceValue } from 'usehooks-ts';
import { projectsApi } from '@/api/projects';

export const ManageItemsAndUnits = () => {
  const updateSidebarOpen = useEstimateStore(useShallow((state) => state.setIsManageItemsAndUnitsOpen));
  const params = useParams();

  return (
    <div className="flex flex-col w-full h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="px-4 py-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Items and Units</div>
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

const ProjectItems = () => {
  const params = useParams();
  const [pagination, setPagination] = useState<PaginationParams>({});
  const [search, setSearch] = useState('');
  const [searchTerm] = useDebounceValue(search, 500);
  const queryParams = useMemo(
    () => ({
      ...pagination,
      project: params.project as string,
      limit: 5,
      searchTerm: searchTerm.trim().length > 0 ? searchTerm : undefined,
      includeHidden: true,
    }),
    [params.project, pagination, searchTerm],
  );
  const { data, isLoading } = useQuery({
    queryKey: [QueryKey.ITEMS, queryParams],
    queryFn: () => itemsApi.get(queryParams),
    placeholderData: keepPreviousData,
  });

  const { data: items = [], hasNext, hasPrev, nextCursor, prevCursor } = data ?? ({} as PaginatedResponse<Item>);

  const queryClient = useQueryClient();

  const { mutateAsync: addItem, isPending: isSavingItem } = useMutation({
    mutationFn: async (data: any) => {
      await itemsApi.create(data);
      await queryClient.invalidateQueries({ queryKey: [QueryKey.ITEMS] });
      return data;
    },
  });

  const { mutateAsync: deleteItem, isPending: isDeletingItem } = useMutation({
    mutationFn: async (itemId: string) => {
      await itemsApi.removeById(itemId);
      await queryClient.invalidateQueries({ queryKey: [QueryKey.ITEMS] });
    },
  });

  const { mutateAsync: hideItem, isPending: isHidingItem } = useMutation({
    mutationFn: async (itemId: string) => {
      await itemsApi.hide(itemId, params.project as string);
      await queryClient.invalidateQueries({ queryKey: [QueryKey.ITEMS] });
    },
  });

  const { mutateAsync: unhideItem, isPending: isUnhidingItem } = useMutation({
    mutationFn: async (itemId: string) => {
      await itemsApi.unhide(itemId, params.project as string);
      await queryClient.invalidateQueries({ queryKey: [QueryKey.ITEMS] });
    },
  });

  const [isAddingItem, setIsAddingItem] = useState(false);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      <Card className="flex-grow">
        <CardTitle className="text-md font-semibold text-gray-800 text-center mt-3">All Items</CardTitle>
        <CardContent className="p-4 flex flex-col gap-2 max-h-[calc(100vh-250px)] overflow-y-auto">
          <div className="overflow-x-auto rounded-md border">
            <div>
              <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">
                    Default Unit
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
                    <td className="px-4 py-2 text-sm text-gray-700">{item.category}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{item.defaultMeasureUnit}</td>
                    <td className="px-4 py-2 flex justify-end">
                      {!item.project && (
                        <>
                          {item.hiddenInProjects?.includes(params.project as string) ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => unhideItem(item._id)}
                              disabled={isUnhidingItem}
                            >
                              <EyeOffIcon className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-green-500 hover:text-green-600"
                              onClick={() => hideItem(item._id)}
                              disabled={isHidingItem}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                      {item.project && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => deleteItem(item._id)}
                          disabled={isDeletingItem}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <PageBar setPagination={setPagination} hasNext={hasNext} hasPrev={hasPrev} nextCursor={nextCursor} prevCursor={prevCursor} />
            {isLoading && items.length === 0 && <div className="text-sm text-muted-foreground text-center py-6">Loading...</div>}
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

const ProjectUnits = () => {
  const params = useParams();

  const measurementTypeWisePredefinedUnits: Record<string, PredefinedUnit[]> = {};
  PREDEFINED_UNITS.forEach((unit) => {
    if (!measurementTypeWisePredefinedUnits[unit.measurementType]) {
      measurementTypeWisePredefinedUnits[unit.measurementType] = [];
    }
    measurementTypeWisePredefinedUnits[unit.measurementType].push(unit);
  });

  const queryClient = useQueryClient();
  const [pagination, setPagination] = useState<PaginationParams>({});
  const [search, setSearch] = useState('');
  const { data: project } = useQuery({
    queryKey: [QueryKey.PROJECTS, params.project as string],
    queryFn: () => projectsApi.getById(params.project as string),
  });
  const [searchTerm] = useDebounceValue(search, 500);
  const queryParams = useMemo(
    () => ({
      ...pagination,
      project: params.project as string,
      limit: 10,
      searchTerm: searchTerm.trim().length > 0 ? searchTerm : undefined,
      user: project?.createdBy,
    }),
    [params.project, pagination, searchTerm, project],
  );

  const { data, isLoading } = useQuery({
    queryKey: [QueryKey.MEASUREMENT_UNITS, queryParams],
    queryFn: () => measurementUnitsApi.get(queryParams),
    placeholderData: keepPreviousData,
    enabled: !!project,
  });
  const { data: measurementUnits = [], hasNext, hasPrev, nextCursor, prevCursor } = data ?? ({} as PaginatedResponse<MeasurementUnit>);

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

  const [isAddingCustomUnit, setIsAddingCustomUnit] = useState(false);
  return (
    <Tabs defaultValue="custom" className="flex flex-col w-full h-full gap-2">
      <TabsList className="grid grid-cols-2">
        <TabsTrigger value="custom">Custom</TabsTrigger>
        <TabsTrigger value="predefined">SI Units</TabsTrigger>
      </TabsList>

      <TabsContent value="custom" className="flex-grow flex flex-col gap-4">
        <Card className="flex-grow">
          <CardTitle className="text-md font-semibold text-gray-800 text-center mt-3">Custom Units</CardTitle>

          <CardContent className="p-4 flex flex-col gap-4">
            <div className="overflow-x-auto rounded-md border">
              <div>
                <Input placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
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
                  {measurementUnits.map((unit) => (
                    <tr key={unit._id}>
                      <td className="px-4 py-2 text-sm text-gray-700">{unit.symbol}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{unit.measurementType}</td>
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
                  ))}
                </tbody>
              </table>
              <PageBar setPagination={setPagination} hasNext={hasNext} hasPrev={hasPrev} nextCursor={nextCursor} prevCursor={prevCursor} />
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
            <AddMeasurementUnitForm onSubmit={withToasts(addCustomUnit)} isSubmitting={isSavingCustomUnit} />
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
