import { ItemCategory, MeasurementUnit } from '@/types';
import { ItemInStore, ItemRequirementInStore, NodeRequirements } from '../store';
import { EstimateNode } from '../types';
import { RateCell } from '@/components/table-cells';
import { QuantityCell } from '@/components/table-cells';
import { AmountFromRateAndQuantityCell } from './amount-from-rate-and-quantity';

export const ItemAggregate = ({
  childNodeRequirements,
  childNodes,
  customUnits,
}: {
  childNodeRequirements: NodeRequirements[];
  childNodes: EstimateNode[];
  customUnits: MeasurementUnit[];
}) => {
  const itemRequirementLinesWithNode = childNodeRequirements
    .map((requirements) => requirements.item)
    .flatMap((item) => item)
    .map((line) => {
      const node = childNodes.find((n) => n.id === line.nodeId);
      return { ...line, node };
    });

  // we have item requirement lines
  // want to show category -> itemA -> activity A : amount A, activity B : amount B, total amount

  const linesByItem = itemRequirementLinesWithNode.reduce((acc, line) => {
    const item = line.item;
    if (!acc[item._id]) acc[item._id] = [];
    acc[item._id].push(line);
    return acc;
  }, {} as Record<string, ItemRequirementInStore[]>);
  const allItemsFromLines = Object.values(linesByItem).flatMap((lines) => lines.map((line) => line.item));
  const itemIdsSet = new Set(allItemsFromLines.map((item) => item._id));
  const items = Array.from(itemIdsSet).map((id) => allItemsFromLines.find((item) => item._id === id)) as ItemInStore[];

  const itemsByCategory: Record<ItemCategory, ItemInStore[]> = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<ItemCategory, ItemInStore[]>);

  return (
    <div>
      <div>Items</div>
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <div key={category}>
          <div>{category}</div>
          {items.map((item) => (
            <div key={item._id}>
              {item.name}
              <div>
                {itemRequirementLinesWithNode
                  .filter((line) => line.item._id === item._id)
                  .map((line) => (
                    <div>
                      <div>
                        {line.node?.data.name} <QuantityCell quantity={line.quantity} /> at <RateCell rate={line.rate} />
                      </div>
                      <div>{line.details}</div>
                      <div>
                        <AmountFromRateAndQuantityCell rate={line.rate} quantity={line.quantity} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
