import { useState } from 'react';
import { format } from 'date-fns';
import { Layout } from '@/components/Layout';
import { useMyBookings, useCancelBooking } from '@/hooks/useBookings';
import { useMyRoomBookings, useCancelRoomBooking } from '@/hooks/useRoomBookings';
import { formatDate } from '@/lib/utils';
import { Calendar, MapPin, XCircle, CheckCircle, Clock, Users, DoorOpen, Monitor } from 'lucide-react';
import { useToast } from '@/components/Toast';
import { CancelBookingModal } from '@/components/CancelBookingModal';

interface CancelModalState {
  isOpen: boolean;
  bookingId: string | null;
  bookingType: 'desk' | 'room';
  bookingDetails?: {
    name: string;
    date?: string;
    time?: string;
    location?: string;
  };
}

export function MyBookings() {
  const [filter, setFilter] = useState<'all' | 'active' | 'cancelled'>('active');
  const [bookingType, setBookingType] = useState<'desks' | 'rooms'>('desks');
  const [cancelModal, setCancelModal] = useState<CancelModalState>({
    isOpen: false,
    bookingId: null,
    bookingType: 'desk',
  });
  
  // Desk bookings
  const { data: deskBookings = [], isLoading: deskLoading } = useMyBookings(
    filter === 'all' ? undefined : filter
  );
  const cancelDeskBooking = useCancelBooking();
  
  // Room bookings
  const { data: roomBookings = [], isLoading: roomLoading } = useMyRoomBookings(
    filter === 'all' ? undefined : filter
  );
  const cancelRoomBooking = useCancelRoomBooking();
  
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const openCancelDeskModal = (booking: any) => {
    setCancelModal({
      isOpen: true,
      bookingId: booking.id,
      bookingType: 'desk',
      bookingDetails: {
        name: booking.desk.name,
        date: formatDate(booking.booking_date),
        location: booking.desk.location,
      },
    });
  };

  const openCancelRoomModal = (booking: any) => {
    setCancelModal({
      isOpen: true,
      bookingId: booking.id,
      bookingType: 'room',
      bookingDetails: {
        name: booking.room_name || 'Meeting Room',
        date: formatDateTime(booking.start_time),
        time: `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`,
        location: booking.location,
      },
    });
  };

  const closeCancelModal = () => {
    setCancelModal({
      isOpen: false,
      bookingId: null,
      bookingType: 'desk',
    });
  };

  const handleConfirmCancel = async (reason?: string) => {
    if (!cancelModal.bookingId) return;

    try {
      setCancellingId(cancelModal.bookingId);
      
      if (cancelModal.bookingType === 'desk') {
        await cancelDeskBooking.mutateAsync({ 
          id: cancelModal.bookingId, 
          data: reason ? { cancellation_reason: reason } : undefined 
        });
        showToast({
          type: 'success',
          message: 'Desk booking cancelled successfully.',
        });
      } else {
        await cancelRoomBooking.mutateAsync({ id: cancelModal.bookingId, reason });
        showToast({
          type: 'success',
          message: 'Room booking cancelled successfully.',
        });
      }
      
      closeCancelModal();
    } catch (error) {
      showToast({
        type: 'error',
        message: 'Failed to cancel booking. Please try again.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  // Desk booking filters - sorted by date (closest first for upcoming, most recent first for past)
  const upcomingDeskBookings = deskBookings
    .filter((b) => b.status === 'active' && new Date(b.booking_date) >= new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime());
  const pastDeskBookings = deskBookings
    .filter((b) => b.status === 'active' && new Date(b.booking_date) < new Date(new Date().setHours(0,0,0,0)))
    .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());
  const cancelledDeskBookings = deskBookings
    .filter((b) => b.status === 'cancelled')
    .sort((a, b) => new Date(b.booking_date).getTime() - new Date(a.booking_date).getTime());

  // Room booking filters - sorted by date (closest first for upcoming, most recent first for past)
  const upcomingRoomBookings = roomBookings
    .filter((b) => b.status === 'active' && new Date(b.start_time) >= new Date())
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  const pastRoomBookings = roomBookings
    .filter((b) => b.status === 'active' && new Date(b.start_time) < new Date())
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  const cancelledRoomBookings = roomBookings
    .filter((b) => b.status === 'cancelled')
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());

  const isLoading = bookingType === 'desks' ? deskLoading : roomLoading;
  const bookings = bookingType === 'desks' ? deskBookings : roomBookings;

  const formatTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'h:mm a');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-cyan-600">My Bookings</h1>
          <p className="mt-2 text-gray-600">View and manage your desk and room bookings</p>
        </div>

        {/* Booking Type Toggle */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
          <button
            onClick={() => setBookingType('desks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              bookingType === 'desks'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className="h-4 w-4" />
            Desk Bookings
          </button>
          <button
            onClick={() => setBookingType('rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              bookingType === 'rooms'
                ? 'bg-white text-cyan-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <DoorOpen className="h-4 w-4" />
            Room Bookings
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'active'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({bookingType === 'desks' ? upcomingDeskBookings.length : upcomingRoomBookings.length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'cancelled'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cancelled ({bookingType === 'desks' ? cancelledDeskBookings.length : cancelledRoomBookings.length})
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium transition-colors ${
              filter === 'all'
                ? 'border-b-2 border-cyan-600 text-cyan-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({bookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-200 border-t-cyan-600"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
            <DoorOpen className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-600">No {bookingType} bookings found</p>
            <p className="mt-1 text-sm text-gray-400">Your bookings will appear here</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* DESK BOOKINGS */}
            {bookingType === 'desks' && (
              <>
                {filter === 'active' && upcomingDeskBookings.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-lg font-semibold text-gray-900">Upcoming Desk Bookings</h2>
                    <div className="space-y-3">
                      {upcomingDeskBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {booking.desk.name}
                                </h3>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                  <CheckCircle className="h-3 w-3" />
                                  Active
                                </span>
                              </div>
                              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {formatDate(booking.booking_date)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  {booking.desk.location}
                                </div>
                              </div>
                              <p className="mt-2 text-sm text-gray-500">{booking.desk.desk_type}</p>
                            </div>
                            <button
                              onClick={() => openCancelDeskModal(booking)}
                              disabled={cancellingId === booking.id}
                              className="ml-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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

                {filter === 'active' && pastDeskBookings.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-lg font-semibold text-gray-900">Past Desk Bookings</h2>
                    <div className="space-y-3">
                      {pastDeskBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-700">{booking.desk.name}</h3>
                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {formatDate(booking.booking_date)}
                              </div>
                              <div className="flex items-center gap-1.5">
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
                  cancelledDeskBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-xl border border-red-200 bg-red-50 p-5"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{booking.desk.name}</h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                            <XCircle className="h-3 w-3" />
                            Cancelled
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {formatDate(booking.booking_date)}
                          </div>
                          <div className="flex items-center gap-1.5">
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
                  deskBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`rounded-xl border p-5 transition-all ${
                        booking.status === 'cancelled'
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">{booking.desk.name}</h3>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                booking.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700'
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
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDate(booking.booking_date)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4 text-gray-400" />
                              {booking.desk.location}
                            </div>
                          </div>
                        </div>
                        {booking.status === 'active' &&
                          new Date(booking.booking_date) >= new Date(new Date().setHours(0,0,0,0)) && (
                            <button
                              onClick={() => openCancelDeskModal(booking)}
                              disabled={cancellingId === booking.id}
                              className="ml-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
              </>
            )}

            {/* ROOM BOOKINGS */}
            {bookingType === 'rooms' && (
              <>
                {filter === 'active' && upcomingRoomBookings.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-lg font-semibold text-gray-900">Upcoming Room Bookings</h2>
                    <div className="space-y-3">
                      {upcomingRoomBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {booking.room_name || 'Meeting Room'}
                                </h3>
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                  <CheckCircle className="h-3 w-3" />
                                  Active
                                </span>
                              </div>
                              {booking.meeting_subject && (
                                <p className="mt-1 text-sm font-medium text-gray-700">{booking.meeting_subject}</p>
                              )}
                              <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="h-4 w-4 text-gray-400" />
                                  {formatDateTime(booking.start_time)}
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                                </div>
                                {booking.location && (
                                  <div className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {booking.location}
                                  </div>
                                )}
                                {booking.attendee_count && (
                                  <div className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    {booking.attendee_count} attendees
                                  </div>
                                )}
                              </div>
                              {booking.room_number && (
                                <p className="mt-2 text-sm text-gray-500 font-mono">{booking.room_number}</p>
                              )}
                            </div>
                            <button
                              onClick={() => openCancelRoomModal(booking)}
                              disabled={cancellingId === booking.id}
                              className="ml-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
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

                {filter === 'active' && pastRoomBookings.length > 0 && (
                  <div>
                    <h2 className="mb-3 text-lg font-semibold text-gray-900">Past Room Bookings</h2>
                    <div className="space-y-3">
                      {pastRoomBookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                        >
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-700">
                              {booking.room_name || 'Meeting Room'}
                            </h3>
                            {booking.meeting_subject && (
                              <p className="mt-1 text-sm text-gray-600">{booking.meeting_subject}</p>
                            )}
                            <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {formatDateTime(booking.start_time)}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                              </div>
                              {booking.location && (
                                <div className="flex items-center gap-1.5">
                                  <MapPin className="h-4 w-4" />
                                  {booking.location}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filter === 'cancelled' &&
                  cancelledRoomBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-xl border border-red-200 bg-red-50 p-5"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.room_name || 'Meeting Room'}
                          </h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                            <XCircle className="h-3 w-3" />
                            Cancelled
                          </span>
                        </div>
                        {booking.meeting_subject && (
                          <p className="mt-1 text-sm text-gray-700">{booking.meeting_subject}</p>
                        )}
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            {formatDateTime(booking.start_time)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4" />
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </div>
                          {booking.location && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="h-4 w-4" />
                              {booking.location}
                            </div>
                          )}
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
                  roomBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`rounded-xl border p-5 transition-all ${
                        booking.status === 'cancelled'
                          ? 'border-red-200 bg-red-50'
                          : 'border-gray-200 bg-white hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.room_name || 'Meeting Room'}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
                                booking.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700'
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
                          {booking.meeting_subject && (
                            <p className="mt-1 text-sm font-medium text-gray-700">{booking.meeting_subject}</p>
                          )}
                          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {formatDateTime(booking.start_time)}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4 text-gray-400" />
                              {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                            </div>
                            {booking.location && (
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {booking.location}
                              </div>
                            )}
                          </div>
                        </div>
                        {booking.status === 'active' &&
                          new Date(booking.start_time) >= new Date() && (
                            <button
                              onClick={() => openCancelRoomModal(booking)}
                              disabled={cancellingId === booking.id}
                              className="ml-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <XCircle className="h-4 w-4" />
                              {cancellingId === booking.id ? 'Cancelling...' : 'Cancel'}
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={cancelModal.isOpen}
        onClose={closeCancelModal}
        onConfirm={handleConfirmCancel}
        isLoading={cancellingId !== null}
        bookingType={cancelModal.bookingType}
        bookingDetails={cancelModal.bookingDetails}
      />
    </Layout>
  );
}
