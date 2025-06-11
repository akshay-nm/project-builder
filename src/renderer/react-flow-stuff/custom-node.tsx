import { useCallback, useMemo } from 'react';
import { Handle, NodeProps, Position } from '@xyflow/react';

import { EstimateNode } from './types';
import { Input } from '@/components/ui/input';
import { DateRangePicker } from '@/components/filters/date-range-filter';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2Icon } from 'lucide-react';
import { EstimateStoreState, ProjectPlanInStore, useEstimateStore } from './store';
import { useShallow } from 'zustand/react/shallow';
import { useParams } from 'next/navigation';
import { DateRange } from 'react-day-picker';
import { projectsApi } from '@/api/projects';
import { useQuery } from '@tanstack/react-query';
import { QueryKey } from '@/query-keys';
import { isAfter, isBefore } from 'date-fns';
import { getCurrentProjectPlanSelector, updateNodeDataSelector, deleteNodeWithChildrenSelector, projectPlanSelector } from './selectors';
import { ImportFromCsv } from '@/components/csv';
import { SampleSCVDownload } from '@/components/csv';

// this function returns the label for the node based on the current state

const NodeTypeHeader = ({ id }: { id: string }) => {
  const params = useParams();
  const currentProjectPlan = useEstimateStore(useShallow((state) => getCurrentProjectPlanSelector(state, params.project as string)));
  const type = currentProjectPlan.nodes.find((node) => node.id === id)?.data.type;
  return <div className="capitalize">{type}</div>;
};

const NodeNameInput = ({ id }: { id: string }) => {
  const params = useParams();
  const updateNodeData = useEstimateStore(useShallow(updateNodeDataSelector));
  const currentProjectPlan = useEstimateStore(useShallow((state) => getCurrentProjectPlanSelector(state, params.project as string)));
  const name = currentProjectPlan.nodes.find((node) => node.id === id)?.data.name;

  return <Input placeholder="name" value={name} onChange={(e) => updateNodeData(params.project as string, id, { name: e.target.value })} />;
};

const NodeDateRangeFilter = ({ id }: { id: string }) => {
  const params = useParams();
  const { data: project } = useQuery({
    queryKey: [QueryKey.PROJECTS, params],
    queryFn: () => projectsApi.getById(params.project as string),
    enabled: !!params.project,
  });
  const disabledDates = useMemo(
    () =>
      !project
        ? false
        : {
            before: new Date(project.start),
            after: new Date(project.end),
          },
    [project],
  );
  const currentProjectPlan = useEstimateStore(useShallow((state) => getCurrentProjectPlanSelector(state, params.project as string)));
  const updateNodeData = useEstimateStore(useShallow(updateNodeDataSelector));
  const node = currentProjectPlan.nodes.find((node) => node.id === id);
  // Combine parent constraints

  if (!node) return null;
  const allParents = getAllParents(currentProjectPlan, node);
  const effectiveDisabledDates = !disabledDates
    ? false
    : combineMultipleParentConstraints(
        disabledDates,
        allParents.map((p) => p.data.dateRange),
      );
  return (
    <div>
      <DateRangePicker
        dateRange={node?.data.dateRange}
        setDateRange={(dateRange) => updateNodeData(params.project as string, id, { dateRange })}
        disabledDates={effectiveDisabledDates}
      />
    </div>
  );
};

const getAllParents = (projectPlan: ProjectPlanInStore, node: EstimateNode): EstimateNode[] => {
  const parent = projectPlan.nodes.find((n) => n.id === node.data.parentId);
  if (!parent) return [];
  return [parent, ...getAllParents(projectPlan, parent)];
};

const combineMultipleParentConstraints = (
  disabledDates: { before: Date; after: Date },
  dateRanges: (DateRange | undefined)[],
): { before: Date; after: Date } => {
  const filteredDateRanges = dateRanges.filter((range) => range !== undefined);
  if (!filteredDateRanges.length) return disabledDates;

  let latestFrom = disabledDates.before;
  let earliestTo = disabledDates.after;

  for (const range of filteredDateRanges) {
    if (range.from && isAfter(new Date(range.from), new Date(latestFrom))) {
      latestFrom = range.from;
    }
    if (range.to && isBefore(new Date(range.to), new Date(earliestTo))) {
      earliestTo = range.to;
    }
  }

  return {
    before: latestFrom,
    after: earliestTo,
  };
};

const DeleteNodeButton = ({ id }: { id: string }) => {
  const params = useParams();
  const deleteNodeWithChildren = useEstimateStore(useShallow(deleteNodeWithChildrenSelector));
  return (
    <Button
      variant="ghost"
      onClick={() => deleteNodeWithChildren?.(params.project as string, id)}
      size="sm"
      className="text-red-500 hover:bg-white hover:text-red-600 hover:border-red-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
    >
      <Trash2Icon className="w-4 h-4" />
    </Button>
  );
};

const setEstimateNodeIdSelector = (state: EstimateStoreState) => state.setEstimateNodeId;

