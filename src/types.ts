// ---- Basic Entity Types ----

export interface Tool {
  id?: string;
  name?: string;
  status?: ToolStatus;
  description?: string;
}

export interface Group {
  id?: string;
  name?: string;
  tools?: Tool[];
}

export interface Booking {
  id?: string;
  toolId?: string;
  userId?: string;
  status?: BookingStatus;
  startTime?: string;
  endTime?: string;
}

export interface User {
  id?: string;
  name?: string;
  email?: string;
}

// ---- Status Enums (or union types) ----

export type ToolStatus = 
  | 'available' 
  | 'unavailable' 
  | 'in_use' 
  | 'maintenance';

export type BookingStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'canceled';

// ---- ViewState (generic UI state container) ----

export interface ViewState {
  selectedToolId?: string;
  selectedGroupId?: string;
  selectedBookingId?: string;
  mode?: string; // e.g. "view" | "edit" | "create"
}
