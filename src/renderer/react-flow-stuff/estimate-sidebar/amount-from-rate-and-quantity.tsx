import { MeasurementUnit } from '@/types';

import { AmountCell } from '@/components/table-cells';
import { getConversionFactorToTargetUnit } from '@/lib/get-conversion-factor-to-base-unit';
import { Rate, Quantity } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { QueryKey } from '@/query-keys';
import { measurementUnitsApi } from '@/api/measurement-units';
import { useParams } from 'next/navigation';
import { conversionsApi } from '@/api/conversions';

export const AmountFromRateAndQuantityCell = ({ rate, quantity }: { rate: Rate; quantity: Quantity }) => {
  const params = useParams();
  const { data: amount } = useQuery({
    queryKey: [QueryKey.CONVERSION_FACTOR, params.project as string, quantity?.unit, rate?.unit, quantity?.value, rate?.value],
    queryFn: () =>
      conversionsApi.getAmount({
        project: params.project as string,
        quantityUnit: quantity?.unit,
        quantityValue: quantity?.value,
        rateUnit: rate?.unit,
        rateValue: rate?.value,
      }),
  });
  return <AmountCell amount={amount} />;
};
