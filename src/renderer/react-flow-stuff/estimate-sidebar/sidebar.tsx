import { cn } from '@/lib/utils';

import { SidebarHeader } from './header';
import { projectPlanSelector } from '../selectors';
import { useShallow } from 'zustand/react/shallow';
import { useEstimateStore } from '../store';
import { useState } from 'react';
import { AddRequirementLineCollapsible } from './add-requirement-line-collapsible';
import { AggregatedEstimateRows } from './aggregated-estimate-rows';
import { EstimateRows } from './estimate-rows';
import { useParams } from 'next/navigation';

export const ManageNodeEstimate = () => {
  const params = useParams();
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));
  const [isAddingRequirement, setIsAddingRequirement] = useState(false);

  if (!projectPlan) return null;

  return (
    <div className="flex flex-col w-full h-full divide-y">
      <div className="shrink-0">
        <SidebarHeader nodeId={projectPlan.estimateNodeId} />
      </div>
      <AggregatedEstimateRows nodeId={projectPlan.estimateNodeId} />
      <EstimateRows nodeId={projectPlan.estimateNodeId} />
      <div className={cn('p-2 mt-2', isAddingRequirement && 'shrink-0')}>
        <AddRequirementLineCollapsible nodeId={projectPlan.estimateNodeId} isOpen={isAddingRequirement} onOpenChange={setIsAddingRequirement} />
      </div>
    </div>
  );
};
