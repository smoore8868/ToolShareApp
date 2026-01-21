import { create } from 'zustand';
import { Booking, BookingStatus } from '../types';
import { generateId } from '../utils/generateId';

interface BookingState {
  bookings: Booking[];

  // Actions
  createBooking: (bookingData: Omit<Booking, 'id' | 'status'>) => Booking;
  updateBooking: (booking: Booking) => void;
  approveBooking: (bookingId: string) => void;
  rejectBooking: (bookingId: string) => void;
  completeBooking: (bookingId: string) => void;
  initializeBookings: () => void;
}

const loadBookings = (): Booking[] => {
  const stored = localStorage.getItem('bookings');
  return stored ? JSON.parse(stored) : [];
};

const saveBookings = (bookings: Booking[]) => {
  localStorage.setItem('bookings', JSON.stringify(bookings));
};

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: loadBookings(),

  initializeBookings: () => {
    const bookings = loadBookings();
    set({ bookings });
  },

  createBooking: (bookingData) => {
    const newBooking: Booking = {
      ...bookingData,
      id: generateId(),
      status: BookingStatus.PENDING,
    };
    const updatedBookings = [...get().bookings, newBooking];
    set({ bookings: updatedBookings });
    saveBookings(updatedBookings);
    return newBooking;
  },

  updateBooking: (updatedBooking) => {
    const updatedBookings = get().bookings.map(b =>
      b.id === updatedBooking.id ? updatedBooking : b
    );
    set({ bookings: updatedBookings });
    saveBookings(updatedBookings);
  },

  approveBooking: (bookingId) => {
    const updatedBookings = get().bookings.map(b =>
      b.id === bookingId ? { ...b, status: BookingStatus.APPROVED } : b
    );
    set({ bookings: updatedBookings });
    saveBookings(updatedBookings);
  },

  rejectBooking: (bookingId) => {
    const updatedBookings = get().bookings.map(b =>
      b.id === bookingId ? { ...b, status: BookingStatus.REJECTED } : b
    );
    set({ bookings: updatedBookings });
    saveBookings(updatedBookings);
  },

  completeBooking: (bookingId) => {
    const updatedBookings = get().bookings.map(b =>
      b.id === bookingId ? { ...b, status: BookingStatus.COMPLETED } : b
    );
    set({ bookings: updatedBookings });
    saveBookings(updatedBookings);
  },
}));
