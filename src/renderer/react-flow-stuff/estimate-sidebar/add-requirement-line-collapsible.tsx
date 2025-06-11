import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectContent } from '@/components/ui/select';

import { CollapsibleContent } from '@/components/ui/collapsible';

import { PlusIcon } from 'lucide-react';

import { CollapsibleTrigger } from '@/components/ui/collapsible';

import { useEffect } from 'react';

import { RequirementType } from '../store';

import { useShallow } from 'zustand/react/shallow';

import { projectPlanSelector } from '../selectors';
import { addRequirementLineSelector } from '../selectors';
import { useParams } from 'next/navigation';

import { Collapsible } from '@/components/ui/collapsible';
import { useEstimateStore } from '../store';
import { useState } from 'react';
import { XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  ItemRequirementLineForm,
  LumpsumSubContractRequirementLineForm,
  TradesmanRequirementLineForm,
  UnitRateBasedSubContractRequirementLineForm,
} from '../add-requirement-line-forms';

export const AddRequirementLineCollapsible = ({ nodeId, isOpen, onOpenChange }: { nodeId: string; isOpen: boolean; onOpenChange: (open: boolean) => void }) => {
  const params = useParams();
  const addRequirementLine = useEstimateStore(useShallow(addRequirementLineSelector));
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));
  const requirement = projectPlan.requirements.find((r) => r.nodeId === nodeId);
  const [requirementType, setRequirementType] = useState<RequirementType | undefined>();

  if (!requirement) return <div>No requirement found</div>;
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full hover:bg-white text-blue-500 hover:border-blue-600 hover:text-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
          onClick={() => onOpenChange(!isOpen)}
        >
          {isOpen ? <XIcon className="w-4 h-4 mr-2" /> : <PlusIcon className="w-4 h-4 mr-2" />}
          {isOpen ? 'Close' : 'Add Requirement'}
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="pt-4">
        <div className="border rounded-md p-4 space-y-4 ">
          {/* Requirement Type Select */}
          <Select value={requirementType} onValueChange={(value) => setRequirementType(value as RequirementType)}>
            <SelectTrigger>
              <SelectValue placeholder={'Select requirement type'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={RequirementType.UNIT_RATE_BASED_SUB_CONTRACT}>Unit rate based sub-contract</SelectItem>
              <SelectItem value={RequirementType.LUMPSUM_SUB_CONTRACT}>Lumpsum sub-contract</SelectItem>
              <SelectItem value={RequirementType.ITEM}>Item</SelectItem>
              <SelectItem value={RequirementType.TRADESMAN}>Tradesman</SelectItem>
            </SelectContent>
          </Select>

          {/* Dynamic Form based on selection */}
          <div className="space-y-4">
            {requirementType === RequirementType.ITEM && (
              <ItemRequirementLineForm onSubmit={(data) => addRequirementLine(params.project as string, nodeId, RequirementType.ITEM, data as any)} />
            )}
            {requirementType === RequirementType.TRADESMAN && (
              <TradesmanRequirementLineForm onSubmit={(data) => addRequirementLine(params.project as string, nodeId, RequirementType.TRADESMAN, data as any)} />
            )}

            {requirementType === RequirementType.UNIT_RATE_BASED_SUB_CONTRACT && (
              <UnitRateBasedSubContractRequirementLineForm
                onSubmit={(data) => addRequirementLine(params.project as string, nodeId, RequirementType.UNIT_RATE_BASED_SUB_CONTRACT, data as any)}
              />
            )}
            {requirementType === RequirementType.LUMPSUM_SUB_CONTRACT && (
              <LumpsumSubContractRequirementLineForm
                onSubmit={(data) => addRequirementLine(params.project as string, nodeId, RequirementType.LUMPSUM_SUB_CONTRACT, data as any)}
              />
            )}
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
