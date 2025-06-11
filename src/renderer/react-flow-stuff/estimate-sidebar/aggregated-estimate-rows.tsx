import { AmountCell, QuantityCell } from '@/components/table-cells';

import { useShallow } from 'zustand/react/shallow';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { projectPlanSelector } from '../selectors';
import { useEstimateStore } from '../store';
import { useGetAggregatedItemEstimates } from './use-get-aggregated-item-estimates';
import { useParams } from 'next/navigation';

export const AggregatedEstimateRows = ({ nodeId }: { nodeId: string }) => {
  const params = useParams();
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));
  const { itemWiseTotals, isThisNodeAggregated } = useGetAggregatedItemEstimates(nodeId);
  if (!projectPlan) return null;
  if (!isThisNodeAggregated) return null;

  return (
    <div className="flex-grow overflow-y-auto">
      <div className="text-sm font-medium p-2">Aggregated estimate</div>
      <div className="grid divide-y p-2">
        {Object.entries(itemWiseTotals).map(([itemId, { quantity, amount, item }]) => (
          <Card className="w-full" key={itemId}>
            <CardHeader className="p-2">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{item.name}</span>
                <AmountCell amount={amount} />
              </CardTitle>
              <CardDescription className="flex items-center justify-between gap-1">
                <div>
                  <QuantityCell quantity={quantity} />
                </div>
                <div />
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};
