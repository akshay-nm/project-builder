import { differenceInDays } from 'date-fns';
import { MeasurementUnit } from '@/types';
import { Rate } from '@/types';
import { DateRange } from 'react-day-picker';
import { AmountCell } from '@/components/table-cells';
import { getPerWorkingDayRate } from './total-utils';
import { QueryKey } from '@/query-keys';
import { measurementUnitsApi } from '@/api/measurement-units';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

export const TotalFromRateDateRangeAndHeadCount = ({ rate, headCount, dateRange }: { rate: Rate; headCount: number; dateRange?: DateRange }) => {
  const params = useParams();
  const measurementUnitsQuery = useQuery({
    queryKey: [QueryKey.MEASUREMENT_UNITS, { project: params.project as string }],
    queryFn: () => measurementUnitsApi.get({ project: params.project as string, limit: 1000 }),
  });
  const customUnits = measurementUnitsQuery.data?.data ?? [];
  if (!dateRange?.from || !dateRange?.to) return <div>No date range</div>;
  const amount = getTotalFromRateDateRangeAndHeadCount({ rate, headCount, dateRange, customUnits });
  return <AmountCell amount={{ value: amount, currency: rate.currency }} />;
};

export const getTotalFromRateDateRangeAndHeadCount = ({
  rate,
  headCount,
  dateRange,
  customUnits,
}: {
  rate: Rate;
  headCount: number;
  dateRange?: DateRange;
  customUnits: MeasurementUnit[];
}) => {
  if (!dateRange?.from || !dateRange?.to) return 0;
  if (!rate?.unit || !rate?.currency) return 0;
  const days = differenceInDays(dateRange.to, dateRange.from);
  const perDayRate = getPerWorkingDayRate({ rate, customUnits });
  console.log({ perDayRate, days, headCount });
  return perDayRate * headCount * days;
};
