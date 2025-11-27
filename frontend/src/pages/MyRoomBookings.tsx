import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { RoomBookingWithDetails } from '../types';
import { format } from 'date-fns';
import { getToken } from '@/lib/auth';

const API_BASE =
  (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ?? '';

export default function MyRoomBookings() {
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['my-room-bookings'],
    queryFn: async () => {
      const token = getToken();
      const { data } = await axios.get<RoomBookingWithDetails[]>(
        `${API_BASE}/api/room-bookings/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (bookingId: string) => {
      const token = getToken();
      await axios.post(
        `${API_BASE}/api/room-bookings/${bookingId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-room-bookings'] });
    },
  });

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-600">My Room Bookings</h1>
          <p className="mt-2 text-gray-600">View and manage your meeting room reservations</p>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow text-center">
          <p className="text-gray-500">You don't have any room bookings yet.</p>
          <a
            href="/meeting-rooms"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Browse Meeting Rooms
          </a>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Room
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Meeting
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Start Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    End Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {booking.room_name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.room_number} • {booking.location}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {booking.meeting_subject || 'No subject'}
                      </div>
                      {booking.attendee_count && (
                        <div className="text-sm text-gray-500">
                          {booking.attendee_count} attendees
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(booking.start_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateTime(booking.end_time)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {booking.status === 'active' && (
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to cancel this booking?')) {
                              cancelMutation.mutate(booking.id);
                            }
                          }}
                          disabled={cancelMutation.isPending}
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

