import { useMemo } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useToolStore } from '../stores/useToolStore';
import { useGroupStore } from '../stores/useGroupStore';
import { useBookingStore } from '../stores/useBookingStore';
import { BookingStatus, ToolStatus } from '../types';

/**
 * Custom hook that provides computed/derived data
 * Uses memoization for performance
 */
export const useDerivedData = () => {
  const currentUser = useAuthStore(state => state.currentUser);
  const tools = useToolStore(state => state.tools);
  const groups = useGroupStore(state => state.groups);
  const bookings = useBookingStore(state => state.bookings);

  const myTools = useMemo(
    () => tools.filter(t => t.ownerId === currentUser?.id),
    [tools, currentUser?.id]
  );

  const myGroups = useMemo(
    () => groups.filter(g => g.memberIds.includes(currentUser?.id ?? '')),
    [groups, currentUser?.id]
  );

  const myGroupIds = useMemo(
    () => myGroups.map(g => g.id),
    [myGroups]
  );

  const marketTools = useMemo(
    () => tools.filter(t => {
      const isNotMine = t.ownerId !== currentUser?.id;
      const isSharedWithMyGroup = t.groupIds.some(gid => myGroupIds.includes(gid));
      return isNotMine && isSharedWithMyGroup;
    }),
    [tools, currentUser?.id, myGroupIds]
  );

  const myBookings = useMemo(
    () => bookings.filter(b => b.borrowerId === currentUser?.id),
    [bookings, currentUser?.id]
  );

  const myLendingHistory = useMemo(
    () => bookings.filter(b => b.ownerId === currentUser?.id),
    [bookings, currentUser?.id]
  );

  const incomingRequests = useMemo(
    () => bookings.filter(b =>
      b.ownerId === currentUser?.id && b.status === BookingStatus.PENDING
    ),
    [bookings, currentUser?.id]
  );

  const activeBorrows = useMemo(
    () => bookings.filter(b =>
      b.borrowerId === currentUser?.id && b.status === BookingStatus.APPROVED
    ),
    [bookings, currentUser?.id]
  );

  const myToolsBorrowedOut = useMemo(
    () => tools.filter(t =>
      t.ownerId === currentUser?.id && t.status === ToolStatus.BORROWED
    ),
    [tools, currentUser?.id]
  );

  return {
    myTools,
    myGroups,
    myGroupIds,
    marketTools,
    myBookings,
    myLendingHistory,
    incomingRequests,
    activeBorrows,
    myToolsBorrowedOut,
  };
};
