import { create } from 'zustand';
import { addEdge, applyNodeChanges, applyEdgeChanges, Edge, Connection, EdgeChange, NodeChange } from '@xyflow/react';
import { EstimateNode, EstimateNodeData, NodeType } from './types';
import short from 'short-uuid';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  ActivitySubContractType,
  Amount,
  EmployeeType,
  Item,
  MeasurementUnit,
  Permission,
  Quantity,
  Rate,
  Ref,
  SubContractStatus,
  SubContractType,
} from '@/types';

export type ItemInStore = Omit<Item, 'createdAt' | 'createdBy' | 'project' | 'sequence'>;

type RequirementLine = { _id: string; nodeId: string };

export type ItemRequirementInStore = RequirementLine & { item: ItemInStore; quantity: Quantity; rate: Rate; details: string };
export type TradesmanRequirementInStore = RequirementLine & {
  trade: string;
  headCount: number;
  details: string;
  rate: Rate;
  isSubContract: boolean;
};
export type PermanentEmployeeRequirementInStore = RequirementLine & {
  designation: string;
  headCount: number;
  details: string;
  rate: Rate;
  isSubContract: boolean;
};
export type LumpsumSubContractRequirementInStore = RequirementLine & { details: string; amount: Amount };
export type UnitRateBasedSubContractRequirementInStore = RequirementLine & { details: string; quantity: Quantity; rate: Rate };

export enum RequirementType {
  ITEM = 'item',
  TRADESMAN = 'tradesman',
  LUMPSUM_SUB_CONTRACT = 'lumpsumSubContract',
  UNIT_RATE_BASED_SUB_CONTRACT = 'unitRateBasedSubContract',
}

export type NodeRequirement =
  | ItemRequirementInStore
  | TradesmanRequirementInStore
  | PermanentEmployeeRequirementInStore
  | LumpsumSubContractRequirementInStore
  | UnitRateBasedSubContractRequirementInStore;

export type NodeRequirements = {
  _id: string;
  nodeId: string;
  settings: {};
  item: ItemRequirementInStore[];
  tradesman: TradesmanRequirementInStore[];
  permanentEmployee: PermanentEmployeeRequirementInStore[];
  lumpsumSubContract: LumpsumSubContractRequirementInStore[];
  unitRateBasedSubContract: UnitRateBasedSubContractRequirementInStore[];
};

export type SubContractorInStore = { id: string; name: string; email: string; phoneNumber: string };
export type SupplierInStore = { id: string; name: string; email: string; phoneNumber: string };
export type SubContractInStore = {
  id: string;
  details: string;
  subContractor: string;
  structureIds?: string;
  activityIds?: string;
  type: SubContractType;
  activitySubContractType?: ActivitySubContractType;
  amount?: Amount;
  quantity?: Quantity;
  rate?: Rate;
  requirementIds?: string[];
  status?: SubContractStatus;
};

export type AccessPoliciesInStore = {
  id: string;
  title: string;
  description: string;
  permissions: Permission[];
  isRoot?: boolean;
};

export type EmployeeInStore = {
  id: string;
  name: string;
  emails: string[];
  phoneNumbers: string[];
  sequence: number;
  appointment: string;
  compensation?: Rate;
  expiredAt?: Date;
  subContractorId?: string;
  subContractId?: string;
  type: EmployeeType;
  accessPolicyIds: string[];
  hasAppAccess: boolean;
  defaultFeature?: string;
  requirementIds: string[];
};

export interface ProjectPlanInStore {
  isManageItemsAndUnitsOpen: boolean;
  isEstimateSidebarOpen: boolean;
  isUploadStructureCSVOpen: boolean;
  estimateNodeId: string;
  nodes: EstimateNode[];
  edges: Edge[];
  requirements: NodeRequirements[];
  units: {
    standard: StandardUnits;
  };
  employees: EmployeeInStore[];
  subContractors: SubContractorInStore[];
  subContracts: SubContractInStore[];
  suppliers: SupplierInStore[];
  accessPolicies: AccessPoliciesInStore[];
}

