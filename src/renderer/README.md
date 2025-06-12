# Renderer Architecture

## Folder Structure

```
src/renderer/
├── components/          # Reusable UI components
│   ├── CustomNode.tsx   # Individual node component
│   ├── NodeEditForm.tsx # Node editing modal
│   ├── InputModal.tsx   # Generic input modal
│   ├── ConfirmDialog.tsx# Confirmation dialog
│   └── index.ts         # Component exports
├── hooks/               # Custom React hooks
│   └── useDependencyLogic.ts # Dependency selection logic
├── types/               # TypeScript type definitions
│   └── index.ts         # All interfaces and types
├── utils/               # Utility functions
│   └── treeUtils.ts     # Tree conversion and manipulation
├── styles/              # CSS and styling (future use)
├── Chart.tsx            # Main chart component
├── App.tsx              # Application root
└── index.tsx            # Renderer entry point
```

## Key Features

### Dependency System
- **Root nodes**: Can connect to any other node
- **Child nodes**: Cannot connect to ancestors or other root nodes
- **Visual distinction**: Dependency edges are green and dashed

### Component Architecture
- **Modular design**: Each component has a single responsibility
- **Type safety**: Full TypeScript coverage with centralized types
- **Clean separation**: Logic separated from UI components

### Best Practices
- **Minimal comments**: Only essential explanations kept
- **Custom hooks**: Complex logic extracted to reusable hooks
- **Utility functions**: Pure functions for data transformations
- **Consistent naming**: Clear, descriptive component and function names

## Usage

Import the main Chart component:
```typescript
import { Chart } from './Chart';
import type { TreeNode, TreeProps } from './types';
```

The Chart component handles all tree visualization and editing functionality with a clean, modern interface. 