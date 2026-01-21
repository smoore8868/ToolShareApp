import { useBookingStore } from '../stores/useBookingStore';
import { useToolStore } from '../stores/useToolStore';
import { Booking, ToolStatus } from '../types';

/**
 * Custom hook that combines booking and tool operations
 * Encapsulates business logic for booking workflows
 */
export const useBookingActions = () => {
  const approveBooking = useBookingStore(state => state.approveBooking);
  const rejectBooking = useBookingStore(state => state.rejectBooking);
  const completeBooking = useBookingStore(state => state.completeBooking);
  const setToolStatus = useToolStore(state => state.setToolStatus);

  const handleApproveBooking = (booking: Booking) => {
    // Update booking status
    approveBooking(booking.id);
    // Update tool status
    setToolStatus(booking.toolId, ToolStatus.BORROWED, booking.borrowerId);
  };

  const handleRejectBooking = (booking: Booking) => {
    rejectBooking(booking.id);
    // Tool remains available
  };

  const handleReturnTool = (booking: Booking) => {
    // Mark booking completed
    completeBooking(booking.id);
    // Mark tool available
    setToolStatus(booking.toolId, ToolStatus.AVAILABLE, undefined);
  };

  return {
    handleApproveBooking,
    handleRejectBooking,
    handleReturnTool,
  };
};
