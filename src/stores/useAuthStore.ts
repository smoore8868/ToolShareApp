import { create } from 'zustand';
import { User } from '../types';
import { generateId } from '../utils/generateId';

interface AuthState {
  currentUser: User | null;
  users: User[];

  // Actions
  login: (email: string, password?: string) => User | null;
  register: (email: string, name: string, password?: string) => User;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  initializeUsers: () => void;
}

const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Alex', email: 'alex@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'u2', name: 'Jordan', email: 'jordan@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
  { id: 'u3', name: 'Casey', email: 'casey@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey' },
];

const loadUsers = (): User[] => {
  const stored = localStorage.getItem('users');
  return stored ? JSON.parse(stored) : DEFAULT_USERS;
};

const loadCurrentUser = (): User | null => {
  const stored = localStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
};

const saveUsers = (users: User[]) => {
  localStorage.setItem('users', JSON.stringify(users));
};

const saveCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  } else {
    localStorage.removeItem('currentUser');
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: loadCurrentUser(),
  users: loadUsers(),

  initializeUsers: () => {
    const users = loadUsers();
    set({ users });
  },

  login: (email: string) => {
    const users = get().users;
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      set({ currentUser: user });
      saveCurrentUser(user);
      return user;
    }
    return null;
  },

  register: (email: string, name: string) => {
    const users = get().users;
    const newUser: User = {
      id: generateId(),
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`
    };
    const updatedUsers = [...users, newUser];
    set({ users: updatedUsers, currentUser: newUser });
    saveUsers(updatedUsers);
    saveCurrentUser(newUser);
    return newUser;
  },

  logout: () => {
    set({ currentUser: null });
    saveCurrentUser(null);
  },

  setCurrentUser: (user: User) => {
    set({ currentUser: user });
    saveCurrentUser(user);
  },
}));
