import { MeasurementUnit, Rate, RequirementType } from '@/types';
import {
  ItemRequirementInStore,
  TradesmanRequirementInStore,
  LumpsumSubContractRequirementInStore,
  PermanentEmployeeRequirementInStore,
  UnitRateBasedSubContractRequirementInStore,
} from '../store';
import { getConversionFactorToTargetUnit } from '@/lib/get-conversion-factor-to-base-unit';
import { DateRange } from 'react-day-picker';
import { differenceInDays } from 'date-fns';
import { EstimateNode } from '../types';

export const getTotalForRequirement = ({ requirement, customUnits, node }: { requirement: any; customUnits: MeasurementUnit[]; node: EstimateNode }) => {
  if (!requirement) return { value: 0, currency: 'INR' };
  if (requirement.requirementType === RequirementType.ITEM) return getTotalForItemRequirement({ requirement, customUnits });
  if (requirement.requirementType === RequirementType.TRADESMAN)
    return getTotalFromTradesmanRequirement({ requirement, customUnits, dateRange: node.data.dateRange! });
  if (requirement.requirementType === RequirementType.PERMANENT_EMPLOYEE)
    return getTotalForPermanentEmployeeRequirement({ requirement, customUnits, dateRange: node.data.dateRange! });
  if (requirement.requirementType === RequirementType.LUMPSUM_SUB_CONTRACT) return getTotalForLumpsumSubContractRequirement({ requirement, customUnits });
  if (requirement.requirementType === RequirementType.UNIT_RATE_BASED_SUB_CONTRACT)
    return getTotalForUnitRateBasedSubContractRequirement({ requirement, customUnits });
  return { value: 0, currency: 'INR' };
};

export const getTotalForItemRequirement = ({ requirement, customUnits }: { requirement?: ItemRequirementInStore; customUnits: MeasurementUnit[] }) => {
  if (!requirement?.item || !requirement?.quantity?.unit || !requirement?.rate?.unit) return { value: 0, currency: 'INR' };
  const conversionFactor = getConversionFactorToTargetUnit(requirement.rate.unit, customUnits, requirement.quantity.unit);
  return {
    value: requirement.rate.value * requirement.quantity.value * conversionFactor,
    currency: 'INR',
  };
};

export const getPerWorkingDayRate = ({ rate, customUnits }: { rate: Rate; customUnits: MeasurementUnit[] }) => {
  const conversionFactor = 1 / getConversionFactorToTargetUnit(rate.unit, customUnits, 'day');
  const workingDayConversionFactor = 8 / 24; // 8 hours per day

  return rate.value * conversionFactor * workingDayConversionFactor;
};

export const getTotalForPermanentEmployeeRequirement = ({
  requirement,
  customUnits,
  dateRange,
}: {
  requirement?: PermanentEmployeeRequirementInStore;
  customUnits: MeasurementUnit[];
  dateRange: DateRange;
}) => {
  if (!requirement?.headCount || !requirement?.rate?.unit) return { value: 0, currency: 'INR' };
  if (!dateRange.from || !dateRange.to) return { value: 0, currency: 'INR' };
  const perDayRate = getPerWorkingDayRate({ rate: requirement.rate, customUnits });

  const total = requirement.headCount * perDayRate * differenceInDays(dateRange.to, dateRange.from);

  return {
    value: total,
    currency: 'INR',
  };
};
export const getTotalForLumpsumSubContractRequirement = ({
  requirement,
  customUnits,
}: {
  requirement?: LumpsumSubContractRequirementInStore;
  customUnits: MeasurementUnit[];
}) => {
  return {
    value: requirement?.amount?.value ?? 0,
    currency: 'INR',
  };
};
export const getTotalForUnitRateBasedSubContractRequirement = ({
  requirement,
  customUnits,
}: {
  requirement?: UnitRateBasedSubContractRequirementInStore;
  customUnits: MeasurementUnit[];
}) => {
  if (!requirement?.rate?.unit || !requirement?.quantity?.unit) return { value: 0, currency: 'INR' };
  const conversionFactor = getConversionFactorToTargetUnit(requirement.rate.unit, customUnits, requirement.quantity.unit);
  const total = requirement.rate.value * requirement.quantity.value * conversionFactor;

  return {
    value: total,
    currency: 'INR',
  };
};
export const getTotalFromTradesmanRequirement = ({
  requirement,
  customUnits,
  dateRange,
}: {
  requirement?: TradesmanRequirementInStore;
  customUnits: MeasurementUnit[];
  dateRange: DateRange;
}) => {
  if (!requirement?.headCount || !requirement?.rate?.unit) return { value: 0, currency: 'INR' };
  if (!dateRange.from || !dateRange.to) return { value: 0, currency: 'INR' };
  const perDayRate = getPerWorkingDayRate({ rate: requirement.rate, customUnits });
  const total = requirement.headCount * perDayRate * differenceInDays(dateRange.to, dateRange.from);
  return {
    value: total,
    currency: 'INR',
  };
};

export const getTotalFromAllItemRequirements = ({ requirements, customUnits }: { requirements: ItemRequirementInStore[]; customUnits: MeasurementUnit[] }) => {
  return {
    value: requirements.reduce((acc, requirement) => acc + getTotalForItemRequirement({ requirement, customUnits }).value, 0),
    currency: 'INR',
  };
};
export const getTotalFromAllPermanentEmployeeRequirements = ({
  requirementsWithDateRange,
  customUnits,
}: {
  requirementsWithDateRange: { requirement: PermanentEmployeeRequirementInStore; dateRange: DateRange }[];
  customUnits: MeasurementUnit[];
}) => {
  let total = 0;
  for (const { requirement, dateRange } of requirementsWithDateRange) {
    const current = getTotalForPermanentEmployeeRequirement({ requirement, customUnits, dateRange }).value;
    total += current;
    console.log({ total, current, dateRange, requirement });
  }
  return {
    value: total,
    currency: 'INR',
  };
};
export const getTotalFromAllLumpsumSubContractRequirements = ({
  requirements,
  customUnits,
}: {
  requirements: LumpsumSubContractRequirementInStore[];
  customUnits: MeasurementUnit[];
}) => {
  return {
    value: requirements.reduce((acc, requirement) => acc + getTotalForLumpsumSubContractRequirement({ requirement, customUnits }).value, 0),
    currency: 'INR',
  };
};
export const getTotalFromAllUnitRateBasedSubContractRequirements = ({
  requirements,
  customUnits,
}: {
  requirements: UnitRateBasedSubContractRequirementInStore[];
  customUnits: MeasurementUnit[];
}) => {
  return {
    value: requirements.reduce((acc, requirement) => acc + getTotalForUnitRateBasedSubContractRequirement({ requirement, customUnits }).value, 0),
    currency: 'INR',
  };
};
export const getTotalFromAllTradesmanRequirements = ({
  requirementsWithDateRange,
  customUnits,
}: {
  requirementsWithDateRange: { requirement: TradesmanRequirementInStore; dateRange: DateRange }[];
  customUnits: MeasurementUnit[];
}) => {
  let total = 0;
  for (const { requirement, dateRange } of requirementsWithDateRange) {
    const current = getTotalFromTradesmanRequirement({ requirement, customUnits, dateRange }).value;
    total += current;
    console.log({ total, current, dateRange, requirement });
  }
  return {
    value: total,
    currency: 'INR',
  };
};
