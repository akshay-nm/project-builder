import { getAmountFromRateAndQuantity } from '@/lib/get-conversion-factor-to-base-unit';

import { useEstimateStore } from '../store';

import { projectPlanSelector } from '../selectors';

import { ItemRequirementInStore } from '../store';

import { Quantity } from '@/types';

import { Amount } from '@/types';
import { ItemInStore } from '../store';
import { EstimateNode } from '../types';
import { useShallow } from 'zustand/react/shallow';
import { QuantityHelper } from '@/lib/get-conversion-factor-to-base-unit';
import { useParams } from 'next/navigation';
import { QueryKey } from '@/query-keys';
import { useQuery } from '@tanstack/react-query';
import { measurementUnitsApi } from '@/api/measurement-units';

export const useGetAggregatedItemEstimates = (
  nodeId: string,
): {
  itemWiseTotals: Record<string, { quantity: Quantity; amount: Amount; item: ItemInStore }>;
  childNodes: EstimateNode[];
  itemRequirements: ItemRequirementInStore[];
  isThisNodeAggregated: boolean;
} => {
  const params = useParams();
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));

  const measurementUnitsQuery = useQuery({
    queryKey: [QueryKey.MEASUREMENT_UNITS, { project: params.project as string }],
    queryFn: () => measurementUnitsApi.get({ project: params.project as string, limit: 1000 }),
  });
  const customUnits = measurementUnitsQuery.data?.data ?? [];

  const childNodesExist = projectPlan.nodes.some((n) => n.data.parentId === nodeId);
  if (!childNodesExist) return { itemWiseTotals: {}, childNodes: [], itemRequirements: [], isThisNodeAggregated: false };

  const findAllChildNodes = (parentId: string): EstimateNode[] => {
    const directChildren = projectPlan.nodes.filter((n) => n.data.parentId === parentId);
    return directChildren.concat(directChildren.flatMap((child) => findAllChildNodes(child.id)));
  };
  const childNodes = findAllChildNodes(nodeId);
  const childNodeRequirements = childNodes.map((n) => projectPlan.requirements.find((r) => r.nodeId === n.id));

  const itemWiseTotals: Record<string, { quantity: Quantity; amount: Amount; item: ItemInStore }> = {};
  const itemRequirements = childNodeRequirements.flatMap((r) => r?.item).filter(Boolean) as ItemRequirementInStore[];

  for (const requirement of childNodeRequirements) {
    if (!requirement) continue;
    for (const line of requirement.item) {
      if (!itemWiseTotals[line.item._id])
        itemWiseTotals[line.item._id] = {
          quantity: { value: 0, unit: line.item.defaultMeasureUnit },
          amount: { value: 0, currency: line.rate.currency },
          item: line.item,
        };

      const quantityHelper = QuantityHelper.init(line.item, customUnits);
      const summedQuantity = quantityHelper.sum([itemWiseTotals[line.item._id].quantity, { value: line.quantity.value, unit: line.quantity.unit }]); // add quantity

      const lineAmount = getAmountFromRateAndQuantity(line.rate, line.quantity, customUnits);
      const summedAmount = { value: itemWiseTotals[line.item._id].amount.value + lineAmount.value, currency: itemWiseTotals[line.item._id].amount.currency }; // add amount

      itemWiseTotals[line.item._id] = {
        quantity: summedQuantity,
        amount: summedAmount,
        item: line.item,
      };
    }
  }

  return { itemWiseTotals, childNodes, itemRequirements, isThisNodeAggregated: true };
};
