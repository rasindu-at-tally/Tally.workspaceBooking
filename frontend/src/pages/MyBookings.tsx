import { useState } from 'react';
import { format } from 'date-fns';
import { Layout } from '@/components/Layout';
import { useMyBookings, useCancelBooking } from '@/hooks/useBookings';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, XCircle, CheckCircle } from 'lucide-react';

export function MyBookings() {
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('active');
  const { data: bookings = [], isLoading } = useMyBookings(
    filter === 'all' ? undefined : filter
  );
  const cancelBooking = useCancelBooking();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      setCancellingId(bookingId);
      await cancelBooking.mutateAsync({ id: bookingId });
    } catch (error) {
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingBookings = bookings.filter(
    (b) => b.status === 'active' && new Date(b.booking_date) >= new Date()
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'active' && new Date(b.booking_date) < new Date()
  );
  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600">View and manage your desk bookings</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'active'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'cancelled'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cancelled ({cancelledBookings.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({bookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-lg text-gray-600">Loading...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filter === 'active' && upcomingBookings.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Upcoming</h2>
                <div className="space-y-3">
                  {upcomingBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.desk.name}
                            </h3>
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(booking.booking_date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {booking.desk.location}
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-500">{booking.desk.desk_type}</p>
                        </div>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="ml-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filter === 'active' && pastBookings.length > 0 && (
              <div>
                <h2 className="mb-3 text-lg font-semibold text-gray-900">Past</h2>
                <div className="space-y-3">
                  {pastBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-lg border bg-gray-50 p-4 shadow-sm"
                    >
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-700">{booking.desk.name}</h3>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(booking.booking_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {booking.desk.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filter === 'cancelled' &&
              cancelledBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{booking.desk.name}</h3>
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                        <XCircle className="h-3 w-3" />
                        Cancelled
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.booking_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {booking.desk.location}
                      </div>
                    </div>
                    {booking.cancellation_reason && (
                      <p className="mt-2 text-sm text-gray-600">
                        Reason: {booking.cancellation_reason}
                      </p>
                    )}
                  </div>
                </div>
              ))}

            {filter === 'all' &&
              bookings.map((booking) => (
                <div
                  key={booking.id}
                  className={`rounded-lg border p-4 shadow-sm ${
                    booking.status === 'cancelled'
                      ? 'border-red-200 bg-red-50'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{booking.desk.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                            booking.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {booking.status === 'active' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {booking.status}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(booking.booking_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {booking.desk.location}
                        </div>
                      </div>
                    </div>
                    {booking.status === 'active' &&
                      new Date(booking.booking_date) >= new Date() && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="ml-4 flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle className="h-4 w-4" />
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
}



