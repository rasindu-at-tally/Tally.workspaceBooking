import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingApi } from '@/lib/api';
import type { CreateBookingRequest, CancelBookingRequest, BookingStatus } from '@/types';

export function useMyBookings(status?: BookingStatus) {
  return useQuery({
    queryKey: ['bookings', 'my-bookings', status],
    queryFn: () => bookingApi.getMyBookings(status),
  });
}

export function useBookingsByDate(date: string, status?: BookingStatus) {
  return useQuery({
    queryKey: ['bookings', 'by-date', date, status],
    queryFn: () => bookingApi.getByDate(date, status),
    enabled: !!date,
  });
}

export function useDeskBookings(
  deskId: string,
  startDate?: string,
  endDate?: string,
  status?: BookingStatus
) {
  return useQuery({
    queryKey: ['bookings', 'desk', deskId, startDate, endDate, status],
    queryFn: () => bookingApi.getByDesk(deskId, startDate, endDate, status),
    enabled: !!deskId,
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ['bookings', id],
    queryFn: () => bookingApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBookingRequest) => bookingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data?: CancelBookingRequest }) =>
      bookingApi.cancel(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

// Admin hooks
export function useAllBookings(params?: {
  user_id?: string;
  desk_id?: string;
  booking_date?: string;
  status?: BookingStatus;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ['bookings', 'all', params],
    queryFn: () => bookingApi.getAll(params),
  });
}

