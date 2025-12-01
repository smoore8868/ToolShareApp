import type { Tool, User, Group, Booking, ToolStatus, BookingStatus } from '../types';


// Initial Mock Data
const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'Alex', email: 'alex@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
  { id: 'u2', name: 'Jordan', email: 'jordan@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan' },
  { id: 'u3', name: 'Casey', email: 'casey@example.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Casey' },
];

const MOCK_GROUPS: Group[] = [
  {
    id: 'g1',
    name: 'Neighborhood DIY',
    ownerId: 'u1',
    memberIds: ['u1', 'u2', 'u3'],
    inviteCode: 'DIY-1234',
  }
];

const MOCK_TOOLS: Tool[] = [
  {
    id: 't1',
    ownerId: 'u2', // Owned by Jordan
    name: 'Cordless Drill',
    description: '18V Brushless Compact Drill/Driver',
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=400&q=80',
    price: 120,
    category: 'Power Tools',
    status: ToolStatus.AVAILABLE,
    groupIds: ['g1'], // Shared with Neighborhood DIY
  },
  {
    id: 't2',
    ownerId: 'u1', // Owned by Me
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
    ownerId: 'u1', // Owned by Me
    name: 'Socket Set',
    description: 'Standard and Metric Mechanic Tool Set',
    image: 'https://images.unsplash.com/photo-1635339295551-7f98555776d7?auto=format&fit=crop&w=400&q=80',
    price: 150,
    category: 'Hand Tools',
    status: ToolStatus.AVAILABLE,
    groupIds: [], // Not shared yet
  },
];

// Helper to load/save from localStorage
const load = <T,>(key: string, defaultData: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultData;
};

const save = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const store = {
  getUsers: (): User[] => load('users', DEFAULT_USERS),
  
  getCurrentUser: () => {
     const savedUser = localStorage.getItem('currentUser');
     return savedUser ? JSON.parse(savedUser) : null;
  },
  
  // Auth Simulation
  login: (email: string): User | null => {
    const users = load('users', DEFAULT_USERS);
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  },

  register: (email: string, name: string): User => {
    const users = load('users', DEFAULT_USERS);
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.replace(' ', '')}`
    };
    const updatedUsers = [...users, newUser];
    save('users', updatedUsers);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    return newUser;
  },
  
  logout: () => {
    localStorage.removeItem('currentUser');
  },

  getTools: (): Tool[] => load('tools', MOCK_TOOLS),
  saveTools: (tools: Tool[]) => save('tools', tools),

  getGroups: (): Group[] => load('groups', MOCK_GROUPS),
  saveGroups: (groups: Group[]) => save('groups', groups),

  getBookings: (): Booking[] => load('bookings', []),
  saveBookings: (bookings: Booking[]) => save('bookings', bookings),

  // Reset for demo purposes
  reset: () => {
    localStorage.clear();
    window.location.reload();
  }
};
