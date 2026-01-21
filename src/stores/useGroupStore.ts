import { create } from 'zustand';
import { Group } from '../types';
import { generateId, generateInviteCode } from '../utils/generateId';

interface GroupState {
  groups: Group[];

  // Actions
  createGroup: (name: string, ownerId: string) => Group;
  updateGroup: (group: Group) => void;
  deleteGroup: (groupId: string) => void;
  joinGroup: (inviteCode: string, userId: string) => Group | null;
  removeMember: (groupId: string, userId: string) => void;
  initializeGroups: () => void;
}

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Neighborhood DIY',
    ownerId: 'u1',
    memberIds: ['u1', 'u2', 'u3'],
    inviteCode: 'DIY-1234',
  }
];

const loadGroups = (): Group[] => {
  const stored = localStorage.getItem('groups');
  return stored ? JSON.parse(stored) : MOCK_GROUPS;
};

const saveGroups = (groups: Group[]) => {
  localStorage.setItem('groups', JSON.stringify(groups));
};

export const useGroupStore = create<GroupState>((set, get) => ({
  groups: loadGroups(),

  initializeGroups: () => {
    const groups = loadGroups();
    set({ groups });
  },

  createGroup: (name, ownerId) => {
    const newGroup: Group = {
      id: generateId(),
      name,
      ownerId,
      memberIds: [ownerId],
      inviteCode: generateInviteCode(),
    };
    const updatedGroups = [...get().groups, newGroup];
    set({ groups: updatedGroups });
    saveGroups(updatedGroups);
    return newGroup;
  },

  updateGroup: (updatedGroup) => {
    const updatedGroups = get().groups.map(g =>
      g.id === updatedGroup.id ? updatedGroup : g
    );
    set({ groups: updatedGroups });
    saveGroups(updatedGroups);
  },

  deleteGroup: (groupId) => {
    const updatedGroups = get().groups.filter(g => g.id !== groupId);
    set({ groups: updatedGroups });
    saveGroups(updatedGroups);
  },

  joinGroup: (inviteCode, userId) => {
    const groups = get().groups;
    const group = groups.find(g => g.inviteCode === inviteCode);

    if (!group) {
      return null;
    }

    if (group.memberIds.includes(userId)) {
      return group; // Already a member
    }

    const updatedGroup = {
      ...group,
      memberIds: [...group.memberIds, userId],
    };

    const updatedGroups = groups.map(g =>
      g.id === updatedGroup.id ? updatedGroup : g
    );

    set({ groups: updatedGroups });
    saveGroups(updatedGroups);
    return updatedGroup;
  },

  removeMember: (groupId, userId) => {
    const groups = get().groups;
    const group = groups.find(g => g.id === groupId);

    if (!group) return;

    const updatedGroup = {
      ...group,
      memberIds: group.memberIds.filter(id => id !== userId),
    };

    const updatedGroups = groups.map(g =>
      g.id === updatedGroup.id ? updatedGroup : g
    );

    set({ groups: updatedGroups });
    saveGroups(updatedGroups);
  },
}));
