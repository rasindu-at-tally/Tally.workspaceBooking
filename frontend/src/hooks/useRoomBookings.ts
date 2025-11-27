import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getToken } from '@/lib/auth';
import { RoomBookingWithDetails, CancelRoomBookingRequest } from '@/types';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

export function useMyRoomBookings(status?: 'active' | 'cancelled') {
  return useQuery({
    queryKey: ['my-room-bookings', status],
    queryFn: async () => {
      const token = getToken();
      const params = new URLSearchParams();
      if (status) params.append('status_filter', status);
      
      const { data } = await axios.get<RoomBookingWithDetails[]>(
        `${API_BASE}/api/room-bookings/my-bookings?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
  });
}

export function useCancelRoomBooking() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const token = getToken();
      const body: CancelRoomBookingRequest = {};
      if (reason) body.cancellation_reason = reason;
      
      const { data } = await axios.post(
        `${API_BASE}/api/room-bookings/${id}/cancel`,
        body,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-room-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['room-bookings'] });
      queryClient.invalidateQueries({ queryKey: ['room-bookings-by-date'] });
    },
  });
}

export function useRoomBookingsByDate(date: string) {
  return useQuery({
    queryKey: ['room-bookings-by-date', date],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get(
        `${API_BASE}/api/room-bookings/date/${date}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
    enabled: !!date,
  });
}