export interface EstimateStoreState {
  projectPlans: Record<string, ProjectPlanInStore>;

  setIsManageItemsAndUnitsOpen: (projectId: string, isOpen: boolean) => void;
  setIsEstimateSidebarOpen: (projectId: string, isOpen: boolean) => void;
  setIsUploadStructureCSVOpen: (projectId: string, isOpen: boolean) => void;
  setEstimateNodeId: (projectId: string, nodeId: string) => void;
  addProjectPlan: (projectId: string, initialData?: ProjectPlanInStore) => void;
  deleteProjectPlan: (projectId: string) => void;

  onNodesChange: (projectId: string, changes: NodeChange<EstimateNode>[]) => void;
  onEdgesChange: (projectId: string, changes: EdgeChange[]) => void;
  onConnect: (projectId: string, connection: Connection) => void;
  setNodes: (projectId: string, nodes: EstimateNode[]) => void;
  setEdges: (projectId: string, edges: Edge[]) => void;

  addStructure: (projectId: string, data?: Partial<EstimateNodeData>) => void;
  addActivity: (projectId: string, parentId: string, data?: Partial<EstimateNodeData>) => void;
  deleteNodeWithChildren: (projectId: string, nodeId: string) => void;
  updateNodeData: (projectId: string, nodeId: string, data: Partial<EstimateNodeData>) => void;

  updateStandardUnits: (projectId: string, units: StandardUnits) => void;

  addRequirementLine: (projectId: string, nodeId: string, requirementType: RequirementType, requirement: NodeRequirement) => void;
  updateRequirementLine: (projectId: string, nodeId: string, requirementType: RequirementType, requirementId: string, requirement: NodeRequirement) => void;
  deleteRequirementLine: (projectId: string, nodeId: string, requirementType: RequirementType, requirementId: string) => void;
}

export const defaultStandardUnits: StandardUnits = {
  temperature: ['K'],
  angle: ['°'],
  area: ['m²', 'km²', 'cm²', 'in²', 'ft²'],
  time: ['s', 'min', 'h', 'd', 'wk', 'mo'],
  volume: ['m³', 'km³', 'L', 'mL', 'ft³', 'in³'],
  force: ['N'],
  length: ['m', 'km', 'cm', 'mm'],
  mass: ['g', 'kg', 'mg', 't', 'kt'],
  power: ['W', 'TW', 'GW', 'MW', 'kW'],
  pressure: ['Pa', 'kPa', 'bar', 'psi', 'atm'],
  count: ['pcs'],
  data: [],
  energy: [],
};

