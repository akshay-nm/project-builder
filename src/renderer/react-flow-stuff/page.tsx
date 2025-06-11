'use client';

import { Link } from 'react-transition-progress/next';
import { ReactFlow, ReactFlowProvider, MiniMap, Background, Controls } from '@xyflow/react';

import CustomNode from './custom-node';
import useAnimatedNodes from './use-animated-nodes';
import useExpandCollapse from './use-expand-collapse';

import '@xyflow/react/dist/style.css';
import styles from './styles.module.css';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { useShallow } from 'zustand/react/shallow';
import { EstimateStoreState, useEstimateStore } from './store';
import { ManageItemsAndUnits } from './manage-items-and-units';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ManageNodeEstimate } from './estimate-sidebar/sidebar';
import { projectsApi } from '@/api/projects';
import { QueryKey } from '@/query-keys';
import { useQuery } from '@tanstack/react-query';
import { isEstimateSidebarOpenSelector, isUploadStructureCSVOpenSelector, projectPlanByIdSelector } from './selectors';
import { setIsManageItemsAndUnitsOpenSelector, setIsUploadStructureCSVOpenSelector } from './selectors';
import { isManageItemsAndUnitsOpenSelector } from './selectors';
import { UploadStructureCSV } from './upload-structures-csv';

const proOptions = { account: 'paid-pro', hideAttribution: true };

const nodeTypes = {
  custom: CustomNode,
};

type ExpandCollapseExampleProps = {
  treeWidth?: number;
  treeHeight?: number;
  animationDuration?: number;
};

const selector = (state: EstimateStoreState, projectId: string) => ({
  projectPlan: state.projectPlans[projectId],
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  addStructure: state.addStructure,
});

const Estimates = ({ treeWidth = 700, treeHeight = 250, animationDuration = 300 }: ExpandCollapseExampleProps = {}) => {
  const params = useParams();
  const { projectPlan, onNodesChange, onEdgesChange, onConnect, addStructure } = useEstimateStore(
    useShallow((state) => selector(state, params.project as string)),
  );

  const { nodes: visibleNodes, edges: visibleEdges } = useExpandCollapse(projectPlan.nodes, projectPlan.edges, { treeWidth, treeHeight });
  const { nodes: animatedNodes } = useAnimatedNodes(visibleNodes, {
    animationDuration,
  });
  const isManageItemsAndUnitsOpen = useEstimateStore(useShallow((state) => isManageItemsAndUnitsOpenSelector(state, params.project as string)));
  const setIsManageItemsAndUnitsOpen = useEstimateStore(useShallow(setIsManageItemsAndUnitsOpenSelector));
  const isEstimateSidebarOpen = useEstimateStore(useShallow((state) => isEstimateSidebarOpenSelector(state, params.project as string)));
  const isUploadStructureCSVOpen = useEstimateStore(useShallow((state) => isUploadStructureCSVOpenSelector(state, params.project as string)));
  const setIsUploadStructureCSVOpen = useEstimateStore(useShallow(setIsUploadStructureCSVOpenSelector));
  const { data: project } = useQuery({
    queryKey: [QueryKey.PROJECTS, params.project],
    queryFn: () => projectsApi.getById(params.project as string),
    enabled: !!params.project,
  });
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <div className="h-full w-full relative">
          <div className="absolute top-0 left-0 w-full z-10">
            <div className="flex p-2 bg-white shadow-md items-center justify-between overflow-x-auto">
              <div className="text-lg font-semibold">
                <span className="text-sm md:text-base font-bold uppercase text-black tracking-wide">{project?.name}</span>
              </div>
              <div>
                <Link href={`/onboarding/${params.project}/review`}>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-transform duration-200 hover:scale-[1.02]"
                  >
                    Review Project
                  </Button>
                </Link>
              </div>
            </div>

            {projectPlan.nodes.length > 0 && (
              <div className="flex gap-2 p-2 w-full overflow-x-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => addStructure(params.project as string)}
                >
                  + Add Structure
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => setIsManageItemsAndUnitsOpen(params.project as string, !isManageItemsAndUnitsOpen)}
                >
                  {isManageItemsAndUnitsOpen ? 'Close Items and Units Sidebar' : 'Manage Items and Units'}
                </Button>
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => setIsUploadStructureCSVOpen(params.project as string, !isUploadStructureCSVOpen)}
                >
                  {isUploadStructureCSVOpen ? 'Close Upload Structure CSV Sidebar' : 'Upload Structure CSV'}
                </Button> */}
              </div>
            )}
          </div>
          {projectPlan.nodes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-4 text-center bg-white">
              <div className="text-2xl font-semibold">No structures yet</div>
              <div className="text-sm text-muted-foreground">Let&apos;s start by adding your first structure!</div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => addStructure(params.project as string)}
                >
                  + Add Structure
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => setIsManageItemsAndUnitsOpen(params.project as string, !isManageItemsAndUnitsOpen)}
                >
                  {isManageItemsAndUnitsOpen ? 'Close Items and Units Sidebar' : 'Manage Items and Units'}
                </Button>
                {/* <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-500 hover:bg-white hover:text-blue-600 hover:border-blue-600 rounded-md transition-transform duration-200 hover:scale-[1.02]"
                  onClick={() => setIsUploadStructureCSVOpen(params.project as string, !isUploadStructureCSVOpen)}
                >
                  {isUploadStructureCSVOpen ? 'Close Upload Structure CSV Sidebar' : 'Upload Structure CSV'}
                </Button> */}
              </div>
            </div>
          ) : (
            <ReactFlow
              fitView
              onConnect={(connection) => onConnect(params.project as string, connection)}
              nodes={animatedNodes}
              edges={visibleEdges}
              onNodesChange={(changes) => onNodesChange(params.project as string, changes)}
              onEdgesChange={(changes) => onEdgesChange(params.project as string, changes)}
              proOptions={proOptions}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              className={styles.viewport}
              zoomOnDoubleClick={false}
            >
              <Background
                color="#e5e7eb" // Tailwind gray-200
                gap={16}
                size={1}
              />
              <MiniMap />
              <Controls />
            </ReactFlow>
          )}
        </div>
      </ResizablePanel>
      {isEstimateSidebarOpen && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ManageNodeEstimate />
          </ResizablePanel>
        </>
      )}
      {isManageItemsAndUnitsOpen && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <ManageItemsAndUnits />
          </ResizablePanel>
        </>
      )}
      {isUploadStructureCSVOpen && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel>
            <UploadStructureCSV />
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
};

// const validateProjectPlan = (projectPlan: ProjectPlanInStore) => {
//   const { nodes } = projectPlan;
//   if (nodes.filter((node) => !node.data.dateRange || !node.data.dateRange.to || !node.data.dateRange.from))
//     throw new Error('Date range is required for all structures and activities');
//   if (nodes.filter((node) => !node.data.name)) throw new Error('Name is required for all structures and activities');
// };

const EstimatesPage = () => {
  const params = useParams();
  const projectPlan = useEstimateStore(useShallow((state) => projectPlanByIdSelector(state, params.project as string)));
  // const addProjectPlan = useEstimateStore(useShallow(addProjectPlanSelector));

  // useEffect(() => {
  //   if (!projectPlan) {
  //     addProjectPlan(params.project as string);
  //   }
  // }, [projectPlan, addProjectPlan]);

  if (!projectPlan) {
    return <div>Loading...</div>;
  }

  return (
    <ReactFlowProvider>
      <Estimates />
    </ReactFlowProvider>
  );
};

export default EstimatesPage;
