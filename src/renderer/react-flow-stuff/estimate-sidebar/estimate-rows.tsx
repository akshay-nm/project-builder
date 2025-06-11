import { useShallow } from 'zustand/react/shallow';
import { useParams } from 'next/navigation';
import {
  ItemRequirementInStore,
  LumpsumSubContractRequirementInStore,
  PermanentEmployeeRequirementInStore,
  TradesmanRequirementInStore,
  UnitRateBasedSubContractRequirementInStore,
  useEstimateStore,
} from '../store';
import { RequirementType } from '../store';
import { deleteRequirementLineSelector } from '../selectors';
import { projectPlanSelector } from '../selectors';
import { AmountFromRateAndQuantityCell } from './amount-from-rate-and-quantity';
import { Card, CardTitle, CardHeader, CardDescription } from '@/components/ui/card';
import { QuantityWithRateCell } from './quantity-with-rate-cell';
import { Button } from '@/components/ui/button';
import { TrashIcon } from 'lucide-react';
import { AmountCell, QuantityCell, RateCell } from '@/components/table-cells';
import { TotalFromRateDateRangeAndHeadCount } from './total-from-rate-date-range-and-head-count';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QueryKey } from '@/query-keys';
import { measurementUnitsApi } from '@/api/measurement-units';
import { useQuery } from '@tanstack/react-query';

