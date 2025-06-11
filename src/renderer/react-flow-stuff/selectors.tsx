import { EstimateStoreState } from './store';

export const addRequirementLineSelector = (state: EstimateStoreState) => state.addRequirementLine;
export const deleteRequirementLineSelector = (state: EstimateStoreState) => state.deleteRequirementLine;
export const setEstimateNodeIdSelector = (state: EstimateStoreState) => state.setEstimateNodeId;
export const projectPlanSelector = (state: EstimateStoreState, projectId: string) => state.projectPlans[projectId];
export const setIsEstimateSidebarOpenSelector = (state: EstimateStoreState) => state.setIsEstimateSidebarOpen;
export const updateRequirementLineSelector = (state: EstimateStoreState) => state.updateRequirementLine;
export const isManageItemsAndUnitsOpenSelector = (state: EstimateStoreState, projectId: string) => state.projectPlans[projectId]?.isManageItemsAndUnitsOpen;
export const setIsManageItemsAndUnitsOpenSelector = (state: EstimateStoreState) => state.setIsManageItemsAndUnitsOpen;
export const isEstimateSidebarOpenSelector = (state: EstimateStoreState, projectId: string) => state.projectPlans[projectId]?.isEstimateSidebarOpen;
export const isUploadStructureCSVOpenSelector = (state: EstimateStoreState, projectId: string) => state.projectPlans[projectId]?.isUploadStructureCSVOpen;
export const setIsUploadStructureCSVOpenSelector = (state: EstimateStoreState) => state.setIsUploadStructureCSVOpen;
export const projectPlanByIdSelector = (state: EstimateStoreState, id: string) => state.projectPlans[id];
export const addProjectPlanSelector = (state: EstimateStoreState) => state.addProjectPlan;
export const deleteNodeWithChildrenSelector = (state: EstimateStoreState) => state.deleteNodeWithChildren;
export const getCurrentProjectPlanSelector = (state: EstimateStoreState, projectId: string) => state.projectPlans[projectId];
export const updateNodeDataSelector = (state: EstimateStoreState) => state.updateNodeData;
