import '@testing-library/jest-dom';
import { expect, describe, it } from '@jest/globals';

import {
  ItemRequirementInStore,
  PermanentEmployeeRequirementInStore,
  LumpsumSubContractRequirementInStore,
  RequirementType,
  TradesmanRequirementInStore,
  UnitRateBasedSubContractRequirementInStore,
} from '../store';
import {
  getTotalForItemRequirement,
  getTotalForLumpsumSubContractRequirement,
  getTotalForPermanentEmployeeRequirement,
  getTotalForUnitRateBasedSubContractRequirement,
  getTotalFromAllItemRequirements,
  getTotalFromAllLumpsumSubContractRequirements,
  getTotalFromAllPermanentEmployeeRequirements,
  getTotalFromAllTradesmanRequirements,
  getTotalFromAllUnitRateBasedSubContractRequirements,
  getTotalFromTradesmanRequirement,
} from './total-utils';
import { MeasureType } from '@/types';
import { ItemCategory } from '@/types';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

describe('total-utils', () => {
  describe('line totals', () => {
    it('should get total for item requirement', () => {
      const requirement: ItemRequirementInStore = {
        _id: '1',
        nodeId: '1',
        item: { _id: '1', name: 'item', defaultMeasureUnit: 'm', category: ItemCategory.MATERIAL, measureType: MeasureType.LENGTH },
        quantity: { value: 1, unit: 'm' },
        rate: { value: 100, unit: 'm', currency: 'INR' },
        details: 'details',
      };
      const total = getTotalForItemRequirement({ requirement, customUnits: [] });
      expect(total.value).toBe(100);
      expect(total.currency).toBe('INR');
    });

    it('should get total for permanent employee requirement', () => {
      const requirement: PermanentEmployeeRequirementInStore = {
        _id: '1',
        nodeId: '1',
        designation: 'designation',
        headCount: 1,
        rate: { value: 100, unit: 'h', currency: 'INR' },
        details: 'details',
        isSubContract: false,
      };
      const total = getTotalForPermanentEmployeeRequirement({
        requirement,
        customUnits: [],
        dateRange: { from: new Date(), to: addDays(new Date(), 5) },
      });
      expect(total.value).toBe(100 * 8 * 5);
      expect(total.currency).toBe('INR');
    });

    it('should get total for lumpsum sub contract requirement', () => {
      const requirement: LumpsumSubContractRequirementInStore = {
        _id: '1',
        nodeId: '1',
        details: 'details',
        amount: { value: 100, currency: 'INR' },
      };
      const total = getTotalForLumpsumSubContractRequirement({ requirement, customUnits: [] });
      expect(total.value).toBe(100);
      expect(total.currency).toBe('INR');
    });

    it('should get total for unit rate based sub contract requirement', () => {
      const requirement: UnitRateBasedSubContractRequirementInStore = {
        _id: '1',
        nodeId: '1',
        quantity: { value: 1, unit: 'm' },
        rate: { value: 100, unit: 'm', currency: 'INR' },
        details: 'details',
      };
      const total = getTotalForUnitRateBasedSubContractRequirement({ requirement, customUnits: [] });
      expect(total.value).toBe(100);
      expect(total.currency).toBe('INR');
    });

    it('should get total for tradesman requirement', () => {
      const requirement: TradesmanRequirementInStore = {
        _id: '1',
        nodeId: '1',
        trade: 'trade',
        headCount: 1,
        rate: { value: 100, unit: 'h', currency: 'INR' },
        details: 'details',
        isSubContract: false,
      };
      const total = getTotalFromTradesmanRequirement({
        requirement,
        customUnits: [],
        dateRange: { from: new Date(), to: addDays(new Date(), 5) },
      });
      expect(total.value).toBe(100 * 8 * 5);
      expect(total.currency).toBe('INR');
    });
  });

  describe('line type wise totals', () => {
    it('should get total from all item requirements', () => {
      const requirements: ItemRequirementInStore[] = [
        {
          _id: '1',
          nodeId: '1',
          item: { _id: '1', name: 'item', defaultMeasureUnit: 'm', category: ItemCategory.MATERIAL, measureType: MeasureType.LENGTH },
          quantity: { value: 1, unit: 'm' },
          rate: { value: 100, unit: 'm', currency: 'INR' },
          details: 'details',
        },
      ];
      const total = getTotalFromAllItemRequirements({ requirements, customUnits: [] });
      expect(total.value).toBe(100);
      expect(total.currency).toBe('INR');
    });
    it('should get total from all permanent employee requirements', () => {
      const requirementsWithDateRange: { requirement: PermanentEmployeeRequirementInStore; dateRange: DateRange }[] = [
        {
          requirement: {
            _id: '1',
            nodeId: '1',
            designation: 'designation',
            headCount: 1,
            rate: { value: 100, unit: 'h', currency: 'INR' },
            details: 'details',
            isSubContract: false,
          },
          dateRange: { from: new Date(), to: addDays(new Date(), 5) },
        },
      ];
      const total = getTotalFromAllPermanentEmployeeRequirements({ requirementsWithDateRange, customUnits: [] });
      expect(total.value).toBe(100 * 8 * 5);
      expect(total.currency).toBe('INR');
    });
    it('should get total from all lumpsum sub contract requirements', () => {
      const requirements: LumpsumSubContractRequirementInStore[] = [
        {
          _id: '1',
          nodeId: '1',
          details: 'details',
          amount: { value: 100, currency: 'INR' },
        },
      ];
      const total = getTotalFromAllLumpsumSubContractRequirements({ requirements, customUnits: [] });
      expect(total.value).toBe(100);
      expect(total.currency).toBe('INR');
    });
    it('should get total from all unit rate based sub contract requirements', () => {
      const requirements: UnitRateBasedSubContractRequirementInStore[] = [
        {
          _id: '1',
          nodeId: '1',
          details: 'details',
          quantity: { value: 1, unit: 'm' },
          rate: { value: 100, unit: 'm', currency: 'INR' },
        },
      ];
      const total = getTotalFromAllUnitRateBasedSubContractRequirements({ requirements, customUnits: [] });
      expect(total.value).toBe(100);
      expect(total.currency).toBe('INR');
    });
    it('should get total from all tradesman requirements', () => {
      const requirementsWithDateRange: { requirement: TradesmanRequirementInStore; dateRange: DateRange }[] = [
        {
          requirement: {
            _id: '1',
            nodeId: '1',
            trade: 'trade',
            headCount: 1,
            rate: { value: 100, unit: 'h', currency: 'INR' },
            details: 'details',
            isSubContract: false,
          },
          dateRange: { from: new Date(), to: addDays(new Date(), 5) },
        },
      ];
      const total = getTotalFromAllTradesmanRequirements({ requirementsWithDateRange, customUnits: [] });
      expect(total.value).toBe(100 * 8 * 5);
      expect(total.currency).toBe('INR');
    });
  });
});
