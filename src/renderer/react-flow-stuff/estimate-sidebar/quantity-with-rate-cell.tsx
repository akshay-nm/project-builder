import { Rate, Quantity } from '@/types';
import { RateCell } from '@/components/table-cells';
import { QuantityCell } from '@/components/table-cells';

/**
 * 10 kg at 10000/kg
 * This cell is used to display the quantity and rate of a requirement line.
 * It is used in the item aggregate and sub contract aggregate components.
 */
export const QuantityWithRateCell = ({ quantity, rate }: { quantity: Quantity; rate: Rate }) => {
  return (
    <div>
      <QuantityCell quantity={quantity} />
      &nbsp;at&nbsp;
      <RateCell rate={rate} />
    </div>
  );
};
