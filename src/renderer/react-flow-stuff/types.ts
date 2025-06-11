import { Quantity } from '@/types';
import { Node } from '@xyflow/react';
import { DateRange, Matcher } from 'react-day-picker';

export enum NodeType {
  STRUCTURE = 'structure',
  ACTIVITY = 'activity',
}

export type ExpandCollapseNodeData = {
  expanded: boolean;
  expandable?: boolean;
};

export type ExpandCollapseNode = Node<ExpandCollapseNodeData>;

type EstimationData = {
  items: Record<string, { quantity: Quantity; date: Date }>; // id is item._id, to show a table of items with quantity
  manpower: { trade: string; headCount: number; details: string; dateRange: DateRange }[]; // to show a daywise bar chart of manpower for each day in the node dateRange
};
// end goal is to show radar charts for each day comparing the requirement with actual on site situation

export type EstimateNodeData = ExpandCollapseNodeData & {
  type: NodeType;
  disabledDates?: Matcher;
  name?: string;
  dateRange?: DateRange;
  parentId?: string;
  parentStructureId?: string;
  estimationData?: EstimationData;
};

export type EstimateNode = Node<EstimateNodeData>;