export type StandardUnits = {
  temperature: string[];
  angle: string[];
  area: string[];
  time: string[];
  volume: string[];
  force: string[];
  length: string[];
  mass: string[];
  power: string[];
  pressure: string[];
  count: string[];
  data: string[];
  energy: string[];
};
// this is our useStore hook that we can use in our components to get parts of the store and call actions
export const useEstimateStore = create<EstimateStoreState>()(
  persist(
    (set, get) => ({
      projectPlans: {},
      setIsManageItemsAndUnitsOpen: (projectId, isOpen) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: { ...get().projectPlans[projectId], isManageItemsAndUnitsOpen: isOpen },
          },
        });
      },
      setIsEstimateSidebarOpen: (projectId, isOpen) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: { ...get().projectPlans[projectId], isEstimateSidebarOpen: isOpen },
          },
        });
      },
      setIsUploadStructureCSVOpen: (projectId, isOpen) => {
        set({
          projectPlans: { ...get().projectPlans, [projectId]: { ...get().projectPlans[projectId], isUploadStructureCSVOpen: isOpen } },
        });
      },
      setEstimateNodeId: (projectId, nodeId) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: { ...get().projectPlans[projectId], estimateNodeId: nodeId },
          },
        });
      },
      addProjectPlan: (projectId, initialData) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: initialData || {
              isManageItemsAndUnitsOpen: false,
              isEstimateSidebarOpen: false,
              isUploadStructureCSVOpen: false,
              estimateNodeId: '',
              nodes: [],
              edges: [],
              units: { standard: defaultStandardUnits },
              requirements: [],
              employees: [],
              suppliers: [],
              subContractors: [],
              subContracts: [],
              accessPolicies: [],
            },
          },
        });
      },
      deleteProjectPlan: (projectId) => {
        const { [projectId]: _, ...remainingPlans } = get().projectPlans;
        set({
          projectPlans: remainingPlans,
        });
      },
      onNodesChange: (projectId, changes) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              nodes: applyNodeChanges(changes, get().projectPlans[projectId].nodes),
            },
          },
        });
      },
      onEdgesChange: (projectId, changes) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              edges: applyEdgeChanges(changes, get().projectPlans[projectId].edges),
            },
          },
        });
      },
      onConnect: (projectId, connection) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              edges: addEdge(connection, get().projectPlans[projectId].edges),
            },
          },
        });
      },
      setNodes: (projectId, nodes) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              nodes: nodes,
            },
          },
        });
      },
      setEdges: (projectId, edges) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              edges: edges,
            },
          },
        });
      },
      addStructure: (projectId, data: Partial<EstimateNodeData> = {}) => {
        const structureId = short.generate();
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              nodes: [
                ...get().projectPlans[projectId].nodes,
                {
                  id: structureId,
                  position: { x: 0, y: 0 },
                  type: 'custom',
                  data: { expanded: false, type: NodeType.STRUCTURE, ...data },
                  deletable: false,
                },
              ],
              requirements: [
                ...get().projectPlans[projectId].requirements,
                {
                  _id: short.generate(),
                  nodeId: structureId,
                  item: [],
                  tradesman: [],
                  permanentEmployee: [],
                  lumpsumSubContract: [],
                  unitRateBasedSubContract: [],
                  settings: { isSubContracted: false, subContractRequirementType: undefined },
                },
              ],
            },
          },
        });
      },
      addActivity: (projectId, parentId, data: Partial<EstimateNodeData> = {}) => {
        const activityId = short.generate();
        const parentNode = get().projectPlans[projectId].nodes.find((node) => node.id === parentId);
        if (!parentNode) throw new Error('Parent node not found'); // this should never happen

        const parentStructureId = parentNode.data.type === NodeType.STRUCTURE ? parentId : parentNode.data.parentStructureId;
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              nodes: [
                ...get().projectPlans[projectId].nodes.map((node) => {
                  if (node.id === parentNode.id) {
                    return {
                      ...node,
                      data: {
                        ...node.data,
                        expanded: true,
                      },
                      deletable: false,
                    };
                  }
                  return node;
                }),
                {
                  id: activityId,
                  position: { x: parentNode.position.x, y: parentNode.position.y + 100 },
                  type: 'custom',
                  data: { expanded: false, expandable: false, type: NodeType.ACTIVITY, parentStructureId, parentId, ...data },
                },
              ],
              edges: [...get().projectPlans[projectId].edges, { id: `${parentId}->${activityId}`, source: parentId, target: activityId }],
              requirements: [
                ...get().projectPlans[projectId].requirements,
                {
                  _id: short.generate(),
                  nodeId: activityId,
                  item: [],
                  tradesman: [],
                  permanentEmployee: [],
                  lumpsumSubContract: [],
                  unitRateBasedSubContract: [],
                  settings: { isSubContracted: false, subContractRequirementType: undefined },
                },
              ],
            },
          },
        });
      },
      deleteNodeWithChildren: (projectId, nodeId: string) => {
        const findDescendants = (id: string): string[] => {
          const directChildren = get().projectPlans[projectId].nodes.filter((node) => node.data.parentId === id);
          return directChildren.reduce((all, child) => [...all, child.id, ...findDescendants(child.id)], [] as string[]);
        };

        const allToDelete = [nodeId, ...findDescendants(nodeId)];
        const isEstimateSidebarOpen = get().projectPlans[projectId].isEstimateSidebarOpen;
        const estimateNodeId = get().projectPlans[projectId].estimateNodeId;

        const updatedRequirements = get().projectPlans[projectId].requirements.filter((requirement) => !allToDelete.includes(requirement.nodeId));

        const updatedIsEstimateSidebarOpen = allToDelete.includes(estimateNodeId) ? false : isEstimateSidebarOpen;
        const updatedEstimateNodeId = allToDelete.includes(estimateNodeId) ? '' : estimateNodeId;

        const updatedNodes = get().projectPlans[projectId].nodes.filter((node) => !allToDelete.includes(node.id));
        const updatedEdges = get().projectPlans[projectId].edges.filter((edge) => !allToDelete.includes(edge.source) && !allToDelete.includes(edge.target));
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              nodes: updatedNodes,
              edges: updatedEdges,
              requirements: updatedRequirements,
              isEstimateSidebarOpen: updatedIsEstimateSidebarOpen,
              estimateNodeId: updatedEstimateNodeId,
            },
          },
        });
      },
      updateNodeData: (projectId, nodeId, newNodeData) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              nodes: get().projectPlans[projectId].nodes.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...newNodeData } } : node)),
            },
          },
        });
      },
      updateStandardUnits: (projectId, units) => {
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: { ...get().projectPlans[projectId], units: { ...get().projectPlans[projectId].units, standard: units } },
          },
        });
      },

      addRequirementLine: (projectId, nodeId, requirementType, requirementData) => {
        const newRequirementLine = { ...requirementData, _id: short.generate(), nodeId, requirementType };
        const node = get().projectPlans[projectId].nodes.find((n) => n.id === nodeId);
        if (!node) throw new Error('Node not found');
        const requirement = get().projectPlans[projectId].requirements.find((r) => r.nodeId === nodeId);
        if (!requirement) throw new Error('Requirement not found');

        const updatedRequirementLines = { ...requirement, [requirementType]: [...requirement[requirementType], newRequirementLine] };
        const updatedRequirements = get().projectPlans[projectId].requirements.map((r) => (r._id === requirement._id ? updatedRequirementLines : r));
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              requirements: updatedRequirements,
            },
          },
        });
      },
      updateRequirementLine: (projectId, nodeId, requirementType, requirementId, requirementData) => {
        const requirement = get().projectPlans[projectId].requirements.find((r) => r.nodeId === nodeId);
        if (!requirement) throw new Error('Requirement not found');
        const updatedRequirementLines = {
          ...requirement,
          [requirementType]: requirement[requirementType].map((r) => (r._id === requirementId ? { ...r, ...requirementData } : r)),
        };
        const updatedRequirements = get().projectPlans[projectId].requirements.map((r) => (r._id === requirement._id ? updatedRequirementLines : r));
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: {
              ...get().projectPlans[projectId],
              requirements: updatedRequirements,
            },
          },
        });
      },
      deleteRequirementLine: (projectId, nodeId, requirementType, requirementId) => {
        const requirement = get().projectPlans[projectId].requirements.find((r) => r.nodeId === nodeId);
        if (!requirement) throw new Error('Requirement not found');
        const updatedRequirementLines = {
          ...requirement,
          [requirementType]: requirement[requirementType].filter((r) => r._id !== requirementId),
        };
        const updatedRequirements = get().projectPlans[projectId].requirements.map((r) => (r._id === requirement._id ? updatedRequirementLines : r));
        set({
          projectPlans: {
            ...get().projectPlans,
            [projectId]: { ...get().projectPlans[projectId], requirements: updatedRequirements },
          },
        });
      },
    }),

    {
      name: 'onboarding-store',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