export const UnitRateBasedSubContractRequirementRow = ({ requirementLine }: { requirementLine: UnitRateBasedSubContractRequirementInStore }) => {
  const params = useParams();
  const deleteRequirementLine = useEstimateStore(useShallow(deleteRequirementLineSelector));

  return (
    <Card className="w-full">
      <CardHeader className="p-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{requirementLine.details}</span>
          <AmountFromRateAndQuantityCell rate={requirementLine.rate} quantity={requirementLine.quantity} />
        </CardTitle>
        <CardDescription className="flex items-center justify-between gap-1">
          <QuantityWithRateCell quantity={requirementLine.quantity} rate={requirementLine.rate} />

          <div>
            <Button
              variant="ghost"
              onClick={() =>
                deleteRequirementLine(params.project as string, requirementLine.nodeId, RequirementType.UNIT_RATE_BASED_SUB_CONTRACT, requirementLine._id)
              }
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export const UnitRateBasedSubContractRequirementLineCell = ({ requirementLine }: { requirementLine: UnitRateBasedSubContractRequirementInStore }) => {
  return <QuantityWithRateCell quantity={requirementLine.quantity} rate={requirementLine.rate} />;
};

export const LumpsumSubContractRequirementLineRow = ({ requirementLine }: { requirementLine: LumpsumSubContractRequirementInStore }) => {
  const params = useParams();
  const deleteRequirementLine = useEstimateStore(useShallow(deleteRequirementLineSelector));
  return (
    <Card className="w-full">
      <CardHeader className="p-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <div>Lumpsum</div>
          <AmountCell amount={requirementLine.amount} />
        </CardTitle>
        <CardDescription className="flex items-center justify-between gap-1">
          <span>{requirementLine.details}</span>
          <div>
            <Button
              variant="ghost"
              onClick={() => deleteRequirementLine(params.project as string, requirementLine.nodeId, RequirementType.LUMPSUM_SUB_CONTRACT, requirementLine._id)}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export const LumpsumSubContractRequirementLineCell = ({ requirementLine }: { requirementLine: LumpsumSubContractRequirementInStore }) => {
  return <span />;
};

export const ItemRequirementLineRow = ({ requirementLine }: { requirementLine: ItemRequirementInStore }) => {
  const params = useParams();
  const deleteRequirementLine = useEstimateStore(useShallow(deleteRequirementLineSelector));
  return (
    <Card className="w-full" key={requirementLine._id}>
      <CardHeader className="p-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{requirementLine.item.name}</span>
          <AmountFromRateAndQuantityCell rate={requirementLine.rate} quantity={requirementLine.quantity} />
        </CardTitle>
        <CardDescription className="flex items-center justify-between gap-1">
          <div>
            <QuantityWithRateCell quantity={requirementLine.quantity} rate={requirementLine.rate} />
            <div>{requirementLine.details}</div>
          </div>
          <div>
            <Button
              variant="ghost"
              onClick={() => deleteRequirementLine(params.project as string, requirementLine.nodeId, RequirementType.ITEM, requirementLine._id)}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};

export const ItemRequirementLineCell = ({ requirementLine }: { requirementLine: ItemRequirementInStore }) => {
  return (
    <div>
      <QuantityWithRateCell quantity={requirementLine.quantity} rate={requirementLine.rate} />
    </div>
  );
};

export const PermanentEmployeeRequirementLineCell = ({ requirementLine }: { requirementLine: PermanentEmployeeRequirementInStore }) => {
  return (
    <div>
      <div>
        {requirementLine.headCount} {requirementLine.designation}
      </div>
      <div>
        <RateCell rate={requirementLine.rate} />
      </div>
    </div>
  );
};

export const TradesmanRequirementLineRow = ({ requirementLine }: { requirementLine: TradesmanRequirementInStore }) => {
  const params = useParams();
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));
  const deleteRequirementLine = useEstimateStore(useShallow(deleteRequirementLineSelector));
  const node = projectPlan.nodes.find((n) => n.id === requirementLine.nodeId);

  if (!node) return null;
  return (
    <Card className="w-full" key={requirementLine._id}>
      <CardHeader className="p-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>
            {requirementLine.headCount} {requirementLine.trade}
          </span>
          <TotalFromRateDateRangeAndHeadCount rate={requirementLine.rate} headCount={requirementLine.headCount} dateRange={node.data.dateRange} />
        </CardTitle>
        <CardDescription className="flex items-center justify-between gap-1">
          <div>
            <div>
              <RateCell rate={requirementLine.rate} />
            </div>
            <div>{requirementLine.details}</div>
          </div>
          <div>
            <Button
              variant="ghost"
              onClick={() => deleteRequirementLine(params.project as string, requirementLine.nodeId, RequirementType.TRADESMAN, requirementLine._id)}
            >
              <TrashIcon className="w-4 h-4" />
            </Button>
          </div>
        </CardDescription>
      </CardHeader>
    </Card>
  );
};
export const TradesmanRequirementLineCell = ({ requirementLine }: { requirementLine: TradesmanRequirementInStore }) => {
  return (
    <div>
      <div>
        {requirementLine.headCount} {requirementLine.trade}
      </div>
      <div>
        <RateCell rate={requirementLine.rate} />
      </div>
    </div>
  );
};

export const EstimateRows = ({ nodeId }: { nodeId: string }) => {
  const params = useParams();
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));
  const requirement = projectPlan.requirements.find((r) => r.nodeId === nodeId);
  const childNodesExist = projectPlan.nodes.some((n) => n.data.parentId === nodeId);
  const node = projectPlan.nodes.find((n) => n.id === nodeId);
  const deleteRequirementLine = useEstimateStore(useShallow(deleteRequirementLineSelector));

  const measurementUnitsQuery = useQuery({
    queryKey: [QueryKey.MEASUREMENT_UNITS, { project: params.project as string }],
    queryFn: () => measurementUnitsApi.get({ project: params.project as string, limit: 1000 }),
  });
  const customUnits = measurementUnitsQuery.data?.data ?? [];

  if (!node || !requirement || childNodesExist) return null;

  return (
    <div className="flex flex-col w-full">
      {/* Section Heading */}
      <div className="px-4 py-2 text-sm font-semibold text-gray-700 uppercase tracking-wide">Detailed Requirements</div>

      {/* Always showing Tabs */}
      <Tabs defaultValue="materials" className="w-full px-4 pt-2">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="materials">Materials</TabsTrigger>
          <TabsTrigger value="manpower">Manpower</TabsTrigger>
          <TabsTrigger value="unit-rate-based-sub-contract">Unit Rate Based Sub Contract</TabsTrigger>
          <TabsTrigger value="lumpsum-sub-contract">Lumpsum Sub Contract</TabsTrigger>
        </TabsList>

        {/* MATERIALS TAB CONTENT */}
        <TabsContent value="materials" className="pt-4">
          {requirement.item.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Item</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requirement.item.map((reqLine) => (
                    <tr key={reqLine._id}>
                      <td className="px-4 py-2 text-sm text-gray-700">{reqLine.item.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <QuantityCell quantity={reqLine.quantity} />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <RateCell rate={reqLine.rate} />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 text-right">
                        <AmountFromRateAndQuantityCell quantity={reqLine.quantity} rate={reqLine.rate} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRequirementLine(params.project as string, reqLine.nodeId, RequirementType.ITEM, reqLine._id)}
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No materials added yet.</div>
          )}
        </TabsContent>

        {/* MANPOWER TAB CONTENT */}
        <TabsContent value="manpower" className="pt-4">
          {requirement.tradesman.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Manpower Type</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Headcount</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Tradesman Entries */}
                  {requirement.tradesman.map((reqLine) => (
                    <tr key={reqLine._id}>
                      <td className="px-4 py-2 text-sm text-gray-700">{reqLine.trade}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{reqLine.headCount}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <RateCell rate={reqLine.rate} />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 text-right">
                        <TotalFromRateDateRangeAndHeadCount
                          rate={reqLine.rate}
                          headCount={reqLine.headCount}
                          dateRange={projectPlan.nodes.find((n) => n.id === reqLine.nodeId)?.data.dateRange}
                        />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRequirementLine(params.project as string, reqLine.nodeId, RequirementType.TRADESMAN, reqLine._id)}
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No manpower added yet.</div>
          )}
        </TabsContent>
        {/* UNIT RATE BASED SUB CONTRACT TAB CONTENT */}
        <TabsContent value="unit-rate-based-sub-contract" className="pt-4">
          {requirement.unitRateBasedSubContract.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Rate</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Tradesman Entries */}
                  {requirement.unitRateBasedSubContract.map((reqLine) => (
                    <tr key={reqLine._id}>
                      <td className="px-4 py-2 text-sm text-gray-700">{reqLine.details}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <QuantityCell quantity={reqLine.quantity} />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <RateCell rate={reqLine.rate} />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700 text-right">
                        <AmountFromRateAndQuantityCell quantity={reqLine.quantity} rate={reqLine.rate} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            deleteRequirementLine(params.project as string, reqLine.nodeId, RequirementType.UNIT_RATE_BASED_SUB_CONTRACT, reqLine._id)
                          }
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No unit rate based sub contract added yet.</div>
          )}
        </TabsContent>
        {/* LUMPSUM SUB CONTRACT TAB CONTENT */}
        <TabsContent value="lumpsum-sub-contract" className="pt-4">
          {requirement.lumpsumSubContract.length > 0 ? (
            <div className="overflow-x-auto rounded-md border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Tradesman Entries */}
                  {requirement.lumpsumSubContract.map((reqLine) => (
                    <tr key={reqLine._id}>
                      <td className="px-4 py-2 text-sm text-gray-700">{reqLine.details}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <AmountCell amount={reqLine.amount} />
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRequirementLine(params.project as string, reqLine.nodeId, RequirementType.LUMPSUM_SUB_CONTRACT, reqLine._id)}
                        >
                          <TrashIcon className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">No lumpsum sub contract added yet.</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
