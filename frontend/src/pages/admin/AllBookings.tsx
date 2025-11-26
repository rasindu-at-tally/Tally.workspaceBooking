import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { useAllBookings, useCancelBooking } from '@/hooks/useBookings';
import { formatDate } from '@/lib/utils';
import { XCircle } from 'lucide-react';
import { useToast } from '@/components/Toast';

export function AllBookings() {
  const [filter, setFilter] = useState<{ status?: 'active' | 'cancelled' }>({});
  const { data: bookings = [], isLoading } = useAllBookings(filter);
  const cancelBooking = useCancelBooking();
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking as an admin?')) return;

    try {
      setCancellingId(bookingId);
      await cancelBooking.mutateAsync({
        id: bookingId,
        data: { cancellation_reason: 'Cancelled by admin' },
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to cancel booking. Please try again.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
          <p className="mt-2 text-gray-600">View and manage all desk bookings</p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setFilter({})}
            className={`px-4 py-2 font-medium transition-colors ${
              !filter.status
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter({ status: 'active' })}
            className={`px-4 py-2 font-medium transition-colors ${
              filter.status === 'active'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter({ status: 'cancelled' })}
            className={`px-4 py-2 font-medium transition-colors ${
              filter.status === 'cancelled'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cancelled
          </button>
        </div>

        {/* Bookings Table */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Desk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{booking.user.full_name}</div>
                        <div className="text-xs text-gray-500">{booking.user.email}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {booking.desk.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {booking.desk.location}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {formatDate(booking.booking_date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          booking.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {booking.status === 'active' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}