const ExpandCollapseButton = ({ id }: { id: string }) => {
  const params = useParams();
  const updateNodeData = useEstimateStore(useShallow(updateNodeDataSelector));
  const currentProjectPlan = useEstimateStore(useShallow((state) => getCurrentProjectPlanSelector(state, params.project as string)));
  const node = currentProjectPlan.nodes.find((node) => node.id === id);
  const expanded = node?.data.expanded;
  const expandable = node?.data.expandable;
  const onNodeClick = useCallback(() => {
    updateNodeData(params.project as string, id, { expanded: !expanded });
  }, [updateNodeData, params.project, id, expanded]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onNodeClick}
      disabled={!expandable}
      className="text-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
    >
      {expandable ? (expanded ? 'Collapse' : 'Expand') : 'Not Expandable'}
    </Button>
  );
};

const setIsEstimateSidebarOpenSelector = (state: EstimateStoreState) => state.setIsEstimateSidebarOpen;
const estimateNodeIdSelector = (state: EstimateStoreState, projectId: string) => state.projectPlans[projectId]?.estimateNodeId;
const isEstimateSidebarOpenSelector = (state: EstimateStoreState, projectId: string) => state.projectPlans[projectId]?.isEstimateSidebarOpen;

const ManageNodeEstimateButton = ({ id }: { id: string }) => {
  const params = useParams();
  const setEstimateNodeId = useEstimateStore(useShallow(setEstimateNodeIdSelector));
  const setIsEstimateSidebarOpen = useEstimateStore(useShallow(setIsEstimateSidebarOpenSelector));
  const isEstimateSidebarOpen = useEstimateStore(useShallow((state) => isEstimateSidebarOpenSelector(state, params.project as string)));
  const estimateNodeId = useEstimateStore(useShallow((state) => estimateNodeIdSelector(state, params.project as string)));

  const shouldOpen = useMemo(() => {
    if (estimateNodeId === id && isEstimateSidebarOpen) {
      return false;
    }
    return true;
  }, [estimateNodeId, id, isEstimateSidebarOpen]);

  const projectPlan = useEstimateStore(useShallow((state) => projectPlanSelector(state, params.project as string)));
  const hasChildren = projectPlan.nodes.some((n) => n.data.parentId === id || n.data.parentStructureId === id);

  if (hasChildren) return null;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        setEstimateNodeId(params.project as string, id);
        setIsEstimateSidebarOpen(params.project as string, shouldOpen);
      }}
      className="text-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
    >
      {id === estimateNodeId && isEstimateSidebarOpen ? 'Close estimate' : 'Manage estimate'}
    </Button>
  );
};

// const DownloadSampleActivityCSV = () => {
//   return <SampleSCVDownload fields={['name', 'startDate(yyyy-mm-dd)', 'endDate(yyyy-mm-dd)']} />;
// };

// const UploadActivityCSV = ({ id }: { id: string }) => {
//   const params = useParams();
//   const { addActivity } = useEstimateStore(useShallow(selector));
//   return (
//     <ImportFromCsv
//       onUpload={async (rows) => {
//         for (const row of rows) {
//           const dateRange: DateRange = {
//             from: row['startDate(yyyy-mm-dd)'] ? new Date(row['startDate(yyyy-mm-dd)']) : undefined,
//             to: row['endDate(yyyy-mm-dd)'] ? new Date(row['endDate(yyyy-mm-dd)']) : undefined,
//           };

//           addActivity(params.project as string, id, { name: row.name, dateRange });
//         }
//       }}
//       dialogTitle="Upload Activity CSV"
//     />
//   );
// };

const Content = ({ id }: { id: string }) => {
  return (
    <Card className="bg-gray-50 border border-gray-300 rounded-xl shadow-sm text-sm">
      <CardHeader className="px-3 pt-2 pb-0">
        <CardTitle className="text-sm flex justify-between items-center text-gray-700 font-semibold">
          <NodeTypeHeader id={id} />
          <DeleteNodeButton id={id} />
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 flex flex-col gap-2">
        <NodeNameInput id={id} />
        <NodeDateRangeFilter id={id} />
      </CardContent>

      <CardFooter className="p-3 flex flex-wrap gap-2">
        <ExpandCollapseButton id={id} />
        <AddActivityToEstimateButton id={id} />
        <ManageNodeEstimateButton id={id} />
        {/* <DownloadSampleActivityCSV />
        <UploadActivityCSV id={id} /> */}
      </CardFooter>
    </Card>
  );
};

const selector = (state: EstimateStoreState) => ({
  addActivity: state.addActivity,
});

const AddActivityToEstimateButton = ({ id }: { id: string }) => {
  const { addActivity } = useEstimateStore(useShallow(selector));

  const params = useParams();
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => addActivity(params.project as string, id)}
      className="text-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
    >
      + activity
    </Button>
  );
};

export default function CustomNode({ data, id }: NodeProps<EstimateNode>) {
  return (
    <>
      <Content id={id} />
      <Handle position={Position.Top} type="target" />
      <Handle position={Position.Bottom} type="source" />
    </>
  );
}
