import { useEffect } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useToolStore } from '../stores/useToolStore';
import { useGroupStore } from '../stores/useGroupStore';
import { useBookingStore } from '../stores/useBookingStore';

/**
 * Custom hook to initialize all app data on mount
 * This ensures stores are synced with localStorage
 */
export const useAppData = () => {
  const initializeUsers = useAuthStore(state => state.initializeUsers);
  const initializeTools = useToolStore(state => state.initializeTools);
  const initializeGroups = useGroupStore(state => state.initializeGroups);
  const initializeBookings = useBookingStore(state => state.initializeBookings);

  useEffect(() => {
    initializeUsers();
    initializeTools();
    initializeGroups();
    initializeBookings();
  }, [initializeUsers, initializeTools, initializeGroups, initializeBookings]);
};
