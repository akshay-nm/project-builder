import { useShallow } from 'zustand/react/shallow';
import { useEstimateStore } from '../store';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { XIcon } from 'lucide-react';
import { DateCell } from '@/components/detail-components/date-cell';
import { setEstimateNodeIdSelector, setIsEstimateSidebarOpenSelector } from '../selectors';
import { projectPlanSelector } from '../selectors';

export const SidebarHeader = ({ nodeId }: { nodeId: string }) => {
  const params = useParams();
  const setEstimateNodeId = useEstimateStore(useShallow(setEstimateNodeIdSelector));
  const setIsEstimateSidebarOpen = useEstimateStore(useShallow(setIsEstimateSidebarOpenSelector));
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));
  const node = projectPlan.nodes.find((n) => n.id === nodeId);

  return (
    <div className="flex flex-col w-full h-full">
      {/* HEADER */}
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
        <div className="flex flex-col gap-1">
          {node ? (
            <h2 className="text-base font-bold uppercase text-black tracking-wide">{node.data.name ?? node.id}</h2>
          ) : (
            <div className="text-sm text-muted-foreground">Loading...</div>
          )}
          {node?.data.dateRange && (
            <div className="text-xs text-muted-foreground flex gap-1">
              {/* Start date - End date in one line */}
              <DateCell date={node.data.dateRange?.from} formatString="MMM do yyyy" />
              <span>-</span>
              <DateCell date={node.data.dateRange?.to} formatString="MMM do yyyy" />
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700"
          onClick={() => {
            setEstimateNodeId(params.project as string, '');
            setIsEstimateSidebarOpen(params.project as string, false);
          }}
        >
          <XIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
