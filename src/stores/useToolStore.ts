import { create } from 'zustand';
import { Tool, ToolStatus } from '../types';
import { generateId } from '../utils/generateId';

interface ToolState {
  tools: Tool[];

  // Actions
  addTool: (tool: Omit<Tool, 'id'>) => Tool;
  updateTool: (tool: Tool) => void;
  deleteTool: (toolId: string) => void;
  setToolStatus: (toolId: string, status: ToolStatus, holderId?: string) => void;
  updateToolGroups: (toolIds: string[], groupId: string, ownerId: string) => void;
  initializeTools: () => void;
}

const MOCK_TOOLS: Tool[] = [
  {
    id: 't1',
    ownerId: 'u2',
    name: 'Cordless Drill',
    description: '18V Brushless Compact Drill/Driver',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
    price: 120,
    category: 'Power Tools',
    status: ToolStatus.AVAILABLE,
    groupIds: ['g1'],
  },
  {
    id: 't2',
    ownerId: 'u1',
    name: 'Circular Saw',
    description: '7-1/4-Inch Circular Saw with Electric Brake',
    image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=400&q=80',
    price: 89,
    category: 'Power Tools',
    status: ToolStatus.AVAILABLE,
    groupIds: ['g1'],
  },
  {
    id: 't3',
    ownerId: 'u1',
    name: 'Socket Set',
    description: 'Standard and Metric Mechanic Tool Set',
    image: 'https://images.unsplash.com/photo-1635339295551-7f98555776d7?auto=format&fit=crop&w=400&q=80',
    price: 150,
    category: 'Hand Tools',
    status: ToolStatus.AVAILABLE,
    groupIds: [],
  },
];

const loadTools = (): Tool[] => {
  const stored = localStorage.getItem('tools');
  return stored ? JSON.parse(stored) : MOCK_TOOLS;
};

const saveTools = (tools: Tool[]) => {
  localStorage.setItem('tools', JSON.stringify(tools));
};

export const useToolStore = create<ToolState>((set, get) => ({
  tools: loadTools(),

  initializeTools: () => {
    const tools = loadTools();
    set({ tools });
  },

  addTool: (toolData) => {
    const newTool: Tool = {
      ...toolData,
      id: generateId(),
    };
    const updatedTools = [...get().tools, newTool];
    set({ tools: updatedTools });
    saveTools(updatedTools);
    return newTool;
  },

  updateTool: (updatedTool) => {
    const updatedTools = get().tools.map(t =>
      t.id === updatedTool.id ? updatedTool : t
    );
    set({ tools: updatedTools });
    saveTools(updatedTools);
  },

  deleteTool: (toolId) => {
    const updatedTools = get().tools.filter(t => t.id !== toolId);
    set({ tools: updatedTools });
    saveTools(updatedTools);
  },

  setToolStatus: (toolId, status, holderId) => {
    const updatedTools = get().tools.map(t =>
      t.id === toolId
        ? { ...t, status, currentHolderId: holderId }
        : t
    );
    set({ tools: updatedTools });
    saveTools(updatedTools);
  },

  updateToolGroups: (toolIds, groupId, ownerId) => {
    const updatedTools = get().tools.map(t => {
      // Only update tools owned by the current user
      if (t.ownerId === ownerId) {
        const shouldBeInGroup = toolIds.includes(t.id);
        const currentGroupIds = t.groupIds || [];

        let newGroupIds = [...currentGroupIds];
        if (shouldBeInGroup && !currentGroupIds.includes(groupId)) {
          newGroupIds.push(groupId);
        } else if (!shouldBeInGroup && currentGroupIds.includes(groupId)) {
          newGroupIds = newGroupIds.filter(id => id !== groupId);
        }
        return { ...t, groupIds: newGroupIds };
      }
      return t;
    });
    set({ tools: updatedTools });
    saveTools(updatedTools);
  },
}));
