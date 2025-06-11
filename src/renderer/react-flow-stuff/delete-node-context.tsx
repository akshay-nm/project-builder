import { createContext } from 'react';

export const DeleteNodeContext = createContext<((nodeId: string) => void) | undefined>(undefined);
