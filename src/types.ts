export interface User {
  id: string;
  name: string;
  avatar: string; // URL or placeholder
  email: string;
}

export enum ToolStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  MAINTENANCE = 'MAINTENANCE',
}

export interface Tool {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  image: string; // Base64 string
  price: number;
  category: string;
  status: ToolStatus;
  currentHolderId?: string; // If borrowed, who has it
  groupIds: string[]; // IDs of groups this tool is shared with
}

export interface Group {
  id: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  inviteCode: string;
}

export enum BookingStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
}

export interface Booking {
  id: string;
  toolId: string;
  borrowerId: string;
  ownerId: string;
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  reason: string;
  logistics: string; // "PICKUP", "MEET", "DROP"
  logisticsDetails: string;
  status: BookingStatus;
}

export type ViewState = 'HOME' | 'INVENTORY' | 'MARKETPLACE' | 'GROUPS' | 'HISTORY' | 'PROFILE';
